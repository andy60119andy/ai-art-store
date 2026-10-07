import Link from "next/link";
const columns = [
  {
    title: "熱門風格",
    links: [
      ["卡通人像", "/styles/simpsons-portrait"],
      ["日系插畫", "/styles/anime-portrait"],
      ["水彩", "/styles/watercolor-portrait"],
      ["普普藝術", "/styles/pop-art-portrait"],
      ["古典人像", "/styles/renaissance-portrait"],
      ["寵物作品", "/styles/pet-portrait"],
      ["情侶作品", "/styles/couple-portrait"],
    ],
  },
  {
    title: "分類",
    links: [
      ["全部風格", "/styles"],
      ["家庭作品", "/styles/family-portrait"],
      ["婚禮作品", "/styles/wedding-portrait"],
      ["送禮靈感", "/gift-ideas"],
      ["重要場合", "/occasions"],
      ["居家藝術", "/styles/house-portrait"],
    ],
  },
  {
    title: "探索",
    links: [
      ["藝術指南", "/blog"],
      ["作品故事", "/customer-stories"],
      ["風格比較", "/tools/portrait-style-finder"],
      ["關於我們", "/about"],
    ],
  },
  {
    title: "商店",
    links: [
      ["全部商品", "/shop"],
      ["瀏覽風格", "/#styles"],
      ["製作流程", "/#how-it-works"],
      ["大尺寸客製", "/large-format"],
      ["合作提案", "/affiliate-program"],
    ],
  },
  {
    title: "協助",
    links: [
      ["找回我的作品", "/my-orders"],
      ["我的帳戶", "/account"],
      ["聯絡入口", "/contact"],
      ["售後說明", "/refund"],
    ],
  },
  {
    title: "使用說明",
    links: [
      ["資料與隱私", "/privacy"],
      ["服務說明", "/terms"],
      ["售後與修改", "/refund"],
    ],
  },
];
export default function Footer() {
  return (
    <footer className="arto-footer clone-footer">
      <div className="arto-container">
        <div className="clone-footer-brand">
          <Link href="/">
            AI ART <em>STORE</em>
          </Link>
          <p>探索照片的藝術可能，從風格預覽到數位作品、印刷與配框規劃。</p>
          <div>
            <span>私有作品</span>
            <span>120 cm 幅寬</span>
            <span>長幅客製</span>
          </div>
        </div>
        <div className="clone-footer-columns">
          {columns.map((c) => (
            <div key={c.title}>
              <h3>{c.title}</h3>
              {c.links.map(([name, href]) => (
                <Link key={name} href={href}>
                  {name}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="arto-footer-bottom">
          <span>© {new Date().getFullYear()} AI ART STORE</span>
          <span>內部測試 · 正式金流未啟用</span>
          <a href="#">回到頂部 ↑</a>
        </div>
      </div>
    </footer>
  );
}
