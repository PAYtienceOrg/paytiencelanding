import type { Metadata } from "next";
import { IBM_Plex_Sans, Newsreader } from "next/font/google";
import "./globals.css";

// Headings and large numbers: Newsreader (a news serif made for screens); body and UI: IBM Plex Sans (reads like a trade receipt)
const display = Newsreader({ subsets: ["latin"], variable: "--font-display", weight: ["500", "600", "700"] });
const sans = IBM_Plex_Sans({ subsets: ["latin"], variable: "--font-sans", weight: ["400", "500", "600", "700"] });

export const metadata: Metadata = {
  title: "Paytience",
  description: "Name your price. Get it — or get refunded.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    // data-scroll-behavior: Next.js temporarily turns off smooth scrolling during navigation, so page changes don't scroll slowly
    <html lang="en" className={`${display.variable} ${sans.variable}`} data-scroll-behavior="smooth">
      <head>
        {/* With JavaScript disabled, scroll fade-in content is shown right away instead of staying blank */}
        <noscript>
          <style>{"[data-reveal]{opacity:1!important;transform:none!important}"}</style>
        </noscript>
      </head>
      <body>{children}</body>
    </html>
  );
}
