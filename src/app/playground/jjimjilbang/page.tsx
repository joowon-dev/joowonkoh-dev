import type { Metadata, Viewport } from "next";
import JjimjilbangWeather from "./JjimjilbangWeather";

/**
 * viewport-fit=cover가 있어야 env(safe-area-inset-*)이 0이 아닌 값을 준다.
 * 이 페이지는 사진이 화면 끝까지 가고 글자가 노치·홈 인디케이터를 피해야 해서
 * 그 값이 필요하다. 사이트 전체가 아니라 이 라우트에만 건다.
 *
 * themeColor를 검게 두면 홈 화면에 담아 열었을 때 상태 표시줄까지 사진에
 * 이어진다 — 흰 띠가 남으면 앱이 아니라 웹페이지로 보인다.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#000000",
};

const TITLE = "오늘의 찜질방";
const DESCRIPTION =
  "오늘 날씨가 찜질방 어느 방인지 알려줍니다. 체감온도와 습도를 함께 봐서 황토방·건식사우나·습식사우나·불가마로 판정하고, 하루가 어떤 방들을 지나가는지 보여줍니다.";
const URL = "https://joowonkoh.com/playground/jjimjilbang";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
};

export default function JjimjilbangPage() {
  return <JjimjilbangWeather />;
}
