import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const supabase = await createClient();
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!cart)
    return NextResponse.json({ error: "CART_NOT_FOUND" }, { status: 404 });
  const { data, error } = await supabase
    .from("cart_items")
    .select(
      "id,product_id,artwork_id,size_id,frame_id,paper_id,custom_width_mm,custom_height_mm,mockup_id,print_orientation,quantity,unit_price_twd,created_at",
    )
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: false });
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ cartId: cart.id, items: data ?? [] });
}

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "INVALID_ITEM" }, { status: 400 });
  }
  const quantity = Number(body.quantity ?? 1);
  if (
    !body.productId ||
    !body.sizeId ||
    !body.artworkId ||
    !["portrait", "landscape"].includes(body.orientation ?? "portrait") ||
    body.frameId ||
    body.paperId ||
    body.customWidthMm ||
    body.customHeightMm ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > 99
  )
    return NextResponse.json({ error: "INVALID_CANVAS_ITEM" }, { status: 400 });
  const supabase = await createClient();
  const [{ data: cart }, { data: product }, { data: size }, { data: art }] =
    await Promise.all([
      supabase.from("carts").select("id").eq("user_id", user.id).single(),
      supabase
        .from("products")
        .select("id,base_price_twd,material,price_confirmed")
        .eq("id", body.productId)
        .eq("active", true)
        .single(),
      supabase
        .from("product_sizes")
        .select("id,product_id,price_delta_twd,width_mm,height_mm")
        .eq("id", body.sizeId)
        .eq("active", true)
        .single(),
      supabase
        .from("artworks")
        .select("id,status")
        .eq("id", body.artworkId)
        .eq("user_id", user.id)
        .single(),
    ]);
  if (!cart || !product || !size || size.product_id !== product.id || !art)
    return NextResponse.json(
      { error: "INVALID_CATALOG_SELECTION" },
      { status: 400 },
    );
  if (
    product.material !== "canvas" ||
    !product.price_confirmed ||
    art.status !== "ready"
  )
    return NextResponse.json(
      { error: "PRODUCT_OR_ARTWORK_NOT_READY" },
      { status: 400 },
    );
  const validSizes = [
    [203, 254],
    [406, 508],
    [610, 762],
  ];
  if (
    !validSizes.some(
      ([w, h]) =>
        (size.width_mm === w && size.height_mm === h) ||
        (size.width_mm === h && size.height_mm === w),
    )
  )
    return NextResponse.json({ error: "INVALID_CANVAS_SIZE" }, { status: 400 });
  const unitPrice = product.base_price_twd + size.price_delta_twd;
  if (!Number.isSafeInteger(unitPrice) || unitPrice <= 0)
    return NextResponse.json(
      { error: "PRICE_NOT_CONFIGURED" },
      { status: 400 },
    );
  const { data, error } = await supabase
    .from("cart_items")
    .insert({
      cart_id: cart.id,
      product_id: product.id,
      artwork_id: art.id,
      size_id: size.id,
      frame_id: null,
      paper_id: null,
      quantity,
      print_orientation: body.orientation ?? "portrait",
      unit_price_twd: unitPrice,
    })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: "CART_UPDATE_FAILED" }, { status: 500 });
  return NextResponse.json({ item: data });
}

export async function DELETE(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json();
  if (!body.itemId)
    return NextResponse.json({ error: "INVALID_ITEM" }, { status: 400 });
  const supabase = await createClient();
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!cart)
    return NextResponse.json({ error: "CART_NOT_FOUND" }, { status: 404 });
  const { error } = await supabase
    .from("cart_items")
    .delete()
    .eq("id", body.itemId)
    .eq("cart_id", cart.id);
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}

export async function PATCH(req: Request) {
  const user = await getCurrentUser();
  if (!user)
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json();
  const quantity = Math.floor(Number(body.quantity));
  if (
    !body.itemId ||
    !Number.isFinite(quantity) ||
    quantity < 1 ||
    quantity > 99
  )
    return NextResponse.json({ error: "INVALID_QUANTITY" }, { status: 400 });
  const supabase = await createClient();
  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!cart)
    return NextResponse.json({ error: "CART_NOT_FOUND" }, { status: 404 });
  const { data, error } = await supabase
    .from("cart_items")
    .update({ quantity })
    .eq("id", body.itemId)
    .eq("cart_id", cart.id)
    .select("id,quantity,unit_price_twd")
    .single();
  if (error || !data)
    return NextResponse.json(
      { error: error?.message || "ITEM_NOT_FOUND" },
      { status: error ? 500 : 404 },
    );
  return NextResponse.json({ item: data });
}
