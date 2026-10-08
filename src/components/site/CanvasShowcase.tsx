"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState, type CSSProperties } from "react";

const works = [
  {
    key: "watercolor-portrait",
    name: "溫柔水彩",
    subject: "讓日常，多一點柔軟。",
    image: "/images/reference/styles/watercolor-portrait-thumb.webp",
  },
  {
    key: "pet-portrait",
    name: "寵物肖像",
    subject: "把最愛的牠，留在身邊。",
    image: "/images/reference/styles/pet-portrait-thumb.webp",
  },
  {
    key: "oil-painting-portrait",
    name: "經典油畫",
    subject: "值得珍藏的每一道筆觸。",
    image: "/images/reference/styles/oil-painting-portrait-thumb.webp",
  },
];
const sizes = [
  { label: "20.3 × 25.4 cm", scale: 1 / 3 },
  { label: "40.6 × 50.8 cm", scale: 2 / 3 },
  { label: "61 × 76.2 cm", scale: 1 },
];

export default function CanvasShowcase({ paused }: { paused: boolean }) {
  const [selected, setSelected] = useState(0);
  const [size, setSize] = useState(1);
  const card = useRef<HTMLDivElement>(null);
  const frame = useRef(0);
  const reduced = useRef(true);
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const sync = () => {
      reduced.current = media.matches;
    };
    sync();
    media.addEventListener("change", sync);
    return () => {
      media.removeEventListener("change", sync);
      cancelAnimationFrame(frame.current);
    };
  }, []);
  function reset() {
    cancelAnimationFrame(frame.current);
    card.current?.style.setProperty("--tilt-x", "0deg");
    card.current?.style.setProperty("--tilt-y", "0deg");
  }
  useEffect(() => {
    if (paused) reset();
  }, [paused]);
  const work = works[selected];
  return (
    <div className="atelier-showcase">
      <div
        className="atelier-wall"
        onPointerMove={(event) => {
          if (paused || reduced.current || event.pointerType !== "mouse")
            return;
          const bounds = event.currentTarget.getBoundingClientRect();
          const x = (event.clientX - bounds.left) / bounds.width - 0.5;
          const y = (event.clientY - bounds.top) / bounds.height - 0.5;
          cancelAnimationFrame(frame.current);
          frame.current = requestAnimationFrame(() => {
            card.current?.style.setProperty("--tilt-x", `${-y * 8}deg`);
            card.current?.style.setProperty("--tilt-y", `${x * 10}deg`);
          });
        }}
        onPointerLeave={reset}
      >
        <span className="atelier-wall-label">
          THE CANVAS EDITION <i>01—03</i>
        </span>
        <div
          ref={card}
          className="atelier-canvas"
          style={{ "--canvas-scale": sizes[size].scale } as CSSProperties}
        >
          <Image
            key={work.key}
            src={work.image}
            alt={`${work.name}的帆布裸框示意`}
            fill
            priority={selected === 0}
            sizes="(max-width:800px) 70vw, 380px"
          />
          <span className="atelier-weave" aria-hidden="true" />
        </div>
        <div className="atelier-shelf" aria-hidden="true" />
        <span className="atelier-wall-caption">油畫布／帆布 · 裸框呈現</span>
      </div>
      <div className="atelier-showcase-info">
        <div>
          <span className="atelier-eyebrow">CURATED FOR YOUR EVERYDAY</span>
          <p aria-live="polite">{work.subject}</p>
        </div>
        <span className="atelier-counter">0{selected + 1} / 03</span>
      </div>
      <div
        className="atelier-switches"
        role="group"
        aria-label="切換帆布示意風格"
      >
        {works.map((item, index) => (
          <button
            key={item.key}
            type="button"
            aria-pressed={index === selected}
            onClick={() => setSelected(index)}
          >
            {item.name}
          </button>
        ))}
      </div>
      <div className="atelier-sizes" role="group" aria-label="切換示意尺寸">
        <span>尺寸示意</span>
        {sizes.map((item, index) => (
          <button
            key={item.label}
            type="button"
            aria-pressed={index === size}
            onClick={() => setSize(index)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div className="atelier-showcase-foot">
        <small>風格與比例示意，非實際成品攝影；尺寸價格另行確認。</small>
        <Link href={`/styles/${work.key}`}>探索這個風格 ↗</Link>
      </div>
    </div>
  );
}
