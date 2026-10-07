import StyleFinder from "@/components/site/StyleFinder";
import { Breadcrumb, InnerCTA } from "@/components/site/InnerPage";
export default function Page() {
  return (
    <main className="arto-home arto-subpage">
      <Breadcrumb title="藝術風格比較" />
      <section className="arto-container arto-section">
        <div className="arto-heading">
          <span className="arto-eyebrow">STYLE FINDER</span>
          <h1>先比較風格，再決定你的作品</h1>
          <p>探索 12 種常見方向，挑選最多三種並排比較。</p>
        </div>
        <StyleFinder />
      </section>
      <InnerCTA />
    </main>
  );
}
