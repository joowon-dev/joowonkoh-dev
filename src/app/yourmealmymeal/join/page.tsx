import type { Metadata } from "next";

import Wallpaper from "../Wallpaper";
import InviteCode from "./InviteCode";

export const metadata: Metadata = {
  title: "네밥내밥 모임 초대",
  description: "네밥내밥 모임에 초대받았어요. 앱에서 열면 초대코드가 채워진 채로 참여 화면이 열립니다.",
  alternates: { canonical: "https://joowonkoh.com/yourmealmymeal/join" },
  // 초대 링크마다 코드만 다른 같은 페이지다. 검색에 걸릴 이유가 없다.
  robots: { index: false, follow: false },
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
