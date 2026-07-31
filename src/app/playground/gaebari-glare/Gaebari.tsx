"use client";

import type { LookDirection } from "./detect";
import type { GlareLevel } from "./state";

/**
 * 상태별 개바리 표시.
 *
 * 하얀 폼피츠. 복슬복슬한 실루엣은 타원 둘레에 작은 원을 둘러 만든다 —
 * 털 한 올씩 그리는 것보다 훨씬 싸고, 이 크기에서는 구분이 안 간다.
 *
 * 교체 전제는 그대로다. 나중에 그림이나 짧은 webm 루프로 갈아끼울 때
 * 이 파일 하나만 바꾸면 된다. 바깥은 level과 direction만 넘긴다.
 *
 * 째려보는 쪽은 direction으로 받는다. 눈·고개가 같은 방향으로 함께 움직여야
 * "저쪽을 본다"로 읽힌다 — 눈만 돌아가면 그냥 사시처럼 보인다.
 */

interface Pose {
  /** 눈알이 옆으로 밀리는 정도(px) */
  eye: number;
  /** 위 눈꺼풀이 내려온 정도(px). 클수록 동그란 눈이 사나운 실눈이 된다. */
  lid: number;
  /** 눈썹 주름 진하기 0~1. 평온할 땐 아예 없다. */
  brow: number;
  /** 고개 기울기(deg) */
  tilt: number;
  /** 입이 뒤집힌 정도. 0이면 웃는 입, 크면 아래로 꺾인 심통 */
  frown: number;
  /** 귀가 뒤로 눕는 정도(deg) */
  ear: number;
}

const POSES: Record<GlareLevel, Pose> = {
  // 평온하게 앉아 있음
  idle: { eye: 0, lid: 0, brow: 0, tilt: 0, frown: 0, ear: 0 },
  // 눈만 옆으로 힐끗
  glance: { eye: 3.5, lid: 2, brow: 0.35, tilt: 0, frown: 0.4, ear: 6 },
  // 고개까지 돌려 정면 응시
  stare: { eye: 5.5, lid: 7, brow: 0.7, tilt: 6, frown: 1.1, ear: 14 },
  // 대놓고 째려봄
  glare: { eye: 7, lid: 13, brow: 1, tilt: 10, frown: 1.8, ear: 22 },
};

const FUR = "#ffffff";
/** 흰 개를 밝은 배경에 놓으면 윤곽이 사라진다. 한 겹 크게 깐 테두리로 띄운다. */
const RIM = "#dfe3ea";
const SHADE = "#eef1f5";
const INK = "#241f1c";
const EAR_INNER = "#f6d5d1";
const TONGUE = "#e79a9a";

const EYE_R = 14;
const EASE = "300ms cubic-bezier(0.34, 1.15, 0.64, 1)";

/**
 * 좌표를 소수 둘째 자리에서 끊는다.
 *
 * Math.sin/cos는 구현체마다 마지막 자리가 다를 수 있어서, 서버(Node)와 브라우저가
 * 같은 식으로 다른 문자열을 낸다 — 하이드레이션 불일치의 원인이다. 이 크기에서
 * 0.01px은 보이지도 않는다.
 */
const round2 = (v: number): number => Math.round(v * 100) / 100;

/** 타원 둘레에 원을 둘러 복슬복슬한 덩어리를 만든다. */
function fluff(cx: number, cy: number, rx: number, ry: number, n: number, r: number, fill: string) {
  const puffs = [];
  for (let i = 0; i < n; i += 1) {
    const a = (i / n) * Math.PI * 2;
    // 반지름을 조금씩 흔들어 기계적인 톱니가 안 보이게 한다
    const wobble = 1 + 0.12 * Math.sin(i * 2.7);
    puffs.push(
      <circle
        key={i}
        cx={round2(cx + Math.cos(a) * rx)}
        cy={round2(cy + Math.sin(a) * ry)}
        r={round2(r * wobble)}
        fill={fill}
      />,
    );
  }
  return (
    <g>
      <ellipse cx={cx} cy={cy} rx={rx} ry={ry} fill={fill} />
      {puffs}
    </g>
  );
}

/** 테두리 한 겹 + 흰 몸 한 겹 */
function FluffyBlob({
  cx,
  cy,
  rx,
  ry,
  n,
  r,
}: {
  cx: number;
  cy: number;
  rx: number;
  ry: number;
  n: number;
  r: number;
}) {
  return (
    <g>
      {fluff(cx, cy, rx, ry, n, r + 2.5, RIM)}
      {fluff(cx, cy, rx, ry, n, r, FUR)}
    </g>
  );
}

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
  const p: Pose = { ...base, eye: base.eye * direction, tilt: base.tilt * direction };

  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      role="img"
      aria-label={`개바리 ${GAEBARI_LABELS[level]}`}
    >
      {/* 몸통과 앞발 */}
      <FluffyBlob cx={100} cy={176} rx={44} ry={38} n={18} r={9} />
      <FluffyBlob cx={66} cy={168} rx={12} ry={16} n={9} r={7} />
      <FluffyBlob cx={134} cy={168} rx={12} ry={16} n={9} r={7} />

      <g
        style={{
          transform: `rotate(${p.tilt}deg)`,
          transformOrigin: "100px 150px",
          transition: `transform ${EASE}`,
        }}
      >
        {/* 쫑긋 선 삼각 귀. 째려볼수록 뒤로 눕는다. 머리 뒤에 그린다. */}
        <Ear x={68} y={58} sign={-1} angle={p.ear} />
        <Ear x={132} y={58} sign={1} angle={p.ear} />

        <FluffyBlob cx={100} cy={94} rx={54} ry={49} n={24} r={11} />

        {/* 주둥이 둘레의 옅은 그늘 — 흰색끼리 붙어 있어 경계가 필요하다 */}
        <ellipse cx={100} cy={116} rx={34} ry={24} fill={SHADE} />
        <ellipse cx={100} cy={113} rx={31} ry={21} fill={FUR} />

        <Eye cx={78} cy={95} pose={p} />
        <Eye cx={122} cy={95} pose={p} />

        {/* 코 */}
        <path
          d="M 91 107 Q 100 103 109 107 Q 109 116 100 118 Q 91 116 91 107 Z"
          fill={INK}
        />

        {/* 입 — frown이 커지면 곡선이 위로 부풀고 입꼬리가 내려가 심통이 된다 */}
        <path
          d={`M 100 118 L 100 124
              M 100 124 Q 91 ${129 - p.frown * 3.2} 83 ${123 + p.frown * 2.2}
              M 100 124 Q 109 ${129 - p.frown * 3.2} 117 ${123 + p.frown * 2.2}`}
          stroke={INK}
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          style={{ transition: `d ${EASE}` }}
        />

        {/* 웃을 때만 보이는 혓바닥 */}
        <ellipse
          cx={100}
          cy={131}
          rx={7}
          ry={4}
          fill={TONGUE}
          style={{
            opacity: Math.max(0, 1 - p.frown * 1.6),
            transition: `opacity ${EASE}`,
          }}
        />
      </g>
    </svg>
  );
}

/**
 * 쫑긋 선 삼각 귀 하나. sign이 1이면 오른쪽 — 좌우 대칭이라 왼쪽 모양을 거울로 뒤집어 쓴다.
 *
 * 좌표를 귀 밑동(0,0) 기준으로 잡는다. 머리 위로 확실히 솟아야 폼피츠로 읽히므로
 * 꼭짓점을 머리 윤곽보다 한참 위에 둔다.
 */
function Ear({ x, y, sign, angle }: { x: number; y: number; sign: number; angle: number }) {
  const tri = (spread: number, height: number, fill: string) => (
    <path
      d={`M ${-spread} ${16} L ${-spread * 0.3} ${-height} L ${spread * 0.9} ${2} Z`}
      fill={fill}
      strokeWidth={5}
      stroke={fill}
      strokeLinejoin="round"
    />
  );

  return (
    <g transform={`translate(${x} ${y})${sign < 0 ? "" : " scale(-1 1)"}`}>
      <g
        style={{
          // 째려볼수록 바깥쪽으로 눕는다
          transform: `rotate(${-angle}deg)`,
          transformOrigin: "0px 10px",
          transition: `transform ${EASE}`,
        }}
      >
        {tri(24, 48, RIM)}
        {tri(19, 42, FUR)}
        {tri(10, 26, EAR_INNER)}
      </g>
    </g>
  );
}

function Eye({ cx, cy, pose }: { cx: number; cy: number; pose: Pose }) {
  const inner = cx < 100 ? -1 : 1;
  return (
    <g>
      <g
        style={{
          transform: `translateX(${pose.eye}px)`,
          transition: `transform ${EASE}`,
        }}
      >
        <circle cx={cx} cy={cy} r={EYE_R} fill={INK} />
        {/* 반짝임. 눈이 통째로 까매서 이게 없으면 눈이 아니라 구멍으로 보인다. */}
        <circle cx={cx - 4.5} cy={cy - 5} r={4.5} fill="#ffffff" />
        <circle cx={cx + 5} cy={cy + 4} r={2} fill="#ffffff" opacity={0.6} />
      </g>

      {/* 위 눈꺼풀. 털색이라 눈을 위에서 덮으면 실눈이 된다. */}
      <path
        d={`M ${cx - EYE_R - 1} ${cy} a ${EYE_R + 1} ${EYE_R + 1} 0 0 1 ${(EYE_R + 1) * 2} 0 Z`}
        fill={FUR}
        style={{
          transform: `translateY(${pose.lid - EYE_R - 1}px)`,
          transition: `transform ${EASE}`,
        }}
      />

      {/* 눈썹 주름. 평온할 땐 아예 안 보인다. */}
      <line
        x1={cx - 11}
        y1={cy - EYE_R - 6}
        x2={cx + 11}
        y2={cy - EYE_R - 6}
        stroke={INK}
        strokeWidth="3.5"
        strokeLinecap="round"
        opacity={pose.brow}
        style={{
          transform: `rotate(${-inner * pose.brow * 20}deg)`,
          transformOrigin: `${cx - inner * 11}px ${cy - EYE_R - 6}px`,
          transition: `transform ${EASE}, opacity ${EASE}`,
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
