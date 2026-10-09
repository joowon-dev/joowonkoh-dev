"use client";

import { motion } from "motion/react";
import { useState } from "react";

import Mascot, { type Mood } from "./Mascot";
import { EASE } from "./motion";
import { C, CUTE, STICKER } from "./palette";

/**
 * 첫 화면 — 설명보다 고양이를 먼저 만져 보게 한다.
 *
 * 왼쪽은 이름과 한 줄, 오른쪽은 속도·보안을 바꿔 볼 수 있는 고양이. 표정은 보안 등급, 속도는 앱과 같은
 * 용도 판정 한 줄(src/core/mascot.ts 의 headline, 기준은 usageVerdict.ts)로 보여 준다.
 */

const RISE = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

const SPEEDS = [2, 4, 20, 300];
const GRADES: { mood: Mood; label: string; color: string; soft: string }[] = [
  { mood: "happy", label: "안전", color: C.good, soft: C.goodSoft },
  { mood: "puzzled", label: "주의", color: C.fair, soft: C.fairSoft },
  { mood: "shocked", label: "위험", color: C.poor, soft: C.poorSoft },
];

/** 앱의 headline 과 같다: 넷플릭스 4K 25Mbps, 유튜브 HD 5Mbps, 웹서핑 3Mbps 이상. */
function headline(mbps: number): string {
  if (mbps >= 25) return "넷플릭스 4K 거뜬해요";
  if (mbps >= 5) return "유튜브 HD는 괜찮아요";
  if (mbps >= 3) return "웹서핑 정도는 돼요";
  return "많이 느려요";
}

function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={on}
      className="rounded-full px-3 py-1.5 text-[15px] spring-transition"
      style={{
        fontFamily: CUTE,
        border: `2px solid ${C.ink}`,
        background: on ? C.ink : C.card,
        color: on ? C.card : C.ink,
      }}
    >
      {children}
    </button>
  );
}

function CatDemo() {
  const [mbps, setMbps] = useState(100);
  const [grade, setGrade] = useState(0);
  const g = GRADES[grade];

  return (
    <div className="w-full max-w-[340px] rounded-[24px] p-5" style={{ background: C.card, ...STICKER }}>
      <div className="flex items-center justify-between">
        <span className="text-[15px]" style={{ fontFamily: CUTE }}>
          {mbps}Mbps · {headline(mbps)}
        </span>
        <span
          className="rounded-full px-2.5 py-0.5 text-[14px]"
          style={{ fontFamily: CUTE, background: g.soft, color: g.color, border: `2px solid ${g.color}` }}
        >
          {g.label}
        </span>
      </div>
      <div className="mt-2 flex justify-center">
        <Mascot mood={g.mood} width={240} />
      </div>
      <p className="mt-3 text-[13px]" style={{ color: C.inkSoft }}>
        다운로드 속도
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {SPEEDS.map((s) => (
          <Chip key={s} on={mbps === s} onClick={() => setMbps(s)}>
            {s}Mbps
          </Chip>
        ))}
      </div>
      <p className="mt-3 text-[13px]" style={{ color: C.inkSoft }}>
        보안 등급
      </p>
      <div className="mt-1.5 flex flex-wrap gap-1.5">
        {GRADES.map((x, i) => (
          <Chip key={x.label} on={grade === i} onClick={() => setGrade(i)}>
            {x.label}
          </Chip>
        ))}
      </div>
    </div>
  );
}

export default function Hero() {
  return (
    <motion.div
      className="grid items-center gap-10 md:grid-cols-[1fr_auto]"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <div>
        <motion.div variants={RISE} transition={{ duration: 0.6, ease: EASE }} className="mb-4">
          <span
            className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{ background: C.gold, color: C.ink, border: `2px solid ${C.ink}` }}
          >
            iOS · Android · 와이파이 진단
          </span>
        </motion.div>

        <motion.h1
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[46px] leading-[1.05] md:text-[54px]"
          style={{ fontFamily: CUTE, color: C.ink }}
        >
          와파냥
        </motion.h1>

        <motion.p
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-3 text-[22px] leading-snug md:text-[24px]"
          style={{ fontFamily: CUTE, color: C.ink }}
        >
          이 와이파이, <span style={{ background: C.gold, padding: "0 4px" }}>빠르고 안전한지</span> 고양이가 봐 줄게요
        </motion.p>

        <motion.p
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-5 max-w-[40ch] text-[15px] leading-[1.8] break-keep"
          style={{ color: C.inkSoft }}
        >
          지금 붙은 와이파이를 한 번 눌러 속도와 보안을 함께 진단합니다. 안전하면
          고양이가 웃고, 위험하면 깜짝 놀란 얼굴로 바로 할 일을 알려 드려요. 카페
          공용 와이파이도, 집 와이파이도요.
        </motion.p>

        <motion.div
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-7 flex flex-wrap items-center gap-3"
        >
          <span
            className="rounded-[18px] px-6 py-3 text-[19px]"
            style={{ fontFamily: CUTE, background: C.gold, color: C.ink, ...STICKER }}
          >
            App Store 출시 준비 중
          </span>
          <span className="text-[13px]" style={{ color: C.inkSoft }}>
            iPhone · Android · 무료
          </span>
        </motion.div>
      </div>

      <motion.div variants={RISE} transition={{ duration: 0.8, ease: EASE }} className="flex justify-center">
        <CatDemo />
      </motion.div>
    </motion.div>
  );
}
