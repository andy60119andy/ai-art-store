import type { Metadata } from "next";
import Link from "next/link";
import { Breadcrumb } from "@/components/site/InnerPage";
import LargeFormatPlanner from "@/components/site/LargeFormatPlanner";
import LargeFormatScene from "@/components/site/LargeFormatScene";
import "../large-format.css";
export const metadata: Metadata = {
  title: "大尺寸與長幅客製｜AI ART STORE",
  description:
    "120 cm 可印幅寬，長幅尺寸依空間客製。預覽客廳主畫、走廊長卷與商業空間的藝術比例。",
};
export default function Page() {
  return (
    <main className="arto-home arto-subpage lf-page">
      <Breadcrumb title="大尺寸與長幅客製" />
      <section className="arto-container lf-page-hero">
        <div>
          <span className="arto-eyebrow">BIG ART. PERSONAL STORIES.</span>
          <h1>
            你的空間，
            <br />
            <em>值得更大的想像。</em>
          </h1>
          <p>
            把大圖輸出的能力，用在你每天看見的地方。從客廳主畫到走廊長幅，尺寸依照空間規劃，故事由你決定。
          </p>
          <Link href="#planner" className="arto-button">
            開始規劃牆面作品 ↓
          </Link>
        </div>
        <LargeFormatScene
          width={240}
          height={120}
          image="/images/large-format/botanical.svg"
        />
      </section>
      <div className="arto-container lf-specs">
        <div>
          <strong>
            120 <small>cm</small>
          </strong>
          <span>機台可印幅寬</span>
        </div>
        <div>
          <strong>
            長幅 <small>客製</small>
          </strong>
          <span>依圖像與空間規劃</span>
        </div>
        <div>
          <strong>
            一幅 <small>主角</small>
          </strong>
          <span>居家・走廊・商業空間</span>
        </div>
      </div>
      <LargeFormatPlanner />
      <section className="arto-container arto-section">
        <div className="arto-heading">
          <span className="arto-eyebrow">CRAFT MEETS CREATIVITY</span>
          <h2>不只放大，也要適合你的空間</h2>
        </div>
        <div className="lf-process">
          {[
            {
              title: "先量牆面",
              text: "記下可用寬高與家具位置，讓作品與空間保持舒服的比例。",
            },
            {
              title: "再確認畫面",
              text: "人像、風景或 AI 作品都先確認構圖與原檔解析度，避免放大後影響細節。",
            },
            {
              title: "最後選材與配框",
              text: "依紙材、框材、結構與運送條件確認製作方式。長幅印刷不等於所有尺寸都適合裱框。",
            },
          ].map((p, i) => (
            <article key={p.title}>
              <span>0{i + 1}</span>
              <h3>{p.title}</h3>
              <p>{p.text}</p>
            </article>
          ))}
        </div>
      </section>
      <section className="arto-container lf-faq">
        <h2>大尺寸作品，你可能想知道</h2>
        {[
          [
            "120 cm 指的是寬度還是高度？",
            "120 cm 是機台可印幅寬。作品可旋轉安排進料方向，因此 240 × 120 cm 的橫幅也可規劃。實際尺寸依留邊、材質及加工需求確認。",
          ],
          [
            "長度可以自由選擇嗎？",
            "長幅可依需求客製，前台預览不設固定長度上限；實際可製作長度需確認圖像解析度、材料、後加工、現場安裝及運送。",
          ],
          [
            "可以直接把人像拉成長幅嗎？",
            "需要先調整構圖。預覽只是比例與裁切示意；人物照片不能直接拉伸，長幅可選適合的全景、重新構圖或系列作品。",
          ],
          [
            "現在可以下單嗎？",
            "目前提供空間與配框視覺預覽，可複製尺寸需求供後續確認。正式報價、作品生成與結帳尚未啟用。",
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
      </section>
      <section className="arto-final">
        <span className="arto-eyebrow">MAKE SPACE FOR YOUR STORY</span>
        <h2>尺寸想好了，接著選你的故事。</h2>
        <p>用一張喜歡的照片，開始探索你的藝術風格。</p>
        <Link href="/upload" className="arto-button">
          從我的照片開始 →
        </Link>
      </section>
    </main>
  );
}
