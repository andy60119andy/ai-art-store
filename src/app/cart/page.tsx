"use client";
import Link from "next/link";
import ServiceState from "@/components/site/ServiceState";
import { useEffect, useState } from "react";
export default function CartPage() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
    <LiveCartPage />
  ) : (
    <ServiceState
      title="購物車"
      eyebrow="YOUR ART COLLECTION"
      description="先選擇一件專屬藝術作品，再搭配帆布尺寸。"
    />
  );
}
function LiveCartPage() {
  const [items, setItems] = useState<any[]>([]),
    [message, setMessage] = useState("載入購物車…");
  const [busy, setBusy] = useState(false);
  async function load(signal?: AbortSignal) {
    try {
      const r = await fetch("/api/cart/items", { cache: "no-store", signal });
      const d = await r.json();
      if (signal?.aborted) return;
      if (r.status === 404 && d.error === "CART_NOT_FOUND") {
        setItems([]);
        setMessage("");
        return;
      }
      if (!r.ok) {
        setMessage(
          r.status === 401
            ? "請先登入，再查看購物車。"
            : "購物車暫時無法載入，請重試。",
        );
        return;
      }
      setItems(d.items || []);
      setMessage("");
    } catch {
      if (!signal?.aborted) setMessage("連線失敗，請重新載入購物車。");
    }
  }
  async function changeItem(itemId: string, quantity?: number) {
    if (busy) return;
    setBusy(true);
    try {
      const r = await fetch("/api/cart/items", {
        method: quantity === undefined ? "DELETE" : "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ itemId, quantity }),
      });
      if (!r.ok) {
        setMessage("更新未完成，商品與數量未確認變更，請重試。");
        return;
      }
      await load();
    } catch {
      setMessage("連線中斷，請重新載入確認商品與數量。");
    } finally {
      setBusy(false);
    }
  }
  useEffect(() => {
    const controller = new AbortController();
    load(controller.signal);
    return () => controller.abort();
  }, []);
  const total = items.reduce((n, i) => n + i.unit_price_twd * i.quantity, 0);
  return (
    <main className="page">
      <section className="hero" style={{ maxWidth: 1000 }}>
        <p className="eyebrow">SHOPPING CART</p>
        <h1>購物車</h1>
        {message && (
          <div role="status" className="arto-product-notice">
            {message}{" "}
            <button
              className="arto-text-button"
              disabled={busy}
              onClick={() => load()}
            >
              重新載入
            </button>{" "}
            <Link href="/login?next=/cart">登入</Link>
          </div>
        )}
        {!message && !items.length && (
          <div style={{ padding: "40px 0", textAlign: "center" }}>
            <h2>購物車是空的</h2>
            <p>先製作一件 AI 藝術作品，再選擇帆布尺寸。</p>
            <Link href="/shop">挑選作品風格 →</Link>
          </div>
        )}
        {items.map((i) => (
          <div
            key={i.id}
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 20,
              alignItems: "center",
              padding: "22px 0",
              borderBottom: "1px solid #e4e4e0",
            }}
          >
            <div>
              <strong>油畫布／帆布裸框</strong>
              <p>
                <Link href={`/artworks/${i.artwork_id}`}>確認這件作品 →</Link>
              </p>
              <div style={{ marginTop: 8, fontSize: 13, color: "#666" }}>
                {i.custom_width_mm && i.custom_height_mm
                  ? `${i.custom_width_mm} × ${i.custom_height_mm} mm · 客製尺寸`
                  : "標準尺寸"}{" "}
                · 油畫布／帆布裸框 ·{" "}
                {i.print_orientation === "landscape" ? "橫式" : "直式"}
              </div>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  margin: "10px 0",
                }}
              >
                <button
                  disabled={busy || i.quantity <= 1}
                  aria-label="減少數量"
                  onClick={() => changeItem(i.id, i.quantity - 1)}
                >
                  -
                </button>
                <span style={{ minWidth: 24, textAlign: "center" }}>
                  {i.quantity}
                </span>
                <button
                  disabled={busy || i.quantity >= 99}
                  aria-label="增加數量"
                  onClick={() => changeItem(i.id, i.quantity + 1)}
                >
                  +
                </button>
              </div>
              <p style={{ margin: 0, fontSize: 13, color: "#888" }}>
                作品與帆布尺寸會保留於訂單；僅配送台灣本島
              </p>
            </div>
            <div style={{ textAlign: "right" }}>
              <strong>
                NT$ {(i.unit_price_twd * i.quantity).toLocaleString()}
              </strong>
              <p>
                單價 NT$ {i.unit_price_twd.toLocaleString()} × {i.quantity}
              </p>
              <button
                disabled={busy}
                onClick={() => changeItem(i.id)}
                style={{ marginTop: 8 }}
              >
                移除
              </button>
            </div>
          </div>
        ))}
        {!message && items.length > 0 && !busy && (
          <div
            style={{
              marginTop: 28,
              display: "flex",
              justifyContent: "space-between",
              alignItems: "end",
              gap: 20,
              flexWrap: "wrap",
            }}
          >
            <div>
              <p style={{ margin: 0, color: "#666" }}>
                商品小計（未含宅配運費）
              </p>
              <h2 style={{ margin: "6px 0" }}>NT$ {total.toLocaleString()}</h2>
            </div>
            <Link
              href="/checkout"
              style={{
                display: "inline-block",
                padding: "14px 28px",
                borderRadius: 12,
                fontWeight: 800,
                textDecoration: "none",
                background: "#171717",
                color: "#fff",
              }}
            >
              前往結帳 →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
