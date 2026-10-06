"use client";

import { useState } from "react";
import { ART_STYLES } from "@/lib/ai/styles";

export default function GeneratePage() {
  const [uploadId, setUploadId] = useState("");
  const [styleKey, setStyleKey] = useState(ART_STYLES[0].key);
  const [message, setMessage] = useState("");

  async function generate() {
    setMessage("正在建立 AI 生圖任務…");
    const response = await fetch("/api/generation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, styleKey }),
    });
    const data = await response.json();
    if (!response.ok) {
      setMessage("建立失敗：" + (data.error ?? "UNKNOWN"));
      return;
    }

    setMessage("AI 正在生成作品，請稍候…");
    const processResponse = await fetch(`/api/generation/${data.job.id}/process`, { method: "POST" });
    const result = await processResponse.json();

    if (!processResponse.ok) {
      setMessage("生成失敗：" + (result.message ?? result.error ?? "UNKNOWN"));
      return;
    }

    setMessage(`生成完成！作品 ID：${result.artworkId}`);
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">AI GENERATION</p>
        <h1>選擇藝術風格</h1>
        <p>上傳完成後，把 Upload ID 貼到這裡，系統會呼叫真實 AI 生圖模型並儲存作品。</p>
        <input
          aria-label="upload-id"
          placeholder="貼上 Upload ID"
          value={uploadId}
          onChange={(e) => setUploadId(e.target.value)}
        />
        <select value={styleKey} onChange={(e) => setStyleKey(e.target.value)}>
          {ART_STYLES.map((style) => (
            <option key={style.key} value={style.key}>{style.name}</option>
          ))}
        </select>
        <button onClick={generate} disabled={!uploadId}>開始生成</button>
        <p role="status">{message}</p>
      </section>
    </main>
  );
}
