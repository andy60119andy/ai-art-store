import Link from "next/link";
import Image from "next/image";
export default function Page() {
  return (
    <main className="arto-home arto-subpage">
      <section className="arto-container arto-section">
        <div className="arto-heading">
          <span className="arto-eyebrow">ART JOURNAL</span>
          <h1>照片、藝術與空間靈感</h1>
          <p>創作前先了解照片、比例與風格，讓選擇更有方向。</p>
        </div>
        <div className="clone-journal">
          {[
            {
              title: "怎麼挑選適合創作的照片？",
              text: "光線清楚、主體完整，以原始照片保留更多細節。",
              image: "/images/reference/how-to-step-1.webp",
              href: "/upload",
            },
            {
              title: "水彩、油畫與線稿，哪個適合你？",
              text: "並排比較色彩與筆觸，再選擇符合照片與空間的方向。",
              image: "/images/reference/styles/watercolor-portrait-thumb.webp",
              href: "/tools/portrait-style-finder",
            },
            {
              title: "大尺寸作品如何規劃比例？",
              text: "先量牆面，再確認圖像品質與製作方式。",
              image: "/images/large-format/abstract-landscape.svg",
              href: "/large-format",
            },
          ].map((p) => (
            <Link href={p.href} key={p.title}>
              <div>
                <Image
                  src={p.image}
                  alt=""
                  fill
                  sizes="(max-width:650px) 90vw,30vw"
                />
              </div>
              <h2>{p.title}</h2>
              <p>{p.text}</p>
              <span>查看完整指南 →</span>
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
