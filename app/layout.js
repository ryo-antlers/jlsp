import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const SITE_TITLE = "JLSP — Jリーグ クラブ相性診断";
const SITE_DESC =
  "高まったサッカー熱、次はJリーグで。価値観や好みから、あなたが本当に好きになるクラブを診断します。";

export const metadata = {
  metadataBase: new URL("https://jlsp.jleakstats.com"),
  title: SITE_TITLE,
  description: SITE_DESC,
  openGraph: {
    type: "website",
    siteName: "JLSP",
    title: SITE_TITLE,
    description: SITE_DESC,
    // og:image は app/opengraph-image.(png|jpg) を置けば自動で配線される
  },
  twitter: {
    card: "summary_large_image",
    title: SITE_TITLE,
    description: SITE_DESC,
  },
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="ja"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <footer className="mt-auto border-t border-[var(--border)] py-6 px-5">
          <div className="max-w-2xl mx-auto flex flex-wrap items-center justify-between gap-2 text-[10px] text-[var(--muted)]">
            <span>© JLSP — 非公式のJリーグ クラブ相性診断</span>
            <Link href="/privacy" className="underline hover:text-[var(--foreground)]">
              プライバシーポリシー・運営者情報
            </Link>
          </div>
        </footer>
        <Analytics />
      </body>
    </html>
  );
}
