import { NextResponse } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const { data: order, error } = await supabase
    .from("orders")
    .select("id,order_number,status,shipping_address,subtotal_twd,shipping_fee_twd,discount_twd,total_twd,created_at,order_items(*),payments(*)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
