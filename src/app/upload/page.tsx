import { hasSupabaseConfiguration } from "@/lib/service-availability";
import PreviewCreator from "@/components/site/PreviewCreator";
import Image from "next/image";
import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArtworkUploader } from "@/components/upload/ArtworkUploader";

export default async function UploadPage() {
  if (!hasSupabaseConfiguration())
    return (
      <main className="arto-home arto-subpage">
        <section className="arto-product arto-container arto-upload-page">
          <div>
            <span className="arto-eyebrow">01 · UPLOAD YOUR PHOTO</span>
            <h1>
              先選一張照片，
              <br />
              開始你的藝術故事。
            </h1>
            <p>人像、家庭、寵物與旅行，從你喜歡的照片開始。</p>
            <div className="arto-product-image">
              <Image
                src="/images/reference/how-to-step-1.webp"
                alt="照片上傳流程示意"
                fill
                priority
                sizes="45vw"
              />
            </div>
          </div>
          <div>
            <PreviewCreator
              styleKey="watercolor-portrait"
              styleName="水彩藝術作品"
            />
            <div className="arto-product-notice">
              此處可先預覽照片。正式上傳與 AI 生成服務尚未啟用。
            </div>
          </div>
        </section>
      </main>
    );
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/upload");

  return (
    <main className="creator-page">
      <section className="creator-hero">
        <div>
          <p className="eyebrow">01 · UPLOAD YOUR PHOTO</p>
          <h1>
            先上傳照片，
            <br />
            我們幫你變成藝術。
          </h1>
          <p>不用先決定尺寸。先免費看 AI 作品，再決定要不要做成掛畫。</p>
          <div className="creator-benefits">
            <span>✓ JPG / PNG / WebP</span>
            <span>✓ 最大 20 MB</span>
            <span>✓ 免費預覽</span>
          </div>
        </div>
        <div className="upload-panel">
          <div className="upload-icon">↑</div>
          <h2>拖曳照片到這裡</h2>
          <p>或點擊選擇圖片</p>
          <ArtworkUploader />
          <small>你的原始圖片只會用於建立你的作品。</small>
        </div>
      </section>
      <section className="creator-note">
        <strong>下一步</strong>
        <span>上傳 → 選擇 AI 風格 → 免費生成 → 選帆布尺寸</span>
      </section>
    </main>
  );
}
