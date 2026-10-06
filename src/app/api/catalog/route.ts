import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const supabase = await createClient();
  const [products, sizes, frames, papers] = await Promise.all([
    supabase.from("products").select("id,name,slug,description,base_price_twd").eq("active", true).order("name"),
    supabase.from("product_sizes").select("id,product_id,name,width_mm,height_mm,price_delta_twd").eq("active", true).order("width_mm"),
    supabase.from("frames").select("id,name,material,color,price_delta_twd").eq("active", true).order("name"),
    supabase.from("papers").select("id,name,description,price_delta_twd").eq("active", true).order("name")
  ]);
  if (products.error || sizes.error || frames.error || papers.error) return NextResponse.json({ error: "CATALOG_FETCH_FAILED" }, { status: 500 });
  return NextResponse.json({products:products.data??[],sizes:sizes.data??[],frames:frames.data??[],papers:papers.data??[]});
}
