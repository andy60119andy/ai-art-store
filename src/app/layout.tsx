import type { Metadata } from "next";
import "./globals.css";
export const metadata: Metadata={title:"AI 客製藝術商店",description:"AI 客製藝術電商平台"};
export default function RootLayout({children}:{children:React.ReactNode}){return <html lang="zh-Hant"><body>{children}</body></html>}