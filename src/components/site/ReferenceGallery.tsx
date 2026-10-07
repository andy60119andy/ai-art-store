"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";

const categories = {
  All: "全部風格",
  Cartoon: "卡通",
  Art: "藝術",
  Pets: "寵物",
  Couples: "情侶",
  Wedding: "婚禮",
  Gifts: "禮物",
  Family: "家庭",
  Home: "居家",
  Vehicles: "交通工具",
  Portrait: "人像",
};
type Reference = (typeof REFERENCE_GALLERY)[number];
export default function ReferenceGallery() {
  const [category, setCategory] = useState("All");
  const [expanded, setExpanded] = useState(false);
  const [selected, setSelected] = useState<Reference | null>(null);
  const dialog = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (selected) dialog.current?.showModal();
  }, [selected]);
  const filtered = REFERENCE_GALLERY.filter(
    (s) => category === "All" || s.category === category,
  );
  const visible = expanded ? filtered : filtered.slice(0, 12);
  return (
    <>
      <div className="arto-filters" role="group" aria-label="風格分類">
        {Object.entries(categories).map(([key, label]) => (
          <button
            type="button"
            key={key}
            aria-pressed={category === key}
            onClick={() => {
              setCategory(key);
              setExpanded(false);
            }}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="arto-style-grid">
        {visible.map((style, i) => (
          <button
            type="button"
            className="arto-style-card"
            key={style.key}
            style={{ animationDelay: `${Math.min(i % 12, 8) * 35}ms` }}
            onClick={() => setSelected(style)}
            aria-label={`放大預覽 ${style.name}`}
          >
            <div className="arto-style-image">
              <Image
                src={style.src}
                alt={style.name}
                fill
                sizes="(max-width: 650px) 45vw, (max-width: 1000px) 30vw, 23vw"
              />
              <span>放大預覽 ↗</span>
            </div>
            <div className="arto-style-caption">
              <small>
                {categories[style.category as keyof typeof categories] ??
                  style.category}
              </small>
              <h3>{style.name}</h3>
              <span>查看風格參考 →</span>
            </div>
          </button>
        ))}
      </div>
      {filtered.length > 12 && (
        <div className="arto-center">
          <button
            type="button"
            className="arto-outline"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded
              ? "收起更多風格 ↑"
              : `顯示全部 ${filtered.length} 種風格 ↓`}
          </button>
        </div>
      )}
      <p className="arto-disclaimer">
        圖片為參考站風格展示。目前創作頁提供 12 種已設定的生成風格。
      </p>
      <dialog
        ref={dialog}
        className="arto-preview-dialog"
        aria-labelledby="arto-preview-title"
        onClose={() => setSelected(null)}
        onClick={(e) => {
          if (e.target === e.currentTarget) e.currentTarget.close();
        }}
      >
        {selected && (
          <>
            <button
              type="button"
              className="arto-dialog-close"
              aria-label="關閉風格預覽"
              onClick={() => dialog.current?.close()}
            >
              ✕
            </button>
            <div className="arto-dialog-image">
              <Image
                src={selected.src}
                alt={selected.name}
                fill
                sizes="(max-width: 700px) 90vw, 550px"
              />
            </div>
            <div className="arto-dialog-content">
              <span className="arto-eyebrow">STYLE PREVIEW</span>
              <h2 id="arto-preview-title">{selected.name}</h2>
              <p>
                此圖為風格參考。前往創作頁後，可選擇目前已設定的 12 種創作風格。
              </p>
              <Link
                className="arto-button"
                href="/generate"
                onClick={() => dialog.current?.close()}
              >
                探索創作風格 →
              </Link>
            </div>
          </>
        )}
      </dialog>
    </>
  );
}
