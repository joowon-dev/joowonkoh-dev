import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Faq from "./Faq";
import Features from "./Features";
import Hero from "./Hero";
import Mascot from "./Mascot";
import { Reveal } from "./motion";
import { C, CUTE, STICKER } from "./palette";

export const metadata: Metadata = {
  title: "파스타 한 줌",
  description:
    "저울 없이 파스타 양을 재는 앱. 화면 속 실제 크기 원에 마른 면 다발을 대면 0.5인분부터 5인분까지 맞고, 면과 익힘 정도에 맞춘 타이머까지 켜 줍니다. 파스타 한 줌 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/pasta-ring",
  },
};

const CONTACT = "contact@joowonkoh.com";

const SHOTS = [
  { src: "/pasta-ring/pick.jpg", alt: "브랜드별 면 목록과 즐겨찾기 하트가 있는 면 고르기 화면", caption: "어떤 면?" },
  { src: "/pasta-ring/measure.jpg", alt: "실제 크기 원과 인분 조절 버튼이 있는 양 재기 화면", caption: "원에 대 보기" },
  { src: "/pasta-ring/cook.jpg", alt: "물·소금 양과 익힘 네 단계별 시간이 있는 화면", caption: "얼마나 익힐까" },
  { src: "/pasta-ring/timer.jpg", alt: "냄비 속 마스코트와 남은 시간이 보이는 타이머 화면", caption: "보글보글 타이머" },
];

const STEPS = [
  { big: "1", small: "집에 있는 면 봉지를 골라요" },
  { big: "2", small: "면 다발을 세워 원에 대요" },
  { big: "3", small: "익힘을 고르고 면을 넣어요" },
];

/** 섹션 위의 작은 머리말. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-[24px]" style={{ fontFamily: CUTE, color: C.tomato }}>
      {children}
    </h2>
  );
}

export default function PastaRingPage() {
  return (
    <div
      className="-mx-4 rounded-[32px] px-5 py-10 sm:mx-0 sm:px-8 md:px-10"
      style={{ background: C.paper, color: C.ink }}
    >
      <Hero />

      <section className="mt-20">
        <Reveal>
          <Eyebrow>이렇게 써요</Eyebrow>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-3">
          {STEPS.map((s, i) => (
            <Reveal key={s.big} delay={i * 0.06}>
              <div
                className="flex h-full items-center gap-4 rounded-[20px] p-5"
                style={{ background: i === 1 ? C.tomatoSoft : C.card, ...STICKER }}
              >
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[22px]"
                  style={{ fontFamily: CUTE, background: C.noodle, color: C.ink }}
                >
                  {s.big}
                </span>
                <p className="text-[15px] leading-[1.55] break-keep">{s.small}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-5">
          {SHOTS.map((s, i) => (
            <Reveal key={s.src} delay={i * 0.06}>
              <figure>
                <div className="overflow-hidden rounded-[22px] p-1" style={{ background: C.card, ...STICKER }}>
                  <Image src={s.src} alt={s.alt} width={414} height={900} className="h-auto w-full rounded-[18px]" />
                </div>
                <figcaption className="mt-3 text-center text-[17px] leading-tight" style={{ fontFamily: CUTE }}>
                  {s.caption}
                </figcaption>
              </figure>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <div className="flex flex-wrap items-end gap-4">
            <Mascot size={72} mood="yay" />
            <p className="max-w-[18ch] text-[30px] leading-[1.25] break-keep md:text-[38px]" style={{ fontFamily: CUTE }}>
              원을 줄이지 않아요.
            </p>
          </div>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[50ch] text-[15px] leading-[1.8] break-keep" style={{ color: C.inkSoft }}>
            5인분처럼 원이 화면보다 커지면, 원을 화면에 맞게 줄이는 대신 같은 원으로
            몇 번에 나눠 재라고 알려 드립니다. 원을 줄이는 순간 실제 크기라는 약속이
            깨지기 때문입니다. 면을 대고 있는 동안과 삶는 동안에는 광고도 띄우지
            않습니다.
          </p>
        </Reveal>
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
          <p className="max-w-[52ch] text-[15px] leading-[1.8] break-keep" style={{ color: C.inkSoft }}>
            아직 스토어에 올라가지 않았고, 출시를 준비하고 있습니다. 올라가면 이
            페이지에 내려받는 곳을 답니다. 집에 있는 면이 목록에 없거나 시간이 봉지와
            다르면 아래 이메일로 알려 주세요. 다음 업데이트에 넣겠습니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <a
              href={`mailto:${CONTACT}`}
              className="rounded-full px-4 py-2 text-[14px] font-semibold text-white spring-transition hover:opacity-85"
              style={{ background: C.tomato }}
            >
              {CONTACT} →
            </a>
            {[
              { href: "/pasta-ring/privacy", label: "개인정보처리방침" },
              { href: "/pasta-ring/terms", label: "이용약관" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-[14px] font-medium spring-transition hover:opacity-70"
                style={{ border: `1.5px solid ${C.ink}`, color: C.ink }}
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </Reveal>
      </section>
    </div>
  );
}
