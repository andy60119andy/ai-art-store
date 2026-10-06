import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { createServiceClient } from "@/lib/supabase/service";
import { buildEcpayPayment } from "@/lib/payments/ecpay";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });

  const body = await req.json();
  const supabase = await createClient();

  const { data: cart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!cart) return NextResponse.json({ error: "CART_NOT_FOUND" }, { status: 400 });

  const { data: cartItems, error: cartError } = await supabase
    .from("cart_items")
    .select("id,product_id,artwork_id,size_id,frame_id,paper_id,mockup_id,quantity,created_at")
    .eq("cart_id", cart.id)
    .order("created_at", { ascending: true });

  if (cartError || !cartItems?.length) {
    return NextResponse.json({ error: cartError?.message || "CART_EMPTY" }, { status: 400 });
  }

  const { data, error } = await supabase.rpc("create_order_from_cart", {
    p_user_id: user.id,
    p_shipping_address: body.shippingAddress,
  });
  if (error || !data?.[0]) {
    return NextResponse.json({ error: error?.message || "CHECKOUT_FAILED" }, { status: 400 });
  }

  const order = data[0];
  const service = createServiceClient();

  const { data: orderItems, error: orderItemsError } = await service
    .from("order_items")
    .select("id,product_id,artwork_id,size_id,frame_id,paper_id,quantity,created_at")
    .eq("order_id", order.order_id)
    .order("created_at", { ascending: true });

  if (orderItemsError || !orderItems || orderItems.length !== cartItems.length) {
    return NextResponse.json({ error: "ORDER_ITEM_SYNC_FAILED" }, { status: 500 });
  }

  for (let i = 0; i < orderItems.length; i += 1) {
    const source = cartItems[i];
    if (source.mockup_id) {
      const { error: mockupError } = await service
        .from("order_items")
        .update({ mockup_id: source.mockup_id })
        .eq("id", orderItems[i].id);
      if (mockupError) return NextResponse.json({ error: "MOCKUP_SYNC_FAILED" }, { status: 500 });
    }
  }

  const { error: paymentError } = await service.from("payments").insert({
    order_id: order.order_id,
    provider: "ecpay",
    status: "pending",
    amount_twd: order.total_twd,
  });
  if (paymentError) return NextResponse.json({ error: "PAYMENT_RECORD_CREATE_FAILED" }, { status: 500 });

  const payment = buildEcpayPayment({
    orderNumber: order.order_number,
    totalTwd: order.total_twd,
    itemName: "客製藝術掛畫",
  });

  return NextResponse.json({
    order: {
      id: order.order_id,
      order_number: order.order_number,
      status: "pending_payment",
      total_twd: order.total_twd,
    },
    payment,
  }, { status: 201 });
}
