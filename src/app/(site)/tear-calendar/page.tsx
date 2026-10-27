import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Faq from "./Faq";
import Features from "./Features";
import Hero from "./Hero";
import { Reveal } from "./motion";
import { C, HAND } from "./palette";

export const metadata: Metadata = {
  title: "뜯어쓰는 달력",
  description:
    "둘이 서로에게 하루 한 장씩 꾸며 주는 커플 일력 iOS 앱. 상대가 꾸며 둔 오늘 페이지를 진짜 일력처럼 쭉 뜯어서 봅니다. 뜯어쓰는 달력 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/tear-calendar",
  },
};

const CONTACT = "contact@joowonkoh.com";

const SHOTS = [
  {
    src: "/tear-calendar/home-open.jpg",
    alt: "오늘 날짜 9월 27일을 뜯어 상대가 올린 하트 스티커가 보이는 화면",
    caption: "뜯으면 상대가 꾸민 오늘",
    tilt: "-rotate-2",
  },
  {
    src: "/tear-calendar/home-behind.jpg",
    alt: "밀린 날짜 9월 23일 페이지와 오늘까지 한 번에 뜯기 버튼",
    caption: "밀렸으면 한 번에 뜯기",
    tilt: "rotate-1",
  },
  {
    src: "/tear-calendar/home-empty.jpg",
    alt: "비어 있는 오늘 페이지 위에 9월 20일에 받은 예전 페이지가 기울어져 놓인 화면",
    caption: "빈 날엔 예전 한 장",
    tilt: "-rotate-1",
  },
];

const BRAKES = [
  { big: "6시간", small: "같은 알림은 6시간에 한 번까지" },
  { big: "22시–8시", small: "밤에는 보내지 않아요" },
  { big: "탓하지 않기", small: "“왜 안 뜯어?” 같은 말은 없어요" },
];

/** 섹션 위의 작은 머리말 — 손글씨. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2
      className="mb-4 text-[24px] font-bold"
      style={{ fontFamily: HAND, color: C.cherry }}
    >
      {children}
    </h2>
  );
}

export default function TearCalendarPage() {
  return (
    <div
      className="-mx-4 rounded-[32px] px-5 py-10 sm:mx-0 sm:px-8 md:px-10"
      style={{ background: C.paper, color: C.cocoaDeep }}
    >
      <Hero />

      <section className="mt-20">
        <Reveal>
          <Eyebrow>이런 앱이에요</Eyebrow>
        </Reveal>
        <Features />
      </section>

      <section className="mt-20">
        <Reveal>
          <Eyebrow>화면</Eyebrow>
        </Reveal>
        <div className="grid grid-cols-3 gap-3 sm:gap-6">
          {SHOTS.map((s, i) => (
            <Reveal key={s.src} delay={i * 0.08}>
              <figure className={`${s.tilt} transition-transform duration-300 hover:rotate-0`}>
                <div
                  className="overflow-hidden rounded-[18px] sm:rounded-[26px]"
                  style={{
                    border: `2px dashed ${C.stitch}`,
                    padding: 4,
                    background: C.paperOld,
                  }}
                >
                  <Image
                    src={s.src}
                    alt={s.alt}
                    width={414}
                    height={900}
                    className="h-auto w-full rounded-[14px] sm:rounded-[22px]"
                  />
                </div>
                <figcaption
                  className="mt-3 text-center text-[15px] leading-tight sm:text-[18px]"
                  style={{ fontFamily: HAND, color: C.cocoaDeep }}
                >
                  {s.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <p
            className="max-w-[18ch] text-[32px] font-bold leading-[1.25] break-keep md:text-[40px]"
            style={{ fontFamily: HAND, color: C.cherryDeep }}
          >
            뜯는 게 곧 &ldquo;봤어&rdquo;라는 대답이 돼요.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[48ch] text-[15px] leading-[1.8] break-keep">
            오늘 페이지를 뜯으면 상대에게 알림이 한 번 갑니다. 그래서 알림이 이
            앱을 굴리는 힘이지만, 잘못 쓰면 재촉이 되어 앱을 망칩니다. 그래서
            처음부터 제동을 걸어 두었습니다. 며칠 밀린 장을 한 번에 뜯어도 알림은
            하나만 갑니다.
          </p>
        </Reveal>
        <div className="mt-8 grid gap-3 sm:grid-cols-3">
          {BRAKES.map((b, i) => (
            <Reveal key={b.big} delay={0.1 + i * 0.06}>
              <div
                className="h-full rounded-[22px] p-5"
                style={{
                  background: i === 1 ? C.mint : C.blushLight,
                  border: `2px dashed ${i === 1 ? C.mintDeep : C.stitch}`,
                }}
              >
                <p
                  className="text-[26px] font-bold leading-none"
                  style={{ fontFamily: HAND, color: i === 1 ? C.cocoaDeep : C.cherry }}
                >
                  {b.big}
                </p>
                <p className="mt-2 text-[14px] leading-[1.55] break-keep">
                  {b.small}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <Eyebrow>자주 묻는 질문</Eyebrow>
        </Reveal>
        <Reveal delay={0.05}>
          <Faq />
        </Reveal>
      </section>

      <section className="mt-16">
        <Reveal>
          <Eyebrow>문의 및 지원</Eyebrow>
          <p className="max-w-[52ch] text-[15px] leading-[1.8] break-keep">
            아직 App Store 에 올라가지 않았고, 출시를 준비하고 있습니다. 올라가면
            이 페이지에 내려받는 곳을 답니다. 그 전이라도 궁금한 점이나 제안은
            아래 이메일로 보내 주세요.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            {[
              { href: `mailto:${CONTACT}`, label: CONTACT, external: true },
              { href: "/tear-calendar/privacy", label: "개인정보처리방침" },
              { href: "/tear-calendar/terms", label: "이용약관" },
              { href: "/tear-calendar/delete-account", label: "계정 삭제" },
            ].map((l) =>
              l.external ? (
                <a
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-4 py-2 text-[14px] font-semibold text-white spring-transition hover:opacity-85"
                  style={{ background: C.cherry }}
                >
                  {l.label} →
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full px-4 py-2 text-[14px] font-medium spring-transition hover:opacity-70"
                  style={{
                    border: `1.5px dashed ${C.stitch}`,
                    color: C.cocoaDeep,
                  }}
                >
                  {l.label} →
                </Link>
              ),
            )}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
