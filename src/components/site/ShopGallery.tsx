"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
const filters = [
  ["All", "全部"],
  ["Art", "藝術"],
  ["Cartoon", "卡通"],
  ["Portrait", "人像"],
  ["Wedding", "婚禮"],
  ["Home", "居家"],
  ["Vehicles", "交通工具"],
  ["Couples", "情侶"],
  ["Family", "家庭"],
  ["Pets", "寵物"],
  ["Gifts", "禮物"],
];
const searchAliases: Record<string, string> = {
  "watercolor-portrait": "水彩 溫柔",
  "oil-painting-portrait": "油畫 經典",
  "pet-portrait": "寵物 毛孩",
  "couple-portrait": "情侶 紀念",
  "family-portrait": "家庭 合照",
  "anime-portrait": "動漫 日系",
};
const recommended = [
  "watercolor-portrait",
  "oil-painting-portrait",
  "pet-portrait",
  "couple-portrait",
  "family-portrait",
  "anime-portrait",
];
export default function ShopGallery() {
  const [category, setCategory] = useState("All");
  const [query, setQuery] = useState("");
  const [expanded, setExpanded] = useState(false);
  const styles = [...REFERENCE_GALLERY]
    .sort((a, b) => {
      const ai = recommended.indexOf(a.key),
        bi = recommended.indexOf(b.key);
      return (
        (ai < 0 ? 99 : ai) - (bi < 0 ? 99 : bi) || a.name.localeCompare(b.name)
      );
    })
    .filter(
      (s) =>
        (category === "All" || s.category === category) &&
        `${s.name} ${searchAliases[s.key] ?? ""} ${filters.find(([key]) => key === s.category)?.[1] ?? ""}`
          .toLowerCase()
          .includes(query.trim().toLowerCase()),
    );
  const visible = expanded ? styles : styles.slice(0, 12);
  return (
    <>
      <div className="journey-search">
        <label htmlFor="style-search">尋找藝術方向</label>
        <input
          id="style-search"
          type="search"
          value={query}
          placeholder="搜尋水彩、寵物、Watercolor…"
          onChange={(e) => {
            setQuery(e.target.value);
            setExpanded(false);
          }}
        />
        <p>
          先從水彩、油畫、寵物或家庭肖像探索，再慢慢挑選。排列為編輯精選，非銷售排名。
        </p>
      </div>
      <div className="arto-filters" role="group" aria-label="商品風格分類">
        {filters.map(([key, label]) => (
          <button
            key={key}
            type="button"
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
      <p className="journey-count" role="status">
        找到 {styles.length} 種風格 · 顯示 {visible.length} 種
      </p>
      {styles.length === 0 && (
        <div className="arto-product-notice">
          沒有符合的風格。
          <button
            type="button"
            className="arto-text-button"
            onClick={() => {
              setQuery("");
              setCategory("All");
            }}
          >
            清除條件
          </button>
        </div>
      )}
      <div className="clone-shop-grid">
        {visible.map((s) => (
          <article className="clone-shop-card" key={s.key}>
            <Link href={`/styles/${s.key}`} className="clone-shop-image">
              <Image
                src={s.src}
                alt={s.name}
                fill
                sizes="(max-width:600px) 90vw, (max-width:950px) 45vw, 23vw"
              />
              <span>風格預覽</span>
              <strong>查看風格 →</strong>
            </Link>
            <div>
              <h3>{s.name}</h3>
              <p>讓你的照片，擁有專屬的藝術模樣。</p>
              <ul>
                <li>依個人照片創作</li>
                <li>查看作品後再選呈現方式</li>
                <li>數位作品與印刷帆布輸出規劃</li>
              </ul>
              <p className="clone-shop-format">
                作品預覽 <small>· 成品依尺寸規劃</small>
              </p>
              <Link href={`/styles/${s.key}`} className="arto-button">
                選擇這個風格 →
              </Link>
            </div>
          </article>
        ))}
      </div>
      {styles.length > 12 && (
        <div className="arto-center">
          <button
            type="button"
            className="arto-outline"
            aria-expanded={expanded}
            onClick={() => setExpanded(!expanded)}
          >
            {expanded
              ? "收起更多風格 ↑"
              : `查看其餘 ${styles.length - 12} 種風格 ↓`}
          </button>
        </div>
      )}
      <p className="arto-disclaimer">
        圖片為風格參考，非你的生成結果。油畫布／帆布裸框僅配送台灣本島；AI
        與正式訂購尚未開放。
      </p>
    </>
  );
}
