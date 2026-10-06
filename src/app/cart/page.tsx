"use client";
import {useEffect,useState} from "react";
export default function CartPage(){
const [items,setItems]=useState<any[]>([]),[message,setMessage]=useState("載入購物車…");
async function load(){const r=await fetch("/api/cart/items");const d=await r.json();if(!r.ok){setMessage(d.error||"載入失敗");return}setItems(d.items||[]);setMessage("")}
useEffect(()=>{load()},[]);
const total=items.reduce((n,i)=>n+i.unit_price_twd*i.quantity,0);
return <main className="page"><section className="hero" style={{maxWidth:1000}}><p className="eyebrow">SHOPPING CART</p><h1>購物車</h1>{message&&<p>{message}</p>}{!message&&!items.length&&<p>購物車目前是空的。</p>}{items.map((i)=><div key={i.id} style={{display:"flex",justifyContent:"space-between",gap:20,alignItems:"center",padding:"20px 0",borderBottom:"1px solid #ddd"}}><div><strong>客製藝術掛畫</strong><p style={{margin:"6px 0",color:"#666"}}>{i.quantity} 件</p></div><div style={{textAlign:"right"}}><strong>{"NT$"+(i.unit_price_twd*i.quantity).toLocaleString()}</strong><br/><button onClick={async()=>{await fetch("/api/cart/items",{method:"DELETE",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemId:i.id})});load()}} style={{marginTop:8}}>刪除</button></div></div>)}{items.length>0&&<div style={{marginTop:28,textAlign:"right"}}><p>商品小計</p><h2>{"NT$"+total.toLocaleString()}</h2><a href="/checkout" style={{display:"inline-block",padding:"14px 28px",borderRadius:12,fontWeight:800,textDecoration:"none",background:"#171717",color:"#fff"}}>前往結帳</a></div>}</section></main>
}