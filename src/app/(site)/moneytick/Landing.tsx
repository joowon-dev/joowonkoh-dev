import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import { LANDING } from "./copy";
import Faq from "./Faq";
import Features from "./Features";
import Hero from "./Hero";
import {
  APP_STORE_URL,
  LANG_INFO,
  languageAlternates,
  pagePath,
  playStoreUrl,
  redirectScript,
  type Lang,
} from "./i18n";
import LanguagePicker from "./LanguagePicker";
import { Reveal } from "./motion";
import Race from "./Race";
import StayCounter from "./StayCounter";
import Ticker from "./Ticker";

/**
 * 이게내연봉 소개 페이지 — 언어만 다르고 모양은 하나다.
 *
 * `/moneytick`(한국어)과 `/moneytick/[lang]` 이 같은 이 컴포넌트를 그린다.
 */

export function landingMetadata(lang: Lang): Metadata {
  const copy = LANDING[lang];
  const url = `https://joowonkoh.com${pagePath(lang)}`;
  return {
    title: copy.meta.title,
    description: copy.meta.description,
    alternates: { canonical: url, languages: languageAlternates() },
    openGraph: {
      type: "website",
      siteName: "Joowon Koh",
      locale: LANG_INFO[lang].ogLocale,
      title: copy.meta.title,
      description: copy.meta.description,
      url,
      images: [{ url: "/moneytick-icon.png", alt: copy.iconAlt }],
    },
  };
}

/** 앱과 같은 글꼴 — iOS 에서는 SF Pro / Apple SD Gothic Neo 로 떨어진다. */
const APP_FONT =
  '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Apple SD Gothic Neo", "Pretendard", system-ui, sans-serif';

/** 섹션 위의 작은 머리말. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-[rgba(60,60,67,0.6)]">
      {children}
    </h2>
  );
}

export default function Landing({ lang }: { lang: Lang }) {
  const copy = LANDING[lang];
  const info = LANG_INFO[lang];
  const PLAY_STORE_URL = playStoreUrl(lang);
  // 낱말 중간에서 줄을 바꾸지 않는 건 한국어만 — `LANG_INFO.keepAll` 주석.
  const keep = info.keepAll ? "break-keep" : "";

  return (
    <div lang={info.tag} style={{ fontFamily: APP_FONT }}>
      {lang === "ko" && (
        // 다른 말을 쓰는 브라우저면 그 언어 페이지로 — React 가 붙기 전에 돈다.
        <script dangerouslySetInnerHTML={{ __html: redirectScript("") }} />
      )}
      <div className="mb-6 flex justify-end">
        <LanguagePicker lang={lang} label={copy.languageLabel} />
      </div>

      <Hero lang={lang} appStoreUrl={APP_STORE_URL} playStoreUrl={PLAY_STORE_URL}>
        <Image
          src="/moneytick-icon.png"
          alt={copy.iconAlt}
          width={84}
          height={84}
          className="rounded-[20px] border border-[rgba(0,0,0,0.06)] shadow-ambient"
          priority
        />
      </Hero>

      <section className="mt-12">
        <Ticker lang={lang} />
      </section>

      <section className="mt-16">
        <Reveal>
          <Eyebrow>{copy.eyebrow.features}</Eyebrow>
        </Reveal>
        <Features lang={lang} />
      </section>

      <section className="mt-16">
        <Reveal>
          <Eyebrow>{copy.eyebrow.race}</Eyebrow>
        </Reveal>
        <Race lang={lang} />
      </section>

      <section className="mt-20">
        <Reveal>
          <p className={`max-w-[20ch] text-[28px] font-bold leading-[1.35] tracking-[-0.6px] ${keep} text-black md:text-[34px]`}>
            {copy.statement.headline}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className={`mt-5 max-w-[46ch] text-[15px] leading-[1.8] tracking-[-0.24px] ${keep} text-[rgba(60,60,67,0.7)]`}>
            {copy.statement.body}
          </p>
        </Reveal>
        <Reveal delay={0.15} className="mt-8">
          <StayCounter lang={lang} />
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <Eyebrow>{copy.eyebrow.faq}</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <Faq lang={lang} />
        </Reveal>
      </section>

      <section className="mt-16">
        <Reveal>
          <Eyebrow>{copy.eyebrow.support}</Eyebrow>
          <div className="flex flex-wrap gap-5">
            <a
              href={APP_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-semibold tracking-[-0.24px] text-[#248A3D] spring-transition hover:opacity-70"
            >
              App Store →
            </a>
            <a
              href={PLAY_STORE_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[15px] font-semibold tracking-[-0.24px] text-[#248A3D] spring-transition hover:opacity-70"
            >
              Google Play →
            </a>
            <a
              href="mailto:contact@joowonkoh.com"
              className="text-[15px] font-medium tracking-[-0.24px] text-[rgba(60,60,67,0.75)] spring-transition hover:text-[#248A3D]"
            >
              contact@joowonkoh.com →
            </a>
            <Link
              href={pagePath(lang, "/privacy")}
              className="text-[15px] font-medium tracking-[-0.24px] text-[rgba(60,60,67,0.75)] spring-transition hover:text-[#248A3D]"
            >
              {copy.support.privacy} →
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
