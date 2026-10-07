"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
import { GIFT_COLLECTIONS, OCCASION_COLLECTIONS } from "@/lib/ai/collections";
import "@/app/storefront.css";
import "@/app/reference-flow.css";
const groups = [
  {
    name: "卡通與動畫",
    keys: [
      "simpsons-portrait",
      "anime-portrait",
      "ghibli-portrait",
      "cartoon-portrait",
      "pixar-portrait",
    ],
  },
  {
    name: "經典藝術",
    keys: [
      "watercolor-portrait",
      "oil-painting-portrait",
      "renaissance-portrait",
      "pencil-sketch-portrait",
      "digital-portrait",
    ],
  },
  {
    name: "寵物",
    keys: [
      "pet-portrait",
      "dog-portrait",
      "cat-portrait",
      "horse-portrait",
      "royal-pet-portrait",
    ],
  },
  {
    name: "人物與家庭",
    keys: [
      "couple-portrait",
      "family-portrait",
      "family-illustration",
      "couple-line-art-portrait",
      "storybook-family-portrait",
    ],
  },
  {
    name: "婚禮與愛情",
    keys: [
      "wedding-portrait",
      "wedding-line-art-portrait",
      "wedding-venue-portrait",
      "wedding-bouquet-illustration",
      "save-the-date-illustration",
    ],
  },
  {
    name: "禮物與居家",
    keys: [
      "portrait-gift",
      "house-portrait",
      "graduation-portrait",
      "memorial-portrait",
      "first-home-illustration",
    ],
  },
];
export default function Header() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  function closeMenu() {
    setOpen(false);
    navRef.current
      ?.querySelectorAll("details")
      .forEach((d) => (d.open = false));
  }
  return (
    <header className="arto-header clone-header">
      <div className="arto-announcement">
        ✓ 從喜歡的照片開始，先找到你的藝術風格
      </div>
      <div className="arto-header-inner">
        <Link href="/" className="arto-brand">
          ▧ AI ART <em>STORE</em>
          <small>Transform your photos into art</small>
        </Link>
        <button
          className="arto-menu-toggle"
          aria-expanded={open}
          aria-controls="arto-navigation"
          onClick={() => setOpen(!open)}
          aria-label="切換導覽選單"
        >
          {open ? "✕" : "☰"}
        </button>
        <nav
          id="arto-navigation"
          ref={navRef}
          className={open ? "is-open" : ""}
          aria-label="主要導覽"
          onClick={(e) => {
            if ((e.target as HTMLElement).closest("a")) closeMenu();
          }}
        >
          <details className="arto-nav-dropdown">
            <summary>
              藝術風格 <span>⌄</span>
            </summary>
            <div className="arto-mega clone-mega">
              <div className="clone-mega-heading">
                <div>
                  <h3>挑選你的藝術方向</h3>
                  <p>79 種風格參考，從照片開始創作。</p>
                </div>
                <Link href="/styles">查看全部 →</Link>
              </div>
              <div className="clone-mega-columns">
                {groups.map((g) => (
                  <section key={g.name}>
                    <h4>{g.name}</h4>
                    {g.keys.map((key) => {
                      const s = REFERENCE_GALLERY.find((x) => x.key === key);
                      return s ? (
                        <Link key={key} href={`/styles/${key}`}>
                          {s.name}
                        </Link>
                      ) : null;
                    })}
                    <Link className="clone-mega-more" href="/shop">
                      探索更多 →
                    </Link>
                  </section>
                ))}
              </div>
              <div className="clone-mega-bottom">
                <span>上傳照片 · 風格預覽 · 專屬創作</span>
                <Link href="/shop">開始選擇 →</Link>
              </div>
            </div>
          </details>
          <details className="arto-nav-dropdown">
            <summary>
              商店 <span>⌄</span>
            </summary>
            <div className="arto-mega clone-mega">
              <div className="clone-mega-heading">
                <div>
                  <h3>找到適合這份心意的作品</h3>
                  <p>依對象、場合或主題挑選。</p>
                </div>
                <Link href="/shop">瀏覽商店 →</Link>
              </div>
              <div className="clone-mega-columns clone-shop-menu">
                <section>
                  <h4>作品與印刷</h4>
                  <Link href="/shop">全部商品風格</Link>
                  <Link href="/styles">全部風格</Link>
                  <Link href="/large-format">120 cm 大尺寸客製</Link>
                  <Link href="/customize">尺寸與畫框</Link>
                </section>
                <section>
                  <h4>送禮對象</h4>
                  {GIFT_COLLECTIONS.map((g) => (
                    <Link key={g.slug} href={`/gifts/${g.slug}`}>
                      {g.name}
                    </Link>
                  ))}
                </section>
                <section>
                  <h4>重要場合</h4>
                  {OCCASION_COLLECTIONS.slice(0, 5).map((g) => (
                    <Link key={g.slug} href={`/occasions/${g.slug}`}>
                      {g.name}
                    </Link>
                  ))}
                  <Link href="/occasions">全部場合 →</Link>
                </section>
                <section>
                  <h4>作品主題</h4>
                  {[
                    "pet-portrait",
                    "couple-portrait",
                    "family-portrait",
                    "memorial-portrait",
                  ].map((k) => (
                    <Link key={k} href={`/styles/${k}`}>
                      {REFERENCE_GALLERY.find((s) => s.key === k)?.name}
                    </Link>
                  ))}
                </section>
              </div>
            </div>
          </details>
          <Link href="/gift-ideas">送禮靈感</Link>
          <Link href="/#how-it-works">製作流程</Link>
        </nav>
        <div className="arto-header-actions">
          <Link href="/my-orders" className="arto-my-art">
            ▧ 我的作品
          </Link>
          <span className="clone-currency" aria-label="幣別：新台幣">
            TWD
          </span>
          <Link href="/login" className="arto-cart" aria-label="登入我的帳戶">
            ♙
          </Link>
          <Link href="/shop" className="arto-header-cta">
            ✧ 開始創作<small>先找到喜歡的風格</small>
          </Link>
        </div>
      </div>
    </header>
  );
}
