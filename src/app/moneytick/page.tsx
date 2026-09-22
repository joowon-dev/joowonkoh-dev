import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

import Faq from "./Faq";
import Features from "./Features";
import Hero from "./Hero";
import { Reveal } from "./motion";
import Race from "./Race";
import StayCounter from "./StayCounter";
import Ticker from "./Ticker";

export const metadata: Metadata = {
  title: "이게내연봉",
  description:
    "연봉을 넣으면 지금 이 순간 쌓이는 내 돈이 1초 단위로 보이는 iOS 앱. 홈 위젯·잠금화면·StandBy에서도 확인할 수 있고, 궁금한 사람의 연봉을 넣어 나란히 달리는 비교 레이스가 있습니다. 이게내연봉 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/moneytick",
  },
};

const APP_STORE_URL = "https://apps.apple.com/kr/app/id6795989020";

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

export default function MoneyTickPage() {
  return (
    <div style={{ fontFamily: APP_FONT }}>
      <Hero appStoreUrl={APP_STORE_URL}>
        <Image
          src="/moneytick-icon.png"
          alt="이게내연봉 앱 아이콘"
          width={84}
          height={84}
          className="rounded-[20px] border border-[rgba(0,0,0,0.06)] shadow-ambient"
          priority
        />
      </Hero>

      <section className="mt-12">
        <Ticker />
      </section>

      <section className="mt-16">
        <Reveal>
          <Eyebrow>기능</Eyebrow>
        </Reveal>
        <Features />
      </section>

      <section className="mt-16">
        <Reveal>
          <Eyebrow>비교 레이스</Eyebrow>
        </Reveal>
        <Race />
      </section>

      <section className="mt-20">
        <Reveal>
          <p className="max-w-[20ch] text-[28px] font-bold leading-[1.35] tracking-[-0.6px] break-keep text-black md:text-[34px]">
            회의가 길어질 때 화면을 보면, 그 회의의 가격이 보입니다.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[46ch] text-[15px] leading-[1.8] tracking-[-0.24px] break-keep text-[rgba(60,60,67,0.7)]">
            월급날에만 잠깐 실감하던 숫자를 매일 보게 만들고 싶어서 만들었습니다.
            넣은 연봉은 이 기기 밖으로 나가지 않습니다.
          </p>
        </Reveal>
        <Reveal delay={0.15} className="mt-8">
          <StayCounter />
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
              href="mailto:contact@joowonkoh.com"
              className="text-[15px] font-medium tracking-[-0.24px] text-[rgba(60,60,67,0.75)] spring-transition hover:text-[#248A3D]"
            >
              contact@joowonkoh.com →
            </a>
            <Link
              href="/moneytick/privacy"
              className="text-[15px] font-medium tracking-[-0.24px] text-[rgba(60,60,67,0.75)] spring-transition hover:text-[#248A3D]"
            >
              개인정보처리방침 →
            </Link>
          </div>
        </Reveal>
      </section>
    </div>
  );
}
