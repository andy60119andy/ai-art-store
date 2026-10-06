import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <section className="hero" style={{ width: "min(1180px,100%)", padding: 0, overflow: "hidden" }}>
        <div style={{ padding: "28px 34px", borderBottom: "1px solid #eee", display:"flex", justifyContent:"space-between", alignItems:"center", gap:20 }}>
          <strong style={{fontSize:20}}>AI ART STORE</strong>
          <nav style={{display:"flex",gap:18,flexWrap:"wrap"}}>
            <Link href="/upload">開始創作</Link>
            <Link href="/account">我的作品</Link>
            <Link href="/cart">購物車</Link>
          </nav>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"1.15fr .85fr",minHeight:560}}>
          <div style={{padding:"72px 48px",display:"flex",flexDirection:"column",justifyContent:"center"}}>
            <p className="eyebrow">AI CUSTOM ART STORE</p>
            <h1 style={{margin:"18px 0",maxWidth:700}}>把一張照片，變成值得掛在牆上的藝術作品。</h1>
            <p>上傳你的照片，選擇藝術風格，AI 生成專屬作品，再挑選尺寸、畫框與紙張，直接完成客製訂購。</p>
            <div style={{display:"flex",gap:12,flexWrap:"wrap",marginTop:24}}>
              <Link href="/upload" style={{display:"inline-block",padding:"15px 24px",borderRadius:12,fontWeight:800,textDecoration:"none",background:"#171717",color:"#fff"}}>開始製作作品 →</Link>
              <Link href="/account" style={{display:"inline-block",padding:"15px 24px",borderRadius:12,fontWeight:800,textDecoration:"none",border:"1px solid #ddd"}}>查看我的作品</Link>
            </div>
            <div style={{display:"grid",gridTemplateColumns:"repeat(3,1fr)",gap:10,marginTop:38}}>
              {["AI 真實生圖","真實畫框 Mockup","線上訂購與追蹤"].map((x)=><div key={x} style={{padding:"14px 10px",borderTop:"1px solid #ddd",fontSize:13,fontWeight:700}}>{x}</div>)}
            </div>
          </div>
          <div style={{background:"linear-gradient(145deg,#eeeae2,#d8d1c5)",display:"grid",placeItems:"center",padding:50}}>
            <div style={{width:"min(330px,90%)",aspectRatio:"4/5",padding:18,background:"#161616",boxShadow:"0 28px 55px rgba(0,0,0,.25)"}}>
              <div style={{height:"100%",background:"#f8f4eb",display:"grid",placeItems:"center",textAlign:"center",padding:35}}>
                <div><div style={{fontSize:70}}>✦</div><strong style={{fontSize:24}}>YOUR ART</strong><p style={{fontSize:14,marginTop:10}}>Made with AI</p></div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}