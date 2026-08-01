"use client";

import { motion } from "motion/react";

/** 표정. 단계 이름이 아니라 표정 이름이다 — 이 컴포넌트는 세션을 모른다. */
export type Mood = "calm" | "strain" | "breathe" | "happy";

const SPRING = { type: "spring", stiffness: 260, damping: 18 } as const;

/** 눈: 표정마다 다르게 그린다. 감은 눈은 선, 뜬 눈은 원. */
function Eyes({ mood }: { mood: Mood }) {
  if (mood === "strain") {
    // 꽉 감은 눈 — 힘주는 중
    return (
      <g stroke="#3b2b26" strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M74 96 q10 -9 20 0" />
        <path d="M126 96 q10 -9 20 0" />
      </g>
    );
  }
  if (mood === "breathe") {
    // 편히 감은 눈 — 쉬는 중
    return (
      <g stroke="#3b2b26" strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M74 98 q10 7 20 0" />
        <path d="M126 98 q10 7 20 0" />
      </g>
    );
  }
  // calm·happy — 뜬 눈. happy는 하이라이트가 더 크다.
  const highlight = mood === "happy" ? 4 : 2.5;
  return (
    <g fill="#3b2b26">
      <ellipse cx={84} cy={96} rx={7} ry={mood === "happy" ? 9 : 7} />
      <ellipse cx={136} cy={96} rx={7} ry={mood === "happy" ? 9 : 7} />
      <circle cx={86.5} cy={93} r={highlight} fill="#fff" />
      <circle cx={138.5} cy={93} r={highlight} fill="#fff" />
    </g>
  );
}

export function Cat({ mood, squish }: { mood: Mood; squish: number }) {
  // 배가 눌리면 세로로 납작해지고 옆으로 퍼진다. 부피가 보존되는 것처럼 보인다.
  const bellyScaleY = 1 - squish * 0.22;
  const bellyScaleX = 1 + squish * 0.08;

  return (
    <svg
      viewBox="0 0 220 380"
      className="h-full w-full"
      role="img"
      aria-label="배를 보이고 누운 고양이"
    >
      {/* 꼬리 — 힘줄 때 살짝 말린다 */}
      <motion.path
        d="M186 300 q34 14 22 46"
        stroke="#f4d9c0"
        strokeWidth={16}
        strokeLinecap="round"
        fill="none"
        animate={{ rotate: mood === "strain" ? -14 : 0 }}
        transition={SPRING}
        style={{ originX: "186px", originY: "300px" }}
      />

      {/* 뒷발 */}
      <ellipse cx={78} cy={322} rx={22} ry={16} fill="#f4d9c0" />
      <ellipse cx={142} cy={322} rx={22} ry={16} fill="#f4d9c0" />

      {/* 몸통 */}
      <ellipse cx={110} cy={228} rx={78} ry={100} fill="#f4d9c0" />

      {/* 배 — 누르는 곳. 실제 포인터는 바깥 컨테이너가 받는다. */}
      <motion.ellipse
        data-belly
        cx={110}
        cy={232}
        rx={56}
        ry={74}
        fill="#fff3e6"
        animate={{ scaleY: bellyScaleY, scaleX: bellyScaleX }}
        transition={SPRING}
        style={{ originX: "110px", originY: "232px" }}
      />

      {/* 앞발 — 힘줄 때 오므린다 */}
      <motion.g animate={{ y: mood === "strain" ? -8 : 0 }} transition={SPRING}>
        <ellipse cx={44} cy={186} rx={18} ry={26} fill="#f4d9c0" />
        <ellipse cx={176} cy={186} rx={18} ry={26} fill="#f4d9c0" />
      </motion.g>

      {/* 머리 — 힘줄 때 턱을 당긴다 */}
      <motion.g animate={{ y: mood === "strain" ? 6 : 0 }} transition={SPRING}>
        {/* 귀 */}
        <path d="M62 74 l-10 -34 32 14 z" fill="#f4d9c0" />
        <path d="M158 74 l10 -34 -32 14 z" fill="#f4d9c0" />
        {/* 얼굴 */}
        <ellipse cx={110} cy={96} rx={58} ry={52} fill="#f9e4d0" />
        <Eyes mood={mood} />
        {/* 볼 — 힘줄 때만 붉어진다 */}
        <motion.g
          animate={{ opacity: mood === "strain" ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          fill="#f6a6a0"
        >
          <ellipse cx={68} cy={112} rx={12} ry={7} />
          <ellipse cx={152} cy={112} rx={12} ry={7} />
        </motion.g>
        {/* 코 */}
        <path d="M105 108 h10 l-5 6 z" fill="#e08f86" />
        {/* 입 — 심호흡할 때는 동그랗게, 아니면 w자 */}
        {mood === "breathe" ? (
          <ellipse cx={110} cy={124} rx={7} ry={9} fill="#3b2b26" />
        ) : (
          <path
            d="M110 116 q-8 10 -16 2 M110 116 q8 10 16 2"
            stroke="#3b2b26"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {/* 수염 */}
        <g stroke="#e0c4ad" strokeWidth={3} strokeLinecap="round">
          <path d="M52 104 h-22" />
          <path d="M52 114 h-20" />
          <path d="M168 104 h22" />
          <path d="M168 114 h20" />
        </g>
      </motion.g>
    </svg>
  );
}
