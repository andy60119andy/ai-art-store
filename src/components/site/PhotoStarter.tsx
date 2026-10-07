"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
export default function PhotoStarter({
  styleName,
  continueHref = "/upload",
  continueLabel = "前往正式上傳與創作 →",
}: {
  styleName: string;
  continueHref?: string;
  continueLabel?: string;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null),
    [preview, setPreview] = useState(""),
    [error, setError] = useState(""),
    [dragging, setDragging] = useState(false);
  useEffect(() => {
    if (!file) {
      setPreview("");
      return;
    }
    const url = URL.createObjectURL(file);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);
  function select(next?: File) {
    if (!next) return;
    if (!["image/jpeg", "image/png", "image/webp"].includes(next.type)) {
      setError("請選擇 JPG、PNG 或 WebP 圖片。");
      return;
    }
    if (next.size > 20 * 1024 * 1024) {
      setError("圖片大小請控制在 20 MB 以內。");
      return;
    }
    setError("");
    setFile(next);
  }
  return (
    <div className="arto-photo-starter">
      <h3>✧ 開始你的 {styleName}</h3>
      <div
        className={`arto-photo-drop ${dragging ? "dragging" : ""}`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          select(e.dataTransfer.files[0]);
        }}
      >
        {preview ? (
          <div className="arto-local-photo">
            <Image
              src={preview}
              alt="選擇的原始照片，尚未生成"
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
          onClick={() => input.current?.click()}
        >
          {file ? "重新選擇照片" : "或點擊選擇圖片"}
        </button>
        <small>JPG、PNG、WebP · 最大 20 MB</small>
        <input
          ref={input}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={(e) => select(e.target.files?.[0])}
          className="arto-sr-only"
          aria-label="選擇創作照片"
        />
      </div>
      {error && <p role="alert">{error}</p>}
      <Link className="arto-button" href={continueHref}>
        {continueLabel}
      </Link>
      <p className="arto-photo-note">
        這裡可先預覽原始照片。正式創作將在上傳頁進行。
      </p>
    </div>
  );
}
