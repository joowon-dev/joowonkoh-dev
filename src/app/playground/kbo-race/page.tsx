import type { Metadata } from "next";
import KboRace from "./KboRace";

const TITLE = "KBO 순위 레이스";
const DESCRIPTION =
  "KBO 10개 구단 선수가 홈 유니폼을 입고 한 줄로 달리며, 개막일부터 오늘까지의 실제 순위와 게임차를 날짜별로 다시 보여 주는 도트 애니메이션.";
const URL = "https://joowonkoh.com/playground/kbo-race";
const OG_IMAGE = "/og/kbo-race.jpg";

export const metadata: Metadata = {
  // 사이트 이름을 붙이지 않고 이름 그대로 — 공유했을 때 «KBO 순위 레이스»만 보이게.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: ["KBO 순위", "KBO 게임차", "프로야구 순위 변화", "KBO 2026", "야구 도트"],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "홈 유니폼을 입은 10개 구단 도트 선수들이 순위대로 한 줄로 달리는 그림" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function KboRacePage() {
  return <KboRace />;
}
