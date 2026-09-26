import type { Metadata } from "next";
import Bukangi from "./Bukangi";

const TITLE = "부캉이의 기록";
const DESCRIPTION =
  "부산 북항 친수공원 수로에 들어온 3.5m 상어 부캉이. 처음 발견된 날부터 오늘까지 날마다 늘어난 구경꾼과 사건, 그날 롯데 경기를 도트 애니메이션으로 다시 본다.";
const URL = "https://joowonkoh.com/playground/bukangi";
const OG_IMAGE = "/og/bukangi.jpg";

export const metadata: Metadata = {
  // 사이트 이름을 붙이지 않고 이름 그대로 — 공유했을 때 «부캉이의 기록»만 보이게.
  title: { absolute: TITLE },
  description: DESCRIPTION,
  keywords: ["부캉이", "북항 상어", "부산 북항 친수공원 상어", "부캉이 롯데", "상어 도트"],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
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
