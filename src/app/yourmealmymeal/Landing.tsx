import type { Metadata } from "next";
import Link from "next/link";

import { COPY } from "./copy";
import Faq from "./Faq";
import Features from "./Features";
import Hero from "./Hero";
import { languageAlternates, LANG_INFO, ORIGIN, pagePath, type Lang } from "./i18n";
import { Reveal } from "./motion";
import { C, CARD } from "./palette";
import RedirectScript from "./RedirectScript";
import StoreButtons from "./StoreButtons";

const OG_IMAGE = `${ORIGIN}/yourmealmymeal/og-main-v3.png`;

export function landingMetadata(lang: Lang): Metadata {
  const m = COPY[lang].landing.meta;
  const url = `${ORIGIN}${pagePath(lang)}`;
  return {
    title: m.title,
    description: m.description,
    alternates: { canonical: url, languages: languageAlternates() },
    openGraph: {
      type: "website",
      locale: LANG_INFO[lang].ogLocale,
      siteName: COPY[lang].appName,
      title: m.ogTitle,
      description: m.ogDescription,
      url,
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: m.ogAlt }],
    },
    twitter: {
      card: "summary_large_image",
      title: m.ogTitle,
      description: m.ogDescription,
      images: [OG_IMAGE],
    },
  };
}

const CONTACT = "contact@joowonkoh.com";

/** 섹션 머리말. 앱 로그인 화면처럼 기기 글꼴을 굵게, 가운데에. */
function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-[24px] leading-[1.3] md:text-[26px]" style={{ color: C.ink }}>
      {children}
    </h2>
  );
}

function Lead({ children }: { children: React.ReactNode }) {
  return (
    <p className="mx-auto mt-3 max-w-[34ch] text-[16px] leading-[1.75] break-keep" style={{ color: C.body }}>
      {children}
    </p>
  );
}

const OUTLINE = { background: C.surface, color: C.ink, border: `1px solid ${C.hairline}` } as const;

/** 소개 한 장. 한국어는 `/yourmealmymeal`, 다른 언어는 `/yourmealmymeal/<언어>`. */
export default function Landing({ lang }: { lang: Lang }) {
  const copy = COPY[lang];
  const t = copy.landing;

  return (
    <div className="text-center">
      <RedirectScript lang={lang} sub="" />
      <Hero
        lang={lang}
        appName={copy.appName}
        trayTitle={t.trayTitle}
        greetings={t.greetings}
        quote={copy.quote}
        tagline={t.tagline}
        download={copy.store.download}
      />

      <section className="mt-28">
        <Reveal>
          <Heading>{t.together.title}</Heading>
          <Lead>{t.together.lead}</Lead>
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <Heading>{t.featuresTitle}</Heading>
        </Reveal>
        <Reveal delay={0.06} className="mt-6">
          <Features items={t.features} />
        </Reveal>
      </section>

      <section className="mt-24">
        <Reveal>
          <p className="mx-auto max-w-[18ch] text-[26px] font-bold leading-[1.35] tracking-[-0.02em] break-keep md:text-[30px]" style={{ color: C.ink }}>
            {t.statement.before}
            <span style={{ color: C.tomato }}>{t.statement.em}</span>
            {t.statement.after}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mx-auto mt-6 max-w-[40ch] space-y-3 text-[16px] leading-[1.85] break-keep" style={{ color: C.body }}>
            {t.story.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        </Reveal>
      </section>

      <section className="mt-24">
        <Reveal>
          <Heading>{t.faqTitle}</Heading>
        </Reveal>
        <Reveal delay={0.05} className="mt-6">
          <Faq items={t.faq} />
        </Reveal>
      </section>

      <section className="mt-24">
        <Reveal>
          <div className="mx-auto flex max-w-[440px] flex-col items-center rounded-[28px] bg-white px-5 py-8 sm:px-8" style={CARD}>
            <Heading>{t.closing.title}</Heading>
            <p className="mt-2 text-[15px] leading-[1.7] break-keep" style={{ color: C.body }}>
              {t.closing.body}
            </p>
            <StoreButtons className="mt-6" lang={lang} download={copy.store.download} />
            <a
              href={`mailto:${CONTACT}`}
              className="mt-2.5 flex h-[54px] w-full items-center justify-center rounded-full text-[16px] font-semibold transition-transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: C.yolk, color: C.ink }}
            >
              {CONTACT}
            </a>
            <div className="mt-2.5 flex w-full gap-2.5">
              <Link
                href={pagePath(lang, "/privacy")}
                className="flex min-h-[54px] min-w-0 flex-1 items-center justify-center rounded-full px-3 text-[15px] font-medium leading-[1.25] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                style={OUTLINE}
              >
                {t.closing.privacy}
              </Link>
              <Link
                href={pagePath(lang, "/delete-account")}
                className="flex min-h-[54px] min-w-0 flex-1 items-center justify-center rounded-full px-3 text-[15px] font-medium leading-[1.25] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                style={OUTLINE}
              >
                {t.closing.deleteAccount}
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
