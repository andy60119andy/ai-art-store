"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ART_STYLES } from "@/lib/ai/styles";

export default function GeneratePage() {
  const [uploadId, setUploadId] = useState("");
  const [styleKey, setStyleKey] = useState(ART_STYLES[0].key);
  const [message, setMessage] = useState("");
  const [artworkId, setArtworkId] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("uploadId");
    if (id) setUploadId(id);
  }, []);

  async function generate() {
    setMessage("正在建立 AI 生圖任務…");
    setArtworkId("");
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

    setArtworkId(result.artworkId ?? "");
    setMessage("生成完成！現在可以把作品做成畫框商品。");
  }

  return (
    <main className="page">
      <section className="hero">
        <p className="eyebrow">AI GENERATION</p>
        <h1>把照片變成藝術作品</h1>
        <p>選擇藝術風格，系統會使用真實 AI 生圖模型生成作品。</p>

        <label htmlFor="upload-id">圖片 Upload ID</label>
        <input
          id="upload-id"
          aria-label="upload-id"
          placeholder="上傳完成後會自動帶入"
          value={uploadId}
          onChange={(e) => setUploadId(e.target.value)}
        />

        <label htmlFor="style-key">藝術風格</label>
        <select id="style-key" value={styleKey} onChange={(e) => setStyleKey(e.target.value)}>
          {ART_STYLES.map((style) => (
            <option key={style.key} value={style.key}>{style.name}</option>
          ))}
        </select>

        <button onClick={generate} disabled={!uploadId}>開始生成 AI 藝術作品</button>
        <p role="status">{message}</p>

        {artworkId && (
          <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:16}}>
            <Link href={`/artworks/${artworkId}`}>查看我的作品 →</Link>
            <Link href="/customize">選擇尺寸與畫框 →</Link>
          </div>
        )}
      </section>
    </main>
  );
}
