"use client";
import Image from "next/image";
import Link from "next/link";
import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";
function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//")
    ? value
    : "/account";
}
export default function LoginPage() {
  const [email, setEmail] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false);
  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      setMessage("登入服務尚未啟用。你可以先瀏覽藝術風格。");
      return;
    }
    setBusy(true);
    setMessage("");
    try {
      const supabase = createClient();
      const redirectTo = new URL("/auth/callback", window.location.origin);
      redirectTo.searchParams.set(
        "next",
        safeNext(new URLSearchParams(window.location.search).get("next")),
      );
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: redirectTo.toString() },
      });
      setMessage(
        error
          ? "寄送失敗，請稍後再試。"
          : "登入連結已寄到你的 Email，請開啟信件完成登入。",
      );
    } catch {
      setMessage("目前無法寄送登入連結，請稍後再試。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="arto-home arto-subpage">
      <section className="arto-login arto-container">
        <div className="arto-login-art">
          <Image
            src="/images/reference/styles/watercolor-portrait-thumb.webp"
            alt="水彩藝術風格示意"
            fill
            priority
            sizes="45vw"
          />
          <div>
            <span>YOUR PHOTOS. YOUR STORIES.</span>
            <h2>
              把喜歡的回憶，
              <br />
              放進你的作品庫。
            </h2>
          </div>
        </div>
        <div className="arto-login-form">
          <span className="arto-eyebrow">WELCOME TO AI ART STORE</span>
          <h1>歡迎回來</h1>
          <p>用 Email 登入，繼續你的藝術創作。</p>
          <form onSubmit={submit}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="your@email.com"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <button type="submit" className="arto-button" disabled={busy}>
              {busy ? "正在寄送…" : "寄送登入連結 →"}
            </button>
          </form>
          {message && (
            <p role="status" className="arto-product-notice">
              {message}
            </p>
          )}
          <p className="arto-photo-note">
            不需要記住密碼，透過信箱連結即可登入。
          </p>
          <Link href="/styles" className="arto-text-button">
            先探索藝術風格 →
          </Link>
        </div>
      </section>
    </main>
  );
}
