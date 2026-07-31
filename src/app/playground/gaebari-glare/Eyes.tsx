"use client";

import { useId } from "react";
import { CENTER_GAZE, type Gaze } from "./detect";
import type { GlareLevel } from "./state";

/**
 * 눈 한 쌍만 그린다. 캐릭터는 없다.
 *
 * 눈매는 아몬드 모양 path 하나로 만들고, 흰자와 눈동자를 그 path로 잘라낸다(clipPath).
 * 이러면 눈꺼풀을 배경색으로 덮을 필요가 없어서 어떤 배경 위에 놓아도 맞는다.
 *
 * 사나움은 두 값이 만든다 — 눈매 높이가 줄고(실눈), 안쪽 눈꼬리가 내려간다(찌푸림).
 * 시선은 -1~1 연속값을 받아 눈동자를 그쪽으로 민다. 검출이 10fps라 프레임 사이가
 * 비는데, 짧은 transition이 그 사이를 메워 눈이 끊기지 않고 흐른다.
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
/** 시선이 끝까지 갔을 때 눈동자가 움직이는 거리 */
const LOOK_X = 15;
const LOOK_Y = 10;

const INK = "#23272f";
const WHITE = "#ffffff";
/**
 * 눈매가 바뀌는 속도. 단계 전환은 이미 디바운스돼 있어 느긋해도 된다.
 * 브라우저가 path의 d 보간을 지원하면 부드럽게 바뀌고, 아니면 단계마다 바로 바뀐다 —
 * 어느 쪽이든 초당 몇 번씩 튀지는 않는다.
 */
const LID_EASE = "d 300ms cubic-bezier(0.34, 1.15, 0.64, 1)";
/**
 * 눈동자가 따라가는 속도. 검출 주기(100ms)보다 조금 길게 잡아 프레임 사이가
 * 이어지게 한다. 더 길면 사람보다 눈이 확연히 늦는다.
 */
const GAZE_EASE = "130ms linear";

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
  gaze = CENTER_GAZE,
  className,
}: {
  level: GlareLevel;
  /** 볼 곳. 가운데가 0, 끝이 ±1. */
  gaze?: Gaze;
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
      <Eye id={`${uid}-l`} x={72} pose={pose} gaze={gaze} side={-1} />
      <Eye id={`${uid}-r`} x={168} pose={pose} gaze={gaze} side={1} />
    </svg>
  );
}

/** side가 -1이면 왼눈 — 눈매를 거울로 뒤집어 안쪽 눈꼬리가 코 쪽을 향하게 한다. */
function Eye({
  id,
  x,
  pose,
  gaze,
  side,
}: {
  id: string;
  x: number;
  pose: Pose;
  gaze: Gaze;
  side: -1 | 1;
}) {
  const d = lidPath(pose);

  return (
    <g transform={`translate(${x} 60)`}>
      <g transform={side < 0 ? "scale(-1 1)" : undefined}>
        <clipPath id={id}>
          <path d={d} style={{ transition: LID_EASE }} />
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
              transform: `translate(${gaze.x * LOOK_X * side}px, ${gaze.y * LOOK_Y}px)`,
              transition: `transform ${GAZE_EASE}`,
            }}
          />
        </g>

        <path
          d={d}
          fill="none"
          stroke={INK}
          strokeWidth={5}
          strokeLinejoin="round"
          style={{ transition: LID_EASE }}
        />
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
