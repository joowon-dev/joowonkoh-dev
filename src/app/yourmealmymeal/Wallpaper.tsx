import type { CSSProperties, ReactNode } from "react";

import { C } from "./palette";

/**
 * 수저·포크·그릇·반짝이. 선으로 그리지 않고 통째로 채운다. 앱 로그인 화면의 무늬와 같은 모양이다.
 * 바탕에 옅게 흩뿌리고, 초대 페이지에서는 포크를 화살표로도 쓴다.
 */
export type MotifKind = "spoon" | "fork" | "bowl" | "star";

const VIEW_BOX: Record<MotifKind, [number, number]> = {
  spoon: [40, 96],
  fork: [40, 96],
  bowl: [60, 42],
  star: [40, 36],
};

function MotifShape({ kind }: { kind: MotifKind }) {
  if (kind === "spoon") {
    return (
      <>
        <ellipse cx={20} cy={23} rx={16.5} ry={21.5} />
        <rect x={13.5} y={38} width={13} height={58} rx={6.5} />
      </>
    );
  }
  if (kind === "fork") {
    return (
      <>
        <rect x={3.5} y={5} width={9.5} height={31} rx={4.75} />
        <rect x={15.25} y={5} width={9.5} height={31} rx={4.75} />
        <rect x={27} y={5} width={9.5} height={31} rx={4.75} />
        <rect x={5} y={27} width={30} height={19} rx={9.5} />
        <rect x={13.5} y={40} width={13} height={56} rx={6.5} />
      </>
    );
  }
  if (kind === "bowl") {
    return (
      <>
        <path d="M3 15h54c0 14.9-12.1 27-27 27S3 29.9 3 15z" />
        <rect x={0} y={8} width={60} height={9} rx={4.5} />
      </>
    );
  }
  return <path d="M20 0c1.9 12.6 5.5 16.2 18 18-12.5 1.8-16.1 5.4-18 18-1.9-12.6-5.5-16.2-18-18 12.5-1.8 16.1-5.4 18-18z" />;
}

export function Motif({
  kind,
  size,
  color,
  opacity = 1,
  className,
  style,
}: {
  kind: MotifKind;
  /** 높이(px). 너비는 비율로 정해진다. */
  size: number;
  color: string;
  opacity?: number;
  className?: string;
  style?: CSSProperties;
}) {
  const [w, h] = VIEW_BOX[kind];
  return (
    <svg
      width={(size * w) / h}
      height={size}
      viewBox={`0 0 ${w} ${h}`}
      fill={color}
      fillOpacity={opacity}
      className={className}
      style={style}
      aria-hidden
    >
      <MotifShape kind={kind} />
    </svg>
  );
}

/**
 * 오른쪽을 가리키는 작은 포크(갈래가 오른쪽). 글 사이의 "→" 대신 쓴다.
 * 돌린 svg 는 줄 높이를 망가뜨리므로, 처음부터 눕힌 viewBox 에 그린다.
 */
export function ForkRight({ height = 9, color = "currentColor", className }: { height?: number; color?: string; className?: string }) {
  return (
    <svg
      width={(height * 96) / 40}
      height={height}
      viewBox="0 0 96 40"
      fill={color}
      className={`inline-block shrink-0 align-middle ${className ?? ""}`}
      aria-hidden
    >
      <g transform="translate(96 0) rotate(90)">
        <MotifShape kind="fork" />
      </g>
    </svg>
  );
}

/** 바탕에 흩뿌릴 무늬 한 점. left·right 는 화면 가장자리에서 잰다. */
export type Spot = {
  kind: MotifKind;
  size: number;
  color: string;
  rotate: number;
  top: number;
  left?: string;
  right?: string;
  /** 좁은 화면에서 글과 겹치면 숨긴다. */
  wideOnly?: boolean;
};

const T = C.tomato;
const Y = C.yolk;
const M = C.mint;

/** 소개 첫 화면 — 왼쪽 위에 엇갈린 수저, 오른쪽 위에 그릇, 아래로 그릇·숟가락·반짝이. */
export const HERO_SPOTS: Spot[] = [
  { kind: "spoon", size: 78, color: T, rotate: -24, top: 26, left: "max(14px, calc(50% - 300px))" },
  { kind: "fork", size: 78, color: Y, rotate: 22, top: 30, left: "max(36px, calc(50% - 278px))" },
  { kind: "bowl", size: 34, color: M, rotate: -10, top: 70, right: "max(18px, calc(50% - 290px))" },
  { kind: "star", size: 18, color: Y, rotate: 10, top: 210, right: "max(30px, calc(50% - 230px))" },
  { kind: "star", size: 14, color: T, rotate: -12, top: 250, left: "max(26px, calc(50% - 240px))" },
  { kind: "bowl", size: 30, color: Y, rotate: 9, top: 470, left: "max(10px, calc(50% - 330px))", wideOnly: true },
  { kind: "spoon", size: 66, color: M, rotate: 32, top: 430, right: "max(10px, calc(50% - 320px))", wideOnly: true },
];

/** 글 위주의 페이지 — 머리말 오른쪽에만 조용히. */
export const QUIET_SPOTS: Spot[] = [
  { kind: "bowl", size: 30, color: M, rotate: -10, top: 26, right: "max(18px, calc(50% - 360px))" },
  { kind: "star", size: 14, color: Y, rotate: 10, top: 78, right: "max(64px, calc(50% - 300px))" },
  { kind: "fork", size: 66, color: T, rotate: 24, top: 120, right: "max(-6px, calc(50% - 440px))", wideOnly: true },
  { kind: "spoon", size: 66, color: Y, rotate: -20, top: 150, left: "max(-6px, calc(50% - 450px))", wideOnly: true },
];

/** 초대 페이지 — 급식판을 둘러싸게. */
export const JOIN_SPOTS: Spot[] = [
  { kind: "spoon", size: 70, color: T, rotate: -24, top: 22, left: "max(10px, calc(50% - 250px))" },
  { kind: "fork", size: 70, color: Y, rotate: 22, top: 26, left: "max(30px, calc(50% - 230px))" },
  { kind: "bowl", size: 32, color: M, rotate: -10, top: 60, right: "max(16px, calc(50% - 240px))" },
  { kind: "star", size: 16, color: Y, rotate: 10, top: 172, right: "max(36px, calc(50% - 190px))" },
  { kind: "star", size: 12, color: T, rotate: -12, top: 196, left: "max(36px, calc(50% - 190px))" },
  { kind: "bowl", size: 30, color: Y, rotate: 9, top: 420, left: "max(8px, calc(50% - 380px))", wideOnly: true },
  { kind: "spoon", size: 62, color: M, rotate: 32, top: 520, right: "max(8px, calc(50% - 380px))", wideOnly: true },
];

/**
 * 밝은 회색 바탕. 앱의 배경과 같고, 네밥내밥 페이지 전체를 덮는다.
 * 흐린 빛 번짐 대신 수저 무늬를 옅게(0.18) 흩뿌린다. 넘치는 무늬는 잘라 가로 스크롤이 생기지 않게 한다.
 */
export default function Wallpaper({ spots, children }: { spots: Spot[]; children: ReactNode }) {
  return (
    <div className="relative min-h-dvh overflow-x-clip" style={{ background: C.bg, color: C.ink }}>
      <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
        {spots.map((s, i) => (
          <Motif
            key={i}
            kind={s.kind}
            size={s.size}
            color={s.color}
            opacity={0.18}
            className={`absolute ${s.wideOnly ? "hidden md:block" : ""}`}
            style={{ top: s.top, left: s.left, right: s.right, transform: `rotate(${s.rotate}deg)` }}
          />
        ))}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
