import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Script from "next/script";

export const metadata: Metadata = {
  title: {
    default: "Joowon Koh",
    template: "%s | Joowon Koh",
  },
  description: "Developer & Creator — 새로운 것을 만들고 공유합니다.",
  metadataBase: new URL("https://joowonkoh.dev"),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body className="min-h-screen bg-bg text-text-primary font-sans antialiased">
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-12">{children}</main>
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-XXXXXXXXXXXXXXXX"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-XXXXXXXXXX');
  `}
        </Script>
      </body>
    </html>
  );
}
