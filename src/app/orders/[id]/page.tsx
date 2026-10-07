import { hasSupabaseConfiguration } from "@/lib/service-availability";
import ServiceState from "@/components/site/ServiceState";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!hasSupabaseConfiguration())
    return (
      <ServiceState
        title="訂單詳情"
        eyebrow="ORDER DETAILS"
        description="查看作品規格、製作與配送進度。"
      />
    );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { id } = await params;
  const { data: order } = await supabase
    .from("orders")
    .select(
      `id,order_number,status,shipping_address,subtotal_twd,shipping_fee_twd,discount_twd,total_twd,created_at,
      order_items(id,quantity,unit_price_twd,product_id,artwork_id,size_id,frame_id,paper_id,mockup_id,
        products(name),
        product_sizes(name,width_mm,height_mm),
        frames(name),
        papers(name),
        mockups(id,storage_path)
      ),
      payments(status,provider)`,
    )
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!order) notFound();

  const payment = Array.isArray(order.payments)
    ? order.payments[0]
    : order.payments;
  const address = order.shipping_address as {
    recipient_name?: string;
    phone?: string;
    city?: string;
    address_line?: string;
  } | null;

  const items = await Promise.all(
    (order.order_items ?? []).map(async (item: any) => {
      const mockup = Array.isArray(item.mockups)
        ? item.mockups[0]
        : item.mockups;
      const signed = mockup?.storage_path
        ? await supabase.storage
            .from("artwork-uploads")
            .createSignedUrl(mockup.storage_path, 3600)
        : null;
      return { ...item, mockupUrl: signed?.data?.signedUrl ?? null };
    }),
  );

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">ORDER DETAIL</p>
        <h1>{order.order_number}</h1>
        <p>
          訂單狀態：<strong>{statusLabel[order.status] ?? order.status}</strong>
          <br />
          付款狀態：
          <strong>
            {paymentLabel[payment?.status ?? "pending"] ??
              payment?.status ??
              "待付款"}
          </strong>
        </p>
        <div style={{ display: "grid", gap: 12 }}>
          {items.map((item: any) => {
            const product = Array.isArray(item.products)
              ? item.products[0]
              : item.products;
            const size = Array.isArray(item.product_sizes)
              ? item.product_sizes[0]
              : item.product_sizes;
            const frame = Array.isArray(item.frames)
              ? item.frames[0]
              : item.frames;
            const paper = Array.isArray(item.papers)
              ? item.papers[0]
              : item.papers;
            return (
              <div
                key={item.id}
                style={{
                  padding: 16,
                  border: "1px solid #e4e4e0",
                  borderRadius: 14,
                  display: "grid",
                  gridTemplateColumns: "180px 1fr",
                  gap: 18,
                  alignItems: "center",
                }}
              >
                {item.mockupUrl ? (
                  <img
                    src={item.mockupUrl}
                    alt="畫框成品預覽"
                    style={{ width: "100%", borderRadius: 10 }}
                  />
                ) : (
                  <div
                    style={{
                      aspectRatio: "1",
                      background: "#f2f2ef",
                      borderRadius: 10,
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    作品
                  </div>
                )}
                <div>
                  <strong>{product?.name ?? "客製藝術掛畫"}</strong>
                  <div style={{ marginTop: 8 }}>
                    尺寸：
                    {item.custom_width_mm && item.custom_height_mm
                      ? `${item.custom_width_mm} × ${item.custom_height_mm} mm`
                      : (size?.name ?? "—")}
                    　畫框：{frame?.name ?? "—"}　紙張：{paper?.name ?? "—"}
                  </div>
                  <div style={{ marginTop: 8 }}>
                    數量：{item.quantity}　單價：NT${" "}
                    {item.unit_price_twd.toLocaleString()}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 20 }}>
          <p>商品小計：NT$ {order.subtotal_twd.toLocaleString()}</p>
          <p>運費：NT$ {order.shipping_fee_twd.toLocaleString()}</p>
          <p>折扣：NT$ {order.discount_twd.toLocaleString()}</p>
          <h2>合計：NT$ {order.total_twd.toLocaleString()}</h2>
        </div>
        {address && (
          <div
            style={{
              marginTop: 20,
              padding: 16,
              borderRadius: 14,
              background: "#f7f7f5",
            }}
          >
            <strong>收件資訊</strong>
            <p>
              {address.recipient_name}
              <br />
              {address.phone}
              <br />
              {address.city}
              {address.address_line}
            </p>
          </div>
        )}
        <p>
          <Link href={`/orders/${order.id}/tracking`}>
            查看物流與生產進度 →
          </Link>
        </p>
        <p>
          <Link href="/orders">← 我的訂單</Link>
        </p>
      </section>
    </main>
  );
}
