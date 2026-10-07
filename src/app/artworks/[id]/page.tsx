import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";

export default async function ArtworkDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const user=await getCurrentUser(); if(!user) redirect("/login");
  const {id}=await params; const supabase=await createClient();
  const {data:artwork}=await supabase.from("artworks").select("id,title,status,created_at,updated_at,artwork_versions(id,storage_path,width_px,height_px,version_no,created_at)").eq("id",id).eq("user_id",user.id).single();
  if(!artwork) notFound();
  const versions=await Promise.all([...(artwork.artwork_versions??[])].sort((a,b)=>b.version_no-a.version_no).map(async v=>{const {data}=await supabase.storage.from("artwork-uploads").createSignedUrl(v.storage_path,3600);return {...v,signedUrl:data?.signedUrl??null}}));
  const latest=versions[0];
  return <main className="artwork-page">
    <div className="artwork-breadcrumb"><Link href="/account">← 我的作品</Link><span>AI ARTWORK</span></div>
    <section className="artwork-result">
      <div className="artwork-stage">{latest?.signedUrl?<img src={latest.signedUrl} alt={artwork.title??"AI artwork"} />:<div className="empty-art">目前沒有可預覽的生成結果。</div>}</div>
      <aside className="artwork-info">
        <p className="eyebrow">YOUR AI ARTWORK</p><h1>{artwork.title??"AI 作品"}</h1>
        <div className="artwork-meta"><span>✓ AI 生成完成</span><span>Version {latest?.version_no??0}</span></div>
        <p>你的作品已準備好。接下來可以選擇實際尺寸、材質與畫框，預覽它掛在牆上的樣子。</p>
        <div className="artwork-actions"><Link className="button-dark" href="/customize">把它做成掛畫 →</Link>{latest?.signedUrl&&<a className="button-light" href={latest.signedUrl} target="_blank" rel="noreferrer">開啟原圖</a>}</div>
        <small>預覽使用限時私有連結，作品不會公開。</small>
      </aside>
    </section>
    <section className="before-after"><div><p className="eyebrow">FROM PHOTO TO ART</p><h2>從一張照片，變成一件作品。</h2><p>AI 生成只是第一步；你還可以決定尺寸、材質、畫框，最後才把作品帶回家。</p></div><div className="ba-card"><div>PHOTO</div><strong>→</strong><div>AI ART</div></div></section>
    {versions.length>1&&<section className="versions"><p className="eyebrow">VERSIONS</p><h2>生成歷史</h2><div className="version-grid">{versions.map(v=>v.signedUrl&&<a key={v.id} href={v.signedUrl} target="_blank" rel="noreferrer"><img src={v.signedUrl} alt={"Version "+v.version_no}/><span>Version {v.version_no}</span></a>)}</div></section>}
  </main>;
}