"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { useCreationDraft } from "./CreationDraft";
export default function PreviewCreator({
  styleKey,
  styleName,
}: {
  styleKey: string;
  styleName: string;
}) {
  const { file, setFile, email, setEmail } = useCreationDraft();
  const input = useRef<HTMLInputElement>(null),
    requestKey = useRef("");
  const [url, setUrl] = useState(""),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [jobId, setJobId] = useState(""),
    [artworkId, setArtworkId] = useState(""),
    [drag, setDrag] = useState(false),
    [login, setLogin] = useState(false);
  useEffect(() => {
    if (!file) {
      setUrl("");
      return;
    }
    const u = URL.createObjectURL(file);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [file]);
  useEffect(() => {
    requestKey.current = "";
    setJobId("");
    setArtworkId("");
    setMessage("");
  }, [file, styleKey]);
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
          setLogin(r.status === 401);
          setMessage("暫時無法查詢任務，請登入後到作品庫確認。");
          return;
        }
        if (d.job.status === "succeeded") {
          setArtworkId(d.artworkId ?? "");
          setMessage("作品已完成，可以查看結果與規劃成品。");
          return;
        }
        if (d.job.status === "failed") {
          setMessage(
            "此次創作未完成，請稍後再試。超時請先確認作品庫，避免重複生成。",
          );
          return;
        }
        setMessage(
          d.job.status === "queued"
            ? "作品已排入創作任務。"
            : "AI 正在創作，請稍候…",
        );
        timer = setTimeout(poll, 3000);
      } catch {
        if (!stopped) {
          setMessage("連線中斷，正在重新查詢作品狀態…");
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
  function choose(next?: File) {
    if (!next) return;
    if (
      !["image/jpeg", "image/png", "image/webp"].includes(next.type) ||
      next.size > 20 * 1024 * 1024
    ) {
      setMessage("請選擇 20 MB 以內的 JPG、PNG 或 WebP。");
      return;
    }
    setFile(next);
    setLogin(false);
  }
  async function create(e: React.FormEvent) {
    e.preventDefault();
    if (!file || busy) return;
    setBusy(true);
    setMessage("正在驗證照片並建立創作任務…");
    setLogin(false);
    try {
      requestKey.current ||= crypto.randomUUID();
      const headers = {
        "Content-Type": "application/json",
        "Idempotency-Key": requestKey.current,
      };
      const r = await fetch("/api/preview", {
        method: "POST",
        headers,
        body: JSON.stringify({
          email,
          styleKey,
          filename: file.name,
          contentType: file.type,
          sizeBytes: file.size,
        }),
      });
      const d = await r.json();
      if (!r.ok) {
        setLogin(r.status === 401);
        setMessage(
          r.status === 401
            ? "請先使用這個信箱登入，照片會在此分頁暫存。"
            : r.status === 503
              ? "照片預覽可用；正式 AI 生成服務尚未設定，這次沒有建立生成任務。"
              : d.error === "EMAIL_MISMATCH"
                ? "請使用目前登入帳戶的 Email。"
                : "無法準備照片上傳，請稍後再試。",
        );
        return;
      }
      if (!d.verified) {
        const { createClient } = await import("@/lib/supabase/client");
        const db = createClient();
        const { error } = await db.storage
          .from("artwork-uploads")
          .uploadToSignedUrl(d.path, d.token, file);
        const complete = await fetch("/api/upload/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ path: d.path }),
        });
        if (!complete.ok) {
          setMessage(
            error
              ? "照片上傳未完成，請稍後再試。"
              : "無法驗證這張照片，請使用清晰且有效的圖片。",
          );
          return;
        }
      }
      const generated = await fetch("/api/generation", {
        method: "POST",
        headers,
        body: JSON.stringify({ uploadId: d.uploadId, styleKey }),
      });
      const result = await generated.json();
      if (!generated.ok) {
        setMessage(
          generated.status === 429
            ? "今天的創作次數或同時任務已達限制。"
            : "建立作品失敗，請稍後再試。",
        );
        return;
      }
      setJobId(result.job.id);
      if (result.artworkId) setArtworkId(result.artworkId);
    } catch {
      setMessage("連線失敗，請稍後重新操作；重試會使用相同任務識別碼。");
    } finally {
      setBusy(false);
    }
  }
  return (
    <form className="arto-photo-starter clone-preview-form" onSubmit={create}>
      <h3>✧ 開始你的 {styleName}</h3>
      <div
        className={`arto-photo-drop ${drag ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDrag(true);
        }}
        onDragLeave={() => setDrag(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDrag(false);
          if (!busy && !jobId) choose(e.dataTransfer.files[0]);
        }}
      >
        {url ? (
          <div className="arto-local-photo">
            <Image
              src={url}
              alt="你的原始照片，尚未生成"
              fill
              unoptimized
              sizes="220px"
            />
          </div>
        ) : (
          <span className="arto-upload-symbol">⇧</span>
        )}
        <strong>{file ? file.name : "拖曳照片到這裡"}</strong>
        <button
          type="button"
          className="arto-text-button"
          disabled={busy || !!jobId}
          onClick={() => input.current?.click()}
        >
          {file ? "重新選擇照片" : "或點擊選擇圖片"}
        </button>
        <small>JPG、PNG、WebP · 最大 20 MB</small>
        <input
          ref={input}
          type="file"
          disabled={busy || !!jobId}
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => choose(e.target.files?.[0])}
          className="arto-sr-only"
          aria-label="選擇創作照片"
        />
      </div>
      <label htmlFor={`preview-email-${styleKey}`}>Email</label>
      <input
        id={`preview-email-${styleKey}`}
        type="email"
        autoComplete="email"
        placeholder="your@email.com"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        disabled={busy || !!jobId}
      />
      <button
        type="submit"
        className="arto-button"
        disabled={!file || !email || busy || !!jobId}
      >
        {busy
          ? "正在建立任務…"
          : jobId
            ? "已建立創作任務"
            : "生成我的作品預覽 →"}
      </button>
      <p className="arto-photo-note">
        照片只在此分頁預覽；按下生成後才會送至本站。生成需登入並接通 AI 服務。
      </p>
      {message && (
        <p role="status" className="arto-product-notice">
          {message}
        </p>
      )}
      {login && (
        <Link
          className="arto-outline"
          href={`/login?next=${encodeURIComponent(`/styles/${styleKey}`)}`}
        >
          登入後繼續 →
        </Link>
      )}
      {artworkId && (
        <Link className="arto-button" href={`/artworks/${artworkId}`}>
          查看我的完成作品 →
        </Link>
      )}
      {jobId && (
        <Link className="arto-text-button" href="/account">
          到作品庫查看 →
        </Link>
      )}
      {(artworkId || message.startsWith("此次創作未完成")) && (
        <button
          type="button"
          className="arto-outline"
          onClick={() => {
            setJobId("");
            setArtworkId("");
            requestKey.current = "";
            setMessage("可以重新選圖或按下生成，這將建立另一個創作任務。");
          }}
        >
          準備另一版本
        </button>
      )}
    </form>
  );
}
