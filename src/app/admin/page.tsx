import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

const labels:Record<string,string>={pending_payment:"待付款",paid:"已付款",processing:"處理中",in_production:"生產中",shipped:"已出貨",completed:"已完成",cancelled:"已取消",refunded:"已退款"};

export default async function AdminPage(){
 const profile=await getCurrentProfile();
 if(!profile || (profile.role!=="admin"&&profile.role!=="production")) redirect("/");
 const supabase=await createClient();
 const {data:orders}=await supabase.from("orders").select("id,status,total_twd,created_at").order("created_at",{ascending:false});
 const list=orders??[];
 const total=list.reduce((n,o)=>n+o.total_twd,0);
 const pending=list.filter(o=>o.status==="pending_payment").length;
 const production=list.filter(o=>o.status==="in_production").length;
 const shipped=list.filter(o=>o.status==="shipped").length;
 return <main className="page"><section className="hero">
  <p className="eyebrow">ADMIN CONSOLE</p><h1>管理後台</h1>
  <p>歡迎，{profile.display_name??"管理員"}。這裡集中管理訂單與後續生產流程。</p>
  <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))",gap:14}}>
   {[["訂單總數",String(list.length)],["訂單金額","NT$ "+total.toLocaleString()],["待付款",String(pending)],["生產中",String(production)],["已出貨",String(shipped)]].map(([k,v])=><div key={k} style={{padding:18,border:"1px solid #e4e4e0",borderRadius:16,background:"#fff"}}><strong>{k}</strong><div style={{fontSize:28,marginTop:8}}>{v}</div></div>)}
  </div>
  <p style={{marginTop:24}}><Link href="/admin/orders">進入訂單管理 →</Link></p>
  <h2>最近訂單</h2>
  <div style={{display:"grid",gap:10}}>{list.slice(0,8).map(o=><Link key={o.id} href="/admin/orders" style={{padding:14,border:"1px solid #e4e4e0",borderRadius:12,color:"inherit",textDecoration:"none",background:"#fff"}}>{labels[o.status]??o.status}　NT$ {o.total_twd.toLocaleString()}</Link>)}</div>
 </section></main>;
}
