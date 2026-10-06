import Link from "next/link";
import { redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  pending_payment: "待付款", paid: "已付款", processing: "處理中",
  in_production: "生產中", shipped: "已出貨", completed: "已完成",
  cancelled: "已取消", refunded: "已退款",
};
const paymentLabel: Record<string, string> = {
  pending: "待付款", paid: "付款成功", failed: "付款失敗", refunded: "已退款",
};

export default async function OrdersPage() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: orders } = await supabase
    .from("orders")
    .select("id,order_number,status,total_twd,created_at,payments(status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return <main className="page"><section className="hero">
    <p className="eyebrow">MY ORDERS</p><h1>我的訂單</h1>
    <p>查看訂單、付款狀態與訂單詳情。</p>
    {!orders?.length ? <p>目前還沒有訂單。</p> :
      <div style={{ display: "grid", gap: 14 }}>
        {orders.map((order) => {
          const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments;
          return <Link key={order.id} href={"/orders/" + order.id} style={{ display:"block", padding:18, border:"1px solid #e4e4e0", borderRadius:16, background:"#fff", color:"inherit", textDecoration:"none" }}>
            <strong>訂單 {order.order_number}</strong>
            <div style={{ marginTop:8, display:"flex", gap:16, flexWrap:"wrap" }}>
              <span>{statusLabel[order.status] ?? order.status}</span>
              <span>付款：{paymentLabel[payment?.status ?? "pending"] ?? payment?.status ?? "待付款"}</span>
              <span>NT$ {order.total_twd.toLocaleString()}</span>
            </div>
          </Link>;
        })}
      </div>}
    <p><Link href="/account">← 回會員中心</Link></p>
  </section></main>;
}
