"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: window.location.origin + "/auth/callback" },
    });
    setMessage(error ? error.message : "登入連結已寄到你的 Email。");
    setBusy(false);
  }

  return <main className="page"><section className="hero">
    <p className="eyebrow">ACCOUNT</p><h1>登入 AI 客製藝術商店</h1>
    <p>輸入 Email，我們會寄送一次性登入連結。</p>
    <form onSubmit={submit}><label htmlFor="email">Email</label>
      <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
      <button type="submit" disabled={busy}>{busy ? "寄送中…" : "寄送登入連結"}</button>
    </form>
    {message && <p role="status">{message}</p>}
  </section></main>;
}