import type { Metadata } from "next";
import Bukangi from "./Bukangi";

const TITLE = "부캉이의 기록";
const DESCRIPTION =
  "부산 북항 친수공원 수로에 들어온 3.5m 상어 부캉이. 처음 발견된 날부터 오늘까지 날마다 늘어난 구경꾼과 사건, 그날 롯데 경기를 도트 애니메이션으로 다시 본다.";
const URL = "https://joowonkoh.com/playground/bukangi";
const OG_IMAGE = "/og/bukangi.jpg";

export const metadata: Metadata = {
  // 문서 제목은 무엇인지까지 적는다. 이름만 두면 짧아서 구글이 « - Joowon Koh»를 붙여 버린다.
  // 공유 카드(og·twitter)에는 이름만.
  title: { absolute: "부캉이의 기록 — 부산 북항 상어 날짜별 도트 기록" },
  description: DESCRIPTION,
  keywords: ["부캉이", "북항 상어", "부산 북항 친수공원 상어", "부캉이 롯데", "상어 도트"],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
    images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: "부산 북항 수로를 도는 도트 상어와 난간 너머 구경꾼들" }],
  },
  twitter: {
    card: "summary_large_image",
    title: TITLE,
    description: DESCRIPTION,
    images: [OG_IMAGE],
  },
};

export default function BukangiPage() {
  return <Bukangi />;
}
