import "../globals.css";

import SiteDocument, { siteMetadata } from "@/components/SiteDocument";

/**
 * 개인 사이트의 루트 레이아웃. 사이트 페이지는 전부 `(site)` 묶음 아래에 있다.
 *
 * 앱 맨 위(`src/app/layout.tsx`)에 두지 않는 까닭: 맨 위 레이아웃은 모든 페이지의 `<html>` 을 그려서
 * 네밥내밥의 영어·일본어 … 페이지까지 `<html lang="ko">` 로 나갔다. 루트 레이아웃을 묶음마다 따로 두면
 * 네밥내밥은 자기 루트 레이아웃에서 언어에 맞는 `lang` 을 단다(`yourmealmymeal/(ko)`, `yourmealmymeal/[...path]`).
 * 루트 레이아웃이 다른 곳으로 넘어갈 때는 페이지를 새로 불러온다 — 사이트 ↔ 네밥내밥 사이에서만 그렇다.
 */
export const metadata = siteMetadata;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return <SiteDocument>{children}</SiteDocument>;
}
