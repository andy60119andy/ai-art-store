"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
const choices = [
  ["watercolor-portrait", "溫柔水彩", "柔和色彩與輕盈筆觸"],
  ["oil-painting-portrait", "經典油畫", "層次豐富的色彩與質感"],
  ["renaissance-portrait", "古典人像", "莊重光線與細緻描繪"],
  ["anime-portrait", "日系動漫", "表情與線條的活力"],
  ["ghibli-portrait", "動畫水彩", "溫暖的手繪氣氛"],
  ["pixar-portrait", "立體動畫", "圓潤表情與立體造型"],
  ["cartoon-portrait", "卡通插畫", "輕鬆有趣的日常"],
  ["pop-art-portrait", "普普藝術", "大膽色塊与圖像節奏"],
  ["comic-book-portrait", "漫畫", "強烈輪廓與戲劇感"],
  ["digital-portrait", "數位藝術", "俐落光影與現代色彩"],
  ["minimalist-line-art-portrait", "極簡線稿", "線條與留白的平衡"],
  ["royal-pet-portrait", "皇家寵物", "將毛孩化為優雅主角"],
];
export default function StyleFinder() {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <>
      <div className="clone-finder-grid">
        {choices.map(([key, name, text]) => {
          const s = REFERENCE_GALLERY.find((s) => s.key === key);
          return s ? (
            <article
              key={key}
              className={selected.includes(key) ? "selected" : ""}
            >
              <Link href={`/styles/${key}`}>
                <div>
                  <Image
                    src={s.src}
                    alt={name}
                    fill
                    sizes="(max-width:650px) 45vw, 23vw"
                  />
                </div>
                <h3>{name}</h3>
                <p>{text.replace("与", "與")}</p>
              </Link>
              <button
                type="button"
                aria-pressed={selected.includes(key)}
                onClick={() =>
                  setSelected((v) =>
                    v.includes(key)
                      ? v.filter((k) => k !== key)
                      : v.length < 3
                        ? [...v, key]
                        : v,
                  )
                }
              >
                {selected.includes(key) ? "✓ 已加入比較" : "＋ 加入比較"}
              </button>
            </article>
          ) : null;
        })}
      </div>
      <section className="clone-shortlist" aria-live="polite">
        <h2>我的風格比較（{selected.length}/3）</h2>
        {selected.length ? (
          <div>
            {selected.map((key) => {
              const s = REFERENCE_GALLERY.find((s) => s.key === key)!;
              return (
                <Link key={key} href={`/styles/${key}`}>
                  <Image src={s.src} alt={s.name} width={160} height={180} />
                  <strong>{s.name}</strong>
                  <span>用我的照片創作 →</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <p>選擇最多三種風格，並排看看你喜歡的色彩與筆觸。</p>
        )}
      </section>
    </>
  );
}
