import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Faq from "./Faq";
import Features from "./Features";
import Hero from "./Hero";
import { Reveal } from "./motion";
import { BODY, C, DISPLAY, STICKER, YOLK_SHADOW } from "./palette";
import Table from "./Table";

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
        url: "https://joowonkoh.com/yourmealmymeal/og-main.jpg",
        width: 1200,
        height: 630,
        alt: "민트 식판에 아침·점심·저녁·간식이 차려진 네밥내밥 소개 이미지",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "네밥내밥 — 밥 먹었냐고 묻는 대신",
    description: "아침·점심·저녁을 식판 한 칸씩 사진으로 채우고, 가족이나 친구와 서로 챙기는 앱.",
    images: ["https://joowonkoh.com/yourmealmymeal/og-main.jpg"],
  },
};

const CONTACT = "contact@joowonkoh.com";

/** 섹션 머리말. 앱의 큰 제목처럼 노른자 한 겹을 깐다. */
function Heading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-5 text-[28px] leading-[1.2]" style={{ fontFamily: DISPLAY, textShadow: YOLK_SHADOW }}>
      {children}
    </h2>
  );
}

export default function YourMealMyMealPage() {
  return (
    <>
      <Hero
        icon={
          <Image
            src="/yourmealmymeal-icon.png"
            alt="네밥내밥 앱 아이콘"
            width={84}
            height={84}
            className="rounded-[20px]"
            style={STICKER}
            priority
          />
        }
      />

      <section className="mt-24">
        <Reveal>
          <Heading>같이 먹는 밥상</Heading>
          <p className="mb-6 max-w-[40ch] text-[16px] leading-[1.75] break-keep" style={{ fontFamily: BODY, color: C.body }}>
            초대코드로 모인 2~6명의 식판이 한 상에 놓여요. 누가 아직 안 먹었는지 묻지 않아도 보여요.
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <Table />
        </Reveal>
      </section>

      <section className="mt-24">
        <Reveal>
          <Heading>이런 걸 해요</Heading>
        </Reveal>
        <Features />
      </section>

      <section className="mt-24">
        <Reveal>
          <p className="max-w-[18ch] text-[30px] leading-[1.3] break-keep md:text-[36px]" style={{ fontFamily: DISPLAY }}>
            &ldquo;밥 먹었어?&rdquo; 대신, <span style={{ color: C.tomato }}>빈 칸</span>이 먼저 말해 줘요.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <div className="mt-6 max-w-[46ch] space-y-3 text-[16px] leading-[1.85] break-keep" style={{ fontFamily: BODY, color: C.body }}>
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
        <Reveal delay={0.05}>
          <Faq />
        </Reveal>
      </section>

      <section className="mt-24">
        <Reveal>
          <div className="rounded-[22px] p-6" style={{ ...STICKER, background: C.tray }}>
            <h2 className="text-[24px]" style={{ fontFamily: DISPLAY }}>
              곧 만나요 🍚
            </h2>
            <p className="mt-2 text-[15px] leading-[1.75] break-keep" style={{ fontFamily: BODY, color: C.ink }}>
              App Store와 Google Play에 올리는 중이에요. 올라가면 여기에 내려받는 곳을 달게요.
              기능 제안이나 문의는 언제든 메일로 보내 주세요.
            </p>
            <div className="mt-5 flex flex-wrap gap-3" style={{ fontFamily: BODY }}>
              <a
                href={`mailto:${CONTACT}`}
                className="rounded-full px-5 py-2 text-[15px] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: C.yolk, border: `2.5px solid ${C.ink}`, boxShadow: `0 2px 0 ${C.ink}` }}
              >
                {CONTACT}
              </a>
              <Link
                href="/yourmealmymeal/privacy"
                className="rounded-full px-5 py-2 text-[15px] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: C.surface, border: `2.5px solid ${C.ink}`, boxShadow: `0 2px 0 ${C.ink}` }}
              >
                개인정보처리방침
              </Link>
              <Link
                href="/yourmealmymeal/delete-account"
                className="rounded-full px-5 py-2 text-[15px] transition-transform hover:-translate-y-0.5 active:translate-y-0"
                style={{ background: C.surface, border: `2.5px solid ${C.ink}`, boxShadow: `0 2px 0 ${C.ink}` }}
              >
                계정 삭제 안내
              </Link>
            </div>
          </div>
        </Reveal>
      </section>
    </>
  );
}
