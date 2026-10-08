"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
type Product = {
  id: string;
  name: string;
  base_price_twd: number;
  price_confirmed: boolean;
};
type Size = { id: string; name: string; price_delta_twd: number };
export default function StoreSettings() {
  const [products, setProducts] = useState<Product[]>([]);
  const [sizes, setSizes] = useState<Size[]>([]);
  const [fee, setFee] = useState(0);
  const [enabled, setEnabled] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("載入設定…");
  useEffect(() => {
    fetch("/api/admin/store-settings")
      .then(async (r) => {
        if (!r.ok) throw new Error("需要管理員登入，並完成資料庫設定。");
        return r.json();
      })
      .then((d) => {
        setProducts(d.products);
        setSizes(d.sizes);
        setFee(d.shipping?.shipping_fee_twd ?? 0);
        setEnabled(d.shipping?.enabled ?? false);
        setLoaded(true);
        setMessage("");
      })
      .catch((e) => setMessage(e.message));
  }, []);
  async function save(body: unknown) {
    setBusy(true);
    try {
      const r = await fetch("/api/admin/store-settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!r.ok) throw new Error("儲存失敗，請檢查數值與權限。");
      setMessage("已儲存");
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "儲存失敗");
    } finally {
      setBusy(false);
    }
  }
  return (
    <main className="page">
      <section className="hero" style={{ maxWidth: 850 }}>
        <Link href="/admin">← 管理後台</Link>
        <h1>帆布售價與本島宅配</h1>
        <p>僅配送台灣本島。此處設定台幣實際售價；首頁美元價格為參考。</p>
        <p role="status">{message}</p>
        {loaded && (
          <>
            <h2>宅配運費</h2>
            <label>
              台幣運費
              <input
                type="number"
                min={0}
                value={fee}
                onChange={(e) => setFee(Number(e.target.value))}
              />
            </label>
            <label>
              <input
                type="checkbox"
                checked={enabled}
                onChange={(e) => setEnabled(e.target.checked)}
              />
              開放本島宅配
            </label>
            <button
              disabled={busy}
              onClick={() =>
                save({ type: "shipping", shippingFeeTwd: fee, enabled })
              }
            >
              儲存配送設定
            </button>
            <h2>帆布基本售價</h2>
            {products.map((p, i) => (
              <div key={p.id}>
                <h3>{p.name}</h3>
                <label>
                  基本售價
                  <input
                    type="number"
                    min={1}
                    value={p.base_price_twd}
                    onChange={(e) =>
                      setProducts(
                        products.map((x, j) =>
                          j === i
                            ? { ...x, base_price_twd: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                  />
                </label>
                <label>
                  <input
                    type="checkbox"
                    checked={p.price_confirmed}
                    onChange={(e) =>
                      setProducts(
                        products.map((x, j) =>
                          j === i
                            ? { ...x, price_confirmed: e.target.checked }
                            : x,
                        ),
                      )
                    }
                  />
                  售價已確認
                </label>
                <button
                  disabled={busy}
                  onClick={() =>
                    save({
                      type: "product",
                      id: p.id,
                      basePriceTwd: p.base_price_twd,
                      priceConfirmed: p.price_confirmed,
                    })
                  }
                >
                  儲存售價
                </button>
              </div>
            ))}
            <h2>各尺寸加價</h2>
            {sizes.map((s, i) => (
              <div key={s.id}>
                <label>
                  {s.name} 加價
                  <input
                    type="number"
                    min={0}
                    value={s.price_delta_twd}
                    onChange={(e) =>
                      setSizes(
                        sizes.map((x, j) =>
                          j === i
                            ? { ...x, price_delta_twd: Number(e.target.value) }
                            : x,
                        ),
                      )
                    }
                  />
                </label>
                <button
                  disabled={busy}
                  onClick={() =>
                    save({
                      type: "size",
                      id: s.id,
                      priceDeltaTwd: s.price_delta_twd,
                    })
                  }
                >
                  儲存尺寸價格
                </button>
              </div>
            ))}
          </>
        )}
      </section>
    </main>
  );
}
