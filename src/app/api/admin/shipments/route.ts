import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function staff() { const supabase = await createClient(); const { data: profile } = await supabase.from("profiles").select("role").single(); return { supabase, ok: !!profile && ["admin","production"].includes(profile.role) }; }
export async function GET() {
  const { supabase, ok } = await staff(); if (!ok) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = await supabase.from("shipments").select("id,order_id,carrier,tracking_number,status,shipped_at,delivered_at,orders(order_number,total_twd,status)").order("updated_at",{ascending:false});
  if (error) return NextResponse.json({ error:error.message },{status:500}); return NextResponse.json({ items:data??[] });
}
export async function PATCH(request: Request) {
  const body=await request.json(); const {supabase,ok}=await staff(); if(!ok)return NextResponse.json({error:"Forbidden"},{status:403});
  const allowed=["pending","shipped","in_transit","delivered","exception"]; if(!body.id||!allowed.includes(body.status))return NextResponse.json({error:"Invalid request"},{status:400});
  if (["shipped","in_transit","delivered"].includes(body.status) && (!String(body.carrier??"").trim() || !String(body.trackingNumber??"").trim())) return NextResponse.json({error:"物流商與追蹤單號必填"},{status:400});
  const {data,error}=await supabase.rpc("update_shipment",{p_shipment_id:body.id,p_carrier:body.carrier??"",p_tracking_number:body.trackingNumber??"",p_status:body.status});
  if(error)return NextResponse.json({error:error.message},{status:400}); return NextResponse.json({shipment:data});
}