import type { Metadata } from "next";
import Script from "next/script";

import { AnalyticsHead, AnalyticsNoScript, AnalyticsScripts } from "@/components/Analytics";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import HideOnAdmin, { SiteMain } from "@/components/HideOnAdmin";
import ScrollToTop from "@/components/ScrollToTop";
import { ADSENSE_CLIENT } from "@/lib/adsense";

export const siteMetadata: Metadata = {
  title: {
    default: "Joowon Koh",
    template: "%s",
  },
  description: "Developer & Creator — 새로운 것을 만들고 공유합니다.",
  metadataBase: new URL("https://joowonkoh.com"),
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: "Joowon Koh",
    description: "Developer & Creator — 새로운 것을 만들고 공유합니다.",
    url: "https://joowonkoh.com",
    images: [{ url: "/logo.png", width: 512, height: 512, alt: "Joowon Koh" }],
  },
  twitter: {
    card: "summary",
    title: "Joowon Koh",
    description: "Developer & Creator — 새로운 것을 만들고 공유합니다.",
    images: ["/logo.png"],
  },
  // canonical은 여기에 두면 안 된다. 루트 레이아웃의 metadata는 자기 값을 지정하지 않은
  // 모든 하위 페이지가 그대로 물려받으므로, 홈 주소를 넣어두면 /blog·/playground 등
  // 전 페이지가 "내 정식 주소는 홈이다"라고 선언하게 되고 검색 색인에서 홈으로 합쳐진다.
  // 페이지마다 자기 주소를 지정한다. (홈은 src/app/(site)/page.tsx)
};

/**
 * 개인 사이트의 `<html>` — 헤더·푸터·광고·애널리틱스.
 * 사이트 루트 레이아웃(`(site)/layout.tsx`)과 없는 주소 페이지(`global-not-found.tsx`)가 같이 쓴다.
 * 네밥내밥(`/yourmealmymeal`)은 언어마다 `<html lang>` 이 달라야 해서 이것을 쓰지 않고 자기 루트 레이아웃을 둔다.
 */
export default function SiteDocument({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <head>
        <AnalyticsHead />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800&display=swap"
        />
      </head>
      <body className="noise-overlay min-h-[100dvh] bg-bg text-text-primary font-sans antialiased">
        <AnalyticsNoScript />
        <ScrollToTop />
        <HideOnAdmin header>
          <Header />
        </HideOnAdmin>
        <SiteMain>{children}</SiteMain>
        <HideOnAdmin>
          <Footer />
        </HideOnAdmin>
        {/* 자체 셸 경로(어드민 등)에는 사이트 광고를 싣지 않는다. */}
        <HideOnAdmin>
          <Script
            async
            src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
            crossOrigin="anonymous"
            strategy="afterInteractive"
          />
        </HideOnAdmin>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
