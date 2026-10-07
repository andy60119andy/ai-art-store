import Link from "next/link";
export default function Footer() {
  return (
    <footer className="arto-footer">
      <div className="arto-container">
        <div className="arto-footer-grid">
          <div className="arto-footer-brand">
            <Link href="/">
              AI ART <em>STORE</em>
            </Link>
            <p>
              把喜歡的照片，
              <br />
              變成值得珍藏的藝術。
            </p>
          </div>
          {[
            {
              title: "熱門風格",
              links: [
                ["油畫", "/styles/oil-painting-portrait"],
                ["水彩", "/styles/watercolor-portrait"],
                ["日系插畫", "/styles/anime-portrait"],
                ["電影感", "/styles/cyberpunk-portrait"],
              ],
            },
            {
              title: "創作與配框",
              links: [
                ["上傳照片", "/upload"],
                ["選擇風格", "/generate"],
                ["尺寸與畫框", "/customize"],
                ["創作流程", "/#how-it-works"],
              ],
            },
            {
              title: "我的帳戶",
              links: [
                ["我的作品", "/account"],
                ["我的訂單", "/orders"],
                ["購物車", "/cart"],
              ],
            },
            {
              title: "探索更多",
              links: [
                ["全部風格", "/styles"],
                ["創作方案", "/#options"],
                ["常見問題", "/#faq"],
                ["送禮靈感", "/gift-ideas"],
                ["場合挑選", "/occasions"],
              ],
            },
          ].map((col) => (
            <div key={col.title}>
              <h3>{col.title}</h3>
              {col.links.map(([label, href]) => (
                <Link href={href} key={label}>
                  {label}
                </Link>
              ))}
            </div>
          ))}
        </div>
        <div className="arto-footer-bottom">
          <span>© {new Date().getFullYear()} AI ART STORE</span>
          <span>照片的故事，由你決定。</span>
          <a href="#">回到頂部 ↑</a>
        </div>
      </div>
    </footer>
  );
}
