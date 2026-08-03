import type { Metadata, Viewport } from "next";
import TypingHoop from "./TypingHoop";

/**
 * 화면을 꽉 채우고 아래쪽에 입력창이 붙는다. 홈 인디케이터가 덮는 만큼을
 * 알아야 해서 viewport-fit=cover를 이 라우트에만 건다.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  // 키보드가 올라올 때 레이아웃까지 같이 줄여 달라는 요청. 지원하는 브라우저에서는
  // 이것만으로 입력창이 안 가려지고, 안 되는 곳은 TypingHoop의 visualViewport가 받는다.
  interactiveWidget: "resizes-content",
};

const TITLE = "타자 농구";
const DESCRIPTION =
  "세 글자 낱말을 치는 속도가 그대로 슛 파워가 되는 픽셀 농구 게임. 골밑에서는 천천히, 3점 라인 밖에서는 빠르게 쳐야 들어갑니다. 낱말 1000개, 로그인 없이 브라우저에서 바로.";
const URL = "https://joowonkoh.com/playground/typing-hoop";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  // 아직 공개 전이다. 목록에서 감추는 것(projects.ts의 hidden)만으로는
  // 검색엔진이 주소를 알아내면 그대로 색인한다. 사이트맵 제외는
  // next-sitemap.config.js 쪽에 같이 걸어 뒀다.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
};

export default function TypingHoopPage() {
  return (
    <main>
      <TypingHoop />
    </main>
  );
}
