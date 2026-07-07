import type { Metadata } from "next";
import { JetBrains_Mono, Noto_Sans_SC, Space_Grotesk } from "next/font/google";
import "./globals.css";

const grotesk = Space_Grotesk({
  variable: "--font-grotesk",
  subsets: ["latin"],
  display: "swap",
});

const jbmono = JetBrains_Mono({
  variable: "--font-jbmono",
  subsets: ["latin"],
  display: "swap",
});

const notoSansSC = Noto_Sans_SC({
  variable: "--font-noto-sans-sc",
  weight: ["400", "500", "700"],
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  title: "让 AI 为人创造价值",
  description:
    "石子凡，AI 架构师，15 年大数据与人工智能实战。Agent 工程、企业级 AI 落地、AI 素养教育。六个已上线的个人产品，皆可点开试用。",
  keywords: [
    "石子凡",
    "AI 架构师",
    "Agent 工程",
    "智能体",
    "企业 AI 培训",
  ],
  other: { "theme-color": "#f1ebdd" },
  openGraph: {
    title: "石子凡 · AI 架构师",
    description: "相信未来，笃行当下，让 AI 为人创造价值。",
    url: "https://shizifan.com",
    locale: "zh_CN",
    type: "website",
    images: [{ url: "https://www.shizifan.com/og-image.png", width: 1200, height: 630 }],
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 3,
  userScalable: true,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${grotesk.variable} ${jbmono.variable} ${notoSansSC.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
