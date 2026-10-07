import { StyleCards, InnerCTA } from "@/components/site/InnerPage";
import { REFERENCE_GALLERY } from "@/lib/ai/reference-gallery";
export default function Page() {
  return (
    <main className="arto-home arto-subpage">
      <section className="arto-container arto-section">
        <div className="arto-heading">
          <span className="arto-eyebrow">STORIES IN ART</span>
          <h1>每張照片，都有自己的故事</h1>
          <p>家庭、毛孩、兩個人的回憶，看看不同主題的藝術方向。</p>
          <small>以下為風格示意；本站尚未收集或發布客戶評論。</small>
        </div>
        <StyleCards
          styles={REFERENCE_GALLERY.filter((s) =>
            [
              "family-portrait",
              "couple-portrait",
              "dog-portrait",
              "cat-portrait",
              "wedding-portrait",
              "memorial-portrait",
              "baby-portrait",
              "house-portrait",
            ].includes(s.key),
          )}
        />
      </section>
      <InnerCTA />
    </main>
  );
}
