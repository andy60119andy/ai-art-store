import { NextResponse } from "next/server";
import { createServiceClient } from "@/lib/supabase/service";
import { verifyCheckMacValue } from "@/lib/payments/ecpay";

async function ensureProduction(service: ReturnType<typeof createServiceClient>, orderId: string) {
  const { data: items } = await service
    .from("order_items")
    .select("id,quantity,mockup_id,artwork_id,created_at")
    .eq("order_id", orderId)
    .order("created_at", { ascending: true });

  if (!items?.length) return;

  for (const item of items) {
    const { data: existing } = await service
      .from("production_files")
      .select("id")
      .eq("order_item_id", item.id)
      .limit(1)
      .maybeSingle();

    if (existing) continue;

    let storagePath: string | null = null;
    if (item.mockup_id) {
      const { data: mockup } = await service
        .from("mockups")
        .select("storage_path")
        .eq("id", item.mockup_id)
        .maybeSingle();
      storagePath = mockup?.storage_path ?? null;
    }

    if (!storagePath && item.artwork_id) {
      const { data: version } = await service
        .from("artwork_versions")
        .select("storage_path")
        .eq("artwork_id", item.artwork_id)
        .order("version_no", { ascending: false })
        .limit(1)
        .maybeSingle();
      storagePath = version?.storage_path ?? null;
    }

    if (!storagePath) continue;

    await service.from("production_files").insert({
      order_item_id: item.id,
      mockup_id: item.mockup_id ?? null,
      storage_path: storagePath,
      production_status: "pending",
    });
  }
}

export async function POST(req: Request) {
  try {
    const raw = await req.text();
    const params = new URLSearchParams(raw);
    const fields = Object.fromEntries(params.entries());

    if (
      fields.MerchantID !== process.env.ECPAY_MERCHANT_ID ||
      !verifyCheckMacValue(fields)
    ) {
      return new NextResponse("0|INVALID_CHECKSUM", { status: 400 });
    }

    const service = createServiceClient();
    const { data: order } = await service
      .from("orders")
      .select("id,total_twd,status")
      .eq("order_number", fields.MerchantTradeNo)
      .single();

    if (!order) return new NextResponse("0|ORDER_NOT_FOUND", { status: 404 });
    if (Number(fields.TradeAmt) !== order.total_twd) {
      return new NextResponse("0|AMOUNT_MISMATCH", { status: 400 });
    }

    const eventId =
      fields.TradeNo ||
      `${fields.MerchantTradeNo}:${fields.PaymentDate || fields.TradeDate || ""}`;

    const { error: eventError } = await service.from("payment_events").insert({
      provider: "ecpay",
      event_id: eventId,
      order_id: order.id,
      payload: fields,
      processed_at: null,
    });

    if (eventError?.code === "23505") {
      if (fields.RtnCode === "1") await ensureProduction(service, order.id);
      return new NextResponse("1|OK");
    }
    if (eventError) return new NextResponse("0|EVENT_SAVE_FAILED", { status: 500 });

    const success = fields.RtnCode === "1";
    const { data: payment } = await service
      .from("payments")
      .select("id,status")
      .eq("order_id", order.id)
      .eq("provider", "ecpay")
      .order("created_at", { ascending: false })
      .limit(1)
      .single();

    if (payment) {
      await service
        .from("payments")
        .update({
          status: success ? "paid" : "failed",
          provider_payment_id: fields.TradeNo || null,
        })
        .eq("id", payment.id);
    }

    if (success) {
      await service
        .from("orders")
        .update({ status: "paid" })
        .eq("id", order.id)
        .in("status", ["pending_payment", "paid"]);

      await ensureProduction(service, order.id);
    }

    await service
      .from("payment_events")
      .update({ processed_at: new Date().toISOString() })
      .eq("provider", "ecpay")
      .eq("event_id", eventId);

    return new NextResponse("1|OK");
  } catch {
    return new NextResponse("0|SERVER_ERROR", { status: 500 });
  }
}
