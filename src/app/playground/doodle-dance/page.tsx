import type { Metadata } from "next";
import DoodleDance from "./DoodleDance";

const TITLE = "낙서 댄스";
const DESCRIPTION =
  "마우스나 트랙패드를 움직이면 종이 위에 그린 낙서 캐릭터가 따라 춤춥니다. 손을 멈추면 혼자 흐느적거리는 인터랙티브 낙서.";
const URL = "https://joowonkoh.com/playground/doodle-dance";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["인터랙티브", "낙서", "춤추는 캐릭터", "마우스 인터랙션", "canvas 애니메이션"],
  alternates: { canonical: URL },
  // 내비에서 감춘 항목이다. 목록에 없는 페이지가 검색 결과로만 노출되면
  // 들어온 사람은 사이트에서 다시 찾아갈 길이 없다. 사이트맵 제외는
  // next-sitemap.config.js에 같이 걸어 뒀다.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

export default function DoodleDancePage() {
  return <DoodleDance />;
}
