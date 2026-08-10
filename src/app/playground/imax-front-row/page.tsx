import type { Metadata, Viewport } from "next";
import ImaxFrontRow from "./ImaxFrontRow";

/**
 * 화면을 통째로 덮는 페이지다. 노치나 둥근 모서리 안쪽까지 상영관이
 * 이어지도록 이 라우트에만 viewport-fit=cover를 건다.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const TITLE = "IMAX 1열 체험하기";
const DESCRIPTION =
  "내 카메라 화면이나 가지고 있는 사진을 IMAX 스크린에 걸고 1열에서 봅니다. 목이 꺾이는 각도와 곡면 왜곡을 실제 극장 규격으로 계산합니다.";
const URL = "https://joowonkoh.com/playground/imax-front-row";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: `${TITLE} — Joowon Koh`,
    description: DESCRIPTION,
    url: URL,
  },
};

export default function ImaxFrontRowPage() {
  return (
    <main>
      <ImaxFrontRow />
    </main>
  );
}
