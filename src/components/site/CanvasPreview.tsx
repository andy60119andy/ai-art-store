"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
const sizes = [
  { label: "小尺寸 · 8 × 10 吋（約 20.3 × 25.4 cm）", width: 8, height: 10 },
  { label: "中尺寸 · 16 × 20 吋（約 40.6 × 50.8 cm）", width: 16, height: 20 },
  { label: "大尺寸 · 24 × 30 吋（約 61 × 76.2 cm）", width: 24, height: 30 },
];
export default function CanvasPreview() {
  const [selected, setSelected] = useState(0);
  const [landscape, setLandscape] = useState(false);
  const size = sizes[selected];
  return (
    <main className="arto-home arto-subpage">
      <section className="arto-container arto-frame-page">
        <div className="arto-heading">
          <span className="arto-eyebrow">YOUR ART ON CANVAS</span>
          <h1>你的藝術，印在帆布上</h1>
          <p>油畫布／帆布輸出，裸框成品。選擇適合居家與寄送的標準尺寸。</p>
        </div>
        <div className="arto-frame-grid">
          <div className="arto-room-preview">
            <div
              style={{
                position: "relative",
                width: "min(80%, 400px)",
                aspectRatio: landscape
                  ? size.height / size.width
                  : size.width / size.height,
                boxShadow: "8px 12px 28px rgba(0,0,0,.18)",
              }}
            >
              <Image
                src="/images/reference/styles/oil-painting-portrait-thumb.webp"
                alt="油畫布裸框風格示意"
                fill
                sizes="(max-width: 800px) 80vw, 400px"
                style={{ objectFit: "cover" }}
              />
            </div>
            <p>風格與尺寸示意；實際作品依照片與裁切確認。</p>
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
