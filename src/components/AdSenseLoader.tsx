"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { ADSENSE_CLIENT } from "@/lib/adsense";

/**
 * 애드센스 스크립트는 읽을 글이 있는 곳에만 싣는다.
 *
 * 예전에는 레이아웃이 전 페이지에 실었다. 그러면 앱 약관·계정 삭제 안내·
 * 열기 전엔 아무 글도 없는 장난감 페이지까지 광고 자리가 되고, 심사에서는
 * «게시자 콘텐츠가 없는 화면에 광고»로 읽힌다. 그래서 허용 목록으로 뒤집었다.
 */
const AD_PATHS = ["/", "/about", "/blog", "/playground"];

/** 허용 경로 아래라도 읽을 글이 없는 곳 */
const NO_AD_PATHS = ["/playground/gaegang-gift"];

const under = (pathname: string, prefixes: string[]) =>
  prefixes.some((p) => pathname === p || (p !== "/" && pathname.startsWith(`${p}/`)));

export default function AdSenseLoader() {
  const pathname = usePathname();
  if (!under(pathname, AD_PATHS) || under(pathname, NO_AD_PATHS)) return null;
  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${ADSENSE_CLIENT}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
