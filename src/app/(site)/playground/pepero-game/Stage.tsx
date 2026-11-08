"use client";

import { useRef } from "react";

import { clampMm, cm, STICK_MM } from "./rules";

/**
 * 막대과자 하나를 사이에 둔 두 사람을 옆에서 본 그림(SVG).
 * 얼굴은 점 눈·볼터치만 있는 둥근 만화 얼굴이라 입이 아무리 가까워져도 귀엽게만 보인다.
 * 입이 닿는 일은 그리지 않는다 — 닿으면 「앙!」 하고 깨무는 장면으로 바뀐다.
 */

const W = 480;
const H = 190;
/** 막대 왼쪽 끝 x, 1mm 당 px */
const X0 = 90;
const PX = 2;
/** 입·막대 높이 */
const Y = 100;
/** 얼굴 크기 */
const FACE = 1.2;
/** 왼쪽 끝 손잡이(초코 안 묻은 과자) 길이 mm */
const HANDLE = 18;

export const xOf = (mm: number) => X0 + mm * PX;

export type Mood = "idle" | "chomp" | "blush" | "ouch" | "mystery" | "proud";

export interface Look {
  skin: string;
  hair: string;
  shirt: string;
}

export const LEFT_LOOK: Look = { skin: "#ffe1cc", hair: "#7a4a2c", shirt: "#ff8fab" };
export const RIGHT_LOOK: Look = { skin: "#ffe6d2", hair: "#2f2a33", shirt: "#7cc7b2" };

export interface Crumb {
  id: number;
  x: number;
  dx: number;
  dy: number;
  r: number;
  dark: boolean;
}

interface Props {
  /** 왼쪽 입 자리(mm, 왼쪽 끝에서) */
  left: number;
  /** 오른쪽 입 자리(mm, 왼쪽 끝에서) */
  right: number;
  leftMood: Mood;
  rightMood: Mood;
  leftName: string;
  rightName: string;
  /** 왼쪽 사람이 고른 자리 — 보여 줄 때만 */
  pickLeft?: number | null;
  /** 오른쪽 사람이 고른 자리 — 보여 줄 때만 */
  pickRight?: number | null;
  /** 다 먹고 남은 길이 표시 */
  measure?: boolean;
  /** 깨문 자리(mm) */
  bite?: number | null;
  crumbs?: Crumb[];
  /** 막대를 누르거나 끌어서 자리를 고른다 */
  onPick?: (mm: number) => void;
  caption?: string;
}

export default function Stage({
  left,
  right,
  leftMood,
  rightMood,
  leftName,
  rightName,
  pickLeft = null,
  pickRight = null,
  measure = false,
  bite = null,
  crumbs = [],
  onPick,
  caption,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const pick = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || !onPick) return;
    const box = svg.getBoundingClientRect();
    const x = ((clientX - box.left) / box.width) * W;
    onPick(clampMm((x - X0) / PX));
  };

  const xl = xOf(left);
  const xr = xOf(right);
  const gap = right - left;

  return (
    <svg
      ref={svgRef}
      viewBox={`0 0 ${W} ${H}`}
      className={`pp-stage block w-full select-none ${onPick ? "cursor-ew-resize touch-none" : ""} ${bite !== null ? "pp-shake" : ""}`}
      role="img"
      aria-label={caption ?? `${leftName}·${rightName} 둘이 막대과자를 양쪽에서 물고 있어요`}
      onPointerDown={(e) => {
        if (!onPick) return;
        dragging.current = true;
        e.currentTarget.setPointerCapture(e.pointerId);
        pick(e.clientX);
      }}
      onPointerMove={(e) => dragging.current && pick(e.clientX)}
      onPointerUp={() => (dragging.current = false)}
      onPointerCancel={() => (dragging.current = false)}
    >
      {/* 바닥 그림자 */}
      <ellipse cx={W / 2} cy={H - 8} rx={W * 0.42} ry={7} fill="#5b3221" opacity={0.07} />

      {/* 고른 자리 — 먹을 구간을 연하게 칠한다 */}
      {pickLeft !== null && (
        <PickBand from={0} to={pickLeft} color="#ff8fab" label={`${cm(pickLeft)}cm 냠`} side="left" />
      )}
      {pickRight !== null && (
        <PickBand
          from={pickRight}
          to={STICK_MM}
          color="#38a88a"
          label={`${cm(STICK_MM - pickRight)}cm 냠`}
          side="right"
        />
      )}

      <Head x={xl} side="left" look={LEFT_LOOK} mood={leftMood} />
      <Head x={xr} side="right" look={RIGHT_LOOK} mood={rightMood} />

      {/* 막대 */}
      {gap > 0 && bite === null && <Stick from={left} to={right} />}

      <Lips x={xl} side="left" mood={leftMood} />
      <Lips x={xr} side="right" mood={rightMood} />

      {/* 부스러기 */}
      {crumbs.map((c) => (
        <circle
          key={c.id}
          cx={c.x}
          cy={Y + 2}
          r={c.r}
          fill={c.dark ? "#5b3221" : "#e2ad66"}
          className="pp-crumb"
          style={{ "--dx": `${c.dx}px`, "--dy": `${c.dy}px` } as React.CSSProperties}
        />
      ))}

      {/* 남은 길이 자 */}
      {measure && gap > 0 && (
        <g className="pp-pop" style={{ transformOrigin: `${(xl + xr) / 2}px ${Y - 40}px` }}>
          <path
            d={`M${xl} ${Y - 14} V${Y - 22} H${xr} V${Y - 14}`}
            fill="none"
            stroke="#5b3221"
            strokeWidth={2}
            strokeLinecap="round"
          />
          <g transform={`translate(${(xl + xr) / 2} ${Y - 40})`}>
            <rect x={-34} y={-14} width={68} height={26} rx={13} fill="#5b3221" />
            <text y={5} textAnchor="middle" className="pp-display" fontSize={15} fill="#fff6ec">
              {cm(gap)}cm
            </text>
          </g>
        </g>
      )}

      {/* 깨물었다 */}
      {bite !== null && (
        <g className="pp-pop" style={{ transformOrigin: `${xOf(bite)}px ${Y - 50}px` }}>
          <Burst x={xOf(bite)} y={Y - 52} />
          <text x={xOf(bite)} y={Y - 44} textAnchor="middle" className="pp-display" fontSize={26} fill="#fff">
            앙!
          </text>
        </g>
      )}

      {/* 이름표 */}
      <NameTag x={Math.max(46, xl - 44)} name={leftName} color={LEFT_LOOK.shirt} />
      <NameTag x={Math.min(W - 46, xr + 44)} name={rightName} color={RIGHT_LOOK.shirt} />
    </svg>
  );
}

function PickBand({
  from,
  to,
  color,
  label,
  side,
}: {
  from: number;
  to: number;
  color: string;
  label: string;
  side: "left" | "right";
}) {
  const edge = side === "left" ? xOf(to) : xOf(from);
  return (
    <g>
      <rect x={xOf(from)} y={Y - 12} width={xOf(to) - xOf(from)} height={24} rx={6} fill={color} opacity={0.22} />
      <line
        x1={edge}
        x2={edge}
        y1={Y - 30}
        y2={Y + 22}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <g transform={`translate(${Math.max(50, Math.min(W - 50, edge))} ${Y - 40})`}>
        <rect x={-46} y={-14} width={92} height={27} rx={13.5} fill={color} />
        <text y={5} textAnchor="middle" className="pp-display" fontSize={15} fill="#fff">
          {label}
        </text>
      </g>
    </g>
  );
}

function Stick({ from, to }: { from: number; to: number }) {
  const xa = xOf(from);
  const xb = xOf(to);
  const chocoFrom = Math.max(xa, xOf(HANDLE));
  return (
    <g>
      <rect x={xa} y={Y - 5} width={xb - xa} height={10} rx={3} fill="#e8b46c" stroke="#a8743d" strokeWidth={1.2} />
      {xb > chocoFrom && (
        <>
          <rect x={chocoFrom} y={Y - 6} width={xb - chocoFrom} height={12} rx={4} fill="#5b3221" />
          {/* 초코 결 */}
          <rect x={chocoFrom + 2} y={Y - 4} width={Math.max(0, xb - chocoFrom - 4)} height={2.4} rx={1.2} fill="#8a5a3c" />
        </>
      )}
    </g>
  );
}

/**
 * 머리·머리카락·몸. 오른쪽을 보는 얼굴을 기준으로 그리고, 오른쪽 사람은 좌우를 뒤집는다.
 * (0,0) 이 입 자리다.
 */
function Head({ x, side, look, mood }: { x: number; side: "left" | "right"; look: Look; mood: Mood }) {
  const flip = side === "left" ? 1 : -1;
  const mystery = mood === "mystery";
  const skin = mystery ? "#e9dfd6" : look.skin;
  const hair = mystery ? "#cfc2b6" : look.hair;
  const shirt = mystery ? "#ddd2c8" : look.shirt;
  const blush = mood === "blush" || mood === "ouch";
  return (
    <g transform={`translate(${x} ${Y}) scale(${flip * FACE} ${FACE})`}>
      <g className={mood === "chomp" ? "pp-bob" : undefined}>
        {/* 몸 */}
        <rect x={-66} y={20} width={56} height={60} rx={26} fill={shirt} stroke="#4a2f27" strokeWidth={2.5} />
        {/* 뒷머리 */}
        {side === "left" ? (
          <path d="M-70 -14 C-72 -44 -44 -54 -26 -44 L-30 18 C-48 26 -70 20 -70 -14 Z" fill={hair} />
        ) : (
          <circle cx={-38} cy={-14} r={31} fill={hair} />
        )}
        {/* 얼굴 */}
        <circle cx={-32} cy={-8} r={29} fill={skin} stroke="#4a2f27" strokeWidth={2.5} />
        {/* 앞머리 */}
        {side === "left" ? (
          <path d="M-62 -18 C-60 -44 -30 -48 -12 -30 C-20 -32 -26 -28 -30 -22 C-36 -30 -48 -28 -62 -18 Z" fill={hair} />
        ) : (
          <>
            <path d="M-64 -16 C-62 -44 -28 -50 -10 -28 C-24 -30 -40 -26 -64 -16 Z" fill={hair} />
            {/* 삐침 머리 */}
            <path d="M-36 -36 C-34 -50 -24 -54 -18 -50" fill="none" stroke={hair} strokeWidth={3} strokeLinecap="round" />
          </>
        )}
        {mystery ? (
          <text x={-32} y={-2} textAnchor="middle" className="pp-display" fontSize={26} fill="#a99a8c" transform="scale(-1 1) translate(64 0)">
            ?
          </text>
        ) : (
          <Eye mood={mood} />
        )}
        {/* 볼터치 */}
        {!mystery && (
          <ellipse
            cx={-16}
            cy={-1}
            rx={blush ? 8 : 6}
            ry={blush ? 4.5 : 3.5}
            fill="#ff8fa3"
            opacity={blush ? 0.9 : 0.5}
          />
        )}
        {mood === "blush" && (
          // 땀 한 방울 — 긴장된다
          <path d="M-52 -34 C-52 -30 -48 -28 -46 -31 C-46 -34 -49 -38 -52 -34 Z" fill="#9fd4ff" />
        )}
        {mood === "ouch" && (
          // 눈물 한 방울
          <path d="M-12 -10 C-14 -4 -10 0 -8 -4 C-7 -7 -10 -10 -12 -10 Z" fill="#9fd4ff" className="pp-tear" />
        )}
      </g>
    </g>
  );
}

function Eye({ mood }: { mood: Mood }) {
  if (mood === "ouch")
    return (
      <path d="M-20 -21 L-13 -16 L-20 -11" fill="none" stroke="#2c1d18" strokeWidth={2.6} strokeLinecap="round" strokeLinejoin="round" />
    );
  if (mood === "blush" || mood === "proud")
    return <path d="M-21 -15 Q-16 -21 -11 -15" fill="none" stroke="#2c1d18" strokeWidth={2.6} strokeLinecap="round" />;
  return <circle cx={-15} cy={-16} r={3.3} fill="#2c1d18" className="pp-blink" />;
}

/** 입술 — 막대 위에 겹쳐 그려야 막대를 문 것처럼 보인다. */
function Lips({ x, side, mood }: { x: number; side: "left" | "right"; mood: Mood }) {
  if (mood === "mystery") return null;
  const flip = side === "left" ? 1 : -1;
  return (
    <g transform={`translate(${x} ${Y}) scale(${flip * FACE} ${FACE})`}>
      <g className={mood === "chomp" ? "pp-bob" : undefined}>
        <g className={mood === "chomp" ? "pp-chomp-top" : undefined}>
          <path d="M-9 -4 Q-6 -10 -1 -7 Q1 -6 1 -4 Z" fill="#ff7d96" stroke="#c84d6a" strokeWidth={1.4} strokeLinejoin="round" />
        </g>
        <g className={mood === "chomp" ? "pp-chomp-bottom" : undefined}>
          <path d="M-9 4 Q-6 10 -1 7 Q1 6 1 4 Z" fill="#ff7d96" stroke="#c84d6a" strokeWidth={1.4} strokeLinejoin="round" />
        </g>
        {mood === "ouch" && (
          // 반창고
          <g transform="translate(-4 9) rotate(-18)">
            <rect x={-9} y={-3.5} width={18} height={7} rx={3.5} fill="#f6d7a7" stroke="#c99a5e" strokeWidth={1} />
            <rect x={-3} y={-3.5} width={6} height={7} fill="#eec48c" />
          </g>
        )}
      </g>
    </g>
  );
}

function Burst({ x, y }: { x: number; y: number }) {
  const pts = Array.from({ length: 20 }, (_, i) => {
    const r = i % 2 ? 22 : 34;
    const a = (i / 20) * Math.PI * 2;
    return `${x + Math.cos(a) * r * 1.3},${y + Math.sin(a) * r}`;
  }).join(" ");
  return <polygon points={pts} fill="#ff5f7e" stroke="#4a2f27" strokeWidth={2.5} strokeLinejoin="round" />;
}

function NameTag({ x, name, color }: { x: number; name: string; color: string }) {
  return (
    <g transform={`translate(${x} ${H - 18})`}>
      <rect x={-41} y={-12} width={82} height={22} rx={11} fill="#fffaf3" stroke={color} strokeWidth={2} />
      <text y={4} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#4a2f27">
        {name}
      </text>
    </g>
  );
}
