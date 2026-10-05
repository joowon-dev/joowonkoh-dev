"use client";

import { useMotionValue, useReducedMotion, useScroll, type MotionValue } from "motion/react";
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
  background = G.forest,
}: {
  /** 섹션 길이, 화면 높이의 몇 배인지 */
  screens?: number;
  children: (progress: MotionValue<number>) => ReactNode;
  background?: string;
}) {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const done = useMotionValue(1);
  const reduce = useReducedMotion();

  return (
    <section ref={ref} className="relative" style={{ height: `${screens * 100}svh`, background }}>
      <div className="sticky top-0 h-svh overflow-hidden">{children(reduce ? done : scrollYProgress)}</div>
    </section>
  );
}

/** 장면 위에 얹는 후기 글. MDX 에서 넘어온 문단을 그대로 받는다. */
export function Caption({ children, className = "" }: { children: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <div
      className={`max-w-md rounded-2xl px-5 py-4 backdrop-blur-md [&_p]:my-2 [&_p]:max-w-none [&_p]:text-[15px] [&_p]:leading-[1.75] [&_p]:text-[#E4ECE6] [&_strong]:text-[#F3CD72] ${className}`}
      style={{ background: "rgba(15, 36, 27, 0.72)" }}
    >
      {children}
    </div>
  );
}
