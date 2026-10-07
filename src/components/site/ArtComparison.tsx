"use client";
import Image from "next/image";
import { useEffect, useState } from "react";
const source =
  "/images/reference/landing/watercolor-portrait/watercolor-before-after.webp";
export default function ArtComparison({ paused }: { paused: boolean }) {
  const [split, setSplit] = useState(50);
  const [demo, setDemo] = useState(true);
  useEffect(() => {
    if (paused || !demo) return;
    const start = Date.now();
    const timer = setInterval(
      () => setSplit(50 + Math.sin((Date.now() - start) / 1800) * 22),
      70,
    );
    return () => clearInterval(timer);
  }, [paused, demo]);
  return (
    <div className="arto-comparison-wrap">
      <div className="arto-comparison">
        <div className="arto-source-right">
          <Image
            src={source}
            alt="照片轉換成水彩人像的效果"
            fill
            priority
            sizes="(max-width: 800px) 180vw, 90vw"
          />
        </div>
        <div
          className="arto-comparison-layer"
          style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
        >
          <div className="arto-source-left">
            <Image
              src={source}
              alt="原始照片"
              fill
              priority
              sizes="(max-width: 800px) 180vw, 90vw"
            />
          </div>
        </div>
        <span className="arto-image-label left">原始照片</span>
        <span className="arto-image-label right">水彩作品</span>
        <div className="arto-divider" style={{ left: `${split}%` }}>
          <span>‹ ›</span>
        </div>
        <input
          type="range"
          min="5"
          max="95"
          value={split}
          onPointerDown={() => setDemo(false)}
          onChange={(e) => {
            setDemo(false);
            setSplit(Number(e.target.value));
          }}
          aria-label="拖動比較原始照片與水彩作品"
        />
      </div>
      <div className="arto-drag-note">
        <span>◷ 拖動滑桿，查看照片轉換效果</span>
        <button
          type="button"
          aria-label={demo ? "暫停對比展示" : "播放對比展示"}
          aria-pressed={demo}
          onClick={() => setDemo(!demo)}
        >
          {demo ? "Ⅱ" : "▶"}
        </button>
      </div>
    </div>
  );
}
