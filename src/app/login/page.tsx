"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

function safeNext(value: string | null) {
  return value && value.startsWith("/") && !value.startsWith("//") ? value : "/";
}

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    const supabase = createClient();
    const next = safeNext(new URLSearchParams(window.location.search).get("next"));
    const redirectTo = new URL("/auth/callback", window.location.origin);
    redirectTo.searchParams.set("next", next);

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: redirectTo.toString() },
    });

    setMessage(error ? error.message : "登入連結已寄到你的 Email。請開啟信件完成登入。");
    setBusy(false);
  }

  return <main className="page"><section className="hero">
    <p className="eyebrow">ACCOUNT</p><h1>登入 AI 客製藝術商店</h1>
    <p>登入後即可上傳照片、生成 AI 藝術作品並保存你的作品。</p>
    <form onSubmit={submit}><label htmlFor="email">Email</label>
      <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" disabled={busy}>{busy ? "寄送中…" : "寄送登入連結"}</button>
    </form>
    {message && <p role="status">{message}</p>}
  </section></main>;
}
