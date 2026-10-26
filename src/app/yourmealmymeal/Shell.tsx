"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import TrayMark from "./Mark";
import type { Copy } from "./copy/types";
import { LANG_INFO, pagePath, parsePath, SUBS, type Lang, type Sub } from "./i18n";
import LanguagePicker from "./LanguagePicker";
import { C } from "./palette";
import Wallpaper, { HERO_SPOTS, QUIET_SPOTS } from "./Wallpaper";

const CONTACT = "contact@joowonkoh.com";

/** 머리·꼬리에 쓰는 글. 레이아웃(서버)이 12개 언어치를 골라 넘긴다 — 작은 조각이라 다 실어도 가볍다. */
export type ShellCopy = Copy["shell"] & { appName: string };

/**
 * 네밥내밥 셸의 갈림길. 주소에서 언어를 읽어(`/yourmealmymeal/en/...`) 머리·꼬리를 그 언어로 단다.
 * 대부분은 수저 무늬 바탕에 앱 머리·꼬리를 달고, 초대 페이지(`…/join`)는 아무것도 두르지 않고
 * 페이지가 바탕부터 꼬리까지 직접 그린다 — 카톡에서 열자마자 코드 하나만 보여야 한다.
 * 소개 첫 화면은 큰 급식판이 곧 머리라서 작은 머리막대를 달지 않는다.
 */
export default function Shell({ shells, children }: { shells: Record<Lang, ShellCopy>; children: ReactNode }) {
  const at = parsePath(usePathname()) ?? { lang: "ko" as Lang, sub: "" };
  const { lang } = at;
  const tag = LANG_INFO[lang].tag;
  if (at.sub === "/join" || at.sub.startsWith("/join/")) return <div lang={tag}>{children}</div>;
  const home = at.sub === "";
  const sub: Sub = (SUBS as string[]).includes(at.sub) ? (at.sub as Sub) : "";
  const t = shells[lang];

  return (
    <div lang={tag}>
      <Wallpaper spots={home ? HERO_SPOTS : QUIET_SPOTS}>
        {home ? null : (
          <header className="mx-auto flex max-w-3xl px-5 pt-6 sm:px-6">
            <Link
              href={pagePath(lang)}
              className="flex items-center gap-2 rounded-full py-1 pr-2 transition-opacity hover:opacity-80"
              aria-label={t.homeAria}
            >
              <TrayMark size={36} backdrop="square" />
              <span className="text-[20px] font-black leading-none tracking-[-0.05em]" style={{ color: C.ink }}>
                {t.appName}
              </span>
            </Link>
          </header>
        )}
        <div className={`mx-auto max-w-3xl px-5 pb-16 sm:px-6 ${home ? "pt-14" : "pt-8"}`}>{children}</div>
        <footer className="mx-auto max-w-3xl px-5 pb-12 sm:px-6">
          <div
            className="flex flex-wrap justify-center gap-x-5 gap-y-2 border-t pt-6 text-[14px]"
            style={{ borderColor: C.hairline, color: C.sub }}
          >
            <Link href={pagePath(lang)} className="hover:underline">{t.about}</Link>
            <Link href={pagePath(lang, "/privacy")} className="hover:underline">{t.privacy}</Link>
            <Link href={pagePath(lang, "/delete-account")} className="hover:underline">{t.deleteAccount}</Link>
            <a href={`mailto:${CONTACT}`} className="hover:underline">{CONTACT}</a>
          </div>
          <div className="mt-4 flex justify-center">
            <LanguagePicker lang={lang} sub={sub} label={t.language} />
          </div>
          <p className="mt-3 text-center text-[13px]" style={{ color: C.sub }}>
            © 2026 {t.appName}
          </p>
        </footer>
      </Wallpaper>
    </div>
  );
}
