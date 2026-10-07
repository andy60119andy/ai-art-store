import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/site/Header";
import { CreationDraftProvider } from "@/components/site/CreationDraft";
import "./reference-flow.css";
import Footer from "@/components/site/Footer";
import "./subpages.css";
export const metadata: Metadata = {
  title: "AI ART STORE｜油畫布／帆布裸框",
  description:
    "將照片化為專屬藝術作品，提供油畫布／帆布裸框輸出與方便物流寄送的標準尺寸。",
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-Hant">
      <body>
        <CreationDraftProvider>
          <Header />
          {children}
          <Footer />
        </CreationDraftProvider>
      </body>
    </html>
  );
}
