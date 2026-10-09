"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
const sizes = [
  { label: "小尺寸 · 8 × 10 吋（約 20.3 × 25.4 cm）", width: 8, height: 10 },
  { label: "中尺寸 · 16 × 20 吋（約 40.6 × 50.8 cm）", width: 16, height: 20 },
  { label: "大尺寸 · 24 × 30 吋（約 61 × 76.2 cm）", width: 24, height: 30 },
];
export default function CanvasPreview() {
  const [selected, setSelected] = useState(0);
  const [landscape, setLandscape] = useState(false);
  const [artworkId, setArtworkId] = useState("");
  const [artwork, setArtwork] = useState<{
    title: string;
    status: string;
    url: string | null;
    version: number;
  } | null>(null);
  const [artworkMessage, setArtworkMessage] = useState("");
  const [catalog, setCatalog] = useState<{
    products: Array<{
      id: string;
      base_price_twd: number;
      price_confirmed: boolean;
    }>;
    sizes: Array<{
      id: string;
      product_id: string;
      width_mm: number;
      height_mm: number;
      price_delta_twd: number;
    }>;
  } | null>(null);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    const controller = new AbortController();
    const id =
      new URLSearchParams(window.location.search).get("artworkId") || "";
    setArtworkId(id);
    if (id) {
      setArtworkMessage("正在載入你的私有作品…");
      fetch(`/api/artworks/${encodeURIComponent(id)}`, {
        cache: "no-store",
        signal: controller.signal,
      })
        .then(async (r) => {
          if (!r.ok)
            throw new Error(
              r.status === 401
                ? "請登入後再選擇你的作品。"
                : "無法載入這件作品，請回作品庫重新選擇。",
            );
          return r.json();
        })
        .then((data) => {
          const versions = [...(data.artwork.artwork_versions ?? [])].sort(
            (a, b) => b.version_no - a.version_no,
          );
          const latest = versions[0];
          setArtwork({
            title: data.artwork.title || "我的藝術作品",
            status: data.artwork.status,
            url: latest?.signedUrl || null,
            version: latest?.version_no || 0,
          });
          setArtworkMessage(
            data.artwork.status === "ready" && latest?.signedUrl
              ? ""
              : "作品尚未完成或預覽不可用，請回作品庫確認。",
          );
        })
        .catch((error) => {
          if (!controller.signal.aborted)
            setArtworkMessage(
              error instanceof Error ? error.message : "作品載入失敗",
            );
        });
    }
    if (process.env.NEXT_PUBLIC_SUPABASE_URL)
      fetch("/api/catalog", { signal: controller.signal })
        .then((r) => (r.ok ? r.json() : null))
        .then(setCatalog)
        .catch(() => {
          if (!controller.signal.aborted) setMessage("商品資料暫時無法載入");
        });
    return () => controller.abort();
  }, []);
  const size = sizes[selected];
  const mm = [
    [203, 254],
    [406, 508],
    [610, 762],
  ][selected];
  const catalogSize = catalog?.sizes.find(
    (s) =>
      (s.width_mm === mm[0] && s.height_mm === mm[1]) ||
      (s.width_mm === mm[1] && s.height_mm === mm[0]),
  );
  const product = catalog?.products.find(
    (p) => p.id === catalogSize?.product_id,
  );
  async function addToCart() {
    if (
      !product ||
      !catalogSize ||
      !artworkId ||
      !product.price_confirmed ||
      artwork?.status !== "ready" ||
      !artwork.url
    )
      return;
    setBusy(true);
    try {
      const r = await fetch("/api/cart/items", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productId: product.id,
          sizeId: catalogSize.id,
          artworkId,
          quantity: 1,
          orientation: landscape ? "landscape" : "portrait",
        }),
      });
      const data = await r.json();
      if (!r.ok) throw new Error(data.error || "加入失敗");
      window.location.assign("/cart");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "連線失敗");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="arto-home arto-subpage">
      <section className="arto-container arto-frame-page">
        <div className="arto-heading">
          <span className="arto-eyebrow">YOUR ART ON CANVAS</span>
          <h1>你的藝術，印在帆布上</h1>
          <p>油畫布／帆布輸出，裸框成品。標準尺寸僅配送台灣本島。</p>
        </div>
        <div className="arto-frame-grid">
          <div className="arto-room-preview">
            <div
              style={{
                position: "relative",
                width: `min(80%, ${(360 * (landscape ? size.height : size.width)) / 24}px)`,
                aspectRatio: landscape
                  ? size.height / size.width
                  : size.width / size.height,
                boxShadow: "8px 12px 28px rgba(0,0,0,.18)",
              }}
            >
              {!artworkId || artwork?.url ? (
                <Image
                  src={
                    artworkId
                      ? artwork!.url!
                      : "/images/reference/styles/oil-painting-portrait-thumb.webp"
                  }
                  alt={
                    artworkId
                      ? artwork?.title || "我的藝術作品"
                      : "油畫布裸框風格示意"
                  }
                  fill
                  unoptimized={!!artworkId}
                  sizes="(max-width: 800px) 80vw, 400px"
                  style={{ objectFit: "cover" }}
                />
              ) : (
                <div className="journey-artwork-placeholder">
                  {artworkMessage || "正在載入作品…"}
                </div>
              )}
            </div>
            <p>
              {artworkId
                ? "你的作品預覽；成品比例與裁切需確認。"
                : "示意圖非你的作品；相對尺寸示意，非實際牆面量測。"}
            </p>
          </div>
          <div className="arto-frame-controls">
            <h2>油畫布／帆布裸框</h2>
            <p className="arto-product-price">US$80 起</p>
            <label htmlFor="canvas-size">成品尺寸</label>
            <select
              id="canvas-size"
              value={selected}
              onChange={(e) => setSelected(Number(e.target.value))}
              style={{ width: "100%", padding: 14, margin: "10px 0 20px" }}
            >
              {sizes.map((s, i) => (
                <option value={i} key={s.label}>
                  {s.label}
                </option>
              ))}
            </select>
            <div className="journey-specs">
              <h3>這次選擇的成品</h3>
              <dl>
                <dt>作品</dt>
                <dd>
                  {artwork?.title ??
                    (artworkId ? "載入中／不可用" : "風格示意圖")}
                  {artwork?.version ? ` · 版本 ${artwork.version}` : ""}
                </dd>
                <dt>尺寸</dt>
                <dd>
                  {landscape
                    ? `${mm[1] / 10} × ${mm[0] / 10}`
                    : `${mm[0] / 10} × ${mm[1] / 10}`}{" "}
                  cm · {landscape ? "橫式" : "直式"}
                </dd>
                <dt>成品</dt>
                <dd>油畫布／帆布繃於內部木框，無外部裝飾框</dd>
                <dt>配送</dt>
                <dd>僅台灣本島宅配 · 運費另行確認</dd>
              </dl>
            </div>
            {artworkMessage && (
              <p role="status" className="arto-product-notice">
                {artworkMessage} <Link href="/account">前往我的作品 →</Link>
              </p>
            )}
            <label htmlFor="canvas-orientation">作品方向</label>
            <select
              id="canvas-orientation"
              value={landscape ? "landscape" : "portrait"}
              onChange={(e) => setLandscape(e.target.value === "landscape")}
              style={{ width: "100%", padding: 14, margin: "10px 0 20px" }}
            >
              <option value="portrait">直式</option>
              <option value="landscape">橫式</option>
            </select>
            {product?.price_confirmed && catalogSize && (
              <p>
                此尺寸台幣售價：NT$
                {(
                  product.base_price_twd + catalogSize.price_delta_twd
                ).toLocaleString()}
              </p>
            )}
            <button
              type="button"
              className="arto-button"
              disabled={
                busy ||
                !artworkId ||
                artwork?.status !== "ready" ||
                !artwork?.url ||
                !product ||
                !catalogSize ||
                !product?.price_confirmed
              }
              onClick={addToCart}
            >
              {busy ? "加入中…" : "將我的帆布作品加入購物車"}
            </button>
            {!artworkId && (
              <p>
                目前為尺寸體驗。
                <Link href="/account">從我的作品選擇完成作品 →</Link>
              </p>
            )}
            {(!product?.price_confirmed || !catalogSize) && (
              <p className="arto-product-notice">
                此尺寸的正式台幣售價尚未確認，暫時無法加入購物車。
              </p>
            )}
            {message && <p role="status">{message}</p>}
            <p>材質：油畫布／帆布</p>
            <p>成品：裸框（無外框）</p>
            <p className="arto-product-notice">
              價格參考 FrameArto，以美元（USD）標示。US$80
              為起價，各尺寸售價與運費待確認，不隨尺寸顯示虛構報價。正式結帳尚未啟用。
            </p>
            <Link href="/styles" className="arto-button">
              挑選藝術風格 →
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
