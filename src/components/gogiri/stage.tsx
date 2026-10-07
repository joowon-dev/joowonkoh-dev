"use client";

import {
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { G, IMG } from "./palette";

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
      <div className="sticky top-0 h-svh overflow-hidden">
        {children(reduce ? done : progress)}
        <Grain />
      </div>
    </section>
  );
}

/** 사진 한 장. 글 안의 사진은 next/image 를 쓰지 않는다(MDXComponents 의 img 와 같은 이유). */
export function Photo({
  name,
  alt,
  className = "",
  style,
  eager = false,
}: {
  name: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
  eager?: boolean;
}) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={`${IMG}/${name}.webp`}
      alt={alt}
      className={`block h-full w-full object-cover ${className}`}
      style={style}
      loading={eager ? "eager" : "lazy"}
      decoding="async"
      draggable={false}
    />
  );
}

/** 필름 입자. 사진들이 한 롤에서 나온 것처럼 보이게 장면마다 얹는다. */
const GRAIN_SVG =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='160' height='160'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function Grain() {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-0 opacity-[0.09] mix-blend-overlay"
      style={{ backgroundImage: GRAIN_SVG }}
    />
  );
}

/** 장면 위에 얹는 후기 글. MDX 에서 넘어온 문단을 그대로 받는다. */
export function Caption({ children, className = "" }: { children?: ReactNode; className?: string }) {
  if (!children) return null;
  return (
    <div
      className={`max-w-md rounded-2xl px-5 py-4 backdrop-blur-md [&_p]:my-2 [&_p]:max-w-none [&_p]:text-[15px] [&_p]:leading-[1.75] [&_p]:text-[#EFE9DC] [&_strong]:text-[#F3CD72] ${className}`}
      style={{ background: "rgba(20, 18, 16, 0.62)" }}
    >
      {children}
    </div>
  );
}

/**
 * 포인터를 따라 살짝 기우는 값. 손을 떼면 제자리로 돌아온다.
 * 이벤트 핸들러에서 모션 값만 바꾸므로 다시 그리지 않는다.
 */
export function useTilt(max = 10) {
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-max, max]), { stiffness: 120, damping: 14 });
  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [max, -max]), { stiffness: 120, damping: 14 });

  function onPointerMove(e: PointerEvent<HTMLElement>) {
    const r = e.currentTarget.getBoundingClientRect();
    x.set((e.clientX - r.left) / r.width - 0.5);
    y.set((e.clientY - r.top) / r.height - 0.5);
  }
  function onPointerLeave() {
    x.set(0);
    y.set(0);
  }

  return { rotateX, rotateY, x, y, handlers: { onPointerMove, onPointerLeave } };
}

/** 항상 같은 값을 내는 난수(렌더 중에 Math.random 을 쓰지 않으려고) */
export function seeded(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}
