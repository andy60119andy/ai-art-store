import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const allowed = ["pending_payment","paid","processing","in_production","shipped","completed","cancelled","refunded"] as const;
export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "production"))
    return NextResponse.json({ error:"FORBIDDEN" }, { status:403 });
  const supabase = await createClient();
  const { data, error } = await supabase.from("orders")
    .select("id,order_number,user_id,status,total_twd,shipping_address,created_at,updated_at,payments(id,provider,status,amount_twd,provider_payment_id),order_items(id,product_id,artwork_id,size_id,frame_id,paper_id,quantity,unit_price_twd)")
    .order("created_at",{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({orders:data??[]});
}
export async function PATCH(request:Request) {
  const profile=await getCurrentProfile();
  if(!profile || (profile.role!=="admin" && profile.role!=="production"))
    return NextResponse.json({error:"FORBIDDEN"},{status:403});
  const body=await request.json().catch(()=>null) as {orderId?:string;status?:string}|null;
  if(!body?.orderId || !body.status || !allowed.includes(body.status as typeof allowed[number]))
    return NextResponse.json({error:"INVALID_INPUT"},{status:400});
  const supabase=await createClient();
  const {data,error}=await supabase.rpc("admin_update_order_status",{p_order_id:body.orderId,p_status:body.status});
  if(error) return NextResponse.json({error:error.message},{status:400});
  return NextResponse.json({order:data});
}
