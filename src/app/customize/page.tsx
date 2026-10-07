"use client";
import { useEffect, useMemo, useState } from "react";
import FramePreview from "@/components/site/FramePreview";
export default function CustomizePage() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL &&
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? (
    <LiveCustomizePage />
  ) : (
    <FramePreview />
  );
}
function LiveCustomizePage() {
  const [catalog, setCatalog] = useState<any>(null),
    [artworks, setArtworks] = useState<any[]>([]),
    [artworkId, setArtworkId] = useState(""),
    [sizeId, setSizeId] = useState(""),
    [frameId, setFrameId] = useState(""),
    [paperId, setPaperId] = useState(""),
    [custom, setCustom] = useState(false),
    [widthMm, setWidthMm] = useState(600),
    [heightMm, setHeightMm] = useState(900),
    [message, setMessage] = useState("載入商品資料…"),
    [adding, setAdding] = useState(false),
    [previewKey, setPreviewKey] = useState(""),
    [mockupId, setMockupId] = useState(""),
    [mockupUrl, setMockupUrl] = useState(""),
    [mockupLoading, setMockupLoading] = useState(false);
  useEffect(() => {
    const requestedArtworkId = new URLSearchParams(window.location.search).get(
      "artworkId",
    );
    Promise.all([
      fetch("/api/catalog").then(async (r) => {
        if (r.status === 401) {
          window.location.replace(
            "/login?next=" +
              encodeURIComponent(
                window.location.pathname + window.location.search,
              ),
          );
          throw new Error("請先登入，再選擇尺寸與畫框");
        }
        if (!r.ok) throw new Error("商品資料載入失敗，請稍後再試");
        return r.json();
      }),
      fetch("/api/artworks").then(async (r) => {
        if (!r.ok) throw new Error("作品載入失敗，請稍後再試");
        return r.json();
      }),
    ])
      .then(([c, a]) => {
        setCatalog(c);
        const list = (a.artworks || []).map((x: any) => ({
          ...x,
          imageUrl:
            x.artwork_versions?.sort(
              (u: any, v: any) => v.version_no - u.version_no,
            )[0]?.signedUrl || null,
        }));
        setArtworks(list);
        if (
          requestedArtworkId &&
          list.some((x: any) => x.id === requestedArtworkId)
        )
          setArtworkId(requestedArtworkId);
        const ss = (c.sizes || []).filter(
          (s: any) => s.product_id === c.products?.[0]?.id,
        );
        setSizeId(ss[0]?.id || "");
        setFrameId(c.frames?.[0]?.id || "");
        setPaperId(c.papers?.[0]?.id || "");
        setMessage(c.error ? "商品資料載入失敗" : "");
      })
      .catch((e) =>
        setMessage(e instanceof Error ? e.message : "載入失敗，請重新整理"),
      );
  }, []);
  const product = catalog?.products?.[0],
    size = catalog?.sizes?.find((x: any) => x.id === sizeId),
    frame = catalog?.frames?.find((x: any) => x.id === frameId),
    paper = catalog?.papers?.find((x: any) => x.id === paperId),
    artwork = artworks.find((x) => x.id === artworkId);
  const customPrice = product
    ? product.base_price_twd +
      Math.ceil(((widthMm * heightMm) / 1000000) * 2200) +
      (frame?.price_delta_twd || 0) +
      (paper?.price_delta_twd || 0)
    : 0;
  const total = useMemo(
    () =>
      custom
        ? customPrice
        : product
          ? product.base_price_twd +
            (size?.price_delta_twd || 0) +
            (frame?.price_delta_twd || 0) +
            (paper?.price_delta_twd || 0)
          : 0,
    [custom, customPrice, product, size, frame, paper],
  );
  const selectionKey = JSON.stringify([
    artworkId,
    custom,
    custom ? widthMm : sizeId,
    custom ? heightMm : null,
    frameId,
    paperId,
  ]);
  const validMockup = !!mockupId && previewKey === selectionKey;
  const ratio = custom
    ? widthMm / heightMm
    : size
      ? size.width_mm / size.height_mm
      : 4 / 5;
  const generateMockup = async () => {
    if (!artworkId || !frameId || !paperId) return;
    setMockupLoading(true);
    setMessage("正在製作真實畫框預覽…");
    try {
      const body: any = { artworkId, frameId, paperId };
      if (custom) {
        body.customWidthMm = widthMm;
        body.customHeightMm = heightMm;
      } else body.sizeId = sizeId;
      const r = await fetch("/api/mockups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || "MOCKUP_FAILED");
      if (!d.mockup?.id || !d.signedUrl)
        throw new Error("預覽尚未完成，請重新生成");
      setPreviewKey(selectionKey);
      setMockupId(d.mockup?.id || "");
      setMockupUrl(d.signedUrl || "");
      setMessage("成品預覽已完成 ✓");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "成品預覽失敗");
    } finally {
      setMockupLoading(false);
    }
  };
  return (
    <main className="page">
      <section className="hero" style={{ maxWidth: 1120 }}>
        <p className="eyebrow">CUSTOM ART PRODUCT</p>
        <h1>讓 AI 作品真正符合你的牆面尺寸</h1>
        <p>
          固定尺寸只是起點。我們的大圖輸出可依照你的牆面訂製，價格會依實際面積即時估算。
        </p>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 8,
            margin: "18px 0",
          }}
        >
          {[
            "✓ 免費 AI 預覽",
            "✓ 客製尺寸",
            "✓ 真實畫框 Mockup",
            "✓ 先看成果再決定",
          ].map((x) => (
            <span
              key={x}
              style={{
                padding: "7px 12px",
                borderRadius: 999,
                background: "#f1eee8",
                fontSize: 13,
                fontWeight: 700,
              }}
            >
              {x}
            </span>
          ))}
        </div>
        {message && (
          <p role="status" aria-live="polite">
            {message}
          </p>
        )}
        {catalog && product && (
          <div className="customize-grid" style={{ display: "grid", gap: 32 }}>
            <div>
              <label htmlFor="artwork">選擇我的作品</label>
              <select
                id="artwork"
                value={artworkId}
                onChange={(e) => {
                  setArtworkId(e.target.value);
                  setMockupId("");
                  setMockupUrl("");
                }}
                style={{ width: "100%", padding: 14, margin: "8px 0 20px" }}
              >
                <option value="">請選擇作品</option>
                {artworks.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.title || "AI 作品"}
                  </option>
                ))}
              </select>
              <div
                style={{
                  background: "#e6e1d8",
                  padding: "7%",
                  borderRadius: 18,
                  display: "grid",
                  placeItems: "center",
                  minHeight: 420,
                }}
              >
                {validMockup && mockupUrl ? (
                  <img
                    src={mockupUrl}
                    alt="真實畫框成品預覽"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 460,
                      objectFit: "contain",
                    }}
                  />
                ) : artwork?.imageUrl ? (
                  <div
                    style={{
                      width: Math.min(82, 82 * ratio) + "%",
                      aspectRatio: ratio,
                      background: "#171717",
                      padding: 12,
                      boxShadow: "0 22px 45px rgba(0,0,0,.2)",
                    }}
                  >
                    <img
                      src={artwork.imageUrl}
                      alt="作品預覽"
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
                        display: "block",
                      }}
                    />
                  </div>
                ) : (
                  <span>選擇作品後預覽</span>
                )}
              </div>
            </div>
            <div>
              <h2>{product.name}</h2>
              <p>{product.description}</p>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <button
                  onClick={() => setCustom(false)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    background: custom ? "#fff" : "#171717",
                    color: custom ? "#171717" : "#fff",
                    fontWeight: 800,
                  }}
                >
                  標準尺寸
                </button>
                <button
                  onClick={() => setCustom(true)}
                  style={{
                    flex: 1,
                    padding: 12,
                    borderRadius: 10,
                    border: "1px solid #ccc",
                    background: custom ? "#171717" : "#fff",
                    color: custom ? "#fff" : "#171717",
                    fontWeight: 800,
                  }}
                >
                  客製尺寸
                </button>
              </div>
              {!custom ? (
                <>
                  <label htmlFor="size">尺寸</label>
                  <select
                    id="size"
                    value={sizeId}
                    onChange={(e) => setSizeId(e.target.value)}
                    style={{ width: "100%", padding: 14, margin: "8px 0 16px" }}
                  >
                    {catalog.sizes
                      .filter((s: any) => s.product_id === product.id)
                      .map((s: any) => (
                        <option key={s.id} value={s.id}>
                          {s.name} · {s.width_mm}×{s.height_mm} mm
                        </option>
                      ))}
                  </select>
                </>
              ) : (
                <div
                  style={{
                    padding: 16,
                    borderRadius: 14,
                    background: "#f1eee8",
                    marginBottom: 16,
                  }}
                >
                  <strong>大圖輸出尺寸</strong>
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 10,
                      marginTop: 10,
                    }}
                  >
                    <label>
                      寬 mm
                      <input
                        type="number"
                        min="100"
                        max="3000"
                        value={widthMm}
                        onChange={(e) =>
                          setWidthMm(
                            Math.max(
                              100,
                              Math.min(3000, Number(e.target.value) || 100),
                            ),
                          )
                        }
                        style={{
                          display: "block",
                          width: "100%",
                          padding: 12,
                          marginTop: 6,
                        }}
                      />
                    </label>
                    <label>
                      高 mm
                      <input
                        type="number"
                        min="100"
                        max="6000"
                        value={heightMm}
                        onChange={(e) =>
                          setHeightMm(
                            Math.max(
                              100,
                              Math.min(6000, Number(e.target.value) || 100),
                            ),
                          )
                        }
                        style={{
                          display: "block",
                          width: "100%",
                          padding: 12,
                          marginTop: 6,
                        }}
                      />
                    </label>
                  </div>
                  <small
                    style={{ display: "block", marginTop: 10, color: "#666" }}
                  >
                    可輸入 100–3000 mm 寬、100–6000 mm 高。價格依面積計算。
                  </small>
                </div>
              )}
              <div
                style={{
                  padding: "14px 16px",
                  borderRadius: 14,
                  background: "#f7f4ef",
                  marginTop: 10,
                }}
              >
                <strong>價格包含什麼？</strong>
                <div
                  style={{
                    marginTop: 6,
                    fontSize: 13,
                    color: "#666",
                    lineHeight: 1.7,
                  }}
                >
                  AI
                  作品製作＋指定尺寸輸出＋紙張＋畫框。客製尺寸會依實際面積即時計價。
                </div>
              </div>
              <label htmlFor="frame">畫框</label>
              <select
                id="frame"
                value={frameId}
                onChange={(e) => setFrameId(e.target.value)}
                style={{ width: "100%", padding: 14, margin: "8px 0 16px" }}
              >
                {catalog.frames.map((f: any) => (
                  <option key={f.id} value={f.id}>
                    {f.name} (+NT${f.price_delta_twd})
                  </option>
                ))}
              </select>
              <label htmlFor="paper">紙張</label>
              <select
                id="paper"
                value={paperId}
                onChange={(e) => setPaperId(e.target.value)}
                style={{ width: "100%", padding: 14, margin: "8px 0 16px" }}
              >
                {catalog.papers.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} (+NT${p.price_delta_twd})
                  </option>
                ))}
              </select>
              <button
                disabled={mockupLoading || adding || !artworkId || !validMockup}
                onClick={async () => {
                  setAdding(true);
                  setMessage("加入購物車…");
                  const body: any = {
                    productId: product.id,
                    artworkId,
                    frameId,
                    paperId,
                    mockupId,
                  };
                  if (custom) {
                    body.customWidthMm = widthMm;
                    body.customHeightMm = heightMm;
                  } else body.sizeId = sizeId;
                  try {
                    const r = await fetch("/api/cart/items", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(body),
                    });
                    const d = await r.json();
                    setMessage(r.ok ? "已加入購物車 ✓" : d.error || "加入失敗");
                  } catch {
                    setMessage("連線中斷，請稍後再試");
                  } finally {
                    setAdding(false);
                  }
                }}
                style={{
                  width: "100%",
                  padding: 16,
                  border: 0,
                  borderRadius: 12,
                  marginTop: 20,
                  fontWeight: 800,
                  background: "#171717",
                  color: "#fff",
                }}
              >
                {adding
                  ? "加入中…"
                  : validMockup
                    ? "加入購物車"
                    : "請先生成成品預覽"}
              </button>
              <button
                onClick={generateMockup}
                disabled={mockupLoading || !artworkId}
                style={{
                  width: "100%",
                  padding: 16,
                  border: "1px solid #171717",
                  borderRadius: 12,
                  marginTop: 12,
                  fontWeight: 800,
                  background: "#fff",
                }}
              >
                {mockupLoading ? "製作中…" : "生成真實畫框成品預覽"}
              </button>
              <div
                style={{
                  padding: 20,
                  borderRadius: 16,
                  background: "#171717",
                  color: "#fff",
                  marginTop: 20,
                }}
              >
                <small>即時預估售價</small>
                <div style={{ fontSize: 38, fontWeight: 800 }}>
                  NT${total.toLocaleString()}
                </div>
                <div style={{ opacity: 0.75 }}>
                  {custom
                    ? widthMm + " × " + heightMm + " mm · 客製尺寸"
                    : size?.name + " · " + frame?.name}{" "}
                  · {paper?.name}
                </div>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
