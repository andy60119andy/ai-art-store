import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { ArtworkUploader } from "@/components/upload/ArtworkUploader";

export default async function UploadPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/upload");

  return <main className="page"><section className="hero">
    <p className="eyebrow">UPLOAD</p><h1>上傳你的照片</h1>
    <p>支援 JPG、PNG、WebP，單檔最高 20 MB。</p>
    <ArtworkUploader />
  </section></main>;
}
