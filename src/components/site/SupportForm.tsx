"use client";
import { useState } from "react";
import Link from "next/link";
export default function SupportForm() {
  const [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [login, setLogin] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setLogin(false);
    const form = new FormData(e.currentTarget);
    try {
      const r = await fetch("/api/support", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(form.entries())),
      });
      setLogin(r.status === 401);
      setMessage(
        r.ok
          ? "需求已保存在你的帳戶中，客服可以查閱。尚未寄送任何 Email。"
          : r.status === 503
            ? "客服收件服務尚未啟用，這次沒有送出訊息。"
            : r.status === 401
              ? "請先登入，再提交你的需求。"
              : "送出失敗，請確認資料或稍後再試。",
      );
    } catch {
      setMessage("連線失敗，這次無法確認送出結果。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="clone-support-form" onSubmit={submit}>
      <h2>留下你的問題</h2>
      <label>
        姓名
        <input name="name" required maxLength={100} autoComplete="name" />
      </label>
      <label>
        Email
        <input name="email" type="email" required autoComplete="email" />
      </label>
      <label>
        主題
        <select name="topic">
          <option value="style">風格與照片</option>
          <option value="production">尺寸與製作</option>
          <option value="order">訂單與配送</option>
          <option value="other">其他問題</option>
        </select>
      </label>
      <label>
        訂單編號（選填）
        <input name="orderReference" maxLength={100} />
      </label>
      <label>
        訊息
        <textarea
          name="message"
          required
          minLength={10}
          maxLength={5000}
          rows={6}
        />
      </label>
      <button type="submit" disabled={busy} className="arto-button">
        {busy ? "正在送出…" : "送出需求 →"}
      </button>
      <p className="arto-photo-note">
        僅用於回覆這次需求，請勿填入密碼或付款資料。
      </p>
      {message && (
        <p role="status" className="arto-product-notice">
          {message}
        </p>
      )}
      {login && (
        <Link href="/login?next=/contact" className="arto-outline">
          登入後再送出 →
        </Link>
      )}
    </form>
  );
}
