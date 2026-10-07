"use client";
import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
export default function GeneratePage() {
  const [uploadId, setUploadId] = useState(""),
    [styleKey, setStyleKey] = useState("watercolor-portrait"),
    [message, setMessage] = useState(""),
    [jobId, setJobId] = useState(""),
    [artworkId, setArtworkId] = useState(""),
    [busy, setBusy] = useState(false),
    [terminal, setTerminal] = useState(false);
  const key = useRef("");
  useEffect(() => {
    const q = new URLSearchParams(window.location.search);
    setUploadId(q.get("uploadId") ?? "");
    const style = q.get("style");
    if (REFERENCE_GALLERY.some((s) => s.key === style)) setStyleKey(style!);
    const job = q.get("job");
    if (job) setJobId(job);
  }, []);
  useEffect(() => {
    if (!jobId) return;
    let stopped = false;
    let timer: ReturnType<typeof setTimeout>;
    async function poll() {
      try {
        const r = await fetch(`/api/generation/${jobId}`, {
          cache: "no-store",
        });
        const d = await r.json();
        if (stopped) return;
        if (!r.ok) {
          setMessage("目前無法查看任務，請登入後再試。");
          setTerminal(true);
          return;
        }
        if (d.job.status === "succeeded") {
          setArtworkId(d.artworkId ?? "");
          setMessage("作品完成！");
          setTerminal(true);
          return;
        }
        if (d.job.status === "failed") {
          setMessage("生成未完成，請先到作品庫確認，再決定是否重新創作。");
          setTerminal(true);
          return;
        }
        setMessage(
          d.job.status === "queued" ? "已排入創作任務…" : "AI 正在創作中…",
        );
        timer = setTimeout(poll, 3000);
      } catch {
        if (!stopped) {
          setMessage("連線中斷，正在重新查詢…");
          timer = setTimeout(poll, 5000);
        }
      }
    }
    poll();
    return () => {
      stopped = true;
      clearTimeout(timer);
    };
  }, [jobId]);
  async function generate() {
    if (!uploadId || busy) return;
    setBusy(true);
    setTerminal(false);
    setArtworkId("");
    setMessage("正在建立作品…");
    try {
      key.current ||= crypto.randomUUID();
      const r = await fetch("/api/generation", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Idempotency-Key": key.current,
        },
        body: JSON.stringify({ uploadId, styleKey }),
      });
      const d = await r.json();
      if (!r.ok) {
        setMessage(
          r.status === 503
            ? "AI 生成服務尚未設定。"
            : r.status === 429
              ? "已達創作次數或同時任務限制。"
              : "無法建立作品，請確認登入與照片。",
        );
        return;
      }
      setJobId(d.job.id);
      const url = new URL(window.location.href);
      url.searchParams.set("job", d.job.id);
      window.history.replaceState(null, "", url);
      if (d.artworkId) setArtworkId(d.artworkId);
    } catch {
      setMessage("連線失敗，請稍後再試；重試會保留同一任務識別碼。");
    } finally {
      setBusy(false);
    }
  }
  const active = !!jobId && !terminal;
  return (
    <main className="arto-home arto-subpage">
      <section className="arto-container arto-section">
        <div className="arto-heading">
          <span className="arto-eyebrow">CHOOSE YOUR STYLE</span>
          <h1>選一種風格，開始你的藝術創作</h1>
          <p>79 種風格設定。完成照片上傳後，建立你的專屬作品。</p>
        </div>
        {!uploadId && !jobId && (
          <div className="arto-product-notice">
            請先選擇照片再創作。<Link href="/upload"> 前往照片上傳 →</Link>
          </div>
        )}
        <div className="arto-style-grid clone-generation-grid">
          {REFERENCE_GALLERY.map((s) => (
            <button
              type="button"
              disabled={busy || active}
              className={`arto-style-card ${styleKey === s.key ? "selected" : ""}`}
              key={s.key}
              aria-pressed={styleKey === s.key}
              onClick={() => {
                setStyleKey(s.key);
                key.current = "";
                setJobId("");
                setTerminal(false);
              }}
            >
              <div className="arto-style-image">
                <Image
                  src={s.src}
                  alt={s.name}
                  fill
                  sizes="(max-width:650px)45vw,23vw"
                />
              </div>
              <div className="arto-style-caption">
                <h3>{s.name}</h3>
              </div>
            </button>
          ))}
        </div>
        <div className="clone-generate-bar">
          <div>
            <strong>
              已選：{REFERENCE_GALLERY.find((s) => s.key === styleKey)?.name}
            </strong>
            <p role="status">{message}</p>
          </div>
          <button
            type="button"
            className="arto-button"
            disabled={!uploadId || busy || active || terminal}
            onClick={generate}
          >
            {busy || active ? "創作進行中…" : "生成我的作品 →"}
          </button>
          {terminal && (
            <button
              type="button"
              className="arto-outline"
              onClick={() => {
                setJobId("");
                setTerminal(false);
                key.current = "";
                setMessage("請確認後再按下生成，這會建立另一個任務。");
              }}
            >
              準備另一版本
            </button>
          )}
        </div>
        {artworkId && (
          <div className="clone-result-actions">
            <Link className="arto-button" href={`/artworks/${artworkId}`}>
              查看完成作品 →
            </Link>
            <Link
              className="arto-outline"
              href={`/customize?artworkId=${artworkId}`}
            >
              規劃印刷與配框 →
            </Link>
          </div>
        )}
      </section>
    </main>
  );
}
