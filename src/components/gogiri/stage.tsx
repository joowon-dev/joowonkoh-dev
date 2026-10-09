"use client";

import {
  motion,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useEffect, useRef, type CSSProperties, type PointerEvent, type ReactNode } from "react";
import { G, IMG } from "./palette";

/**
 * 장면과 장면이 겹치는 길이(화면 높이의 몇 배).
 *
 * 앞 장면은 끝난 모습 그대로 이만큼 더 붙어 있고, 그동안 다음 장면이 그 위에서
 * 서서히 나타난다. 장면마다 끊겨 넘어가지 않고 한 롤의 필름처럼 이어지게 하려고.
 */
export const SEAM = 0.8;

/**
 * 다음 장면을 앞 장면 위로 겹쳐 올린다.
 *
 * 화면 한 장 + SEAM 만큼 위로 당겨 두면, 이 장면의 머리가 화면 위에 닿는 순간
 * 앞 장면은 아직 붙어 있다. 그때부터 SEAM 만큼 내리는 동안 0 → 1 로 짙어진다.
 * 머리가 아래에서 올라오는 동안에는 보이지 않으니 눌리지도 않게 한다.
 */
export function Seam({ children }: { children: ReactNode }) {
  const mark = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: mark, offset: ["start start", "end start"] });
  // 함수로 거친다. ScrollStage 의 progress 와 같은 이유(ViewTimeline 으로 넘어가면 0 에 멈춘다)
  const opacity = useTransform(() => scrollYProgress.get());
  const pointerEvents = useTransform(() => (scrollYProgress.get() < 0.6 ? "none" : "auto"));
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="relative"
      style={{ marginTop: `-${(1 + SEAM) * 100}svh`, opacity: reduce ? 1 : opacity, pointerEvents }}
    >
      <div ref={mark} aria-hidden className="pointer-events-none absolute inset-x-0 top-0" style={{ height: `${SEAM * 100}svh` }} />
      {children}
    </motion.div>
  );
}

/**
 * 스크롤로 진행되지 않는 장면(메뉴판, 먹기, 정보)을 끝난 모습 그대로 SEAM 만큼 붙잡아 둔다.
 * 장면이 화면보다 길 수 있어서, 아래 끝이 화면 아래에 닿았을 때 붙도록 top 을 재서 준다.
 */
export function Hold({ children }: { children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const ro = new ResizeObserver(() => {
      el.style.top = `min(0px, calc(100svh - ${el.offsetHeight}px))`;
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div>
      <div ref={ref} className="sticky top-0">
        {children}
      </div>
      <div aria-hidden style={{ height: `${SEAM * 100}svh` }} />
    </div>
  );
}

/**
 * 스크롤로 진행되는 장면의 틀.
 *
 * 바깥 섹션은 화면 몇 장 높이로 길고, 안쪽 무대는 화면에 붙어 있다.
 * 섹션을 지나가는 동안 progress 가 0 → 1 로 간다. 끝에는 SEAM 만큼 더 붙어 있어
 * 다음 장면이 겹쳐 올라올 자리를 낸다(그동안 progress 는 1). 움직임을 줄이라는
 * 설정이면 처음부터 1(다 그려진 모습)을 준다.
 */
export function ScrollStage({
  screens = 2.6,
  children,
  background = G.inkDeep,
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
  // 붙어 있는 구간 (screens - 1 + SEAM) 가운데 앞의 (screens - 1) 동안 0 → 1, 나머지는 1
  const progress = useTransform(() => Math.min(1, (scrollYProgress.get() * (screens - 1 + SEAM)) / (screens - 1)));
  const done = useMotionValue(1);
  const reduce = useReducedMotion();

  return (
    <section ref={ref} className="relative" style={{ height: `${(screens + SEAM) * 100}svh`, background }}>
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
