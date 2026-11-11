import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

// 标题和大数字：Newsreader（屏幕阅读用的新闻衬线体）；正文和界面：IBM Plex Sans（像交易单据）
const display = Newsreader({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const sans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Paytience",
  description: "Name your price. Get it — or get refunded.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior：页面跳转时 Next.js 会临时关掉平滑滚动，避免切页时慢慢滚
    <html lang="en" className={`${display.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      <head>
        {/* 浏览器禁用 JS 时，滚动淡入的内容直接显示，不会一片空白 */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
