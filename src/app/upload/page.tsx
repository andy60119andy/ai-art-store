import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArtworkUploader } from "@/components/upload/ArtworkUploader";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/upload");

  return <main className="creator-page">
    <section className="creator-hero">
      <div><p className="eyebrow">01 · UPLOAD YOUR PHOTO</p><h1>先上傳照片，<br/>我們幫你變成藝術。</h1><p>不用先決定尺寸。先免費看 AI 作品，再決定要不要做成掛畫。</p><div className="creator-benefits"><span>✓ JPG / PNG / WebP</span><span>✓ 最大 20 MB</span><span>✓ 免費預覽</span></div></div>
      <div className="upload-panel"><div className="upload-icon">↑</div><h2>拖曳照片到這裡</h2><p>或點擊選擇圖片</p><ArtworkUploader /><small>你的原始圖片只會用於建立你的作品。</small></div>
    </section>
    <section className="creator-note"><strong>下一步</strong><span>上傳 → 選擇 AI 風格 → 免費生成 → 選尺寸與畫框</span></section>
  </main>;
}