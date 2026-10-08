import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { shippingAddressSchema } from "@/lib/shipping/taiwan";
export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  try {
    shippingAddressSchema.parse((await req.json()).shippingAddress);
  } catch {
    return NextResponse.json(
      {
        error: "MAINLAND_DELIVERY_ONLY",
        message: "請填寫完整台灣本島地址；離島與海外尚不配送。",
      },
      { status: 400 },
    );
  }
  const s = await createClient();
  const { data, error } = await s
    .from("checkout_settings")
    .select("shipping_fee_twd,enabled")
    .eq("id", true)
    .maybeSingle();
  if (error || !data?.enabled)
    return NextResponse.json(
      { error: "SHIPPING_NOT_CONFIGURED", message: "宅配運費尚未設定。" },
      { status: 503 },
    );
  return NextResponse.json({
    currency: "TWD",
    shippingFeeTwd: data.shipping_fee_twd,
    region: "TW_MAINLAND",
    method: "本島宅配",
  });
}
