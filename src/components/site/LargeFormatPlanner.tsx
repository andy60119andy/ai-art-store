"use client";
import Link from "next/link";
import { useState } from "react";
import LargeFormatScene from "./LargeFormatScene";
const presets = [
  { name: "客廳主畫", width: 120, height: 90 },
  { name: "直幅主畫", width: 90, height: 120 },
  { name: "走廊長幅", width: 240, height: 120 },
  { name: "空間長卷", width: 360, height: 120 },
];
const artworks = [
  { name: "暖色抽象", src: "/images/abstract.jpg" },
  { name: "植物藝術", src: "/images/botanical.jpg" },
  { name: "水墨意境", src: "/images/styles/ink-wash.jpg" },
];
export default function LargeFormatPlanner() {
  const [width, setWidth] = useState(120),
    [height, setHeight] = useState(90),
    [art, setArt] = useState(0),
    [space, setSpace] = useState("居家主牆"),
    [copied, setCopied] = useState("");
  const valid =
    width >= 10 &&
    height >= 10 &&
    Number.isFinite(width) &&
    Number.isFinite(height) &&
    Math.min(width, height) <= 120;
  async function copy() {
    try {
      await navigator.clipboard.writeText(
        `AI ART STORE 空間作品需求\n用途：${space}\n尺寸：${width} × ${height} cm\n參考風格：${artworks[art].name}\n製作方式與配框：待確認\n備註：需確認原檔解析度、材質、裁切與運送。`,
      );
      setCopied("需求已複製，可貼給製作人員確認。");
    } catch {
      setCopied("瀏覽器無法複製，請記下上方尺寸與用途。");
    }
  }
  return (
    <section className="arto-container lf-planner" id="planner">
      <div className="arto-heading">
        <span className="arto-eyebrow">PLAN YOUR WALL</span>
        <h2>先看看，哪個比例適合你的牆</h2>
        <p>選擇尺寸，立即比較橫幅與直幅的視覺效果。</p>
      </div>
      <div className="lf-planner-grid">
        <LargeFormatScene
          width={valid ? width : 120}
          height={valid ? height : 90}
          image={artworks[art].src}
        />
        <div className="lf-planner-controls">
          <span className="arto-green-tag">120 CM PRINT WIDTH</span>
          <h3>為你的空間規劃</h3>
          <div className="lf-presets">
            {presets.map((p) => (
              <button
                type="button"
                key={p.name}
                aria-pressed={width === p.width && height === p.height}
                onClick={() => {
                  setWidth(p.width);
                  setHeight(p.height);
                  setCopied("");
                }}
              >
                {p.name}
                <small>
                  {p.width} × {p.height} cm
                </small>
              </button>
            ))}
          </div>
          <div className="lf-input-row">
            <label htmlFor="lf-width">
              畫面寬度（cm）
              <input
                id="lf-width"
                type="number"
                min="10"
                value={width || ""}
                onChange={(e) => {
                  setWidth(Number(e.target.value));
                  setCopied("");
                }}
              />
            </label>
            <span>×</span>
            <label htmlFor="lf-height">
              畫面高度（cm）
              <input
                id="lf-height"
                type="number"
                min="10"
                value={height || ""}
                onChange={(e) => {
                  setHeight(Number(e.target.value));
                  setCopied("");
                }}
              />
            </label>
          </div>
          <p className={valid ? "lf-size-note" : "lf-size-error"} role="status">
            {valid
              ? "短邊在 120 cm 以內，可依進料方向規劃單幅輸出。長度與加工需另確認。"
              : "請輸入至少 10 cm 的尺寸。短邊超過 120 cm，需分幅規劃，請先縮小尺寸預覽。"}
          </p>
          <label htmlFor="lf-art">示意風格</label>
          <select
            id="lf-art"
            value={art}
            onChange={(e) => {
              setArt(Number(e.target.value));
              setCopied("");
            }}
          >
            {artworks.map((a, i) => (
              <option key={a.name} value={i}>
                {a.name}
              </option>
            ))}
          </select>
          <label htmlFor="lf-space">空間用途</label>
          <select
            id="lf-space"
            value={space}
            onChange={(e) => {
              setSpace(e.target.value);
              setCopied("");
            }}
          >
            <option>居家主牆</option>
            <option>走廊與長牆</option>
            <option>店面與商業空間</option>
          </select>
          <div className="lf-summary">
            <strong>
              {width || "—"} × {height || "—"} cm
            </strong>
            <span>
              {space} · {artworks[art].name}
            </span>
            <small>此為比例示意，尚未報價或建立訂單。</small>
          </div>
          <Link
            className="arto-button"
            href={
              valid ? `/customize?width=${width}&height=${height}` : "#planner"
            }
            aria-disabled={!valid}
          >
            繼續查看配框搭配 →
          </Link>
          <button
            className="arto-outline"
            type="button"
            disabled={!valid}
            onClick={copy}
          >
            複製我的尺寸需求
          </button>
          <p className="lf-copy-feedback" role="status">
            {copied}
          </p>
        </div>
      </div>
    </section>
  );
}
