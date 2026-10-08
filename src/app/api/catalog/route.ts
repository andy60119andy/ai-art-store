import { NextResponse } from "next/server";
import { hasSupabaseConfiguration } from "@/lib/service-availability";
import { createClient } from "@/lib/supabase/server";
export async function GET() {
  if (!hasSupabaseConfiguration())
    return NextResponse.json(
      { error: "CATALOG_NOT_CONFIGURED" },
      { status: 503 },
    );
  const supabase = await createClient();
  const [products, sizes] = await Promise.all([
    supabase
      .from("products")
      .select(
        "id,name,slug,description,base_price_twd,material,price_confirmed",
      )
      .eq("active", true)
      .eq("material", "canvas")
      .order("name"),
    supabase
      .from("product_sizes")
      .select("id,product_id,name,width_mm,height_mm,price_delta_twd")
      .eq("active", true)
      .order("width_mm"),
  ]);
  if (products.error || sizes.error)
    return NextResponse.json(
      { error: "CATALOG_FETCH_FAILED" },
      { status: 503 },
    );
  const ids = new Set((products.data ?? []).map((p) => p.id));
  const allowed = [
    [203, 254],
    [406, 508],
    [610, 762],
  ];
  return NextResponse.json({
    products: products.data ?? [],
    sizes: (sizes.data ?? []).filter(
      (s) =>
        ids.has(s.product_id) &&
        allowed.some(
          ([w, h]) =>
            (s.width_mm === w && s.height_mm === h) ||
            (s.width_mm === h && s.height_mm === w),
        ),
    ),
    currency: "TWD",
    material: "canvas",
    shippingRegion: "TW_MAINLAND",
  });
}
