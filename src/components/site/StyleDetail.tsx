import Image from "next/image";
import Link from "next/link";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
import PhotoStarter from "./PhotoStarter";
import { Breadcrumb, InnerCTA, StyleCards } from "./InnerPage";
export default function StyleDetail({
  style,
}: {
  style: (typeof REFERENCE_GALLERY)[number];
}) {
  const related = REFERENCE_GALLERY.filter(
    (s) => s.category === style.category && s.key !== style.key,
  ).slice(0, 4);
  return (
    <main className="arto-home arto-subpage">
      <Breadcrumb
        title={style.name}
        parent={{ name: "全部風格", href: "/styles" }}
      />
      <section className="arto-product arto-container">
        <div>
          <div className="arto-product-image">
            <Image
              src={style.src}
              alt={style.name}
              fill
              priority
              sizes="(max-width:800px) 90vw, 45vw"
            />
            <span>◉ 藝術風格參考</span>
          </div>
          <div className="arto-product-trust">
            <span>✧ 專屬照片</span>
            <span>▧ 畫框搭配</span>
            <span>◇ 自訂尺寸</span>
            <span>♡ 珍藏回憶</span>
          </div>
        </div>
        <div className="arto-product-info">
          <span className="arto-green-tag">YOUR PHOTO, REIMAGINED</span>
          <h1>{style.name}</h1>
          <p>將喜歡的照片，化成 {style.name} 的藝術靈感。</p>
          <div className="arto-product-price">尺寸與配框可自訂</div>
          <div className="arto-product-notice">
            ✓ 先探索風格，再決定作品的呈現方式
            <br />✓ 成品價格依尺寸、材質與畫框計算
          </div>
          <PhotoStarter styleName={style.name} />
          <div className="arto-mini-process">
            <h3>從照片到藝術，簡單三步</h3>
            <div>
              <span>① 上傳照片</span>
              <span>② 選擇風格</span>
              <span>③ 配框預覽</span>
            </div>
          </div>
        </div>
      </section>
      <section className="arto-section arto-container">
        <div className="arto-heading">
          <span className="arto-eyebrow">MADE PERSONAL</span>
          <h2>讓生活裡的照片，成為家的藝術</h2>
          <p>每個故事，都值得一種屬於自己的呈現方式。</p>
        </div>
        <div className="arto-feature-grid">
          {[
            {
              icon: "✧",
              name: "為你的故事創作",
              text: "人像、家庭合照、寵物與旅行，從珍愛的照片開始。",
            },
            {
              icon: "▧",
              name: "配出完整的畫面",
              text: "依照空間挑選尺寸、畫框與卡紙，查看整體搭配。",
            },
            {
              icon: "♡",
              name: "留下有意義的回憶",
              text: "送給自己，也送給生活裡重要的人。",
            },
          ].map((f) => (
            <article key={f.name}>
              <span>{f.icon}</span>
              <h3>{f.name}</h3>
              <p>{f.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="arto-section arto-faq-section">
        <div className="arto-container arto-faq">
          <div>
            <span className="arto-eyebrow">GOOD TO KNOW</span>
            <h2>創作前的小提醒</h2>
            <p>參考圖呈現風格方向，實際結果會依你的照片而不同。</p>
          </div>
          <div className="arto-questions">
            {[
              [
                "可以直接生成這個風格嗎？",
                "目前圖庫提供 79 種參考方向，創作頁提供 12 種已設定的生成風格。你可以先探索圖片，再選擇適合的創作風格。",
              ],
              [
                "適合上傳什麼照片？",
                "選擇清晰、主體完整、光線充足的照片。人像請盡量避免臉部被遮住。",
              ],
              [
                "如何搭配尺寸與畫框？",
                "作品完成後，可前往配框頁選擇尺寸、畫框與卡紙，再查看搭配效果。",
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
      {related.length > 0 && (
        <section className="arto-section arto-container">
          <div className="arto-heading">
            <h2>你也可能喜歡</h2>
            <p>繼續探索相近的藝術風格。</p>
          </div>
          <StyleCards styles={related} />
          <div className="arto-center">
            <Link className="arto-outline" href="/styles">
              查看全部風格 →
            </Link>
          </div>
        </section>
      )}
      <InnerCTA />
    </main>
  );
}
