import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/site/Header";
import Footer from "@/components/site/Footer";
import "./subpages.css";
export const metadata: Metadata = {
  title: "AI ART STORE｜大尺寸藝術・120 cm 幅寬客製",
  description:
    "結合 AI 照片藝術與大圖輸出工藝，提供 120 cm 可印幅寬、長幅客製及尺寸配框規劃，為居家與商業空間打造專屬作品。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>
        <Header />
        {children}
        <Footer />
      </body>
    </html>
  );
}
