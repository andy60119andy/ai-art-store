"use client";

import { useState } from "react";
import { ART_STYLES } from "@/lib/ai/styles";

export default function GeneratePage() {
  const [uploadId, setUploadId] = useState("");
  const [styleKey, setStyleKey] = useState(ART_STYLES[0].key);
  const [message, setMessage] = useState("");

  async function generate() {
    const response = await fetch("/api/generation", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ uploadId, styleKey }),
    });
    const data = await response.json();
    setMessage(response.ok ? "AI 生圖任務已建立：" + data.job.id : "建立失敗：" + (data.error ?? "UNKNOWN"));
  }

  return <main className="page"><section className="hero">
    <p className="eyebrow">AI GENERATION</p><h1>選擇藝術風格</h1>
    <input aria-label="upload-id" placeholder="貼上 Upload ID" value={uploadId} onChange={(e) => setUploadId(e.target.value)} />
    <select value={styleKey} onChange={(e) => setStyleKey(e.target.value)}>
      {ART_STYLES.map((style) => <option key={style.key} value={style.key}>{style.name}</option>)}
    </select>
    <button onClick={generate}>開始生成</button>
    <p role="status">{message}</p>
  </section></main>;
}