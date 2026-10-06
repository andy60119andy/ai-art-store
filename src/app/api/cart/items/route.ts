import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const user = await getCurrentUser(); if (!user) return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
  const supabase=await createClient();
  const {data:cart}=await supabase.from("carts").select("id").eq("user_id",user.id).single();
  if(!cart) return NextResponse.json({error:"CART_NOT_FOUND"},{status:404});
  const {data,error}=await supabase.from("cart_items").select("id,product_id,artwork_id,size_id,frame_id,paper_id,quantity,unit_price_twd,created_at").eq("cart_id",cart.id).order("created_at",{ascending:false});
  if(error) return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({cartId:cart.id,items:data??[]});
}

export async function POST(req:Request) {
  const user=await getCurrentUser(); if(!user) return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
  const body=await req.json(); const ids=[body.productId,body.artworkId,body.sizeId,body.frameId,body.paperId];
  if(!body.productId||!body.sizeId||!body.frameId||!body.paperId) return NextResponse.json({error:"INVALID_ITEM"},{status:400});
  const supabase=await createClient();
  const [{data:cart},{data:product},{data:size},{data:frame},{data:paper}]=await Promise.all([
    supabase.from("carts").select("id").eq("user_id",user.id).single(),
    supabase.from("products").select("id,base_price_twd").eq("id",body.productId).eq("active",true).single(),
    supabase.from("product_sizes").select("id,product_id,price_delta_twd").eq("id",body.sizeId).eq("active",true).single(),
    supabase.from("frames").select("id,price_delta_twd").eq("id",body.frameId).eq("active",true).single(),
    supabase.from("papers").select("id,price_delta_twd").eq("id",body.paperId).eq("active",true).single()
  ]);
  if(!cart||!product||!size||!frame||!paper||size.product_id!==product.id) return NextResponse.json({error:"INVALID_CATALOG_SELECTION"},{status:400});
  let artworkId=body.artworkId||null;
  if(artworkId){const {data:art}=await supabase.from("artworks").select("id").eq("id",artworkId).eq("user_id",user.id).single();if(!artwork)return NextResponse.json({error:"INVALID_ARTWORK"},{status:400});}
  const unitPrice=product.base_price_twd+size.price_delta_twd+frame.price_delta_twd+paper.price_delta_twd;
  const {data,error}=await supabase.from("cart_items").insert({cart_id:cart.id,product_id:product.id,artwork_id:artworkId,size_id:size.id,frame_id:frame.id,paper_id:paper.id,quantity:Math.max(1,Number(body.quantity)||1),unit_price_twd:unitPrice}).select().single();
  if(error)return NextResponse.json({error:error.message},{status:500});
  return NextResponse.json({item:data});
}

export async function DELETE(req:Request){
 const user=await getCurrentUser();if(!user)return NextResponse.json({error:"UNAUTHORIZED"},{status:401});
 const body=await req.json();if(!body.itemId)return NextResponse.json({error:"INVALID_ITEM"},{status:400});
 const supabase=await createClient();const {data:cart}=await supabase.from("carts").select("id").eq("user_id",user.id).single();if(!cart)return NextResponse.json({error:"CART_NOT_FOUND"},{status:404});
 const {error}=await supabase.from("cart_items").delete().eq("id",body.itemId).eq("cart_id",cart.id);if(error)return NextResponse.json({error:error.message},{status:500});return NextResponse.json({ok:true});
}