import { mockupMatchesSelection } from "@/lib/cart/mockup";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const MIN_MM = 100;
const MAX_WIDTH_MM = 3000;
const MAX_HEIGHT_MM = 6000;

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
      "id,product_id,artwork_id,size_id,frame_id,paper_id,custom_width_mm,custom_height_mm,mockup_id,custom_width_mm,custom_height_mm,quantity,unit_price_twd,created_at",
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
  const body = await req.json();
  if (!body.productId || !body.frameId || !body.paperId)
    return NextResponse.json({ error: "INVALID_ITEM" }, { status: 400 });

  const customWidthMm =
    body.customWidthMm == null ? null : Math.floor(Number(body.customWidthMm));
  const customHeightMm =
    body.customHeightMm == null
      ? null
      : Math.floor(Number(body.customHeightMm));
  const isCustom = customWidthMm !== null || customHeightMm !== null;
  const widthForValidation = customWidthMm ?? -1;
  const heightForValidation = customHeightMm ?? -1;
  if (
    isCustom &&
    (!Number.isFinite(widthForValidation) ||
      !Number.isFinite(heightForValidation) ||
      widthForValidation < MIN_MM ||
      widthForValidation > MAX_WIDTH_MM ||
      heightForValidation < MIN_MM ||
      heightForValidation > MAX_HEIGHT_MM)
  ) {
    return NextResponse.json({ error: "INVALID_CUSTOM_SIZE" }, { status: 400 });
  }
  if (!isCustom && !body.sizeId)
    return NextResponse.json({ error: "INVALID_SIZE" }, { status: 400 });

  const supabase = await createClient();
  const [
    { data: cart },
    { data: product },
    { data: size },
    { data: frame },
    { data: paper },
  ] = await Promise.all([
    supabase.from("carts").select("id").eq("user_id", user.id).single(),
    supabase
      .from("products")
      .select("id,base_price_twd")
      .eq("id", body.productId)
      .eq("active", true)
      .single(),
    body.sizeId
      ? supabase
          .from("product_sizes")
          .select("id,product_id,price_delta_twd")
          .eq("id", body.sizeId)
          .eq("active", true)
          .single()
      : Promise.resolve({ data: null }),
    supabase
      .from("frames")
      .select("id,price_delta_twd")
      .eq("id", body.frameId)
      .eq("active", true)
      .single(),
    supabase
      .from("papers")
      .select("id,price_delta_twd")
      .eq("id", body.paperId)
      .eq("active", true)
      .single(),
  ]);
  if (
    !cart ||
    !product ||
    !frame ||
    !paper ||
    (!isCustom && (!size || size.product_id !== product.id))
  )
    return NextResponse.json(
      { error: "INVALID_CATALOG_SELECTION" },
      { status: 400 },
    );

  const artworkId = body.artworkId || null;
  const mockupId = body.mockupId || null;
  if (mockupId) {
    const { data: mockup } = await supabase
      .from("mockups")
      .select(
        "id,artwork_id,size_id,frame_id,paper_id,custom_width_mm,custom_height_mm",
      )
      .eq("id", mockupId)
      .eq("user_id", user.id)
      .single();
    if (
      !mockup ||
      !mockupMatchesSelection(mockup, {
        artworkId,
        frameId: frame.id,
        paperId: paper.id,
        sizeId: isCustom ? null : size!.id,
        customWidthMm: isCustom ? customWidthMm : null,
        customHeightMm: isCustom ? customHeightMm : null,
      })
    )
      return NextResponse.json({ error: "INVALID_MOCKUP" }, { status: 400 });
  }
  if (artworkId) {
    const { data: art } = await supabase
      .from("artworks")
      .select("id")
      .eq("id", artworkId)
      .eq("user_id", user.id)
      .single();
    if (!art)
      return NextResponse.json({ error: "INVALID_ARTWORK" }, { status: 400 });
  }

  const safeCustomWidthMm = widthForValidation;
  const safeCustomHeightMm = heightForValidation;
  const unitPrice = isCustom
    ? product.base_price_twd +
      Math.ceil(((safeCustomWidthMm * safeCustomHeightMm) / 1000000) * 2200) +
      frame.price_delta_twd +
      paper.price_delta_twd
    : product.base_price_twd +
      size!.price_delta_twd +
      frame.price_delta_twd +
      paper.price_delta_twd;

  const { data, error } = await supabase
    .from("cart_items")
    .insert({
      cart_id: cart.id,
      product_id: product.id,
      artwork_id: artworkId,
      size_id: isCustom ? null : size!.id,
      frame_id: frame.id,
      paper_id: paper.id,
      mockup_id: mockupId,
      custom_width_mm: isCustom ? customWidthMm : null,
      custom_height_mm: isCustom ? customHeightMm : null,
      quantity: Math.max(1, Number(body.quantity) || 1),
      unit_price_twd: unitPrice,
    })
    .select()
    .single();
  if (error)
    return NextResponse.json({ error: error.message }, { status: 500 });
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
