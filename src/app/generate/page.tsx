"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ART_STYLES } from "@/lib/ai/styles";

const visual = ["style-v0","style-v1","style-v2","style-v3","style-v4","style-v5","style-v6","style-v7","style-v8","style-v9","style-v10","style-v11"];

export default function GeneratePage() {
  const [uploadId,setUploadId]=useState(""); const [styleKey,setStyleKey]=useState<string>(ART_STYLES[0]?.key ?? ""); const [message,setMessage]=useState(""); const [artworkId,setArtworkId]=useState(""); const [busy,setBusy]=useState(false);
  useEffect(()=>{const id=new URLSearchParams(window.location.search).get("uploadId");if(id)setUploadId(id)},[]);
  async function generate(){
    if(!uploadId||busy)return; setBusy(true); setMessage("正在生成你的 AI 藝術作品…"); setArtworkId("");
    try{const response=await fetch("/api/generation",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({uploadId,styleKey})});const data=await response.json();if(!response.ok){setMessage("建立失敗："+(data.error??"UNKNOWN"));return}
      setMessage("AI 正在創作中…");const pr=await fetch("/api/generation/"+data.job.id+"/process",{method:"POST"});const result=await pr.json();if(!pr.ok){setMessage("生成失敗："+(result.message??result.error??"UNKNOWN"));return}setArtworkId(result.artworkId??"");setMessage("作品完成！");}
    finally{setBusy(false)}
  }
  return <main className="creator-page"><section className="style-creator">
    <div className="creator-top"><div><p className="eyebrow">02 · CHOOSE YOUR STYLE</p><h1>選一個你喜歡的風格。</h1><p>不喜歡可以重新生成。先免費預覽，再決定尺寸與畫框。</p></div><div className="free-badge">FREE PREVIEW</div></div>
    <div className="style-picker">{ART_STYLES.map((s,i)=><button type="button" key={s.key} className={"style-picker-card "+(styleKey===s.key?"selected ":"")+visual[i%visual.length]} onClick={()=>setStyleKey(s.key)}><span>{s.name}</span><small>AI ART</small></button>)}</div>
    <div className="generate-bar"><div><strong>已選：{ART_STYLES.find(s=>s.key===styleKey)?.name}</strong><small>免費預覽 · AI 生成</small></div><button className="button-dark" onClick={generate} disabled={!uploadId||busy}>{busy?"AI 創作中…":"生成我的作品 →"}</button></div>
    <p className="creator-status" role="status">{message}</p>
    {artworkId&&<div className="result-card"><div><p className="eyebrow">YOUR ARTWORK IS READY</p><h2>作品完成了。</h2><p>下一步可以選擇客製尺寸、材質與畫框，預覽實際成品。</p></div><div className="result-actions"><Link className="button-dark" href={"/artworks/"+artworkId}>查看作品</Link><Link className="button-light" href={"/customize?artworkId="+artworkId}>製作成品 →</Link></div></div>}
  </section></main>;
}