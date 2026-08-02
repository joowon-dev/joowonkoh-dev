"use client";

import { motion } from "motion/react";

/** 표정. 단계 이름이 아니라 표정 이름이다 — 이 컴포넌트는 세션을 모른다. */
export type Mood = "calm" | "strain" | "breathe" | "happy";

const SPRING = { type: "spring", stiffness: 260, damping: 18 } as const;

/**
 * motion은 SVG에 transform-box: fill-box를 건다. 그래서 transform-origin은
 * SVG 좌표가 아니라 그 요소 자기 바운딩박스 기준이 된다. 배처럼 자기 중심에서
 * 눌려야 하는 것은 기본값(50% 50%)이 정답이라 origin을 아예 주지 않고,
 * 꼬리처럼 한쪽 끝에서 돌아야 하는 것만 박스 모서리를 집어준다.
 */
const TAIL_ROOT = { originX: "0%", originY: "0%" } as const;

/** 0~1로 자른다 */
function clamp01(v: number): number {
  return Math.min(1, Math.max(0, v));
}

/** 눈: 표정마다 다르게 그린다. 힘줄 때만 세기에 따라 이어서 변한다. */
function Eyes({ mood, intensity }: { mood: Mood; intensity: number }) {
  if (mood === "strain") {
    // 힘이 들어갈수록 눈이 감긴다. 뜬 눈을 세로로 눌러 실눈에서 감은 선까지
    // 이어지게 한다 — 감았다/떴다 두 장으로 갈아끼우면 5초가 정지 화면이 된다.
    const lid = 1 - intensity * 0.88;
    // 눈썹은 막판에만 뚜렷해진다. 처음부터 있으면 화난 얼굴로 읽힌다.
    const brow = clamp01(intensity * 1.8 - 0.7);
    return (
      <>
        <motion.ellipse cx={84} cy={96} rx={7} ry={7} fill="#3b2b26" animate={{ scaleY: lid }} transition={SPRING} />
        <motion.ellipse cx={136} cy={96} rx={7} ry={7} fill="#3b2b26" animate={{ scaleY: lid }} transition={SPRING} />
        <motion.g
          stroke="#3b2b26"
          strokeWidth={4}
          strokeLinecap="round"
          fill="none"
          animate={{ opacity: brow }}
          transition={SPRING}
        >
          <path d="M72 80 q12 -6 23 -2" />
          <path d="M148 80 q-12 -6 -23 -2" />
        </motion.g>
      </>
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
  if (mood === "happy") {
    // 웃는 눈 — 축하 화면의 표정이라 차분한 평상시와 명확히 구별되어야 함
    return (
      <g stroke="#3b2b26" strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M74 98 q10 -8 20 0" />
        <path d="M126 98 q10 -8 20 0" />
      </g>
    );
  }
  // calm — 뜬 눈. 동공과 하이라이트가 있다
  return (
    <g fill="#3b2b26">
      <ellipse cx={84} cy={96} rx={7} ry={7} />
      <ellipse cx={136} cy={96} rx={7} ry={7} />
      <circle cx={86.5} cy={93} r={2.5} fill="#fff" />
      <circle cx={138.5} cy={93} r={2.5} fill="#fff" />
    </g>
  );
}

export function Cat({
  mood,
  strain: rawStrain = 0,
}: {
  mood: Mood;
  /** 힘주는 세기 0~1. 표정과 배 눌림이 이 값 하나로 함께 움직인다. */
  strain?: number;
}) {
  const strain = mood === "strain" ? clamp01(rawStrain) : 0;

  // 배가 눌리면 세로로 납작해지고 옆으로 퍼진다. 부피가 보존되는 것처럼 보인다.
  // 몸통(rx 78)보다 넉넉히 좁게 두어 최대로 퍼져도 몸 밖으로 안 나간다.
  const bellyScaleY = 1 - strain * 0.22;
  const bellyScaleX = 1 + strain * 0.08;

  // 입은 세기가 절반을 넘을 때부터 앙다문 모양으로 바뀐다.
  const gritted = clamp01((strain - 0.45) / 0.35);

  return (
    <svg
      viewBox="0 0 220 380"
      className="h-full w-full"
      role="img"
      aria-label="배를 보이고 누운 고양이"
    >
      {/* 꼬리 — 힘줄수록 말린다. 뿌리(186,300)가 박스 왼쪽 위라 origin은 0% 0%다. */}
      <motion.path
        d="M186 300 q34 14 22 46"
        stroke="#f4d9c0"
        strokeWidth={16}
        strokeLinecap="round"
        fill="none"
        animate={{ rotate: -14 * strain }}
        transition={SPRING}
        style={TAIL_ROOT}
      />

      {/* 뒷발 */}
      <ellipse cx={78} cy={322} rx={22} ry={16} fill="#f4d9c0" />
      <ellipse cx={142} cy={322} rx={22} ry={16} fill="#f4d9c0" />

      {/* 몸통 */}
      <ellipse cx={110} cy={228} rx={78} ry={100} fill="#f4d9c0" />

      {/* 배 — 누르는 곳. 자기 중심에서 눌려야 하므로 origin을 주지 않는다.
          실제 포인터는 바깥 컨테이너가 받는다. */}
      <motion.ellipse
        data-belly
        cx={110}
        cy={232}
        rx={56}
        ry={74}
        fill="#fff3e6"
        animate={{ scaleY: bellyScaleY, scaleX: bellyScaleX }}
        transition={SPRING}
      />

      {/* 앞발 — 힘줄수록 오므린다 */}
      <motion.g animate={{ y: -8 * strain }} transition={SPRING}>
        <ellipse cx={44} cy={186} rx={18} ry={26} fill="#f4d9c0" />
        <ellipse cx={176} cy={186} rx={18} ry={26} fill="#f4d9c0" />
      </motion.g>

      {/* 머리 — 힘줄수록 턱을 당긴다 */}
      <motion.g animate={{ y: 6 * strain }} transition={SPRING}>
        {/* 귀 */}
        <path d="M62 74 l-10 -34 32 14 z" fill="#f4d9c0" />
        <path d="M158 74 l10 -34 -32 14 z" fill="#f4d9c0" />
        {/* 얼굴 */}
        <ellipse cx={110} cy={96} rx={58} ry={52} fill="#f9e4d0" />
        <Eyes mood={mood} intensity={strain} />
        {/* 볼 — 힘줄수록 진해지고, 웃을 때는 흐릿하게 */}
        <motion.g
          animate={{ opacity: mood === "strain" ? strain : mood === "happy" ? 0.55 : 0 }}
          transition={{ duration: 0.2 }}
          fill="#f6a6a0"
        >
          <ellipse cx={68} cy={112} rx={12} ry={7} />
          <ellipse cx={152} cy={112} rx={12} ry={7} />
        </motion.g>
        {/* 코 */}
        <path d="M105 108 h10 l-5 6 z" fill="#e08f86" />
        {/* 입 — 심호흡은 동그랗게, 힘줄 때는 앙다물게, 그 외에는 w자 */}
        {mood === "breathe" ? (
          <ellipse cx={110} cy={124} rx={7} ry={9} fill="#3b2b26" />
        ) : (
          <>
            <motion.path
              d="M110 116 q-8 10 -16 2 M110 116 q8 10 16 2"
              stroke="#3b2b26"
              strokeWidth={4}
              strokeLinecap="round"
              fill="none"
              animate={{ opacity: 1 - gritted }}
              transition={SPRING}
            />
            <motion.g animate={{ opacity: gritted }} transition={SPRING}>
              <rect x={97} y={118} width={26} height={11} rx={5} fill="#3b2b26" />
              <rect x={100} y={121} width={20} height={2.5} fill="#fff" />
            </motion.g>
          </>
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
