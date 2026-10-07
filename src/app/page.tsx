"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ArtComparison from "@/components/site/ArtComparison";
import ReferenceGallery from "@/components/site/ReferenceGallery";
import "./storefront.css";

const questions = [
  [
    "如何製作我的專屬藝術作品？",
    "上傳照片，選擇喜歡的藝術風格，再預覽 AI 生成的作品。選好作品後，可以挑選尺寸與畫框，確認配框效果。",
  ],
  [
    "可以先看看風格再上傳嗎？",
    "可以。下方提供 79 種風格參考圖，點選圖片可放大預覽。創作頁目前提供 12 種已設定風格。示意圖用來說明風格，實際作品會依你的照片而不同。",
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
  const [paused, setPaused] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const syncMotion = () => setPaused(media.matches);
    syncMotion();
    media.addEventListener("change", syncMotion);
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).dataset.reveal = "visible";
            observer.unobserve(entry.target);
          }
        }),
      { threshold: 0.08 },
    );
    mainRef.current
      ?.querySelectorAll(".arto-section, .arto-final")
      .forEach((element) => {
        if (
          element.getBoundingClientRect().top > window.innerHeight &&
          !media.matches
        )
          (element as HTMLElement).dataset.reveal = "pending";
        observer.observe(element);
      });
    let frame = 0;
    const updateProgress = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        if (progressRef.current)
          progressRef.current.style.transform = `scaleX(${max > 0 ? window.scrollY / max : 0})`;
      });
    };
    window.addEventListener("scroll", updateProgress, { passive: true });
    updateProgress();
    return () => {
      observer.disconnect();
      media.removeEventListener("change", syncMotion);
      window.removeEventListener("scroll", updateProgress);
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <main
      ref={mainRef}
      className={`arto-home ${paused ? "arto-motion-paused" : ""}`}
    >
      <div
        ref={progressRef}
        className="arto-scroll-progress"
        aria-hidden="true"
      />
      <button
        type="button"
        className="arto-motion-control"
        onClick={() => setPaused(!paused)}
        aria-pressed={paused}
      >
        {paused ? "▶ 播放視覺動畫" : "Ⅱ 暫停視覺動畫"}
      </button>
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
          <ArtComparison paused={paused} />
        </div>
        <div className="arto-filmstrip" aria-label="藝術風格輪播">
          <div className="arto-filmstrip-track">
            {[0, 1].map((copy) => (
              <div
                className="arto-filmstrip-group"
                key={copy}
                aria-hidden={copy === 1 ? true : undefined}
              >
                {[
                  [
                    "Anime",
                    "/images/reference/styles/anime-portrait-thumb.webp",
                  ],
                  [
                    "Oil Painting",
                    "/images/reference/styles/oil-painting-portrait-thumb.webp",
                  ],
                  ["Couples", "/images/reference/couples_thumb8.webp"],
                  [
                    "Ghibli",
                    "/images/reference/styles/ghibli-portrait-thumb.webp",
                  ],
                  [
                    "Pop Art",
                    "/images/reference/styles/pop-art-portrait-thumb.webp",
                  ],
                  [
                    "Watercolor",
                    "/images/reference/styles/watercolor-portrait-thumb.webp",
                  ],
                  [
                    "Royal Pet",
                    "/images/reference/styles/royal-pet-portrait-thumb.webp",
                  ],
                  [
                    "Comic Book",
                    "/images/reference/styles/comic-book-portrait-thumb.webp",
                  ],
                  [
                    "Renaissance",
                    "/images/reference/styles/renaissance-portrait-thumb.webp",
                  ],
                  ["Lego", "/images/reference/styles/lego-portrait-thumb.webp"],
                  [
                    "Cyberpunk",
                    "/images/reference/styles/cyberpunk-portrait-thumb.webp",
                  ],
                  ["Simpsons", "/images/reference/main_thumb_new.webp"],
                ].map(([name, src]) => (
                  <Link
                    href="/#styles"
                    key={name}
                    tabIndex={copy === 1 ? -1 : undefined}
                  >
                    <Image src={src} alt="" width={128} height={110} />
                    <span>{name}</span>
                  </Link>
                ))}
              </div>
            ))}
          </div>
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
              image: "/images/reference/how-to-step-1.webp",
              tag: "你的照片 · 你的故事",
            },
            {
              n: "02",
              title: "選擇 AI 藝術風格",
              text: "探索 12 種風格，讓照片化作油畫、水彩、插畫或電影感作品。",
              image: "/images/reference/how-to-step-2.webp",
              tag: "12 種風格自由探索",
            },
            {
              n: "03",
              title: "搭配尺寸與畫框",
              text: "選擇成品大小、畫框與卡紙，預覽作品在畫框中的完整樣貌。",
              image: "/images/reference/how-to-step-3.webp",
              tag: "自訂尺寸 · 配框預覽",
            },
          ].map((step) => (
            <article className="arto-step" key={step.n}>
              <div className="arto-step-image">
                <Image
                  src={step.image}
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
            <h2>探索全部 79 種風格參考</h2>
            <p>每一種風格，都是另一種看見回憶的方式。</p>
          </div>
          <ReferenceGallery />
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
              image: "/images/reference/styles/ghibli-portrait-thumb.webp",
              href: "/styles",
            },
            {
              title: "珍藏重要回憶",
              text: "將人像與生活照片變成專屬作品。",
              image: "/images/reference/styles/royal-pet-portrait-thumb.webp",
              href: "/upload",
            },
            {
              title: "為居家挑選配框",
              text: "尺寸、畫框與卡紙，搭出理想比例。",
              image: "/images/reference/how-to-step-3.webp",
              href: "/customize",
            },
          ].map((d) => (
            <Link key={d.title} href={d.href}>
              <div>
                <Image
                  src={d.image}
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
    </main>
  );
}
