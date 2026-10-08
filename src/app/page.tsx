"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import ArtComparison from "@/components/site/ArtComparison";
import ReferenceGallery from "@/components/site/ReferenceGallery";
import CanvasShowcase from "@/components/site/CanvasShowcase";
import "./storefront.css";

const questions = [
  [
    "如何製作我的專屬藝術作品？",
    "先選擇喜歡的藝術風格，再在風格頁預覽你的照片。AI 服務接通後可建立專屬作品，選好作品後再搭配帆布尺寸。目前可體驗風格與尺寸示意，尚未開放正式生成與訂購。",
  ],
  [
    "可以先看看風格再上傳嗎？",
    "可以。下方提供 79 種風格參考圖，點選圖片可查看風格與開始創作。創作頁已有 79 種風格設定，AI 服務尚待接通。示意圖用來說明風格，實際作品會依你的照片而不同。",
  ],
  [
    "什麼樣的照片比較適合？",
    "建議使用清晰、光線充足、主體完整的照片。人像請避免臉部被遮住，並盡量使用原始照片。",
  ],
  [
    "可以選擇自己的帆布尺寸嗎？",
    "可以。在帆布尺寸頁面選擇成品尺寸與帆布裸框，也可以使用標準尺寸查看搭配效果。",
  ],
  [
    "風格不符合期待怎麼辦？",
    "可以回到風格選擇頁，改選另一種風格後重新創作。確認作品後，再選擇帆布尺寸。",
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
            <span className="studio-kicker">THE EVERYDAY ART COLLECTION</span>
            <span className="arto-pill">從一張照片，開始一件專屬作品</span>
            <h1>
              把回憶，
              <br />
              <em>掛成日常。</em>
            </h1>
            <p>
              讓珍愛的人、毛孩與生活片刻，成為一幅有溫度的畫。
              挑選藝術風格，以油畫布／帆布裸框，留下屬於你的故事。
            </p>
            <strong>油畫布／帆布裸框 · 標準尺寸 · 台灣本島配送</strong>
            <div className="arto-hero-actions">
              <Link className="arto-button" href="/shop">
                挑選我的作品風格 <span>→</span>
              </Link>
              <Link href="/#canvas-details" className="atelier-secondary">
                先看看帆布成品 ↗
              </Link>
            </div>
            <div className="studio-edition">
              <b>01 /</b>
              <span>你的照片 · 藝術風格 · 帆布裸框</span>
            </div>
          </div>
          <CanvasShowcase paused={paused} />
        </div>
        <div className="atelier-test-note arto-container">
          <span>內部體驗版</span>可瀏覽風格與預覽尺寸。正式 AI
          創作、付款與出貨尚未開放。
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
        <span>◇ 79 種風格參考</span>
        <span>✧ 專屬照片創作</span>
        <span>▧ 帆布裸框輸出</span>
        <span>♡ 珍藏生活回憶</span>
      </div>
      <section
        id="canvas-details"
        className="arto-section arto-container atelier-materials"
      >
        <div className="arto-heading">
          <span className="arto-eyebrow">MADE TO LIVE WITH YOU</span>
          <h2>
            一幅畫，
            <br />
            也是家的溫度。
          </h2>
          <p>
            從照片的藝術方向，到牆面上的比例。
            <br />
            先了解你會選擇的成品，再開始創作。
          </p>
          <Link className="arto-outline" href="/customize">
            體驗尺寸與橫直向預覽 ↗
          </Link>
        </div>
        <div className="atelier-detail-grid">
          <article>
            <span>01 / THE MATERIAL</span>
            <h3>油畫布／帆布</h3>
            <p>以布面呈現作品。紙張、外框與卡紙不列入目前的成品選項。</p>
          </article>
          <article>
            <span>02 / THE FINISH</span>
            <h3>裸框呈現</h3>
            <p>帆布繃在內部木框，呈現簡潔邊緣；不加外部裝飾框。</p>
          </article>
          <article>
            <span>03 / THE SIZE</span>
            <h3>三種標準比例</h3>
            <p>約 20.3 × 25.4、40.6 × 50.8、61 × 76.2 cm，可切換橫直向預覽。</p>
          </article>
          <article>
            <span>04 / THE DELIVERY</span>
            <h3>台灣本島宅配</h3>
            <p>離島與海外暫不配送。正式尺寸售價與運費確認後，才開放訂購。</p>
          </article>
        </div>
      </section>
      <section id="styles" className="arto-section arto-styles-section">
        <div className="arto-container">
          <div className="arto-heading">
            <span className="arto-eyebrow">FIND YOUR STYLE</span>
            <h2>探索全部 79 種風格參考</h2>
            <p>每一種風格，都是另一種看見回憶的方式。</p>
          </div>
          <ReferenceGallery linkToDetails />
          <div className="arto-center">
            <Link className="arto-outline" href="/shop">
              挑選風格並查看照片預覽 →
            </Link>
          </div>
        </div>
      </section>
      <section className="arto-section arto-container atelier-comparison-section">
        <ArtComparison paused={paused} />
        <div className="arto-heading">
          <span className="arto-eyebrow">A NEW WAY TO SEE</span>
          <h2>
            同一張照片，
            <br />
            另一種想像。
          </h2>
          <p>
            拖動滑桿，比較原始照片與藝術風格參考。這是展示範例，並非即時生成的作品。
          </p>
          <Link className="arto-outline" href="/shop">
            找到我喜歡的藝術方向 →
          </Link>
        </div>
      </section>
      <section id="how-it-works" className="arto-section arto-container">
        <div className="arto-heading">
          <span className="arto-eyebrow">SIMPLE PROCESS · 簡單三步</span>
          <h2>你的藝術作品，這樣誕生</h2>
          <p>先找到藝術方向，再讓照片成為作品。正式創作服務接通後適用。</p>
        </div>
        <div className="arto-steps">
          {[
            {
              n: "01",
              title: "挑選你的藝術風格",
              text: "從水彩、油畫或寵物肖像開始，找到喜歡的藝術方向，再前往風格詳情。",
              image: "/images/reference/how-to-step-2.webp",
              tag: "風格選擇 · 藝術方向",
            },
            {
              n: "02",
              title: "從你的照片開始",
              text: "選擇清晰的照片並預覽原圖。服務開通後，登入並建立 AI 作品，再確認喜歡的結果。",
              image: "/images/reference/how-to-step-1.webp",
              tag: "照片預覽 · 專屬創作",
            },
            {
              n: "03",
              title: "搭配帆布尺寸",
              text: "選擇標準尺寸，以油畫布／帆布裸框呈現你的專屬藝術作品。",
              image: "/images/reference/how-to-step-3.webp",
              tag: "標準尺寸 · 帆布預覽",
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
          <Link className="arto-button" href="/shop">
            挑選我的作品風格 →
          </Link>
        </div>
      </section>
      <section id="options" className="arto-section arto-container">
        <div className="arto-heading">
          <span className="arto-eyebrow">MADE FOR YOU</span>
          <h2>先預覽，再選擇你的藝術作品</h2>
          <p>依照作品與空間，選擇適合你的呈現方式。</p>
        </div>
        <div className="arto-plans">
          {[
            {
              n: "01",
              name: "照片與尺寸體驗",
              price: "免費瀏覽",
              sub: "選一種喜歡的藝術風格",
              items: ["79 種風格參考", "原始照片本機預覽", "帆布尺寸示意"],
              cta: "挑選作品風格",
              href: "/shop",
            },
            {
              n: "02",
              name: "數位作品",
              price: "US$9.95",
              sub: "作品完成後查看原始圖檔",
              items: ["個人作品庫", "實際解析度資訊", "私有作品預覽"],
              cta: "查看我的作品",
              href: "/account",
            },
            {
              n: "03",
              name: "油畫布／帆布裸框",
              price: "US$80 起",
              sub: "把喜歡的作品帶進生活空間",
              items: ["油畫布／帆布輸出", "裸框成品", "方便寄送的標準尺寸"],
              cta: "規劃印刷成品",
              href: "/customize",
            },
          ].map((p, i) => (
            <article
              className={`arto-plan ${i === 2 ? "featured" : ""}`}
              key={p.n}
            >
              {i === 2 && (
                <div className="arto-plan-ribbon">帆布成品 · 主要服務</div>
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
                className={i === 2 ? "arto-button" : "arto-outline"}
              >
                {p.cta} →
              </Link>
            </article>
          ))}
        </div>
        <p className="arto-center">
          展示價格參考 FrameArto，幣別為美元（USD）；帆布價格依尺寸而異。正式 AI
          服務與結帳尚未啟用。
        </p>
      </section>
      <section id="faq" className="arto-section arto-faq-section">
        <div className="arto-container arto-faq">
          <div>
            <span className="arto-eyebrow">A LITTLE HELP</span>
            <h2>想多了解一點？</h2>
            <p>
              從照片選擇到帆布輸出，
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
              href: "/shop",
            },
            {
              title: "為居家挑選帆布作品",
              text: "尺寸與帆布裸框，搭出理想比例。",
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
        <Link href="/shop" className="arto-button">
          挑選我的作品風格 →
        </Link>
        <small>79 種風格參考 · 標準尺寸 · 帆布預覽</small>
      </section>
      <div className="arto-trust">
        <span>◇ 藝術風格選擇</span>
        <span>✧ 照片專屬創作</span>
        <span>▧ 帆布尺寸搭配</span>
        <span>♡ 為回憶找到位置</span>
      </div>
    </main>
  );
}
