"use client";

import { usePathname } from "next/navigation";

/**
 * 사이트 크롬(헤더·푸터·광고 등)을 쓰지 않는 경로. 저마다 자체 셸을 쓴다.
 * - /admin: 어드민 셸
 * - /yourmealmymeal: 네밥내밥 앱 페이지. 초대 링크로 들어온 사람에게 개인 사이트가 보이면 엉뚱하다.
 * - /playground/chiikawa-talk: 먼작귀 통역기. 하늘이 화면을 꽉 채우는 전체 화면 놀이 페이지다.
 */
const OWN_SHELL = ["/admin", "/yourmealmymeal", "/playground/chiikawa-talk"];

/**
 * 헤더만 빼는 경로 — 푸터와 본문 틀은 그대로 쓴다.
 * - /moneytick: 이게내연봉 소개·개인정보처리방침(12개 언어). 앱 소개가 첫 화면이어야 하고,
 *   한국어 사이트 메뉴(Blog·Playground)가 다른 언어 페이지 위에 걸리면 어색하다.
 */
const NO_HEADER = ["/moneytick"];

/** 본문 폭·여백까지 자체 셸이 정하는 경로. 어드민은 사이트 본문 틀을 그대로 쓴다. */
const BARE_MAIN = ["/yourmealmymeal", "/playground/chiikawa-talk"];

const under = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || pathname.startsWith(`${p}/`));

export default function HideOnAdmin({
  children,
  header = false,
}: {
  children: React.ReactNode;
  /** 헤더를 감쌀 때 켠다 — `NO_HEADER` 경로에서도 숨긴다. */
  header?: boolean;
}) {
  const pathname = usePathname();
  if (under(pathname, OWN_SHELL)) return null;
  if (header && under(pathname, NO_HEADER)) return null;
  return <>{children}</>;
}

/** 사이트 본문 틀. 자체 셸 경로에서는 폭·여백 없이 그대로 내준다. */
export function SiteMain({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (under(pathname, BARE_MAIN)) return <main>{children}</main>;
  return <main className="mx-auto max-w-3xl px-6 py-16">{children}</main>;
}
