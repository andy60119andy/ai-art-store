import Link from "next/link";
import { ART_STYLES } from "@/lib/ai/styles";

const styleMeta = [
  ["油畫","經典厚塗質感，適合客廳主牆","style-v0"],
  ["水彩","柔和筆觸與自然留白","style-v1"],
  ["復古海報","復古色調，適合收藏與送禮","style-v2"],
  ["日系插畫","清爽、溫暖、生活感","style-v3"],
  ["極簡藝術","低調俐落，現代空間首選","style-v4"],
];

export default function HomePage(){
  return <main className="storefront">
    <section className="store-hero">
      <div className="store-hero-copy">
        <p className="eyebrow">AI ART STORE · CUSTOM PRINTING</p>
        <h1>把一張照片，變成值得掛上牆的藝術。</h1>
        <p className="lead">AI 生成專屬作品，再由我們的大圖輸出能力，做成你真正想要的尺寸、材質與畫框。</p>
        <div className="hero-actions"><Link className="button-dark" href="/upload">免費開始創作 →</Link><Link className="button-light" href="#styles">探索 AI 風格</Link></div>
        <div className="trust-row"><span>✓ 免費先預覽</span><span>✓ AI 真實生圖</span><span>✓ 100–3000 mm 寬</span><span>✓ 大圖輸出</span></div>
      </div>
      <div className="hero-art">
        <div className="hero-before-after">
          <div className="hero-photo"><span>YOUR<br/>PHOTO</span></div>
          <div className="hero-arrow">→</div>
          <div className="hero-frame"><div className="hero-artwork"><span>AI<br/>ART</span></div></div>
        </div>
      </div>
    </section>

    <section id="styles" className="style-section">
      <div className="section-head"><div><p className="eyebrow">CHOOSE YOUR STYLE</p><h2>先選風格，免費預覽再決定。</h2></div><Link href="/upload">開始上傳 →</Link></div>
      <div className="style-grid">{styleMeta.map(([name,desc,visual],i)=>{const style=ART_STYLES[i]; return <Link href="/upload" className="style-card" key={style?.key ?? name}><div className={"style-visual "+visual}><span>{name}</span></div><div className="style-card-body"><strong>{name}</strong><small>{desc}</small><em>免費預覽 →</em></div></Link>})}</div>
    </section>

    <section className="custom-size-section">
      <div><p className="eyebrow">YOUR SIZE · YOUR WALL</p><h2>不是只有 A4、A3。<br/>你的牆有多大，我們就印多大。</h2><p>支援客製尺寸，從小幅作品到大型牆面藝術，都能依照你的空間調整。</p><Link className="button-dark" href="/customize">查看尺寸與價格 →</Link></div>
      <div className="size-demo"><div className="size-ruler"><span>600 mm</span><span>1200 mm</span><span>1800 mm</span></div><div className="size-art"><span>CUSTOM WALL ART</span></div><div className="size-label">CUSTOM<br/>WIDTH × HEIGHT</div></div>
    </section>

    <section className="benefit-section">
      <div className="benefit-card"><p className="eyebrow">01 · AI</p><h3>從照片開始</h3><p>上傳你的照片，選擇喜歡的藝術風格，先看作品效果再決定是否製作。</p></div>
      <div className="benefit-card"><p className="eyebrow">02 · PRINT</p><h3>大圖輸出</h3><p>支援客製寬高，讓 AI 藝術真正符合牆面比例，而不是被固定尺寸限制。</p></div>
      <div className="benefit-card"><p className="eyebrow">03 · FINISH</p><h3>畫框與展示</h3><p>選擇材質、畫框與成品預覽，購買前先確認掛在空間裡的感覺。</p></div>
    </section>

    <section className="how-section">
      <p className="eyebrow">HOW IT WORKS</p><h2>從照片到牆上，只要四步。</h2>
      <div className="steps">{["上傳照片","選擇 AI 風格","免費預覽作品","自訂尺寸、材質與畫框"].map((x,i)=><div key={x}><span>0{i+1}</span><strong>{x}</strong><small>{["JPG / PNG / WebP","油畫、水彩、插畫等","不滿意可以重新生成","確認成品後加入購物車"][i]}</small></div>)}</div>
    </section>

    <section className="final-cta"><div><p className="eyebrow">READY TO CREATE?</p><h2>你的下一幅牆面藝術，從一張照片開始。</h2><p>先免費預覽，不需要先決定尺寸。</p></div><Link className="button-dark" href="/upload">開始免費預覽 →</Link></section>
  </main>;
}
