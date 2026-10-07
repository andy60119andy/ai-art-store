"use client";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
const filters = [
  ["All", "全部"],
  ["Art", "藝術"],
  ["Couples", "情侶"],
  ["Family", "家庭"],
  ["Pets", "寵物"],
  ["Gifts", "禮物"],
];
export default function ShopGallery() {
  const [category, setCategory] = useState("All");
  const styles = [...REFERENCE_GALLERY]
    .sort((a, b) => a.name.localeCompare(b.name))
    .filter((s) => category === "All" || s.category === category);
  return (
    <>
      <div className="arto-filters" role="group" aria-label="商品風格分類">
        {filters.map(([key, label]) => (
          <button
            key={key}
            type="button"
            aria-pressed={category === key}
            onClick={() => setCategory(key)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="clone-shop-grid">
        {styles.map((s) => (
          <article className="clone-shop-card" key={s.key}>
            <Link href={`/styles/${s.key}`} className="clone-shop-image">
              <Image
                src={s.src}
                alt={s.name}
                fill
                sizes="(max-width:600px) 90vw, (max-width:950px) 45vw, 23vw"
              />
              <span>風格預覽</span>
              <strong>開始創作 →</strong>
            </Link>
            <div>
              <h3>{s.name}</h3>
              <p>讓你的照片，擁有專屬的藝術模樣。</p>
              <ul>
                <li>依個人照片創作</li>
                <li>查看作品後再選呈現方式</li>
                <li>數位作品與印刷配框規劃</li>
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
    </>
  );
}
