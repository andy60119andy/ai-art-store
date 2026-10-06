import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").single();
  if (!profile || !["admin", "production"].includes(profile.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const { data, error } = await supabase.from("production_files").select("id,production_status,storage_path,created_at,updated_at,order_items(id,quantity,orders(id,order_number,status,total_twd))").order("updated_at", { ascending: false });
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ items: data ?? [] });
}

export async function PATCH(request: Request) {
  const body = await request.json();
  const supabase = await createClient();
  const { data: profile } = await supabase.from("profiles").select("role").single();
  if (!profile || !["admin", "production"].includes(profile.role)) return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  const allowed = ["pending","ready","printing","framing","packed","completed"];
  if (!body.id || !allowed.includes(body.status)) return NextResponse.json({ error: "Invalid request" }, { status: 400 });
  const { data, error } = await supabase.rpc("update_production_status", { p_production_file_id: body.id, p_status: body.status });
  if (error) return NextResponse.json({ error: error.message }, { status: 400 });
  return NextResponse.json({ item: data });
}