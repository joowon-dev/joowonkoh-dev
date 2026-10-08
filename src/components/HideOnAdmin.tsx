"use client";

import { usePathname } from "next/navigation";

/**
 * 사이트 크롬(헤더·푸터·광고 등)을 쓰지 않는 경로. 저마다 자체 셸을 쓴다.
 * - /admin: 어드민 셸
 * - /yourmealmymeal: 네밥내밥 앱 페이지. 초대 링크로 들어온 사람에게 개인 사이트가 보이면 엉뚱하다.
 */
const OWN_SHELL = ["/admin", "/yourmealmymeal"];

/** 본문 폭·여백까지 자체 셸이 정하는 경로. 어드민은 사이트 본문 틀을 그대로 쓴다. */
const BARE_MAIN = ["/yourmealmymeal"];

const under = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export default function HideOnAdmin({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (under(pathname, OWN_SHELL)) return null;
  return <>{children}</>;
}

/** 사이트 본문 틀. 자체 셸 경로에서는 폭·여백 없이 그대로 내준다. */
export function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (under(pathname, BARE_MAIN)) return <main>{children}</main>;
  return <main className="mx-auto max-w-3xl px-6 py-16">{children}</main>;
}
