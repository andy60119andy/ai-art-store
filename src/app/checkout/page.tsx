"use client";

import { useRef, useState } from "react";

import { MAINLAND_CITIES, shippingAddressSchema } from "@/lib/shipping/taiwan";
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
  const [shippingFee, setShippingFee] = useState<number | null>(null);
  const [shippingConfirmed, setShippingConfirmed] = useState(false);
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
      const parsed = shippingAddressSchema.safeParse(form);
      if (!parsed.success) {
        setMessage("請填寫完整台灣本島收件資料；離島與海外尚不配送。");
        return;
      }
      setMessage("確認宅配運費…");
      const quoteResponse = await fetch("/api/shipping/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ shippingAddress: parsed.data }),
      });
      const quote = await quoteResponse.json();
      if (!quoteResponse.ok) {
        setMessage(quote.message || "請先登入並確認配送設定。");
        return;
      }
      if (!shippingConfirmed) {
        setShippingFee(quote.shippingFeeTwd);
        setShippingConfirmed(true);
        setMessage("請確認下方宅配運費，再送出訂單。");
        return;
      }
      if (shippingFee !== quote.shippingFeeTwd) {
        setShippingFee(quote.shippingFeeTwd);
        setShippingConfirmed(false);
        setMessage("運費已變更，請重新確認。");
        return;
      }
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
          <p>商品與本島宅配運費已合併計入訂單。</p>
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
          油畫布／帆布裸框僅配送台灣本島，離島與海外尚不配送。此處以台幣結帳；商品頁美元價格僅為參考。
        </p>
        {message && <p>{message}</p>}
        <form onSubmit={submit}>
          {fields.map(([key, label, required]) => (
            <label key={key} style={{ display: "block" }}>
              {label}
              {key === "city" ? (
                <select
                  required
                  value={form.city}
                  onChange={(e) => {
                    setForm((current) => ({
                      ...current,
                      city: e.target.value,
                    }));
                    setShippingConfirmed(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 14,
                    margin: "8px 0 16px",
                  }}
                >
                  <option value="">選擇本島縣市</option>
                  {MAINLAND_CITIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  required={required}
                  value={form[key]}
                  onChange={(e) => {
                    setForm((current) => ({
                      ...current,
                      [key]: e.target.value,
                    }));
                    setShippingConfirmed(false);
                  }}
                  style={{
                    display: "block",
                    width: "100%",
                    padding: 14,
                    margin: "8px 0 16px",
                  }}
                />
              )}
            </label>
          ))}
          {shippingFee !== null && (
            <p>
              本島宅配運費：NT${shippingFee.toLocaleString()}（另加商品金額）
            </p>
          )}
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
            {shippingConfirmed ? "確認並前往付款" : "確認宅配運費"}
          </button>
        </form>
      </section>
    </main>
  );
}
