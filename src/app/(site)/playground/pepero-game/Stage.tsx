"use client";

import { useRef } from "react";

import { CharacterBody, CharacterLips, charOf, type Expr } from "./Character";
import { clampMm, cm, STICK_MM } from "./rules";

/**
 * 막대과자 하나를 사이에 둔 두 사람을 옆에서 본 무대(SVG).
 * 입이 맞닿는 장면은 그리지 않는다 — 깨물면 「앙!」 하고 둘 다 튕겨 나간다(Bout 이 자리를 정한다).
 */

const W = 500;
const H = 210;
/** 막대 왼쪽 끝 x, 1mm 당 px */
const X0 = 100;
const PX = 2;
/** 입·막대 높이 */
const Y = 112;
/** 캐릭터 크기 */
const F = 1.25;
/** 왼쪽 끝 손잡이(초코 안 묻은 과자) 길이 mm */
const HANDLE = 18;

export const xOf = (mm: number) => X0 + mm * PX;

export interface Crumb {
  id: number;
  x: number;
  dx: number;
  dy: number;
  r: number;
  dark: boolean;
}

export interface Side {
  /** 입 자리(mm, 막대 왼쪽 끝에서) */
  at: number;
  char: number | "mystery";
  expr: Expr;
  name: string;
  bubble?: string | null;
}

interface Props {
  left: Side;
  right: Side;
  /** 왼쪽 사람이 고른 자리 — 보여 줄 때만 */
  pickLeft?: number | null;
  /** 오른쪽 사람이 고른 자리 — 보여 줄 때만 */
  pickRight?: number | null;
  onPick?: (mm: number) => void;
  /** 다 먹고 남은 조각 — 막대가 똑 부러져 가운데로 튀어 오른다. 값은 실제 남은 mm */
  piece?: number | null;
  /** 깨문 자리(mm) */
  bite?: number | null;
  sparkle?: boolean;
  confetti?: boolean;
  crumbs?: Crumb[];
  /** 카메라 — 가운데(mm)와 확대 배율 */
  cam?: { at: number; zoom: number };
  caption?: string;
}

export default function Stage({
  left,
  right,
  pickLeft = null,
  pickRight = null,
  onPick,
  piece = null,
  bite = null,
  sparkle = false,
  confetti = false,
  crumbs = [],
  cam,
  caption,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);
  const dragging = useRef(false);

  const zoom = cam?.zoom ?? 1;
  const vbW = W / zoom;
  const vbH = H / zoom;
  const vbX = cam ? Math.min(W - vbW, Math.max(0, xOf(cam.at) - vbW / 2)) : 0;
  // 머리 꼭대기가 잘리지 않게 위쪽에 맞춘다.
  const vbY = cam ? Math.min(H - vbH, Math.max(0, Y - 90)) : 0;

  const pick = (clientX: number) => {
    const svg = svgRef.current;
    if (!svg || !onPick) return;
    const box = svg.getBoundingClientRect();
    const x = vbX + ((clientX - box.left) / box.width) * vbW;
    onPick(clampMm((x - X0) / PX));
  };

  const xl = xOf(left.at);
  const xr = xOf(right.at);
  const gap = right.at - left.at;
  const mid = (xl + xr) / 2;

  return (
    <svg
      ref={svgRef}
      viewBox={`${vbX} ${vbY} ${vbW} ${vbH}`}
      className={`pp-stage block w-full select-none ${onPick ? "cursor-ew-resize touch-none" : ""} ${bite !== null ? "pp-shake" : ""}`}
      role="img"
      aria-label={caption ?? `${left.name}·${right.name} 둘이 막대과자를 양쪽에서 물고 있어요`}
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
      {/* 바닥 */}
      <ellipse cx={W / 2} cy={H - 6} rx={W * 0.46} ry={8} fill="#5b3221" opacity={0.07} />

      {pickLeft !== null && (
        <PickBand from={0} to={pickLeft} color="#ff8fab" label={`${cm(pickLeft)}cm 냠`} edge={xOf(pickLeft)} />
      )}
      {pickRight !== null && (
        <PickBand
          from={pickRight}
          to={STICK_MM}
          color="#38a88a"
          label={`${cm(STICK_MM - pickRight)}cm 냠`}
          edge={xOf(pickRight)}
        />
      )}

      <Person side="left" x={xl} s={left} part="body" />
      <Person side="right" x={xr} s={right} part="body" />

      {gap > 0 && bite === null && piece === null && <Stick from={left.at} to={right.at} />}

      <Person side="left" x={xl} s={left} part="lips" />
      <Person side="right" x={xr} s={right} part="lips" />

      {crumbs.map((c) => (
        <circle
          key={c.id}
          cx={c.x}
          cy={Y + 3}
          r={c.r}
          fill={c.dark ? "#5b3221" : "#e2ad66"}
          className="pp-crumb"
          style={{ "--dx": `${c.dx}px`, "--dy": `${c.dy}px` } as React.CSSProperties}
        />
      ))}

      {sparkle && <Sparkles x={mid} />}

      {piece !== null && <Piece x={mid} mm={piece} />}

      {bite !== null && (
        <g className="pp-pop" style={{ transformOrigin: `${xOf(bite)}px ${Y - 4}px` }}>
          <Burst x={xOf(bite)} y={Y - 4} />
          <text
            x={xOf(bite)}
            y={Y + 4}
            textAnchor="middle"
            className="pp-display"
            fontSize={22}
            fill="#fff"
            stroke="#4a2f27"
            strokeWidth={0.6}
          >
            앙!
          </text>
        </g>
      )}

      <Bubble side="left" x={xl} text={left.bubble} />
      <Bubble side="right" x={xr} text={right.bubble} />
      {left.char === "mystery" && <Question x={xl - 22 * F} />}
      {right.char === "mystery" && <Question x={xr + 22 * F} />}

      {confetti && <Confetti />}
      {bite !== null && (
        <rect x={0} y={0} width={W} height={H} fill="#fff" className="pp-flash" pointerEvents="none" />
      )}

      <NameTag x={Math.max(48, xl - 34 * F)} name={left.name} color={charOf(left.char).shirt} />
      <NameTag x={Math.min(W - 48, xr + 34 * F)} name={right.name} color={charOf(right.char).shirt} />
    </svg>
  );
}

function Person({ side, x, s, part }: { side: "left" | "right"; x: number; s: Side; part: "body" | "lips" }) {
  const flip = side === "left" ? 1 : -1;
  return (
    <g transform={`translate(${x} ${Y}) scale(${flip * F} ${F})`}>
      {part === "body" ? <CharacterBody def={charOf(s.char)} expr={s.expr} /> : <CharacterLips expr={s.expr} />}
    </g>
  );
}

function PickBand({
  from,
  to,
  color,
  label,
  edge,
}: {
  from: number;
  to: number;
  color: string;
  label: string;
  edge: number;
}) {
  return (
    <g>
      <rect x={xOf(from)} y={Y - 12} width={xOf(to) - xOf(from)} height={24} rx={6} fill={color} opacity={0.2} />
      <line
        x1={edge}
        x2={edge}
        y1={Y - 32}
        y2={Y + 22}
        stroke={color}
        strokeWidth={2.5}
        strokeDasharray="4 4"
        strokeLinecap="round"
      />
      <g transform={`translate(${Math.max(50, Math.min(W - 50, edge))} ${Y - 44})`}>
        <rect x={-46} y={-14} width={92} height={27} rx={13.5} fill={color} />
        <text y={5} textAnchor="middle" className="pp-display" fontSize={15} fill="#fff">
          {label}
        </text>
      </g>
    </g>
  );
}

/** 똑 부러져 위로 튀어 오른 남은 조각과 그 길이 */
function Piece({ x, mm }: { x: number; mm: number }) {
  const len = Math.max(5, mm * PX);
  return (
    <g transform={`translate(${x} ${Y})`}>
      <g className="pp-fly">
        <rect x={-len / 2} y={-5.5} width={len} height={11} rx={3} fill="#5b3221" stroke="#3a1f13" strokeWidth={1} />
        <rect x={-len / 2 + 1.5} y={-3.6} width={Math.max(0, len - 3)} height={2.2} rx={1.1} fill="#8a5a3c" />
      </g>
      <g className="pp-drop" style={{ animationDelay: "0.45s" }}>
        <g transform="translate(0 -74)">
          <rect x={-30} y={-13} width={60} height={24} rx={12} fill="#5b3221" />
          <text y={4.5} textAnchor="middle" className="pp-display" fontSize={14} fill="#fff6ec">
            {cm(mm)}cm
          </text>
        </g>
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
      <rect x={xa} y={Y - 4.5} width={xb - xa} height={9} rx={3} fill="#e8b46c" stroke="#a8743d" strokeWidth={1.2} />
      {xb > chocoFrom && (
        <>
          <rect x={chocoFrom} y={Y - 5.5} width={xb - chocoFrom} height={11} rx={4} fill="#5b3221" />
          <rect
            x={chocoFrom + 2}
            y={Y - 3.6}
            width={Math.max(0, xb - chocoFrom - 4)}
            height={2.2}
            rx={1.1}
            fill="#8a5a3c"
          />
        </>
      )}
    </g>
  );
}

/** 머리 위 말풍선 */
function Bubble({ side, x, text }: { side: "left" | "right"; x: number; text?: string | null }) {
  if (!text) return null;
  const hx = Math.min(W - 40, Math.max(40, x + (side === "left" ? -24 : 24) * F));
  const y = Y - 90;
  const w = Math.max(46, [...text].length * 15 + 20);
  return (
    <g key={text} className="pp-pop" style={{ transformOrigin: `${hx}px ${y + 16}px` }}>
      <rect x={hx - w / 2} y={y - 14} width={w} height={28} rx={14} fill="#fff" stroke="#4a2f27" strokeWidth={2} />
      <path
        d={`M${hx - 5} ${y + 13} L${hx} ${y + 21} L${hx + 5} ${y + 13}`}
        fill="#fff"
        stroke="#4a2f27"
        strokeWidth={2}
        strokeLinejoin="round"
      />
      <rect x={hx - 6} y={y + 10} width={12} height={4} fill="#fff" />
      <text x={hx} y={y + 5.5} textAnchor="middle" className="pp-display" fontSize={15} fill="#4a2f27">
        {text}
      </text>
    </g>
  );
}

function Question({ x }: { x: number }) {
  return (
    <text x={x} y={Y - 12} textAnchor="middle" className="pp-display pp-float" fontSize={30} fill="#a99a8c">
      ?
    </text>
  );
}

function Burst({ x, y }: { x: number; y: number }) {
  const pts = Array.from({ length: 20 }, (_, i) => {
    const r = i % 2 ? 16 : 27;
    const a = (i / 20) * Math.PI * 2;
    return `${x + Math.cos(a) * r * 1.35},${y + Math.sin(a) * r}`;
  }).join(" ");
  return <polygon points={pts} fill="#ff5f7e" stroke="#4a2f27" strokeWidth={2.2} strokeLinejoin="round" />;
}

function Sparkles({ x }: { x: number }) {
  const spots: [number, number, number][] = [
    [-30, -34, 0],
    [28, -38, 0.12],
    [-18, 28, 0.24],
    [22, 24, 0.08],
  ];
  return (
    <g>
      {spots.map(([dx, dy, delay]) => (
        <g key={`${dx}${dy}`} transform={`translate(${x + dx} ${Y + dy})`}>
          <path
            d="M0 -7 Q1 -1 7 0 Q1 1 0 7 Q-1 1 -7 0 Q-1 -1 0 -7 Z"
            fill="#ffd34d"
            className="pp-twinkle"
            style={{ animationDelay: `${delay}s` }}
          />
        </g>
      ))}
    </g>
  );
}

/** 전설 등급에 내리는 꽃가루 */
function Confetti() {
  const colors = ["#5b3221", "#ff8fab", "#e8b46c", "#ffd34d", "#6cc4a9"];
  return (
    <g>
      {Array.from({ length: 28 }, (_, i) => {
        const x = ((i * 97) % (W - 12)) + 6;
        return (
          <rect
            key={i}
            x={x}
            y={-12}
            width={5}
            height={9}
            rx={2}
            fill={colors[i % colors.length]}
            className="pp-confetti"
            style={{ animationDelay: `${(i % 7) * 0.09}s`, animationDuration: `${1.5 + (i % 5) * 0.2}s` }}
          />
        );
      })}
    </g>
  );
}

function NameTag({ x, name, color }: { x: number; name: string; color: string }) {
  return (
    <g transform={`translate(${x} ${H - 16})`}>
      <rect x={-41} y={-12} width={82} height={23} rx={11.5} fill="#fffaf3" stroke={color} strokeWidth={2.2} />
      <text y={4.5} textAnchor="middle" fontSize={12.5} fontWeight={700} fill="#4a2f27">
        {name}
      </text>
    </g>
  );
}
