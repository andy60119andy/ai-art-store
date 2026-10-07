import ShopGallery from "@/components/site/ShopGallery";
import { InnerCTA } from "@/components/site/InnerPage";
import "../reference-flow.css";
export default function Page() {
  return (
    <main className="arto-home arto-subpage">
      <section className="clone-shop-hero">
        <span className="arto-eyebrow">79 STYLES · YOUR PHOTO, YOUR ART</span>
        <h1>一張照片，無限創作靈感</h1>
        <p>先挑選喜歡的風格，再上傳照片，最後決定作品的呈現方式。</p>
        <div className="clone-benefits">
          <span>◇ 專屬照片創作</span>
          <span>✧ 作品預覽</span>
          <span>▧ 數位與印刷規劃</span>
          <span>♡ 為重要的人而作</span>
        </div>
      </section>
      <section className="arto-container clone-shop-section">
        <div className="arto-heading">
          <span className="arto-eyebrow">BROWSE STYLES</span>
          <h2>全部 79 種藝術風格</h2>
          <p>從藝術方向開始，找到屬於你的那一幅。</p>
        </div>
        <ShopGallery />
      </section>
      <InnerCTA />
    </main>
  );
}
