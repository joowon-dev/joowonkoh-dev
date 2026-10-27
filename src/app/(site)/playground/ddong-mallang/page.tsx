import type { Metadata, Viewport } from "next";
import DdongMallang from "./DdongMallang";

/**
 * viewport-fit=cover가 있어야 env(safe-area-inset-*)이 0이 아닌 값을 준다.
 * 이 페이지는 화면을 꽉 채우고 아래쪽에 버튼이 붙어서, 홈 인디케이터·제스처 바가
 * 덮는 만큼을 알아야 한다. 사이트 전체가 아니라 이 라우트에만 건다.
 */
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

const TITLE = "똥 말랑";
const DESCRIPTION =
  "고양이 배를 꾹 누르면 힘주기, 손을 떼면 심호흡. 배변 리듬을 화면이 잡아줍니다. 기록을 저장하지 않고 브라우저 안에서만 돌아갑니다.";
const URL = "https://joowonkoh.com/playground/ddong-mallang";

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

export default function DdongMallangPage() {
  return (
    <main>
      <DdongMallang />
    </main>
  );
}
