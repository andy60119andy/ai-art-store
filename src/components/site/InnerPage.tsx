import Image from "next/image";
import Link from "next/link";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
export function Breadcrumb({
  title,
  parent,
}: {
  title: string;
  parent?: { name: string; href: string };
}) {
  return (
    <nav className="arto-breadcrumb arto-container" aria-label="麵包屑">
      <Link href="/">首頁</Link>
      <span>›</span>
      {parent && (
        <>
          <Link href={parent.href}>{parent.name}</Link>
          <span>›</span>
        </>
      )}
      <span>{title}</span>
    </nav>
  );
}
export function InnerCTA() {
  return (
    <section className="arto-final">
      <span className="arto-eyebrow">YOUR PHOTO. YOUR STORY.</span>
      <h2>讓一張照片，變成一份心意</h2>
      <p>挑選你喜歡的風格，再搭配適合生活空間的帆布尺寸。</p>
      <Link href="/upload" className="arto-button">
        開始我的創作 →
      </Link>
    </section>
  );
}
export function StyleCards({
  styles,
}: {
  styles: ReadonlyArray<(typeof REFERENCE_GALLERY)[number]>;
}) {
  return (
    <div className="arto-style-grid">
      {styles.map((s) => (
        <Link className="arto-style-card" key={s.key} href={`/styles/${s.key}`}>
          <div className="arto-style-image">
            <Image
              src={s.src}
              alt={s.name}
              fill
              sizes="(max-width:650px) 45vw, 23vw"
            />
            <span>查看詳情 ↗</span>
          </div>
          <div className="arto-style-caption">
            <small>{s.category}</small>
            <h3>{s.name}</h3>
            <span>探索這個風格 →</span>
          </div>
        </Link>
      ))}
    </div>
  );
}
export function CollectionPage({
  title,
  subtitle,
  image,
  styles,
  parent,
}: {
  title: string;
  subtitle: string;
  image: string;
  styles: ReadonlyArray<(typeof REFERENCE_GALLERY)[number]>;
  parent: { name: string; href: string };
}) {
  return (
    <main className="arto-home arto-subpage">
      <Breadcrumb title={title} parent={parent} />
      <section className="arto-collection-hero">
        <Image src={image} alt="" fill priority sizes="100vw" />
        <div>
          <span className="arto-eyebrow">A GIFT WITH A STORY</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
          <Link className="arto-button" href="/upload">
            開始專屬藝術創作 →
          </Link>
        </div>
      </section>
      <section className="arto-section arto-container">
        <div className="arto-heading">
          <span className="arto-eyebrow">CURATED FOR YOU</span>
          <h2>為這份心意，選一種風格</h2>
          <p>從寫實繪畫到溫暖插畫，探索適合這個故事的畫面。</p>
        </div>
        <StyleCards styles={styles} />
      </section>
      <InnerCTA />
    </main>
  );
}
