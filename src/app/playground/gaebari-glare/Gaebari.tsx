"use client";

import type { LookDirection } from "./detect";
import type { GlareLevel } from "./state";

/**
 * 상태별 개바리 표시.
 *
 * 스펙은 정적 PNG 4장으로 시작한다고 했지만 에셋이 없어 인라인 SVG로 그렸다.
 * 교체 전제는 그대로다 — 나중에 그림이나 짧은 webm 루프로 갈아끼울 때
 * 이 파일 하나만 바꾸면 된다. 바깥은 level prop만 넘긴다.
 *
 * 째려보는 쪽은 direction으로 받는다. 눈동자·고개가 같은 방향으로 함께 움직여야
 * "저쪽을 본다"로 읽힌다 — 눈만 돌아가면 그냥 사시처럼 보인다.
 */

interface Pose {
  /** 눈동자 가로 이동(px) */
  pupil: number;
  /** 위 눈꺼풀이 내려온 정도(px). 클수록 눈매가 사나워진다. */
  lid: number;
  /** 눈썹 각도(deg). 안쪽이 내려온다. */
  brow: number;
  /** 고개 기울기(deg) */
  tilt: number;
  /** 입이 뒤집힌 정도. 0이면 늘어진 개 입, 크면 아래로 꺾인 심통 */
  frown: number;
  /** 귀가 뒤로 젖혀진 정도(deg) */
  ear: number;
}

const POSES: Record<GlareLevel, Pose> = {
  // 평온하게 앉아 있음
  idle: { pupil: 0, lid: 0, brow: 0, tilt: 0, frown: 0, ear: 0 },
  // 눈만 옆으로 힐끗
  glance: { pupil: 7, lid: 2, brow: -5, tilt: 0, frown: 1, ear: 6 },
  // 고개까지 돌려 정면 응시
  stare: { pupil: 10, lid: 6, brow: -12, tilt: 7, frown: 3.5, ear: 14 },
  // 대놓고 째려봄
  glare: { pupil: 12, lid: 11, brow: -20, tilt: 12, frown: 6, ear: 22 },
};

const FUR = "#c9a227";
const FUR_DARK = "#a8871c";
const INK = "#2b2a26";
const SNOUT = "#f3e6c4";
const EYE_R = 14;

const EASE = "300ms cubic-bezier(0.34, 1.15, 0.64, 1)";

export default function Gaebari({
  level,
  direction = 1,
  className,
}: {
  level: GlareLevel;
  /** 째려볼 쪽. -1이면 화면 왼쪽. */
  direction?: LookDirection;
  className?: string;
}) {
  const base = POSES[level];
  // 좌우 대칭인 값(눈꺼풀·눈썹·입·귀)은 그대로 두고, 방향이 있는 값만 뒤집는다
  const p: Pose = { ...base, pupil: base.pupil * direction, tilt: base.tilt * direction };

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={`개바리 ${GAEBARI_LABELS[level]}`}
    >
      {/* 몸 — 고개를 기울일 때 기준이 되어 준다. 목 없이 머리만 돌면 떠 있는 것처럼 보인다. */}
      <ellipse cx="100" cy="188" rx="48" ry="38" fill={FUR_DARK} />

      <g
        style={{
          transform: `rotate(${p.tilt}deg)`,
          transformOrigin: "100px 160px",
          transition: `transform ${EASE}`,
        }}
      >
        {/* 늘어진 귀. 머리 뒤에 그려서 옆으로 붙는다. 째려볼수록 뒤로 젖혀진다. */}
        <Ear x={46} sign={-1} angle={p.ear} />
        <Ear x={154} sign={1} angle={p.ear} />

        {/* 머리 */}
        <ellipse cx="100" cy="100" rx="60" ry="54" fill={FUR} />

        {/* 주둥이 */}
        <ellipse cx="100" cy="127" rx="33" ry="25" fill={SNOUT} />

        {/* 입 — frown이 커지면 곡선이 위로 부풀고 입꼬리가 내려가 심통이 된다 */}
        <path
          d={`M 100 122 L 100 132
              M 100 132 Q 87 ${138 - p.frown * 2.4} 77 ${129 + p.frown * 1.3}
              M 100 132 Q 113 ${138 - p.frown * 2.4} 123 ${129 + p.frown * 1.3}`}
          stroke={INK}
          strokeWidth="3.5"
          strokeLinecap="round"
          fill="none"
          style={{ transition: `d ${EASE}` }}
        />

        {/* 코 */}
        <ellipse cx="100" cy="114" rx="10" ry="7.5" fill={INK} />

        <Eye cx={76} cy={93} pose={p} />
        <Eye cx={124} cy={93} pose={p} />
      </g>
    </svg>
  );
}

/** 늘어진 귀 하나. sign이 1이면 오른쪽. */
function Ear({ x, sign, angle }: { x: number; sign: number; angle: number }) {
  return (
    <g
      style={{
        // 붙은 자리를 축으로 뒤로 젖힌다
        transform: `rotate(${sign * angle}deg)`,
        transformOrigin: `${x}px 88px`,
        transition: `transform ${EASE}`,
      }}
    >
      <ellipse
        cx={x + sign * 4}
        cy={124}
        rx={17}
        ry={36}
        fill={FUR_DARK}
        transform={`rotate(${sign * 12} ${x} 124)`}
      />
    </g>
  );
}

function Eye({ cx, cy, pose }: { cx: number; cy: number; pose: Pose }) {
  const inner = cx < 100 ? -1 : 1;
  return (
    <g>
      <circle cx={cx} cy={cy} r={EYE_R} fill="#ffffff" />
      <circle
        cx={cx}
        cy={cy}
        r={6.5}
        fill={INK}
        style={{
          transform: `translateX(${pose.pupil}px)`,
          transition: `transform ${EASE}`,
        }}
      />
      {/* 위 눈꺼풀. 눈 원을 위에서 덮어 눈매를 좁힌다. */}
      <path
        d={`M ${cx - EYE_R} ${cy} a ${EYE_R} ${EYE_R} 0 0 1 ${EYE_R * 2} 0 Z`}
        fill={FUR}
        style={{
          transform: `translateY(${pose.lid - EYE_R}px)`,
          transition: `transform ${EASE}`,
        }}
      />
      {/* 눈썹. 안쪽 끝이 내려오도록 바깥 끝을 축으로 돌린다. */}
      <line
        x1={cx - 12}
        y1={cy - EYE_R - 6}
        x2={cx + 12}
        y2={cy - EYE_R - 6}
        stroke={INK}
        strokeWidth="4.5"
        strokeLinecap="round"
        style={{
          transform: `rotate(${-inner * pose.brow}deg)`,
          transformOrigin: `${cx - inner * 12}px ${cy - EYE_R - 6}px`,
          transition: `transform ${EASE}`,
        }}
      />
    </g>
  );
}

export const GAEBARI_LABELS: Record<GlareLevel, string> = {
  idle: "평온",
  glance: "힐끗",
  stare: "응시",
  glare: "째려봄",
};
