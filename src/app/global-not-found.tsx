import "./globals.css";

import type { Metadata } from "next";

import SiteDocument, { siteMetadata } from "@/components/SiteDocument";

import NotFound, { metadata as notFoundMetadata } from "./(site)/not-found";

/**
 * 어느 주소에도 안 맞을 때의 404. 루트 레이아웃이 여럿이라(`(site)`, 네밥내밥) 맨 위 `not-found.tsx` 를
 * 둘 수 없어서 이 파일이 그 자리를 맡는다(next.config 의 experimental.globalNotFound).
 * 화면은 사이트 404(`(site)/not-found.tsx`)를 사이트 머리·꼬리째 그대로 쓴다.
 */
export const metadata: Metadata = { ...siteMetadata, ...notFoundMetadata };

export default function GlobalNotFound() {
  return (
    <SiteDocument>
      <NotFound />
    </SiteDocument>
  );
}
