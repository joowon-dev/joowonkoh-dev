import type { Metadata } from "next";
import Link from "next/link";

import Faq from "./Faq";
import Features from "./Features";
import Hero from "./Hero";
import Mascot from "./Mascot";
import { Reveal } from "./motion";
import { C, CUTE, STICKER } from "./palette";

export const metadata: Metadata = {
  title: "와파냥",
  description:
    "지금 연결된 와이파이의 속도와 보안을 한 번에 진단하는 앱. 암호 방식, HTTPS 가로채기, DNS 변조, 로그인 페이지, 기기 수와 다운로드·업로드·핑을 재고, 빠를수록 고양이가 꼬리를 세웁니다. 와파냥 소개 및 지원 페이지입니다.",
  alternates: {
    canonical: "https://joowonkoh.com/wapanyang",
  },
};

const CONTACT = "contact@joowonkoh.com";

const STEPS = [
  { big: "1", small: "확인하고 싶은 와이파이에 붙어요" },
  { big: "2", small: "진단 버튼을 한 번 눌러요" },
  { big: "3", small: "꼬리 높이와 표정을 봐요" },
];

const GRADES = [
  { mood: "happy" as const, label: "안전", line: "마음 놓고 써도 돼요", color: C.good, soft: C.goodSoft },
  { mood: "puzzled" as const, label: "주의", line: "중요한 로그인은 잠깐 미뤄요", color: C.fair, soft: C.fairSoft },
  { mood: "shocked" as const, label: "위험", line: "은행·결제는 모바일 데이터로", color: C.poor, soft: C.poorSoft },
];

/** 섹션 위의 작은 머리말. */
function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 text-[24px]" style={{ fontFamily: CUTE, color: C.ink }}>
      <span style={{ background: C.gold, padding: "0 6px" }}>{children}</span>
    </h2>
  );
}

export default function WapanyangPage() {
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
              <div className="flex h-full items-center gap-4 rounded-[20px] p-5" style={{ background: C.card, ...STICKER }}>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full text-[22px]"
                  style={{ fontFamily: CUTE, background: C.gold, color: C.ink, border: `2px solid ${C.ink}` }}
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
          <Eyebrow>표정이 곧 보안 등급</Eyebrow>
        </Reveal>
        <div className="grid gap-3 sm:grid-cols-3">
          {GRADES.map((g, i) => (
            <Reveal key={g.label} delay={i * 0.06}>
              <div className="h-full rounded-[20px] p-4" style={{ background: C.card, ...STICKER }}>
                <div className="flex justify-center">
                  <Mascot spread={0.55} mood={g.mood} width={180} />
                </div>
                <p className="mt-2 text-center text-[22px]" style={{ fontFamily: CUTE, color: g.color }}>
                  {g.label}
                </p>
                <p className="mt-1 text-center text-[14px] break-keep" style={{ color: C.inkSoft }}>
                  {g.line}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mt-20">
        <Reveal>
          <Eyebrow>이런 걸 봐요</Eyebrow>
        </Reveal>
        <Features />
      </section>

      <section className="mt-20">
        <Reveal>
          <p className="max-w-[20ch] text-[30px] leading-[1.25] break-keep md:text-[38px]" style={{ fontFamily: CUTE }}>
            재는 동안에는 광고를 내려요.
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <p className="mt-5 max-w-[50ch] text-[15px] leading-[1.8] break-keep" style={{ color: C.inkSoft }}>
            광고도 데이터를 씁니다. 측정하는 동안 광고가 내려받아지면 속도가 실제보다
            느리게 나오기 때문에, 진단 중에는 배너를 내리고 전면 광고도 띄우지
            않습니다. 진단 기록은 기기 안에만 남고, 결과를 공유할 때는 공인 IP 를
            카드에서 뺍니다.
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
            페이지에 내려받는 곳을 답니다. 결과가 이상하거나 궁금한 점이 있으면 아래
            이메일로 알려 주세요. 휴대폰 기종과 운영체제 버전을 함께 적어 주시면 더
            빨리 고칠 수 있습니다.
          </p>
          <div className="mt-5 flex flex-wrap gap-2.5">
            <a
              href={`mailto:${CONTACT}`}
              className="rounded-full px-4 py-2 text-[14px] font-semibold spring-transition hover:opacity-85"
              style={{ background: C.ink, color: C.card }}
            >
              {CONTACT} →
            </a>
            {[
              { href: "/wapanyang/privacy", label: "개인정보처리방침" },
              { href: "/wapanyang/terms", label: "이용약관" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-full px-4 py-2 text-[14px] font-medium spring-transition hover:opacity-70"
                style={{ border: `2px solid ${C.ink}`, color: C.ink, background: C.card }}
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
