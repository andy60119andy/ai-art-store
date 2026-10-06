import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import OrderStatusForm from "@/components/admin/OrderStatusForm";

const labels:Record<string,string>={pending_payment:"待付款",paid:"已付款",processing:"處理中",in_production:"生產中",shipped:"已出貨",completed:"已完成",cancelled:"已取消",refunded:"已退款"};
export default async function AdminOrdersPage(){
 const profile=await getCurrentProfile();
 if(!profile || (profile.role!=="admin"&&profile.role!=="production")) redirect("/");
 const supabase=await createClient();
 const {data:orders}=await supabase.from("orders").select("id,order_number,user_id,status,total_twd,shipping_address,created_at,payments(status,provider)").order("created_at",{ascending:false});
 return <main className="page"><section className="hero">
  <p className="eyebrow">ORDER MANAGEMENT</p><h1>訂單管理</h1><p>管理訂單付款與生產流程。</p>
  <div style={{display:"grid",gap:14}}>{(orders??[]).map(o=>{const p=Array.isArray(o.payments)?o.payments[0]:o.payments;return <article key={o.id} style={{padding:18,border:"1px solid #e4e4e0",borderRadius:16,background:"#fff"}}>
   <div style={{display:"flex",justifyContent:"space-between",gap:16,flexWrap:"wrap"}}><strong>{o.order_number}</strong><strong>NT$ {o.total_twd.toLocaleString()}</strong></div>
   <p>付款：{p?.status??"pending"}　目前：{labels[o.status]??o.status}</p>
   <p>建立：{new Date(o.created_at).toLocaleString("zh-TW")}</p>
   <OrderStatusForm orderId={o.id} currentStatus={o.status}/>
  </article>})}</div>
  <p><a href="/admin">← 後台首頁</a></p>
 </section></main>;
}
