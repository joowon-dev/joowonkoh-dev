import type { Metadata } from "next";

import Wallpaper from "../Wallpaper";
import InviteCode from "./InviteCode";

export const metadata: Metadata = {
  title: "네밥내밥 모임 초대",
  description: "네밥내밥 모임에 초대받았어요. 앱에서 열면 초대코드가 채워진 채로 참여 화면이 열립니다.",
  alternates: { canonical: "https://joowonkoh.com/yourmealmymeal/join" },
  // 초대 링크마다 코드만 다른 같은 페이지다. 검색에 걸릴 이유가 없다.
  robots: { index: false, follow: false },
  // 카톡·문자로 가장 많이 퍼지는 주소라 미리보기가 곧 첫인상이다. 사이트 공통(Joowon Koh 로고)을 물려받지 않고 앱의 얼굴로 바꾼다.
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "네밥내밥",
    title: "밥상에 초대받았어요 🍚",
    description: "네밥내밥 모임 초대 — 눌러서 초대코드를 확인하고 앱에서 바로 참여하세요.",
    url: "https://joowonkoh.com/yourmealmymeal/join",
    images: [
      {
        url: "https://joowonkoh.com/yourmealmymeal/og-join.jpg",
        width: 1200,
        height: 630,
        alt: "민트 식판에 아침·점심·저녁이 차려져 있고 빈 칸 하나가 '내 자리'로 비어 있는 네밥내밥 초대 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "밥상에 초대받았어요 🍚",
    description: "네밥내밥 모임 초대 — 눌러서 초대코드를 확인하고 앱에서 바로 참여하세요.",
    images: ["https://joowonkoh.com/yourmealmymeal/og-join.jpg"],
  },
};

/**
 * 앱이 보낸 초대 링크(…/join?code=AB2K9M)가 닿는 곳.
 *
 * 카톡에서 앱 주소(yourmealmymeal://)는 눌리지 않아서 웹 주소를 보내고,
 * 여기서 코드를 보여 준 뒤 "앱에서 열기"로 앱의 참여 화면에 코드를 넘긴다.
 * 코드는 서버에서 읽지 않는다 — searchParams를 받으면 라우트가 동적이 된다(SectionList 주석 참고).
 */
export default function YourMealMyMealJoinPage() {
  return (
    <Wallpaper>
      <InviteCode />
    </Wallpaper>
  );
}
