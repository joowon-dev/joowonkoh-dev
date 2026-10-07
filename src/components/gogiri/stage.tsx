"use client";

import { useMotionValue, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import { useRef, type ReactNode } from "react";
import { G } from "./palette";

/**
 * 스크롤로 진행되는 장면의 틀.
 *
 * 바깥 섹션은 화면 몇 장 높이로 길고, 안쪽 무대는 화면에 붙어 있다.
 * 섹션을 지나가는 동안 progress 가 0 → 1 로 간다. 움직임을 줄이라는
 * 설정이면 처음부터 1(다 그려진 모습)을 준다.
 */
export function ScrollStage({
  screens = 2.6,
  children,
  background = G.ink,
}: {
  /** 섹션 길이, 화면 높이의 몇 배인지 */
  screens?: number;
  children: (progress: MotionValue<number>) => ReactNode;
  background?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  // 함수로 한 번 거쳐서 JS 로만 계산하게 한다. 그대로 넘기면 motion 이 opacity 를
  // 브라우저 ViewTimeline 으로 넘기는데, sticky 섹션에서 구간을 잘못 잡아
  // 0 에 멈춘다(그릇 장면의 들기름·김가루가 끝까지 안 나왔다).
  const progress = useTransform(() => scrollYProgress.get());
  const done = useMotionValue(1);
  const reduce = useReducedMotion();

  return (
    <section ref={ref} className="relative" style={{ height: `${screens * 100}svh`, background }}>
      <div className="sticky top-0 h-svh overflow-hidden">{children(reduce ? done : progress)}</div>
    </section>
  );
}

/** 장면 위에 얹는 후기 글. MDX 에서 넘어온 문단을 그대로 받는다. */
/** 어두운 나무 바탕에 은은한 창살 무늬 */
export const LATTICE_BG = {
  backgroundColor: G.inkDeep,
  backgroundImage:
    "linear-gradient(rgba(246,221,166,0.05) 2px, transparent 2px), linear-gradient(90deg, rgba(246,221,166,0.05) 2px, transparent 2px)",
  backgroundSize: "44px 44px",
} as const;

export function Caption({ children, className = "" }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <div
      className={`max-w-md rounded-2xl px-5 py-4 backdrop-blur-md [&_p]:my-2 [&_p]:max-w-none [&_p]:text-[15px] [&_p]:leading-[1.75] [&_p]:text-[#EFE9DC] [&_strong]:text-[#F3CD72] ${className}`}
      style={{ background: "rgba(26, 23, 20, 0.8)" }}
    >
      {children}
    </div>
  );
}
