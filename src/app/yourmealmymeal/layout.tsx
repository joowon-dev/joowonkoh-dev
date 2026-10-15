import type { Metadata } from "next";
import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import TrayMark from "./Mark";
import { BODY, C, DISPLAY } from "./palette";
import Shell from "./Shell";
import "./theme.css";

/**
 * 네밥내밥 셸. 이 아래는 개인 사이트가 아니라 앱의 집이다 —
 * 사이트 헤더·푸터·광고는 루트 레이아웃이 빼 주고(HideOnAdmin), 여기서 앱의 머리와 꼬리를 단다.
 * 초대 링크로 처음 들어온 사람이 엉뚱한 블로그를 보지 않게 하려는 것이다.
 */
export const metadata: Metadata = {
  // 하위 페이지가 따로 정하지 않으면 미리보기도 사이트(Joowon Koh)가 아니라 앱 얼굴로 나간다.
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "네밥내밥",
    images: [{ url: "https://joowonkoh.com/yourmealmymeal/og-main-v2.jpg", width: 1200, height: 630 }],
  },
  twitter: { card: "summary_large_image", images: ["https://joowonkoh.com/yourmealmymeal/og-main-v2.jpg"] },
};

const CONTACT = "contact@joowonkoh.com";

export default function YourMealMyMealLayout({ children }: { children: ReactNode }) {
  return (
    <div className="nemeal" style={{ "--nm-display": DISPLAY, "--nm-body": BODY } as CSSProperties}>
      <Shell
        header={
          <header className="mx-auto flex max-w-3xl px-5 pt-6 sm:px-6">
            <Link
              href="/yourmealmymeal"
              className="flex items-center gap-2 rounded-full py-1 pr-2 transition-opacity hover:opacity-80"
              aria-label="네밥내밥 처음으로"
            >
              <TrayMark size={34} />
              <span className="text-[19px] font-bold leading-none tracking-[-0.02em]" style={{ color: C.ink }}>
                네밥내밥
              </span>
            </Link>
          </header>
        }
        footer={
          <footer className="mx-auto max-w-3xl px-5 pb-12 sm:px-6">
            <div
              className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-t pt-6 text-[14px]"
              style={{ borderColor: C.hairline, color: C.sub }}
            >
              <Link href="/yourmealmymeal" className="hover:underline">소개</Link>
              <Link href="/yourmealmymeal/privacy" className="hover:underline">개인정보처리방침</Link>
              <Link href="/yourmealmymeal/delete-account" className="hover:underline">계정 삭제</Link>
              <a href={`mailto:${CONTACT}`} className="hover:underline">{CONTACT}</a>
            </div>
            <p className="mt-3 text-center text-[13px]" style={{ color: C.sub }}>
              © 2026 네밥내밥
            </p>
          </footer>
        }
      >
        {children}
      </Shell>
    </div>
  );
}
