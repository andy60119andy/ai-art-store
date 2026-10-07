import { NextResponse } from "next/server";
import { checkoutConfiguration } from "@/lib/checkout/config";
import { verifyCheckMacValue } from "@/lib/payments/ecpay";
import { createServiceClient } from "@/lib/supabase/service";
export async function POST(request: Request) {
  if (!checkoutConfiguration().ready)
    return NextResponse.json({ error: "PAYMENTS_DISABLED" }, { status: 503 });
  try {
    const params = new URLSearchParams(await request.text());
    const fields: Record<string, string> = {};
    for (const [k, v] of params) {
      if (k in fields)
        return new Response("0|Duplicate fields", { status: 400 });
      fields[k] = v;
    }
    if (
      fields.MerchantID !== process.env.ECPAY_MERCHANT_ID ||
      !verifyCheckMacValue(fields)
    )
      return new Response("0|Invalid signature", { status: 400 });
    const amount = Number(fields.TradeAmt);
    if (!Number.isSafeInteger(amount) || amount <= 0 || !fields.TradeNo)
      return new Response("0|Invalid payment", { status: 400 });
    if (fields.SimulatePaid === "1" && process.env.ECPAY_MODE === "production")
      return new Response("1|OK");
    const { error } = await createServiceClient().rpc("confirm_ecpay_payment", {
      p_order_number: fields.MerchantTradeNo,
      p_trade_no: fields.TradeNo,
      p_amount: amount,
      p_success: fields.RtnCode === "1",
      p_mode: process.env.ECPAY_MODE,
    });
    if (error)
      return new Response("0|Payment processing failed", { status: 500 });
    return new Response("1|OK");
  } catch {
    return new Response("0|Invalid callback", { status: 400 });
  }
}
