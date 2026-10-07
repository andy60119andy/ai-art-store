"use client";
import Link from "next/link";
import { useState } from "react";
import { ART_STYLES } from "@/lib/ai/styles";
import "@/app/storefront.css";

export default function Header() {
  const [open, setOpen] = useState(false);
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
                {ART_STYLES.map((s) => (
                  <Link
                    key={s.key}
                    href={`/#styles`}
                    onClick={() => setOpen(false)}
                  >
                    {s.name} ↗
                  </Link>
                ))}
              </div>
              <Link href="/#styles" onClick={() => setOpen(false)}>
                探索全部 12 種風格 →
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
          <Link href="/#discover" onClick={() => setOpen(false)}>
            靈感探索
          </Link>
          <Link href="/#how-it-works" onClick={() => setOpen(false)}>
            創作流程
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
