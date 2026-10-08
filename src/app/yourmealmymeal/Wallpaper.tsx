"use client";

import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { useRef, type ReactNode } from "react";

import { C } from "./palette";

/**
 * 수저·포크·그릇·반짝이. 앱처럼 선으로 그리지 않고 통째로 채운다 — 90년대 문구류 포장지처럼.
 * 앱의 `Motif.tsx` 와 같은 도형이다.
 */
export type MotifKind = "spoon" | "fork" | "bowl" | "star";

const VIEW_BOX: Record<MotifKind, [number, number]> = {
  spoon: [40, 100],
  fork: [40, 100],
  bowl: [60, 46],
  star: [40, 40],
};

export function Motif({
  kind,
  size,
  color,
  opacity = 1,
}: {
  kind: MotifKind;
  /** 높이(px). 너비는 비율로 정해진다. */
  size: number;
  color: string;
  opacity?: number;
}) {
  const [w, h] = VIEW_BOX[kind];
  return (
    <svg width={(size * w) / h} height={size} viewBox={`0 0 ${w} ${h}`} fill={color} fillOpacity={opacity} aria-hidden>
      {kind === "spoon" ? (
        <>
          <ellipse cx={20} cy={23} rx={16.5} ry={21.5} />
          <rect x={13.5} y={38} width={13} height={58} rx={6.5} />
        </>
      ) : kind === "fork" ? (
        <>
          <rect x={3.5} y={5} width={9.5} height={31} rx={4.75} />
          <rect x={15.25} y={5} width={9.5} height={31} rx={4.75} />
          <rect x={27} y={5} width={9.5} height={31} rx={4.75} />
          <rect x={5} y={27} width={30} height={19} rx={9.5} />
          <rect x={13.5} y={40} width={13} height={56} rx={6.5} />
        </>
      ) : kind === "bowl" ? (
        <>
          <path d="M3 15h54c0 14.9-12.1 27-27 27S3 29.9 3 15z" />
          <rect x={0} y={8} width={60} height={9} rx={4.5} />
        </>
      ) : (
        <path d="M20 0c1.9 12.6 5.5 16.2 18 18-12.5 1.8-16.1 5.4-18 18-1.9-12.6-5.5-16.2-18-18 12.5-1.8 16.1-5.4 18-18z" />
      )}
    </svg>
  );
}

const TOMATO = { color: C.tomato, opacity: 0.2 };
const MINT = { color: C.tray, opacity: 0.5 };
const YOLK = { color: C.yolk, opacity: 0.32 };

/** 퍼센트 좌표. 손으로 놓은 자리라 규칙이 없다. depth 가 클수록 스크롤에 더 늦게 따라온다. */
const SCATTER = [
  { x: -3, y: 2, kind: "spoon", size: 84, rotate: -18, paint: TOMATO, depth: 0.5 },
  { x: 86, y: 1, kind: "fork", size: 78, rotate: 22, paint: MINT, depth: 0.8 },
  { x: 40, y: 6, kind: "star", size: 30, rotate: 0, paint: YOLK, depth: 1.2 },
  { x: 92, y: 14, kind: "bowl", size: 46, rotate: -10, paint: TOMATO, depth: 0.6 },
  { x: 3, y: 22, kind: "star", size: 26, rotate: 12, paint: MINT, depth: 1.1 },
  { x: 90, y: 30, kind: "spoon", size: 88, rotate: 14, paint: YOLK, depth: 0.7 },
  { x: -4, y: 40, kind: "fork", size: 84, rotate: -24, paint: MINT, depth: 0.9 },
  { x: 55, y: 47, kind: "star", size: 28, rotate: -8, paint: TOMATO, depth: 1.3 },
  { x: 93, y: 54, kind: "bowl", size: 44, rotate: 12, paint: MINT, depth: 0.5 },
  { x: 2, y: 62, kind: "spoon", size: 78, rotate: 20, paint: TOMATO, depth: 0.8 },
  { x: 84, y: 71, kind: "fork", size: 90, rotate: -16, paint: YOLK, depth: 1 },
  { x: -2, y: 82, kind: "bowl", size: 50, rotate: -8, paint: MINT, depth: 0.6 },
  { x: 48, y: 90, kind: "star", size: 30, rotate: 10, paint: TOMATO, depth: 1.2 },
  { x: 90, y: 93, kind: "spoon", size: 74, rotate: -22, paint: TOMATO, depth: 0.7 },
] as const;

function Spot({ s, progress }: { s: (typeof SCATTER)[number]; progress: ReturnType<typeof useScroll>["scrollYProgress"] }) {
  const y = useTransform(progress, [0, 1], [0, -160 * s.depth]);
  const rotate = useTransform(progress, [0, 1], [s.rotate, s.rotate + 40 * (s.depth - 0.85)]);
  return (
    <motion.div className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%`, y, rotate }}>
      <Motif kind={s.kind} size={s.size} color={s.paint.color} opacity={s.paint.opacity} />
    </motion.div>
  );
}

/**
 * 크림 바탕에 수저를 흩뿌린 벽지. 앱의 배경과 같고, 네밥내밥 페이지 전체를 덮는다.
 * 스크롤하면 도형마다 다른 속도로 흘러 깊이가 생긴다. 움직임 줄이기를 켠 사람에게는 멈춰 있다.
 */
export default function Wallpaper({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const still = useReducedMotion();

  return (
    <div ref={ref} className="relative min-h-dvh overflow-hidden" style={{ background: C.bg, color: C.ink }}>
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        {SCATTER.map((s, i) =>
          still ? (
            <div key={i} className="absolute" style={{ left: `${s.x}%`, top: `${s.y}%`, transform: `rotate(${s.rotate}deg)` }}>
              <Motif kind={s.kind} size={s.size} color={s.paint.color} opacity={s.paint.opacity} />
            </div>
          ) : (
            <Spot key={i} s={s} progress={scrollYProgress} />
          ),
        )}
      </div>
      <div className="relative">{children}</div>
    </div>
  );
}
