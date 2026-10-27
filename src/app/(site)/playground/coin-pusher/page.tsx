import type { Metadata } from "next";
import CoinPusherGame from "./CoinPusherGame";

const TITLE = "코인 밀기 추첨기";
const DESCRIPTION =
  "참가자 이름을 넣으면 코인이 판 위로 쏟아지고, 푸셔에 밀려 가장 먼저 떨어진 코인의 주인이 당첨되는 추첨기.";
const URL = "https://joowonkoh.com/playground/coin-pusher";
/** 실제 게임 화면을 캡처해 만든 공유 카드 이미지 (1200×630) */
const OG_IMAGE = "/og/coin-pusher.jpg";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["추첨기", "랜덤 뽑기", "사다리타기 대안", "코인 푸셔", "제비뽑기", "당첨자 추첨"],
  alternates: { canonical: URL },
  // 루트 레이아웃의 사이트 카드(로고 + "Joowon Koh")를 덮어쓴다. 링크를 공유했을 때
  // 방금 본 게임 화면이 그대로 보여야 한다.
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: `${TITLE} 게임 화면` }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function CoinPusherPage() {
  return (
    <main>
      <CoinPusherGame />
    </main>
  );
}
