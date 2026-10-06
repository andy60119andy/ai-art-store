import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  const { id } = await params;

  const supabase = await createClient();
  const { data: artwork } = await supabase
    .from("artworks")
    .select("id, title, status, created_at, updated_at, artwork_versions(id, storage_path, width_px, height_px, version_no, created_at)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!artwork) notFound();

  const versions = await Promise.all(
    [...(artwork.artwork_versions ?? [])]
      .sort((a, b) => b.version_no - a.version_no)
      .map(async (version) => {
        const { data } = await supabase.storage.from("artwork-uploads").createSignedUrl(version.storage_path, 3600);
        return { ...version, signedUrl: data?.signedUrl ?? null };
      }),
  );
  const latest = versions[0];

  return (
    <main className="page">
      <section className="hero">
        <Link href="/account">← 返回作品庫</Link>
        <p className="eyebrow">ARTWORK PREVIEW</p>
        <h1>{artwork.title ?? "AI 作品"}</h1>
        <p>狀態：{artwork.status} · 版本：{latest?.version_no ?? 0}</p>

        {latest?.signedUrl ? (
          <div style={{marginTop:24}}>
            <div style={{background:"#f1eee8",padding:"clamp(18px,5vw,56px)",borderRadius:20,display:"grid",placeItems:"center"}}>
              <img src={latest.signedUrl} alt={artwork.title ?? "AI artwork preview"} style={{display:"block",maxWidth:"100%",maxHeight:"70vh",objectFit:"contain",boxShadow:"0 18px 50px rgba(0,0,0,.18)"}} />
            </div>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:16}}>
              <a href={latest.signedUrl} target="_blank" rel="noreferrer">開啟原圖</a>
              <Link href={`/generate?artworkId=${artwork.id}`}>再創作</Link>
            </div>
            <p style={{fontSize:13,opacity:.7}}>預覽連結為限時私有 URL，不會把作品檔案公開到網站。</p>
          </div>
        ) : <p>目前沒有可預覽的生成結果。</p>}
      </section>

      {versions.length > 1 && (
        <section className="hero">
          <p className="eyebrow">VERSIONS</p>
          <h2>歷史版本</h2>
          <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fill,minmax(180px,1fr))",gap:16}}>
            {versions.map((version) => version.signedUrl ? (
              <a key={version.id} href={version.signedUrl} target="_blank" rel="noreferrer">
                <img src={version.signedUrl} alt={`Version ${version.version_no}`} style={{width:"100%",aspectRatio:"1",objectFit:"cover",borderRadius:12}} />
                <p>Version {version.version_no}</p>
              </a>
            ) : null)}
          </div>
        </section>
      )}
    </main>
  );
}
