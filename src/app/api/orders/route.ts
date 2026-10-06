import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders")
    .select("id,order_number,status,subtotal_twd,shipping_fee_twd,discount_twd,total_twd,shipping_address,created_at,updated_at,payments(id,provider,status,amount_twd,provider_payment_id,created_at,updated_at),order_items(id,product_id,artwork_id,size_id,frame_id,paper_id,quantity,unit_price_twd,created_at)")
    .eq("user_id", user.id).order("created_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ orders: data ?? [] });
}