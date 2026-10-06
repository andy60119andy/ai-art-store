import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  pending_payment: "待付款", paid: "已付款", processing: "處理中",
  in_production: "生產中", shipped: "已出貨", completed: "已完成",
  cancelled: "已取消", refunded: "已退款",
};
const paymentLabel: Record<string, string> = {
  pending: "待付款", paid: "付款成功", failed: "付款失敗", refunded: "已退款",
};

export default async function OrderDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { data: order } = await supabase
    .from("orders")
    .select("id,order_number,status,shipping_address,subtotal_twd,shipping_fee_twd,discount_twd,total_twd,created_at,order_items(*),payments(status,provider)")
    .eq("id", id).eq("user_id", user.id).single();

  if (!order) notFound();
  const payment = Array.isArray(order.payments) ? order.payments[0] : order.payments;
  const address = order.shipping_address as { recipient_name?: string; phone?: string; city?: string; address_line?: string } | null;

  return <main className="page"><section className="hero">
    <p className="eyebrow">ORDER DETAIL</p>
    <h1>{order.order_number}</h1>
    <p>訂單狀態：<strong>{statusLabel[order.status] ?? order.status}</strong><br/>付款狀態：<strong>{paymentLabel[payment?.status ?? "pending"] ?? payment?.status ?? "待付款"}</strong></p>
    <div style={{ display:"grid", gap:12 }}>
      {order.order_items.map((item) => <div key={item.id} style={{ padding:16, border:"1px solid #e4e4e0", borderRadius:14 }}>
        <strong>{item.title}</strong>
        <div>數量：{item.quantity}　單價：NT$ {item.unit_price_twd.toLocaleString()}</div>
      </div>)}
    </div>
    <div style={{ marginTop:20 }}>
      <p>商品小計：NT$ {order.subtotal_twd.toLocaleString()}</p>
      <p>運費：NT$ {order.shipping_fee_twd.toLocaleString()}</p>
      <p>折扣：NT$ {order.discount_twd.toLocaleString()}</p>
      <h2>合計：NT$ {order.total_twd.toLocaleString()}</h2>
    </div>
    {address && <div style={{ marginTop:20, padding:16, borderRadius:14, background:"#f7f7f5" }}>
      <strong>收件資訊</strong><p>{address.recipient_name}<br/>{address.phone}<br/>{address.city}{address.address_line}</p>
    </div>}
    <p><Link href="/orders">← 我的訂單</Link></p>
  </section></main>;
}
