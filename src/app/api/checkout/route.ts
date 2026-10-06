import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 401 });
  const body = await req.json();
  const address = body.shippingAddress;
  if (!address?.recipient_name || !address?.phone || !address?.city || !address?.address_line) {
    return NextResponse.json({ error: "INVALID_SHIPPING_ADDRESS" }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: cart } = await supabase.from("carts").select("id").eq("user_id", user.id).single();
  if (!cart) return NextResponse.json({ error: "CART_NOT_FOUND" }, { status: 404 });

  const { data: items } = await supabase.from("cart_items")
    .select("id,product_id,artwork_id,size_id,frame_id,paper_id,quantity")
    .eq("cart_id", cart.id);
  if (!items?.length) return NextResponse.json({ error: "CART_EMPTY" }, { status: 400 });

  const ids = [...new Set(items.map(i => i.product_id))];
  const sizeIds = [...new Set(items.map(i => i.size_id).filter(Boolean))];
  const frameIds = [...new Set(items.map(i => i.frame_id).filter(Boolean))];
  const paperIds = [...new Set(items.map(i => i.paper_id).filter(Boolean))];

  const [{data:products},{data:sizes},{data:frames},{data:papers}] = await Promise.all([
    supabase.from("products").select("id,base_price_twd").in("id",ids).eq("active",true),
    supabase.from("product_sizes").select("id,product_id,price_delta_twd").in("id",sizeIds).eq("active",true),
    supabase.from("frames").select("id,price_delta_twd").in("id",frameIds).eq("active",true),
    supabase.from("papers").select("id,price_delta_twd").in("id",paperIds).eq("active",true)
  ]);

  const productMap=new Map((products||[]).map(x=>[x.id,x]));
  const sizeMap=new Map((sizes||[]).map(x=>[x.id,x]));
  const frameMap=new Map((frames||[]).map(x=>[x.id,x]));
  const paperMap=new Map((papers||[]).map(x=>[x.id,x]));

  let subtotal=0;
  const snapshots:any[]=[];
  for(const item of items){
    const p=productMap.get(item.product_id),s=item.size_id?sizeMap.get(item.size_id):null,f=item.frame_id?frameMap.get(item.frame_id):null,pa=item.paper_id?paperMap.get(item.paper_id):null;
    if(!p || (item.size_id&&!s) || (item.frame_id&&!f) || (item.paper_id&&!pa)) return NextResponse.json({error:"CATALOG_CHANGED"}, {status:409});
    if(s && s.product_id!==p.id) return NextResponse.json({error:"INVALID_SIZE"}, {status:409});
    const unit=p.base_price_twd+(s?.price_delta_twd||0)+(f?.price_delta_twd||0)+(pa?.price_delta_twd||0);
    subtotal+=unit*item.quantity;
    snapshots.push({...item,unit_price_twd:unit});
  }

  const orderNumber="AA"+Date.now().toString(36).toUpperCase()+Math.random().toString(36).slice(2,6).toUpperCase();
  const {data:order,error:orderError}=await supabase.from("orders").insert({
    user_id:user.id,order_number:orderNumber,status:"pending_payment",
    shipping_address:address,subtotal_twd:subtotal,shipping_fee_twd:0,discount_twd:0,total_twd:subtotal
  }).select("id,order_number,status,total_twd").single();
  if(orderError||!order) return NextResponse.json({error:orderError?.message||"ORDER_CREATE_FAILED"},{status:500});

  const {error:itemError}=await supabase.from("order_items").insert(snapshots.map(i=>({
    order_id:order.id,product_id:i.product_id,artwork_id:i.artwork_id,size_id:i.size_id,frame_id:i.frame_id,paper_id:i.paper_id,quantity:i.quantity,unit_price_twd:i.unit_price_twd
  })));
  if(itemError){await supabase.from("orders").delete().eq("id",order.id);return NextResponse.json({error:itemError.message},{status:500});}

  const {error:clearError}=await supabase.from("cart_items").delete().eq("cart_id",cart.id);
  if(clearError) return NextResponse.json({error:"ORDER_CREATED_CART_CLEAR_FAILED",order}, {status:500});
  return NextResponse.json({order}, {status:201});
}