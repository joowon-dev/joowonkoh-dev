import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ScrollToTop from "@/components/ScrollToTop";
import Script from "next/script";

export const metadata: Metadata = {
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
  // 페이지마다 자기 주소를 지정한다. (홈은 src/app/page.tsx)
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-KJLLSWX6');`,
          }}
        />
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
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KJLLSWX6"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        <ScrollToTop />
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-16">{children}</main>
        <Footer />
        <Script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7807290470382730"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-924W0S77PX"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', 'G-924W0S77PX');
  `}
        </Script>
      </body>
    </html>
  );
}
