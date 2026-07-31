"use client";

import { useId } from "react";
import { CENTER_CELL, type LookCell } from "./detect";
import type { GlareLevel } from "./state";

/**
 * 눈 한 쌍만 그린다. 캐릭터는 없다.
 *
 * 눈매는 아몬드 모양 path 하나로 만들고, 흰자와 눈동자를 그 path로 잘라낸다(clipPath).
 * 이러면 눈꺼풀을 배경색으로 덮을 필요가 없어서 어떤 배경 위에 놓아도 맞는다.
 *
 * 사나움은 두 값이 만든다 — 눈매 높이가 줄고(실눈), 안쪽 눈꼬리가 내려간다(찌푸림).
 * 시선은 아홉 칸 중 한 칸을 받아 눈동자를 그쪽으로 민다.
 */

interface Pose {
  /** 눈매 반높이. 작을수록 실눈 */
  half: number;
  /** 안쪽 눈꼬리가 내려간 정도. 클수록 찌푸린다. */
  drop: number;
}

const POSES: Record<GlareLevel, Pose> = {
  idle: { half: 30, drop: 0 },
  glance: { half: 27, drop: 4 },
  stare: { half: 21, drop: 11 },
  // 더 좁히면 눈동자가 눈을 꽉 채워서 어디를 보는지 안 보인다
  glare: { half: 16, drop: 18 },
};

/** 눈매 반너비 */
const EYE_W = 34;
/** 눈동자 반지름 */
const PUPIL_R = 14;
/** 눈동자가 한 칸당 움직이는 거리 */
const LOOK_X = 15;
const LOOK_Y = 10;

const INK = "#23272f";
const WHITE = "#ffffff";
const EASE = "300ms cubic-bezier(0.34, 1.15, 0.64, 1)";

/**
 * 안쪽(코 쪽)이 -x인 오른눈 기준 눈매. 왼눈은 거울로 뒤집어 쓴다.
 *
 * 2차 베지어가 실제로 닿는 높이는 제어점의 절반이므로 제어점에 2를 곱한다.
 * 이걸 빠뜨리면 눈이 의도한 절반 크기로 찌그러져 눈동자가 눈을 꽉 채운다.
 */
function lidPath({ half, drop }: Pose): string {
  return [
    `M ${-EYE_W} ${drop}`,
    `Q 0 ${-2 * half - drop * 0.6} ${EYE_W} 0`,
    `Q 0 ${2 * half} ${-EYE_W} ${drop}`,
    "Z",
  ].join(" ");
}

export default function Eyes({
  level,
  cell = CENTER_CELL,
  className,
}: {
  level: GlareLevel;
  /** 볼 칸. col/row 각각 -1, 0, 1. */
  cell?: LookCell;
  className?: string;
}) {
  const pose = POSES[level];
  // clipPath는 문서 전체에서 유일한 id가 필요하다. 고정 문자열을 쓰면 한 페이지에
  // 두 쌍을 놓는 순간 둘 다 첫 번째 눈매로 잘린다.
  const uid = useId();

  return (
    <svg
      viewBox="0 0 240 120"
      className={className}
      role="img"
      aria-label={`눈 ${LEVEL_LABELS[level]}`}
    >
      <Eye id={`${uid}-l`} x={72} pose={pose} cell={cell} side={-1} />
      <Eye id={`${uid}-r`} x={168} pose={pose} cell={cell} side={1} />
    </svg>
  );
}

/** side가 -1이면 왼눈 — 눈매를 거울로 뒤집어 안쪽 눈꼬리가 코 쪽을 향하게 한다. */
function Eye({
  id,
  x,
  pose,
  cell,
  side,
}: {
  id: string;
  x: number;
  pose: Pose;
  cell: LookCell;
  side: -1 | 1;
}) {
  const d = lidPath(pose);

  return (
    <g transform={`translate(${x} 60)`}>
      <g transform={side < 0 ? "scale(-1 1)" : undefined}>
        <clipPath id={id}>
          {/* clipPath 안에서는 transition이 안 먹는다. 단계 전환은 눈동자와 테두리가 끌고 간다. */}
          <path d={d} />
        </clipPath>

        <g clipPath={`url(#${id})`}>
          <rect x={-EYE_W} y={-40} width={EYE_W * 2} height={80} fill={WHITE} />
          <circle
            cx={0}
            cy={0}
            r={PUPIL_R}
            fill={INK}
            style={{
              // 눈매를 뒤집어 놨으므로 시선도 같이 뒤집어야 두 눈이 같은 곳을 본다
              transform: `translate(${cell.col * LOOK_X * side}px, ${cell.row * LOOK_Y}px)`,
              transition: `transform ${EASE}`,
            }}
          />
        </g>

        <path d={d} fill="none" stroke={INK} strokeWidth={5} strokeLinejoin="round" />
      </g>
    </g>
  );
}

export const LEVEL_LABELS: Record<GlareLevel, string> = {
  idle: "평온",
  glance: "힐끗",
  stare: "응시",
  glare: "째려봄",
};
