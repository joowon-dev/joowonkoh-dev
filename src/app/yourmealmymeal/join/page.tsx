import type { Metadata } from "next";

import InviteCode from "./InviteCode";

export const metadata: Metadata = {
  title: "밥상에 초대받았어요 · 네밥내밥",
  description: "가까운 친구끼리 끼니를 나누는 곳. 초대코드를 복사하고 앱에서 입력하면 모임에 들어가요.",
  alternates: { canonical: "https://joowonkoh.com/yourmealmymeal/join" },
  // 초대 링크마다 코드만 다른 같은 페이지다. 검색에 걸릴 이유가 없다.
  robots: { index: false, follow: false },
  // 카톡·문자로 가장 많이 퍼지는 주소라 미리보기가 곧 첫인상이다. 사이트 공통(Joowon Koh 로고)을 물려받지 않고 앱의 얼굴로 바꾼다.
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "네밥내밥",
    title: "밥상에 초대받았어요",
    description: "가까운 친구끼리 끼니를 나누는 곳",
    url: "https://joowonkoh.com/yourmealmymeal/join",
    images: [
      {
        // 그림을 바꾸면 파일 이름도 바꾼다. 카톡은 같은 주소의 그림을 오래 붙들고 있다.
        url: "https://joowonkoh.com/yourmealmymeal/og-join-v4.png",
        width: 1200,
        height: 630,
        alt: "밝은 회색 바탕에 노른자색 네밥내밥 앱 아이콘(빈 민트 급식판)과 \"밥상에 초대받았어요\" 글자가 있는 초대 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "밥상에 초대받았어요",
    description: "가까운 친구끼리 끼니를 나누는 곳",
    images: ["https://joowonkoh.com/yourmealmymeal/og-join-v4.png"],
  },
};

/**
 * 앱이 보낸 초대 링크(…/join?code=AB2K9M)가 닿는 곳.
 *
 * 카톡에서 앱 주소(yourmealmymeal://)는 눌리지 않아서 웹 주소를 보내고,
 * 여기서 코드를 보여 준 뒤 "앱에서 열기"로 앱의 참여 화면에 코드를 넘긴다.
 * 코드는 서버에서 읽지 않는다 — searchParams를 받으면 라우트가 동적이 된다(SectionList 주석 참고).
 * 이 페이지만 셸(벽지·머리·꼬리)을 두르지 않는다(Shell.tsx의 BARE). 바탕과 꼬리는 InviteCode가 직접 그린다.
 */
export default function YourMealMyMealJoinPage() {
  return <InviteCode />;
}
