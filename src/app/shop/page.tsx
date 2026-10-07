import ReferenceGallery from "@/components/site/ReferenceGallery";
import { Breadcrumb, InnerCTA } from "@/components/site/InnerPage";
export default function Page() {
  return (
    <main className="arto-home arto-subpage">
      <Breadcrumb title="風格圖庫" />
      <section className="arto-section arto-container">
        <div className="arto-heading">
          <span className="arto-eyebrow">EXPLORE THE COLLECTION</span>
          <h1>探索你的藝術風格</h1>
          <p>依照主題挑選，點進詳情頁看看這份靈感。</p>
        </div>
        <ReferenceGallery linkToDetails initialExpanded />
      </section>
      <InnerCTA />
    </main>
  );
}
