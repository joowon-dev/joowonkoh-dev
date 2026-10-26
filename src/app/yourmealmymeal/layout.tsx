import type { Metadata } from "next";
import type { CSSProperties, ReactNode } from "react";

import { COPY } from "./copy";
import { LANGS, type Lang } from "./i18n";
import { BODY, DISPLAY } from "./palette";
import Shell, { type ShellCopy } from "./Shell";
import "./theme.css";

/**
 * 네밥내밥 셸. 이 아래는 개인 사이트가 아니라 앱의 집이다 —
 * 사이트 헤더·푸터·광고는 루트 레이아웃이 빼 주고(HideOnAdmin), 여기서 앱의 머리와 꼬리를 단다(Shell).
 * 초대 링크로 처음 들어온 사람이 엉뚱한 블로그를 보지 않게 하려는 것이다.
 */
export const metadata: Metadata = {
  // 하위 페이지가 따로 정하지 않으면 미리보기도 사이트(Joowon Koh)가 아니라 앱 얼굴로 나간다.
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "네밥내밥",
    images: [{ url: "https://joowonkoh.com/yourmealmymeal/og-main-v3.png", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["https://joowonkoh.com/yourmealmymeal/og-main-v3.png"] },
};

/** 머리·꼬리 글은 언어마다 몇 낱말뿐이라 12개를 다 셸에 넘기고, 셸이 주소를 보고 고른다. */
const SHELLS = Object.fromEntries(
  LANGS.map((l) => [l, { ...COPY[l].shell, appName: COPY[l].appName }]),
) as Record<Lang, ShellCopy>;

export default function YourMealMyMealLayout({ children }: { children: ReactNode }) {
  return (
    <div className="nemeal" style={{ "--nm-display": DISPLAY, "--nm-body": BODY } as CSSProperties}>
      <Shell shells={SHELLS}>{children}</Shell>
    </div>
  );
}
