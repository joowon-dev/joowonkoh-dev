"use client";

import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import Wallpaper from "./Wallpaper";

/** 벽지·머리·꼬리 없이 혼자 서는 페이지. 초대 링크는 카톡에서 열자마자 코드 하나만 보여야 한다. */
const BARE = ["/yourmealmymeal/join"];

/**
 * 네밥내밥 셸의 갈림길. 대부분은 수저 벽지에 앱 머리·꼬리를 달고,
 * BARE 경로는 아무것도 두르지 않고 페이지가 바탕부터 꼬리까지 직접 그린다.
 */
export default function Shell({ header, footer, children }: { header: ReactNode; footer: ReactNode; children: ReactNode }) {
  const pathname = usePathname();
  if (BARE.some((p) => pathname === p || pathname.startsWith(`${p}/`))) return <>{children}</>;

  return (
    <Wallpaper>
      {header}
      <div className="mx-auto max-w-3xl px-6 pb-16 pt-10">{children}</div>
      {footer}
    </Wallpaper>
  );
}
