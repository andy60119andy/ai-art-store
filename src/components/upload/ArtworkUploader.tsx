"use client";

import { useState } from "react";

const allowed = ["image/jpeg", "image/png", "image/webp"];

export function ArtworkUploader() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function onChange(file?: File) {
    if (!file) return;
    if (!allowed.includes(file.type)) return setMessage("請選擇 JPG、PNG 或 WebP。");
    if (file.size > 20 * 1024 * 1024) return setMessage("圖片不可超過 20 MB。");

    setBusy(true);
    setMessage("準備安全上傳…");

    try {
      const presign = await fetch("/api/upload/presign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type, sizeBytes: file.size }),
      });

      if (!presign.ok) {
        setMessage("請先登入後再上傳。");
        return;
      }

      const { path, token } = await presign.json();
      const { createClient } = await import("@/lib/supabase/client");
      const supabase = createClient();
      const { error } = await supabase.storage.from("artwork-uploads").uploadToSignedUrl(path, token, file);

      if (error) {
        setMessage("上傳失敗，請稍後再試。");
        return;
      }

      const complete = await fetch("/api/upload/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ path }),
      });
      const result = await complete.json();

      if (!complete.ok || !result.upload?.id) {
        setMessage("圖片已上傳，但紀錄更新失敗。");
        return;
      }

      setMessage("圖片上傳完成，準備進入 AI 生圖…");
      window.location.href = `/generate?uploadId=${encodeURIComponent(result.upload.id)}`;
    } finally {
      setBusy(false);
    }
  }

  return <div>
    <label htmlFor="artwork-file">上傳你的圖片</label>
    <input
      id="artwork-file"
      type="file"
      accept="image/jpeg,image/png,image/webp"
      disabled={busy}
      onChange={(e) => onChange(e.target.files?.[0])}
    />
    <p role="status">{message}</p>
  </div>;
}
