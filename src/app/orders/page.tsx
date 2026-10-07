import { hasSupabaseConfiguration } from "@/lib/service-availability";
import ServiceState from "@/components/site/ServiceState";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const statusLabel: Record<string, string> = {
  pending_payment: "待付款",
  paid: "已付款",
  processing: "處理中",
  in_production: "生產中",
  shipped: "已出貨",
  completed: "已完成",
  cancelled: "已取消",
  refunded: "已退款",
};
const paymentLabel: Record<string, string> = {
  pending: "待付款",
  paid: "付款成功",
  failed: "付款失敗",
  refunded: "已退款",
};

export default async function OrdersPage() {
  if (!hasSupabaseConfiguration())
    return (
      <ServiceState
        title="我的訂單"
        eyebrow="MY ORDERS"
        description="你的藝術作品與製作進度，都會保留在這裡。"
      />
    );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: orders } = await supabase
    .from("orders")
    .select("id,order_number,status,total_twd,created_at,payments(status)")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });
  return (
    <main className="page">
      <section className="hero" style={{ maxWidth: 1000 }}>
        <p className="eyebrow">MY ORDERS</p>
        <h1>我的訂單</h1>
        <p>查看付款、生產與物流進度。</p>
        {!orders?.length ? (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <h2>目前還沒有訂單</h2>
            <p>完成第一件 AI 藝術掛畫後，訂單會出現在這裡。</p>
            <Link href="/upload">開始創作 →</Link>
          </div>
        ) : (
          <div style={{ display: "grid", gap: 14 }}>
            {orders.map((order) => {
              const payment = Array.isArray(order.payments)
                ? order.payments[0]
                : order.payments;
              return (
                <Link
                  key={order.id}
                  href={"/orders/" + order.id}
                  style={{
                    display: "block",
                    padding: 20,
                    border: "1px solid #e4e4e0",
                    borderRadius: 18,
                    background: "#fff",
                    color: "inherit",
                    textDecoration: "none",
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 16,
                      flexWrap: "wrap",
                    }}
                  >
                    <strong>訂單 {order.order_number}</strong>
                    <strong>NT$ {order.total_twd.toLocaleString()}</strong>
                  </div>
                  <div
                    style={{
                      marginTop: 10,
                      display: "flex",
                      gap: 10,
                      flexWrap: "wrap",
                      fontSize: 14,
                    }}
                  >
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "#f1f1ed",
                      }}
                    >
                      {statusLabel[order.status] ?? order.status}
                    </span>
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: 999,
                        background: "#f1f1ed",
                      }}
                    >
                      付款：
                      {paymentLabel[payment?.status ?? "pending"] ??
                        payment?.status ??
                        "待付款"}
                    </span>
                    <span style={{ color: "#777" }}>
                      {new Date(order.created_at).toLocaleDateString("zh-TW")}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
        <p style={{ marginTop: 24 }}>
          <Link href="/account">← 回會員中心</Link>
        </p>
      </section>
    </main>
  );
}
