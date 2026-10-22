import type { Metadata } from "next";
import Link from "next/link";

import Faq from "./Faq";
import Features from "./Features";
import Hero from "./Hero";
import { Reveal } from "./motion";
import { C, CARD } from "./palette";
import StoreButtons from "./StoreButtons";

export const metadata: Metadata = {
  title: "네밥내밥",
  description:
    "아침·점심·저녁을 식판 한 칸씩 사진으로 채우고, 가족이나 친구와 서로 챙기는 앱. iOS·안드로이드 앱 네밥내밥 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/yourmealmymeal",
  },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "네밥내밥",
    title: "네밥내밥 — 밥 먹었냐고 묻는 대신",
    description: "아침·점심·저녁을 식판 한 칸씩 사진으로 채우고, 가족이나 친구와 서로 챙기는 앱.",
    url: "https://joowonkoh.com/yourmealmymeal",
    images: [
      {
        url: "https://joowonkoh.com/yourmealmymeal/og-main-v3.png",
        width: 1200,
        height: 630,
        alt: "노른자 바탕에 흰 식판, 점심 칸만 토마토색으로 채운 네밥내밥 소개 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "네밥내밥 — 밥 먹었냐고 묻는 대신",
    description: "아침·점심·저녁을 식판 한 칸씩 사진으로 채우고, 가족이나 친구와 서로 챙기는 앱.",
    images: ["https://joowonkoh.com/yourmealmymeal/og-main-v3.png"],
  },
};

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

export default function YourMealMyMealPage() {
  return (
    <div className="text-center">
      <Hero />

      <section className="mt-28">
        <Reveal>
          <Heading>같이 먹는 밥상</Heading>
          <Lead>초대코드로 모인 2~6명의 식판이 한 상에 놓여요. 누가 아직 안 먹었는지 묻지 않아도 보여요.</Lead>
        </Reveal>
      </section>

      <section className="mt-20">
        <Reveal>
          <Heading>이런 걸 해요</Heading>
        </Reveal>
        <Reveal delay={0.06} className="mt-6">
          <Features />
        </Reveal>
      </section>

      <section className="mt-24">
        <Reveal>
          <p className="mx-auto max-w-[18ch] text-[26px] font-bold leading-[1.35] tracking-[-0.02em] break-keep md:text-[30px]" style={{ color: C.ink }}>
            &ldquo;밥 먹었어?&rdquo; 대신, <span style={{ color: C.tomato }}>빈 칸</span>이 먼저 말해 줘요.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mx-auto mt-6 max-w-[40ch] space-y-3 text-[16px] leading-[1.85] break-keep" style={{ color: C.body }}>
            <p>
              혼자 사는 사람에게 밥은 가장 먼저 대충 때우게 되는 일이에요. 확인할 방법은 전화해서 묻는 것뿐이고,
              물으면 대체로 &ldquo;먹었어&rdquo;라는 답이 와요.
            </p>
            <p>
              그래서 묻는 대신 보이게 만들었어요. 잔소리를 자동화한 앱이 아니라, 안부를 묻는 수고를 덜어 주는 앱이에요.
              그래서 빈 칸을 나무라지 않아요. 끼니는 셋이고 간식은 덤이에요.
            </p>
          </div>
        </Reveal>
      </section>

      <section className="mt-24">
        <Reveal>
          <Heading>자주 묻는 질문</Heading>
        </Reveal>
        <Reveal delay={0.05} className="mt-6">
          <Faq />
        </Reveal>
      </section>

      <section className="mt-24">
        <Reveal>
          <div className="mx-auto flex max-w-[440px] flex-col items-center rounded-[28px] bg-white px-5 py-8 sm:px-8" style={CARD}>
            <Heading>오늘 저녁은 같이 먹는 기분으로</Heading>
            <p className="mt-2 text-[15px] leading-[1.7] break-keep" style={{ color: C.body }}>
              기능 제안이나 문의는 언제든 메일로 보내 주세요.
            </p>
            <StoreButtons className="mt-6" />
            <a
              href={`mailto:${CONTACT}`}
              className="mt-2.5 flex h-[54px] w-full items-center justify-center rounded-full text-[16px] font-semibold transition-transform hover:-translate-y-0.5 active:translate-y-0"
              style={{ background: C.yolk, color: C.ink }}
            >
              {CONTACT}
            </a>
            <div className="mt-2.5 flex w-full gap-2.5">
              <Link
                href="/yourmealmymeal/privacy"
                className="flex h-[54px] min-w-0 flex-1 items-center justify-center rounded-full px-3 text-[15px] font-medium transition-transform hover:-translate-y-0.5 active:translate-y-0"
                style={OUTLINE}
              >
                개인정보처리방침
              </Link>
              <Link
                href="/yourmealmymeal/delete-account"
                className="flex h-[54px] min-w-0 flex-1 items-center justify-center rounded-full px-3 text-[15px] font-medium transition-transform hover:-translate-y-0.5 active:translate-y-0"
                style={OUTLINE}
              >
                계정 삭제 안내
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
