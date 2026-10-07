"use client";

import { useRef, useState } from "react";

type ShippingForm = {
  recipient_name: string;
  phone: string;
  postal_code: string;
  city: string;
  district: string;
  address_line: string;
};

const fields: Array<[keyof ShippingForm, string, boolean]> = [
  ["recipient_name", "收件人", true],
  ["phone", "手機", true],
  ["postal_code", "郵遞區號", true],
  ["city", "城市", true],
  ["district", "區", true],
  ["address_line", "地址", true],
];

export default function CheckoutPage() {
  const [form, setForm] = useState<ShippingForm>({
    recipient_name: "",
    phone: "",
    postal_code: "",
    city: "",
    district: "",
    address_line: "",
  });
  const requestId = useRef<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [mode, setMode] = useState("");
  const [message, setMessage] = useState("");
  const [order, setOrder] = useState<any>(null);
  const [payment, setPayment] = useState<any>(null);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    requestId.current ??= crypto.randomUUID();
    try {
      setMessage("建立訂單中…");
      const r = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requestId: requestId.current,
          shippingAddress: form,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMessage(d.message || d.error || "建立訂單失敗");
        return;
      }
      setMode(d.mode);
      setOrder(d.order);
      setPayment(d.payment);
      setMessage("");
    } catch {
      setMessage("連線失敗，請重試。重試不會重複建立訂單。");
    } finally {
      setBusy(false);
    }
  };

  if (order && payment) {
    return (
      <main className="page">
        <section className="hero">
          <p className="eyebrow">PAYMENT</p>
          <h1>前往付款</h1>
          <p>
            訂單：<strong>{order.order_number}</strong>
          </p>
          <h2>{"NT$" + order.total_twd.toLocaleString()}</h2>
          <p>
            {mode === "test"
              ? "綠界測試付款，不會安排實際出貨。"
              : "即將導向綠界付款頁面。"}
          </p>
          <form method="POST" action={payment.action}>
            {Object.entries(payment.fields).map(([k, v]) => (
              <input key={k} type="hidden" name={k} value={String(v)} />
            ))}
            <button
              type="submit"
              disabled={busy}
              style={{
                padding: "15px 28px",
                border: 0,
                borderRadius: 12,
                fontWeight: 800,
              }}
            >
              立即付款
            </button>
          </form>
        </section>
      </main>
    );
  }

  return (
    <main className="page">
      <section className="hero" style={{ maxWidth: 700 }}>
        <p className="eyebrow">CHECKOUT</p>
        <h1>確認訂單與宅配地址</h1>
        <p>
          油畫布／帆布裸框以宅配寄送。此處以台幣結帳；商品頁美元價格僅為參考。
        </p>
        {message && <p>{message}</p>}
        <form onSubmit={submit}>
          {fields.map(([key, label, required]) => (
            <label key={key} style={{ display: "block" }}>
              {label}
              <input
                required={required}
                value={form[key]}
                onChange={(e) =>
                  setForm((current) => ({ ...current, [key]: e.target.value }))
                }
                style={{
                  display: "block",
                  width: "100%",
                  padding: 14,
                  margin: "8px 0 16px",
                }}
              />
            </label>
          ))}
          <button
            type="submit"
            disabled={busy}
            style={{
              padding: "15px 28px",
              border: 0,
              borderRadius: 12,
              fontWeight: 800,
            }}
          >
            確認並前往付款
          </button>
        </form>
      </section>
    </main>
  );
}
