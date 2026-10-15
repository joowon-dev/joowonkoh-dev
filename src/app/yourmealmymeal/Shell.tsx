"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Wallpaper, { HERO_SPOTS, QUIET_SPOTS } from "./Wallpaper";

/** 벽지·머리·꼬리 없이 혼자 서는 페이지. 초대 링크는 카톡에서 열자마자 코드 하나만 보여야 한다. */
const BARE = ["/yourmealmymeal/join"];
const HOME = "/yourmealmymeal";

/**
 * 네밥내밥 셸의 갈림길. 대부분은 수저 무늬 바탕에 앱 머리·꼬리를 달고,
 * BARE 경로는 아무것도 두르지 않고 페이지가 바탕부터 꼬리까지 직접 그린다.
 * 소개 첫 화면은 큰 급식판이 곧 머리라서 작은 머리막대를 달지 않는다.
 */
export default function Shell({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  if (BARE.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return <>{children}</>;
  const home = pathname === HOME || pathname === `${HOME}/`;

  return (
    <Wallpaper spots={home ? HERO_SPOTS : QUIET_SPOTS}>
      {home ? null : header}
      <div className={`mx-auto max-w-3xl px-5 pb-16 sm:px-6 ${home ? "pt-14" : "pt-8"}`}>{children}</div>
      {footer}
    </Wallpaper>
  );
}
