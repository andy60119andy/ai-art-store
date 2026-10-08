import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
const input = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("shipping"),
    shippingFeeTwd: z.number().int().min(0).max(100000),
    enabled: z.boolean(),
  }),
  z.object({
    type: z.literal("product"),
    id: z.uuid(),
    basePriceTwd: z.number().int().positive().max(1000000),
    priceConfirmed: z.boolean(),
  }),
  z.object({
    type: z.literal("size"),
    id: z.uuid(),
    priceDeltaTwd: z.number().int().min(0).max(1000000),
  }),
]);
export async function GET() {
  const p = await getCurrentProfile();
  if (p?.role !== "admin")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  const s = await createClient();
  const [settings, products, sizes] = await Promise.all([
    s
      .from("checkout_settings")
      .select("shipping_fee_twd,enabled")
      .eq("id", true)
      .maybeSingle(),
    s
      .from("products")
      .select("id,name,base_price_twd,price_confirmed")
      .eq("material", "canvas"),
    s
      .from("product_sizes")
      .select("id,product_id,name,width_mm,height_mm,price_delta_twd"),
  ]);
  if (settings.error || products.error || sizes.error)
    return NextResponse.json({ error: "SETUP_REQUIRED" }, { status: 503 });
  const ids = new Set((products.data ?? []).map((p) => p.id));
  return NextResponse.json({
    shipping: settings.data,
    products: products.data,
    sizes: (sizes.data ?? []).filter((x) => ids.has(x.product_id)),
    region: "TW_MAINLAND",
  });
}
export async function PATCH(req: Request) {
  const p = await getCurrentProfile();
  if (p?.role !== "admin")
    return NextResponse.json({ error: "FORBIDDEN" }, { status: 403 });
  let b;
  try {
    b = input.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "INVALID_SETTINGS" }, { status: 400 });
  }
  const s = await createClient();
  const result =
    b.type === "shipping"
      ? await s
          .from("checkout_settings")
          .upsert({
            id: true,
            shipping_fee_twd: b.shippingFeeTwd,
            enabled: b.enabled,
          })
          .select("id")
          .single()
      : b.type === "product"
        ? await s
            .from("products")
            .update({
              base_price_twd: b.basePriceTwd,
              price_confirmed: b.priceConfirmed,
            })
            .eq("id", b.id)
            .eq("material", "canvas")
            .select("id")
            .single()
        : await s
            .from("product_sizes")
            .update({ price_delta_twd: b.priceDeltaTwd })
            .eq("id", b.id)
            .select("id")
            .single();
  if (result.error)
    return NextResponse.json(
      { error: "SETTINGS_UPDATE_FAILED" },
      { status: 400 },
    );
  return NextResponse.json({ ok: true });
}
