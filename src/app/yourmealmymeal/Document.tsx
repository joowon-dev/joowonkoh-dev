import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";

import { AnalyticsHead, AnalyticsNoScript, AnalyticsScripts } from "@/components/Analytics";
import ScrollToTop from "@/components/ScrollToTop";

import { COPY } from "./copy";
import { LANG_INFO, LANGS, ORIGIN, type Lang } from "./i18n";
import { BODY, DISPLAY } from "./palette";
import Shell, { type ShellCopy } from "./Shell";
import "./theme.css";

/**
 * 네밥내밥의 `<html>`. 이 아래는 개인 사이트가 아니라 앱의 집이다 — 사이트 헤더·푸터·광고 없이 앱의 머리와 꼬리를 단다(Shell).
 * 초대 링크로 처음 들어온 사람이 엉뚱한 블로그를 보지 않게 하려는 것이다.
 *
 * 사이트와 루트 레이아웃을 나눈 까닭은 `<html lang>` 이다. 한 루트 레이아웃 아래에서는 모든 언어 페이지가
 * `lang="ko"` 로 나갔다. 이제 한국어 페이지(`(ko)/layout.tsx`)와 다른 언어 페이지(`[...path]/layout.tsx`)가
 * 저마다 이것을 불러 페이지 언어를 `lang` 에 적는다. 빌드 때 미리 만든 HTML 에 그대로 박힌다.
 */

const OG_IMAGE = `${ORIGIN}/yourmealmymeal/og-main-v3.png`;

/** 하위 페이지가 따로 정하지 않으면 미리보기도 사이트(Joowon Koh)가 아니라 그 언어의 앱 얼굴로 나간다. */
export function documentMetadata(lang: Lang): Metadata {
  return {
    metadataBase: new URL(ORIGIN),
    openGraph: {
      type: "website",
      locale: LANG_INFO[lang].ogLocale,
      siteName: COPY[lang].appName,
      images: [{ url: OG_IMAGE, width: 1200, height: 630 }],
    },
    twitter: { card: "summary_large_image", images: [OG_IMAGE] },
  };
}

/** 머리·꼬리 글은 언어마다 몇 낱말뿐이라 12개를 다 셸에 넘기고, 셸이 주소를 보고 고른다. */
const SHELLS = Object.fromEntries(
  LANGS.map((l) => [l, { ...COPY[l].shell, appName: COPY[l].appName }]),
) as Record<Lang, ShellCopy>;

export default function YourMealMyMealDocument({ lang, children }: { lang: Lang; children: ReactNode }) {
  return (
    <html lang={LANG_INFO[lang].tag}>
      <head>
        <AnalyticsHead />
        {/* 글꼴은 기기 글꼴이고, 한글 글꼴이 없는 기기에서만 Pretendard 로 받친다(palette.ts SYSTEM). */}
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/pretendard.min.css"
        />
      </head>
      <body className="min-h-[100dvh] bg-bg text-text-primary font-sans antialiased">
        <AnalyticsNoScript />
        <ScrollToTop />
        <main>
          <div className="nemeal" style={{ "--nm-display": DISPLAY, "--nm-body": BODY } as CSSProperties}>
            <Shell shells={SHELLS}>{children}</Shell>
          </div>
        </main>
        <AnalyticsScripts />
      </body>
    </html>
  );
}
