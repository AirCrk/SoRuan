import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import Providers from "@/components/Providers";
import prisma from "@/lib/prisma";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});


export async function generateMetadata(): Promise<Metadata> {
  const configs = await prisma.siteConfig.findMany({
    where: {
      key: { in: ["site_title", "site_description"] }
    }
  });

  const settings: Record<string, string> = {};
  configs.forEach((config) => {
    settings[config.key] = config.value;
  });

  return {
    title: settings.site_title || "BuySoft - 正版软件导航平台",
    description: settings.site_description || "发现优质正版软件，享受专属优惠价格",
    keywords: ["正版软件", "软件导航", "软件优惠", "正版授权"],
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const adConfig = await prisma.siteConfig.findFirst({
    where: { key: "google_adsense_code" }
  });
  const adId = adConfig?.value;

  return (
    <html lang="zh-CN">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          {children}
        </Providers>
        {adId && (
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adId}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
