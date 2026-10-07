import Link from "next/link";
import SupportForm from "@/components/site/SupportForm";
export default function Page() {
  return (
    <main className="arto-home arto-subpage">
      <section className="arto-container arto-section">
        <div className="arto-heading">
          <span className="arto-eyebrow">GET IN TOUCH</span>
          <h1>一起找到適合你的作品</h1>
          <p>風格、照片、尺寸或製作問題，請留下具體需求。</p>
        </div>
        <div className="clone-contact-grid">
          <SupportForm />
          <aside>
            <h2>開始之前</h2>
            <p>想做大尺寸作品？可先測量牆面與家具位置，記下成品寬高與用途。</p>
            <Link href="/large-format">查看 120 cm 大圖輸出規劃 →</Link>
            <h3>常用入口</h3>
            <Link href="/my-orders">找回我的作品 →</Link>
            <Link href="/tools/portrait-style-finder">比較藝術風格 →</Link>
            <Link href="/refund">售後說明 →</Link>
            <p className="arto-product-notice">
              此站目前為內部測試。正式客服聯絡方式與回覆時間尚未設定。
            </p>
          </aside>
        </div>
      </section>
    </main>
  );
}
