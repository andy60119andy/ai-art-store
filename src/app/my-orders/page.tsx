import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";
export default async function Page() {
  const user = await getCurrentUser();
  return (
    <main className="arto-home arto-subpage">
      <section className="clone-find-orders arto-container">
        <span className="arto-eyebrow">FIND YOUR PORTRAITS</span>
        <h1>找回你的作品</h1>
        <p>使用創作時的 Email 登入，即可查看屬於你的作品與訂單。</p>
        <div className="clone-find-card">
          <span>✉</span>
          <h2>{user ? "繼續查看你的作品" : "用創作時的信箱登入"}</h2>
          <p>透過信箱登入連結驗證身分，作品與原始照片都只向本人開放。</p>
          <Link
            className="arto-button"
            href={user ? "/account" : "/login?next=/account"}
          >
            {user ? "查看我的作品 →" : "使用 Email 找回作品 →"}
          </Link>
          <Link
            className="arto-outline"
            href={user ? "/orders" : "/login?next=/orders"}
          >
            查看我的訂單 →
          </Link>
        </div>
        <Link href="/contact" className="arto-text-button">
          找不到作品？查看聯絡入口 →
        </Link>
      </section>
    </main>
  );
}
