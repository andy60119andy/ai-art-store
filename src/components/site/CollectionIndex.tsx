import Image from "next/image";
import Link from "next/link";
import { GIFT_COLLECTIONS, OCCASION_COLLECTIONS } from "@/lib/ai/collections";
import { Breadcrumb, InnerCTA } from "./InnerPage";
export default function CollectionIndex({
  kind,
}: {
  kind: "gifts" | "occasions";
}) {
  const gifts = kind === "gifts",
    title = gifts ? "送禮靈感" : "依場合挑選",
    items = gifts ? GIFT_COLLECTIONS : OCCASION_COLLECTIONS;
  const background = gifts
    ? "/images/reference/landing/portrait-gift/portrait-gift-hero-bg.webp"
    : "/images/reference/landing/anniversary-portrait/anniversary-portrait-hero-bg.webp";
  return (
    <main className="arto-home arto-subpage">
      <Breadcrumb title={title} />
      <section className="arto-collection-hero">
        <Image src={background} alt="" fill priority sizes="100vw" />
        <div>
          <span className="arto-eyebrow">
            {gifts
              ? "PERSONAL GIFTS, MADE FOR THEM"
              : "THE RIGHT GIFT, ON THE RIGHT DAY"}
          </span>
          <h1>
            {gifts
              ? "送出一份，只有他才有的禮物"
              : "為每個重要時刻，留下一幅畫"}
          </h1>
          <p>
            {gifts
              ? "給家人、伴侶與陪伴你的寵物。從一張有故事的照片，開始打造專屬的藝術禮物。"
              : "聖誕節、情人節、婚禮、畢業與新家。讓照片裡的重要一天，成為值得珍藏的藝術。"}
          </p>
          <div>
            <Link className="arto-button" href="/upload">
              開始藝術創作 →
            </Link>
            <Link
              className="arto-outline"
              href={gifts ? "/occasions" : "/gift-ideas"}
            >
              {gifts ? "依場合挑選" : "依收禮人挑選"}
            </Link>
          </div>
        </div>
      </section>
      <section className="arto-editorial arto-container">
        <h2>
          {gifts
            ? "比禮物更珍貴的，是你記得的故事"
            : "讓禮物，與那一天的心情相呼應"}
        </h2>
        <p>
          {gifts
            ? "一張合照、一趟旅行、家裡的寵物，或一張一直沒來得及裱框的照片。把對方熟悉的回憶轉化成藝術，是一種溫柔而具體的心意。"
            : "節慶適合溫暖的家庭畫面，週年紀念適合兩個人的合照，畢業則可以挑選更有個性的人像。先想想你要紀念的是什麼，再選擇符合心情的風格。"}
        </p>
      </section>
      <section className="arto-section arto-container">
        <div className="arto-heading">
          <span className="arto-eyebrow">FIND THE PERFECT INSPIRATION</span>
          <h2>{gifts ? "這份心意，想送給誰？" : "你想珍藏哪個時刻？"}</h2>
        </div>
        <div className="arto-collection-grid">
          {items.map((item) => (
            <Link
              className="arto-collection-card"
              key={item.slug}
              href={`/${kind}/${item.slug}`}
            >
              <div>
                <Image
                  src={`/images/reference/styles/${item.image}-thumb.webp`}
                  alt={item.name}
                  fill
                  sizes="(max-width:700px) 90vw, 30vw"
                />
              </div>
              <section>
                <h3>
                  {item.name}
                  <span>↗</span>
                </h3>
                <p>{item.subtitle}</p>
                <span>探索推薦風格 →</span>
              </section>
            </Link>
          ))}
        </div>
      </section>
      <section className="arto-section arto-faq-section">
        <div className="arto-container arto-faq">
          <div>
            <span className="arto-eyebrow">GIFTING MADE PERSONAL</span>
            <h2>挑選禮物的小提醒</h2>
            <p>讓畫作與對方的故事、個性與生活空間搭配。</p>
          </div>
          <div className="arto-questions">
            {[
              [
                "如何挑選照片？",
                "可以從你們的合照、旅行照片或寵物照片開始。建議選擇主體清晰、光線充足的原始照片。",
              ],
              [
                "不確定哪種風格適合？",
                "先看看推薦風格的參考圖，再到創作頁選擇目前已設定的風格。柔和色彩適合溫馨空間，強烈色塊適合充滿個性的禮物。",
              ],
              [
                "可以搭配自訂尺寸嗎？",
                "配框頁可選擇成品尺寸、畫框與卡紙，也可使用自訂尺寸查看搭配效果。",
              ],
            ].map(([q, a]) => (
              <details key={q}>
                <summary>
                  {q}
                  <span>＋</span>
                </summary>
                <p>{a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <InnerCTA />
    </main>
  );
}
