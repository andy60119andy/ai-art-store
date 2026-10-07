"use client";
import Link from "next/link";
import {useEffect,useState} from "react";
export default function CartPage(){
 const [items,setItems]=useState<any[]>([]),[message,setMessage]=useState("載入購物車…");
 async function load(){const r=await fetch("/api/cart/items");const d=await r.json();if(!r.ok){setMessage(d.error||"載入失敗");return}setItems(d.items||[]);setMessage("")}
 useEffect(()=>{load()},[]);
 const total=items.reduce((n,i)=>n+i.unit_price_twd*i.quantity,0);
 return <main className="page"><section className="hero" style={{maxWidth:1000}}>
  <p className="eyebrow">SHOPPING CART</p><h1>購物車</h1>{message&&<p>{message}</p>}
  {!message&&!items.length&&<div style={{padding:"40px 0",textAlign:"center"}}><h2>購物車是空的</h2><p>先製作一件 AI 藝術作品，再選擇尺寸與畫框。</p><Link href="/upload">開始創作 →</Link></div>}
  {items.map(i=><div key={i.id} style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",padding:"22px 0",borderBottom:"1px solid #e4e4e0"}}>
   <div><strong>客製藝術掛畫</strong><div style={{marginTop:8,fontSize:13,color:"#666"}}>{i.custom_width_mm&&i.custom_height_mm?`${i.custom_width_mm} × ${i.custom_height_mm} mm · 客製尺寸`:"標準尺寸"} · 畫框 / 紙張已保留</div><div style={{display:"flex",alignItems:"center",gap:8,margin:"10px 0"}}><button aria-label="減少數量" onClick={async()=>{if(i.quantity<=1)return;await fetch("/api/cart/items",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemId:i.id,quantity:i.quantity-1})});load()}}>-</button><span style={{minWidth:24,textAlign:"center"}}>{i.quantity}</span><button aria-label="增加數量" onClick={async()=>{await fetch("/api/cart/items",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemId:i.id,quantity:i.quantity+1})});load()}}>+</button></div><p style={{margin:0,fontSize:13,color:"#888"}}>Mockup 與作品規格會一起帶入訂單與生產單</p></div>
   <div style={{textAlign:"right"}}><strong>NT$ {(i.unit_price_twd*i.quantity).toLocaleString()}</strong><br/><button onClick={async()=>{await fetch("/api/cart/items",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemId:i.id})});load()}} style={{marginTop:8}}>移除</button></div>
  </div>)}
  {items.length>0&&<div style={{marginTop:28,display:"flex",justifyContent:"space-between",alignItems:"end",gap:20,flexWrap:"wrap"}}><div><p style={{margin:0,color:"#666"}}>商品小計</p><h2 style={{margin:"6px 0"}}>NT$ {total.toLocaleString()}</h2></div><Link href="/checkout" style={{display:"inline-block",padding:"14px 28px",borderRadius:12,fontWeight:800,textDecoration:"none",background:"#171717",color:"#fff"}}>前往結帳 →</Link></div>}
 </section></main>;
}