import Link from "next/link";

export default function Header(){
  return <header className="site-header">
    <div className="site-header-inner">
      <Link href="/" className="brand">AI ART STORE</Link>
      <nav className="site-nav" aria-label="主要導覽">
        <Link href="/upload">開始創作</Link>
        <Link href="/account">我的作品</Link>
        <Link href="/orders">我的訂單</Link>
        <Link href="/cart">購物車</Link>
      </nav>
    </div>
  </header>;
}
