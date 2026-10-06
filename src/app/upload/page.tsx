import { ArtworkUploader } from "@/components/upload/ArtworkUploader";

export default function UploadPage() {
  return <main className="page"><section className="hero">
    <p className="eyebrow">UPLOAD</p><h1>上傳你的照片</h1>
    <p>支援 JPG、PNG、WebP，單檔最高 20 MB。</p>
    <ArtworkUploader />
  </section></main>;
}