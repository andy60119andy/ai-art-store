"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { ART_STYLES } from "@/lib/ai/styles";
import { STYLE_PREVIEWS } from "@/lib/ai/style-previews";
import "./storefront.css";

const groups = ["全部風格", "藝術繪畫", "插畫卡通", "人像紀念", "居家裝飾"];
const categories = [
  "藝術繪畫",
  "藝術繪畫",
  "插畫卡通",
  "居家裝飾",
  "居家裝飾",
  "人像紀念",
  "人像紀念",
  "插畫卡通",
  "人像紀念",
  "藝術繪畫",
  "居家裝飾",
  "人像紀念",
];
const questions = [
  [
    "如何製作我的專屬藝術作品？",
    "上傳照片，選擇喜歡的藝術風格，再預覽 AI 生成的作品。選好作品後，可以挑選尺寸與畫框，確認配框效果。",
  ],
  [
    "可以先看看風格再上傳嗎？",
    "可以。下方提供 12 種風格示意圖，點選喜歡的風格即可前往創作頁面。示意圖用來說明風格，實際作品會依你的照片而不同。",
  ],
  [
    "什麼樣的照片比較適合？",
    "建議使用清晰、光線充足、主體完整的照片。人像請避免臉部被遮住，並盡量使用原始照片。",
  ],
  [
    "可以選擇自己的尺寸與畫框嗎？",
    "可以。在配框頁面選擇成品尺寸、畫框與卡紙，也可以使用自訂尺寸查看搭配效果。",
  ],
  [
    "風格不符合期待怎麼辦？",
    "可以回到風格選擇頁，改選另一種風格後重新創作。確認作品後，再進行配框。",
  ],
  [
    "如何查看作品與訂單？",
    "登入後可從「我的作品」查看收藏的作品，從「我的訂單」查看訂單資料。",
  ],
];

export default function HomePage() {
  const [category, setCategory] = useState("全部風格");
  const [split, setSplit] = useState(50);
  return (
    <main className="arto-home">
      <section className="arto-hero">
        <div className="arto-container arto-hero-grid">
          <div className="arto-hero-copy">
            <span className="arto-pill">✧ 專屬藝術，從一張照片開始</span>
            <h1>
              把你的日常照片
              <br />
              <em>變成藝術作品</em>
            </h1>
            <p>
              用 AI 重新詮釋你珍愛的照片。從溫柔水彩到經典油畫，探索 12
              種藝術風格，再搭配專屬尺寸與畫框。
            </p>
            <strong>挑選風格 · 預覽作品 · 找到你的理想畫框</strong>
            <div className="arto-hero-actions">
              <Link className="arto-button" href="/upload">
                開始創作我的作品 <span>→</span>
              </Link>
              <span>先選風格，再決定配框</span>
            </div>
          </div>
          <div className="arto-comparison-wrap">
            <div className="arto-comparison">
              <Image
                src={STYLE_PREVIEWS["pencil-sketch"].src}
                alt="鉛筆素描風格示意"
                fill
                priority
                sizes="(max-width: 800px) 90vw, 45vw"
              />
              <div
                className="arto-comparison-layer"
                style={{ clipPath: `inset(0 ${100 - split}% 0 0)` }}
              >
                <Image
                  src={STYLE_PREVIEWS.cinematic.src}
                  alt="電影感風格示意"
                  fill
                  priority
                  sizes="(max-width: 800px) 90vw, 45vw"
                />
              </div>
              <span className="arto-image-label left">電影感</span>
              <span className="arto-image-label right">鉛筆素描</span>
              <div className="arto-divider" style={{ left: `${split}%` }}>
                <span>‹ ›</span>
              </div>
              <input
                type="range"
                min="5"
                max="95"
                value={split}
                onChange={(e) => setSplit(Number(e.target.value))}
                aria-label="拖動比較兩種風格示意"
              />
            </div>
            <span className="arto-drag-note">◷ 拖動滑桿，探索不同風格示意</span>
          </div>
        </div>
        <div className="arto-filmstrip">
          {ART_STYLES.map((s) => (
            <Link href={`/#styles`} key={s.key}>
              <Image
                src={STYLE_PREVIEWS[s.key].src}
                alt=""
                width={100}
                height={90}
              />
              <span>{s.name}</span>
            </Link>
          ))}
        </div>
      </section>
      <div className="arto-trust">
        <span>◇ 12 種藝術風格</span>
        <span>✧ 專屬照片創作</span>
        <span>▧ 自訂尺寸配框</span>
        <span>♡ 珍藏生活回憶</span>
      </div>
      <section id="how-it-works" className="arto-section arto-container">
        <div className="arto-heading">
          <span className="arto-eyebrow">SIMPLE PROCESS · 簡單三步</span>
          <h2>你的藝術作品，這樣誕生</h2>
          <p>從一張喜歡的照片，到一幅屬於你的畫。</p>
        </div>
        <div className="arto-steps">
          {[
            {
              n: "01",
              title: "上傳你喜歡的照片",
              text: "選一張清晰的照片，留下人物、旅行或生活裡值得珍藏的瞬間。",
              image: "vintage-film",
              tag: "你的照片 · 你的故事",
            },
            {
              n: "02",
              title: "選擇 AI 藝術風格",
              text: "探索 12 種風格，讓照片化作油畫、水彩、插畫或電影感作品。",
              image: "watercolor",
              tag: "12 種風格自由探索",
            },
            {
              n: "03",
              title: "搭配尺寸與畫框",
              text: "選擇成品大小、畫框與卡紙，預覽作品在畫框中的完整樣貌。",
              image: "minimalist",
              tag: "自訂尺寸 · 配框預覽",
            },
          ].map((step) => (
            <article className="arto-step" key={step.n}>
              <div className="arto-step-image">
                <Image
                  src={
                    STYLE_PREVIEWS[step.image as keyof typeof STYLE_PREVIEWS]
                      .src
                  }
                  alt={step.title}
                  fill
                  sizes="(max-width: 700px) 90vw, 30vw"
                />
                <span>{step.n}</span>
              </div>
              <h3>{step.title}</h3>
              <p>{step.text}</p>
              <small>{step.tag}</small>
            </article>
          ))}
        </div>
        <div className="arto-center">
          <Link className="arto-button" href="/upload">
            開始我的藝術創作 →
          </Link>
        </div>
      </section>
      <section id="styles" className="arto-section arto-styles-section">
        <div className="arto-container">
          <div className="arto-heading">
            <span className="arto-eyebrow">FIND YOUR STYLE</span>
            <h2>探索全部 12 種藝術風格</h2>
            <p>每一種風格，都是另一種看見回憶的方式。</p>
          </div>
          <div className="arto-filters" aria-label="風格分類">
            {groups.map((g) => (
              <button
                key={g}
                aria-pressed={category === g}
                onClick={() => setCategory(g)}
              >
                {g}
              </button>
            ))}
          </div>
          <div className="arto-style-grid">
            {ART_STYLES.map((s, i) => ({ s, i }))
              .filter(
                ({ i }) =>
                  category === "全部風格" || categories[i] === category,
              )
              .map(({ s, i }) => (
                <Link
                  className="arto-style-card"
                  href={`/generate?style=${s.key}`}
                  key={s.key}
                >
                  <div className="arto-style-image">
                    <Image
                      src={STYLE_PREVIEWS[s.key].src}
                      alt={STYLE_PREVIEWS[s.key].alt}
                      fill
                      sizes="(max-width: 650px) 45vw, (max-width: 1000px) 30vw, 23vw"
                    />
                    <span>探索風格 ↗</span>
                  </div>
                  <div className="arto-style-caption">
                    <small>{categories[i]}</small>
                    <h3>{s.name}</h3>
                    <span>製作我的作品 →</span>
                  </div>
                </Link>
              ))}
          </div>
          <p className="arto-disclaimer">
            圖片為藝術風格示意，實際生成結果依上傳照片而異。
          </p>
          <div className="arto-center">
            <Link className="arto-outline" href="/generate">
              前往風格創作頁 →
            </Link>
          </div>
        </div>
      </section>
      <section id="options" className="arto-section arto-container">
        <div className="arto-heading">
          <span className="arto-eyebrow">MADE FOR YOU</span>
          <h2>從藝術創作，到你的理想配框</h2>
          <p>依照作品與空間，選擇適合你的呈現方式。</p>
        </div>
        <div className="arto-plans">
          {[
            {
              n: "01",
              name: "AI 藝術創作",
              price: "從照片開始",
              sub: "選一種喜歡的藝術風格",
              items: ["12 種風格示意", "個人照片創作", "作品預覽與挑選"],
              cta: "開始創作",
              href: "/upload",
            },
            {
              n: "02",
              name: "專屬尺寸配框",
              price: "依尺寸估價",
              sub: "替作品找到合適的畫框",
              items: ["成品尺寸選擇", "畫框與卡紙搭配", "完整配框效果預覽"],
              cta: "前往配框",
              href: "/customize",
            },
            {
              n: "03",
              name: "我的作品收藏",
              price: "留下美好回憶",
              sub: "讓喜歡的作品隨時找得到",
              items: ["個人作品管理", "查看作品細節", "繼續配框與訂單流程"],
              cta: "查看我的作品",
              href: "/account",
            },
          ].map((p, i) => (
            <article
              className={`arto-plan ${i === 1 ? "featured" : ""}`}
              key={p.n}
            >
              {i === 1 && (
                <div className="arto-plan-ribbon">把藝術帶進生活</div>
              )}
              <span className="arto-plan-number">{p.n}</span>
              <h3>{p.name}</h3>
              <h4>{p.price}</h4>
              <p>{p.sub}</p>
              <ul>
                {p.items.map((t) => (
                  <li key={t}>✓ {t}</li>
                ))}
              </ul>
              <Link
                href={p.href}
                className={i === 1 ? "arto-button" : "arto-outline"}
              >
                {p.cta} →
              </Link>
            </article>
          ))}
        </div>
      </section>
      <section id="faq" className="arto-section arto-faq-section">
        <div className="arto-container arto-faq">
          <div>
            <span className="arto-eyebrow">A LITTLE HELP</span>
            <h2>想多了解一點？</h2>
            <p>
              從照片選擇到配框，
              <br />
              這裡整理了創作前常見的問題。
            </p>
            <Link className="arto-outline" href="/#how-it-works">
              查看創作流程 →
            </Link>
          </div>
          <div className="arto-questions">
            {questions.map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>＋</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <section id="discover" className="arto-section arto-container">
        <div className="arto-heading">
          <span className="arto-eyebrow">MORE TO EXPLORE</span>
          <h2>找到屬於你的創作靈感</h2>
          <p>為自己、為所愛的人，也為每天生活的空間。</p>
        </div>
        <div className="arto-discover">
          {[
            {
              title: "探索藝術風格",
              text: "找到符合你個性的筆觸與色彩。",
              image: "oil-painting",
              href: "/#styles",
            },
            {
              title: "珍藏重要回憶",
              text: "將人像與生活照片變成專屬作品。",
              image: "storybook",
              href: "/upload",
            },
            {
              title: "為居家挑選配框",
              text: "尺寸、畫框與卡紙，搭出理想比例。",
              image: "minimalist",
              href: "/customize",
            },
          ].map((d) => (
            <Link key={d.title} href={d.href}>
              <div>
                <Image
                  src={
                    STYLE_PREVIEWS[d.image as keyof typeof STYLE_PREVIEWS].src
                  }
                  alt=""
                  fill
                  sizes="(max-width: 700px) 90vw, 30vw"
                />
              </div>
              <h3>
                {d.title} <span>↗</span>
              </h3>
              <p>{d.text}</p>
            </Link>
          ))}
        </div>
      </section>
      <section className="arto-final">
        <span className="arto-eyebrow">YOUR PHOTO. YOUR ART. YOUR STORY.</span>
        <h2>準備好看見照片的另一種可能？</h2>
        <p>選一張你喜歡的照片，開始打造專屬藝術作品。</p>
        <Link href="/upload" className="arto-button">
          創作我的專屬作品 →
        </Link>
        <small>12 種藝術風格 · 自訂尺寸 · 配框預覽</small>
      </section>
      <div className="arto-trust">
        <span>◇ 藝術風格選擇</span>
        <span>✧ 照片專屬創作</span>
        <span>▧ 尺寸與畫框搭配</span>
        <span>♡ 為回憶找到位置</span>
      </div>
      <footer className="arto-footer">
        <div className="arto-container">
          <div className="arto-footer-grid">
            <div className="arto-footer-brand">
              <Link href="/">
                AI ART <em>STORE</em>
              </Link>
              <p>
                把喜歡的照片，
                <br />
                變成值得珍藏的藝術。
              </p>
            </div>
            {[
              {
                title: "熱門風格",
                links: [
                  ["油畫", "/#styles"],
                  ["水彩", "/#styles"],
                  ["日系插畫", "/#styles"],
                  ["電影感", "/#styles"],
                ],
              },
              {
                title: "創作與配框",
                links: [
                  ["上傳照片", "/upload"],
                  ["選擇風格", "/generate"],
                  ["尺寸與畫框", "/customize"],
                  ["創作流程", "/#how-it-works"],
                ],
              },
              {
                title: "我的帳戶",
                links: [
                  ["我的作品", "/account"],
                  ["我的訂單", "/orders"],
                  ["購物車", "/cart"],
                ],
              },
              {
                title: "探索更多",
                links: [
                  ["全部風格", "/#styles"],
                  ["創作方案", "/#options"],
                  ["常見問題", "/#faq"],
                  ["靈感探索", "/#discover"],
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3>{col.title}</h3>
                {col.links.map(([label, href]) => (
                  <Link href={href} key={label}>
                    {label}
                  </Link>
                ))}
              </div>
            ))}
          </div>
          <div className="arto-footer-bottom">
            <span>© {new Date().getFullYear()} AI ART STORE</span>
            <span>照片的故事，由你決定。</span>
            <a href="#">回到頂部 ↑</a>
          </div>
        </div>
      </footer>
    </main>
  );
}
