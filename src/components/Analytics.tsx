import Script from "next/script";

/**
 * 구글 태그 관리자·애널리틱스. 루트 레이아웃이 여럿이라(사이트 `(site)`, 네밥내밥 한국어 `(ko)`,
 * 네밥내밥 다른 언어 `[...path]`, 없는 주소 `global-not-found`) 같은 태그를 여기 한 곳에 둔다.
 */

const GTM_ID = "GTM-KJLLSWX6";
const GA_ID = "G-924W0S77PX";

/** `<head>` 안에 — 태그 관리자는 되도록 일찍 불러야 한다. */
export function AnalyticsHead() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`,
      }}
    />
  );
}

/** `<body>` 맨 앞에 — 스크립트를 끈 브라우저용 태그 관리자. */
export function AnalyticsNoScript() {
  return (
    <noscript>
      <iframe
        src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
        height="0"
        width="0"
        style={{ display: "none", visibility: "hidden" }}
      />
    </noscript>
  );
}

/** `<body>` 끝에 — 애널리틱스(gtag). */
export function AnalyticsScripts() {
  return (
    <>
      <Script src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`} strategy="afterInteractive" />
      <Script id="google-analytics" strategy="afterInteractive">
        {`
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${GA_ID}');
  `}
      </Script>
    </>
  );
}
