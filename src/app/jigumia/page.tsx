import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "JIGUMIA (지구미아)",
  description:
    "올리브영·무신사·29CM·쿠팡·SSG닷컴 등 인기 브랜드의 세일을 캘린더 하나로 모아 보는 앱. iOS 앱 JIGUMIA 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/jigumia",
  },
};

const FEATURES = [
  {
    title: "브랜드 세일 캘린더",
    body: "올리브영·무신사·29CM·쿠팡·SSG닷컴 등 여러 브랜드의 세일 일정을 월별 달력 하나에서 한눈에 확인합니다.",
  },
  {
    title: "날짜별 세일 모아보기",
    body: "달력에서 날짜를 탭하면 그날 진행되는 모든 브랜드의 세일을 한 번에 볼 수 있습니다.",
  },
  {
    title: "진행 중 · 다가오는 세일",
    body: "지금 진행 중인 세일과 곧 시작될 세일을 홈 화면에서 실시간으로 모아 보여줍니다.",
  },
  {
    title: "세일 상세 · 바로가기",
    body: "할인율·혜택·기간을 확인하고, 버튼 한 번으로 해당 쇼핑몰로 바로 이동합니다.",
  },
  {
    title: "관심 브랜드 추적",
    body: "좋아하는 브랜드만 골라 담아, 그 브랜드의 세일 일정만 모아서 관리할 수 있습니다.",
  },
  {
    title: "세일 알림",
    body: "관심 브랜드의 세일이 시작되기 전 푸시 알림으로 미리 알려드립니다. 더 이상 세일을 놓치지 마세요.",
  },
];

export default function JigumiaPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        iOS App
      </span>

      <div className="flex items-center gap-5">
        <Image
          src="/jigumia-icon.png"
          alt="JIGUMIA 앱 아이콘"
          width={84}
          height={84}
          className="rounded-2xl border border-border shadow-ambient"
        />
        <div>
          <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
            JIGUMIA
          </h1>
          <p className="mt-1 text-sm text-text-muted">
            지금이야! — 브랜드 세일을 모아 보는 캘린더
          </p>
        </div>
      </div>

      <p className="mt-6 max-w-[60ch] leading-[1.85] text-text-secondary">
        JIGUMIA(지구미아)는 올리브영, 무신사, 29CM, 쿠팡, SSG닷컴 등 인기 브랜드의
        할인 일정을 캘린더 하나에 모아 보는 모바일 앱입니다. &ldquo;그 브랜드 세일
        언제였지?&rdquo; 하고 여러 쇼핑몰 앱을 일일이 확인하던 시간을 줄이기 위해
        만들었습니다. 달력만 열면 이번 달 모든 브랜드 세일이 한눈에 보이고,
        관심 브랜드의 세일은 시작 전 알림으로 미리 챙길 수 있습니다.
      </p>

      <div className="mt-6">
        <span className="inline-block rounded-full border border-border bg-card-bg px-4 py-2 text-sm font-medium text-text-secondary shadow-ambient">
          App Store 출시 준비 중
        </span>
      </div>

      <section className="mt-14">
        <h2 className="mb-5 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          Features
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {FEATURES.map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient"
            >
              <h3 className="mb-2 font-display text-base font-semibold text-text-primary">
                {item.title}
              </h3>
              <p className="text-sm leading-[1.7] text-text-secondary">
                {item.body}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="mb-4 text-[11px] font-semibold uppercase tracking-[0.15em] text-text-muted">
          문의 및 지원
        </h2>
        <p className="max-w-[55ch] text-sm leading-[1.8] text-text-secondary">
          앱 사용 중 문제가 있거나 기능 제안, 문의 사항이 있다면 아래 이메일로
          연락 주세요. 가능한 한 빠르게 답장드리겠습니다.
        </p>
        <div className="mt-4 flex flex-wrap gap-5">
          <a
            href="mailto:hello@joowonkoh.com"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            hello@joowonkoh.com →
          </a>
          <Link
            href="/jigumia/privacy"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            개인정보처리방침 →
          </Link>
          <Link
            href="/jigumia/terms"
            className="text-sm font-medium text-text-secondary spring-transition hover:text-accent"
          >
            이용약관 →
          </Link>
        </div>
      </section>
    </div>
  );
}
