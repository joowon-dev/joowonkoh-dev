import type { Metadata } from "next";

import { COPY } from "../copy";
import { languageAlternates, LANG_INFO, ORIGIN, pagePath, type Lang } from "../i18n";

// 그림을 바꾸면 파일 이름도 바꾼다. 카톡은 같은 주소의 그림을 오래 붙들고 있다.
const OG_IMAGE = `${ORIGIN}/yourmealmymeal/og-join-v5.png`;

/**
 * 초대 페이지의 머리 정보. 카톡·문자로 가장 많이 퍼지는 주소라 미리보기가 곧 첫인상이다.
 * 사이트 공통(Joowon Koh 로고)을 물려받지 않고 앱의 얼굴로 바꾼다.
 * 초대 링크마다 코드만 다른 같은 페이지라 검색에는 올리지 않는다.
 */
export function joinMetadata(lang: Lang): Metadata {
  const m = COPY[lang].join.meta;
  const url = `${ORIGIN}${pagePath(lang, "/join")}`;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: url, languages: languageAlternates("/join") },
    robots: { index: false, follow: false },
    openGraph: {
      type: "website",
      locale: LANG_INFO[lang].ogLocale,
      siteName: COPY[lang].appName,
      title: m.ogTitle,
      description: m.ogDescription,
      url,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: m.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: m.ogTitle,
      description: m.ogDescription,
      images: [OG_IMAGE],
    },
  };
}
