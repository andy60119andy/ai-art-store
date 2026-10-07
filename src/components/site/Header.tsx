"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
import "@/app/storefront.css";

export default function Header() {
  const [open, setOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  function closeMenu() {
    setOpen(false);
    navRef.current?.querySelectorAll("details").forEach((item) => {
      item.open = false;
    });
  }
  return (
    <header className="arto-header">
      <div className="arto-announcement">
        ✓ 專屬藝術創作，從你喜歡的照片開始
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
          onClick={(event) => {
            if ((event.target as HTMLElement).closest("a")) closeMenu();
          }}
          className={open ? "is-open" : ""}
          aria-label="主要導覽"
        >
          <details className="arto-nav-dropdown">
            <summary>
              藝術風格 <span>⌄</span>
            </summary>
            <div className="arto-mega">
              <h3>找到你喜歡的藝術風格</h3>
              <div>
                {REFERENCE_GALLERY.slice(0, 12).map((s) => (
                  <Link
                    key={s.key}
                    href={`/styles/${s.key}`}
                    onClick={closeMenu}
                  >
                    {s.name} ↗
                  </Link>
                ))}
              </div>
              <Link href="/styles" onClick={closeMenu}>
                探索全部 79 種風格參考 →
              </Link>
            </div>
          </details>
          <details className="arto-nav-dropdown">
            <summary>
              創作與配框 <span>⌄</span>
            </summary>
            <div className="arto-mega arto-mega-small">
              <Link href="/upload">照片藝術創作 →</Link>
              <Link href="/customize">選擇尺寸與畫框 →</Link>
              <Link href="/account">我的作品收藏 →</Link>
            </div>
          </details>
          <Link href="/gift-ideas" onClick={closeMenu}>
            送禮靈感
          </Link>
          <Link href="/#how-it-works" onClick={closeMenu}>
            創作流程
          </Link>
          <Link href="/occasions" onClick={closeMenu}>
            場合挑選
          </Link>
        </nav>
        <div className="arto-header-actions">
          <Link href="/account" className="arto-my-art">
            ▧ 我的作品
          </Link>
          <Link href="/cart" aria-label="購物車" className="arto-cart">
            ♧
          </Link>
          <Link href="/upload" className="arto-header-cta">
            ✧ 開始創作<small>打造你的專屬藝術</small>
          </Link>
        </div>
      </div>
    </header>
  );
}
