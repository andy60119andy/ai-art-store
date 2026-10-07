import Link from "next/link";
import { ART_STYLES } from "@/lib/ai/styles";

const categories=[
  {title:"藝術經典",items:["油畫","水彩","復古海報"]},
  {title:"現代插畫",items:["日系插畫","極簡藝術","漫畫感"]},
  {title:"送禮與收藏",items:["寵物肖像","家庭肖像","紀念作品"]},
];

export default function HomePage(){
  return <main className="storefront">
    <section className="store-hero">
      <div className="store-hero-copy">
        <p className="eyebrow">AI ART STORE · CUSTOM PRINTING</p>
        <h1>把一張照片，變成真正可以掛上牆的藝術。</h1>
        <p className="lead">AI 生成你的專屬作品，再用我們的大圖輸出能力，把它做成你想要的尺寸、材質與畫框。</p>
        <div className="hero-actions"><Link className="button-dark" href="/upload">免費開始創作 →</Link><Link className="button-light" href="/customize">先看商品規格</Link></div>
        <div className="trust-row"><span>✓ AI 真實生圖</span><span>✓ 免費先預覽</span><span>✓ 客製尺寸</span><span>✓ 大圖輸出</span></div>
      </div>
      <div className="hero-art" aria-label="客製藝術掛畫示意">
        <div className="wall"><div className="frame-card"><div className="art-placeholder"><span>YOUR PHOTO</span><strong>→ ART</strong><small>AI CUSTOM ART</small></div></div></div>
      </div>
    </section>

    <section className="style-section">
      <div className="section-head"><div><p className="eyebrow">CHOOSE A STYLE</p><h2>先選風格，也可以上傳後再決定。</h2></div><Link href="/generate">全部風格 →</Link></div>
      <div className="style-grid">{ART_STYLES.map((style,i)=><Link href="/upload" className="style-card" key={style.key}><div className={"style-visual style-v"+i}><span>{style.name}</span></div><div className="style-card-body"><strong>{style.name}</strong><small>免費預覽 · AI 生成</small></div></Link>)}</div>
    </section>

    <section className="benefit-section">
      {categories.map(c=><div className="benefit-card" key={c.title}><p className="eyebrow">{c.title}</p><h3>{c.items[0]} / {c.items[1]}</h3><p>{c.items[2]}等客製風格，從照片直接生成專屬作品。</p></div>)}
    </section>

    <section className="how-section">
      <p className="eyebrow">HOW IT WORKS</p><h2>從照片到牆上，只要四步。</h2>
      <div className="steps">{["上傳照片","選擇 AI 風格","免費預覽作品","自訂尺寸、材質與畫框並下單"].map((x,i)=><div key={x}><span>0{i+1}</span><strong>{x}</strong></div>)}</div>
    </section>

    <section className="final-cta"><div><p className="eyebrow">READY TO CREATE?</p><h2>你的下一幅牆面藝術，從一張照片開始。</h2></div><Link className="button-dark" href="/upload">開始免費預覽 →</Link></section>
  </main>;
}