"use client";
import {useState} from "react";
const statuses=[["pending_payment","待付款"],["paid","已付款"],["processing","處理中"],["in_production","生產中"],["shipped","已出貨"],["completed","已完成"],["cancelled","已取消"],["refunded","已退款"]];
export default function OrderStatusForm({orderId,currentStatus}:{orderId:string;currentStatus:string}){
 const [status,setStatus]=useState(currentStatus); const [message,setMessage]=useState("");
 async function save(){setMessage("更新中…");const r=await fetch("/api/admin/orders",{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({orderId,status})});const d=await r.json();setMessage(r.ok?"已更新 ✓":(d.error??"更新失敗"));if(r.ok) window.location.reload();}
 return <div style={{display:"flex",gap:10,alignItems:"center",flexWrap:"wrap"}}><select value={status} onChange={e=>setStatus(e.target.value)}>{statuses.map(([v,l])=><option key={v} value={v}>{l}</option>)}</select><button onClick={save}>更新狀態</button>{message&&<span>{message}</span>}</div>;
}
