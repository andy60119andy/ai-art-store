import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { buildEcpayPayment } from "@/lib/payments/ecpay";
import { checkoutConfiguration } from "@/lib/checkout/config";
import { shippingAddressSchema } from "@/lib/shipping/taiwan";
const schema = z.object({
  requestId: z.uuid(),
  shippingAddress: shippingAddressSchema,
});
export async function POST(request: Request) {
  const config = checkoutConfiguration();
  if (!config.ready)
    return NextResponse.json(
      {
        error: "PAYMENTS_DISABLED",
        message: "付款尚待商家、資料庫及台幣運費設定。",
      },
      { status: 503 },
    );
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  let body;
  try {
    body = schema.parse(await request.json());
  } catch {
    return NextResponse.json(
      { error: "INVALID_SHIPPING_ADDRESS" },
      { status: 400 },
    );
  }
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("checkout_canvas_order", {
    p_request_id: body.requestId,
    p_mode: config.mode,
    p_shipping_address: body.shippingAddress,
  });
  if (error || !data)
    return NextResponse.json(
      {
        error: "CHECKOUT_FAILED",
        message: "請確認購物車、正式售價與配送設定。",
      },
      { status: 400 },
    );
  const order = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({
    order,
    payment: buildEcpayPayment({
      orderNumber: order.order_number,
      totalTwd: order.total_twd,
      itemName: "油畫布／帆布裸框",
    }),
    mode: config.mode,
  });
}
