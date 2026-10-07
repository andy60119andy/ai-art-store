import Image from "next/image";
import Link from "next/link";
export default function ServiceState({
  title,
  eyebrow,
  description,
}: {
  title: string;
  eyebrow: string;
  description: string;
}) {
  return (
    <main className="arto-home arto-subpage">
      <section className="arto-service-state arto-container">
        <div className="arto-state-art">
          <Image
            src="/images/reference/styles/watercolor-portrait-thumb.webp"
            alt="水彩藝術風格示意"
            fill
            sizes="(max-width:800px) 90vw, 45vw"
          />
        </div>
        <div>
          <span className="arto-eyebrow">{eyebrow}</span>
          <h1>{title}</h1>
          <p>{description}</p>
          <div className="arto-product-notice">
            帳戶與作品服務尚未啟用。你可以先探索風格與帆布尺寸頁面。
          </div>
          <div className="arto-inline-actions">
            <Link className="arto-button" href="/styles">
              探索藝術風格 →
            </Link>
            <Link className="arto-outline" href="/customize">
              查看帆布尺寸頁
            </Link>
          </div>
        </div>
      </section>
    </main>
  );
}
