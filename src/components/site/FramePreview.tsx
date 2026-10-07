"use client";
import Image from "next/image";
import Link from "next/link";
import "@/app/large-format.css";
import { useEffect, useState } from "react";
const frames = [
  { name: "自然原木", color: "#b18b60" },
  { name: "霧面黑框", color: "#232628" },
  { name: "純白畫框", color: "#f2efe9" },
  { name: "深色胡桃", color: "#60472f" },
];
export default function FramePreview() {
  const [frame, setFrame] = useState(0),
    [mat, setMat] = useState(true),
    [width, setWidth] = useState(60),
    [height, setHeight] = useState(90),
    [image, setImage] = useState("watercolor-portrait");
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const w = Number(params.get("width")),
      h = Number(params.get("height"));
    if (
      Number.isFinite(w) &&
      Number.isFinite(h) &&
      w >= 10 &&
      h >= 10 &&
      Math.min(w, h) <= 120
    ) {
      setWidth(w);
      setHeight(h);
    }
  }, []);
  const fitsPrintWidth =
    width >= 10 && height >= 10 && Math.min(width, height) <= 120;
  const ratio = Math.max(10, width || 10) / Math.max(10, height || 10);
  return (
    <main className="arto-home arto-subpage">
      <section className="arto-container arto-frame-page">
        <div className="arto-heading">
          <span className="arto-eyebrow">03 · MAKE IT YOURS</span>
          <h1>為作品找到理想的畫框</h1>
          <p>
            探索尺寸、框色與留白。120 cm
            可印幅寬，長幅可依空間規劃；實際配框另行確認。
          </p>
        </div>
        <div className="arto-frame-grid">
          <div className="arto-room-preview">
            <div
              className="arto-demo-frame"
              style={{
                aspectRatio: ratio,
                width:
                  ratio > 1
                    ? "min(85%,500px)"
                    : `min(${Math.max(30, ratio * 72)}%,400px)`,
                borderColor: frames[frame].color,
                padding: mat ? "28px" : "0",
              }}
            >
              <div>
                <Image
                  src={`/images/reference/styles/${image}-thumb.webp`}
                  alt="配框視覺示意"
                  fill
                  sizes="500px"
                />
              </div>
            </div>
            <span className="arto-room-caption">
              配框視覺示意 · {width || 10} × {height || 10} cm
            </span>
          </div>
          <section className="arto-frame-controls">
            <span className="arto-green-tag">FRAME PREVIEW</span>
            <h2>搭出屬於你的比例</h2>
            <label htmlFor="demo-artwork">藝術參考圖</label>
            <select
              id="demo-artwork"
              value={image}
              onChange={(e) => setImage(e.target.value)}
            >
              <option value="watercolor-portrait">水彩人像</option>
              <option value="oil-painting-portrait">經典油畫</option>
              <option value="family-portrait">家庭作品</option>
              <option value="minimalist-line-art-portrait">極簡線稿</option>
            </select>
            <label>尺寸（公分）</label>
            <div className="arto-size-inputs">
              <label htmlFor="demo-width">
                寬
                <input
                  id="demo-width"
                  type="number"
                  min="10"
                  value={width}
                  onChange={(e) => setWidth(Number(e.target.value))}
                />
              </label>
              <span>×</span>
              <label htmlFor="demo-height">
                高
                <input
                  id="demo-height"
                  type="number"
                  min="10"
                  value={height}
                  onChange={(e) => setHeight(Number(e.target.value))}
                />
              </label>
            </div>
            <p
              className={`lf-print-note ${fitsPrintWidth ? "" : "is-error"}`}
              role="status"
            >
              {fitsPrintWidth
                ? "尺寸短邊在 120 cm 可印幅寬內；長度、材質與裱框結構需確認。"
                : "短邊超過 120 cm 或尺寸不完整，需調整尺寸或另行規劃分幅。"}
            </p>
            <Link href="/large-format" className="lf-room-link">
              查看大尺寸與長幅空間示意 →
            </Link>
            <label>選擇畫框</label>
            <div className="arto-frame-swatches">
              {frames.map((f, i) => (
                <button
                  type="button"
                  key={f.name}
                  aria-pressed={frame === i}
                  onClick={() => setFrame(i)}
                >
                  <span style={{ background: f.color }} />
                  {f.name}
                </button>
              ))}
            </div>
            <label className="arto-mat-checkbox">
              <input
                type="checkbox"
                checked={mat}
                onChange={(e) => setMat(e.target.checked)}
              />
              加入白色卡紙留邊
            </label>
            <div className="arto-product-notice">
              目前為配框視覺示意，實際報價與個人作品串接尚未啟用。
            </div>
            <Link href="/styles" className="arto-button">
              先選擇喜歡的藝術風格 →
            </Link>
          </section>
        </div>
      </section>
    </main>
  );
}
