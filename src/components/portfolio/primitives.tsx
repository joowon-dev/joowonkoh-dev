"use client";

import {
  motion,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
  type Variants,
} from "motion/react";
import { useEffect, useRef, useState, type ReactNode } from "react";

/** Supanova motion signature — slow-out, gentle settle. */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** Scroll-reveal wrapper: fades + rises + de-blurs when it enters the viewport. */
export function Reveal({
  children,
  delay = 0,
  y = 28,
  className,
  once = true,
}: {
  children: ReactNode;
  delay?: number;
  y?: number;
  className?: string;
  once?: boolean;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y, filter: "blur(8px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once, margin: "-80px" }}
      transition={{ duration: 0.9, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}

/** Stagger container + item pair for lists. */
export const stagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.09, delayChildren: 0.05 } },
};

export const staggerItem: Variants = {
  hidden: { opacity: 0, y: 24, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.8, ease: EASE } },
};

/** Word-by-word kinetic headline reveal. */
export function KineticText({
  text,
  className,
  delay = 0,
}: {
  text: string;
  className?: string;
  delay?: number;
}) {
  const words = text.split(" ");
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={i} className="inline-block overflow-hidden align-bottom">
          <motion.span
            className="inline-block"
            initial={{ y: "110%" }}
            animate={{ y: 0 }}
            transition={{ duration: 1, delay: delay + i * 0.08, ease: EASE }}
          >
            {word}
            {i < words.length - 1 ? " " : ""}
          </motion.span>
        </span>
      ))}
    </span>
  );
}

/** Count-up number that animates once scrolled into view. */
export function CountUp({
  value,
  suffix = "",
  prefix = "",
  comma = false,
  className,
}: {
  value: number;
  suffix?: string;
  prefix?: string;
  comma?: boolean;
  className?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: "-60px" });
  const mv = useMotionValue(0);
  const spring = useSpring(mv, { duration: 1600, bounce: 0 });
  const display = useTransform(spring, (v) => {
    const n = Math.round(v);
    return comma ? n.toLocaleString("en-US") : String(n);
  });

  useEffect(() => {
    if (inView) mv.set(value);
  }, [inView, value, mv]);

  return (
    <span ref={ref} className={className} style={{ fontVariantNumeric: "tabular-nums" }}>
      {prefix}
      <motion.span>{display}</motion.span>
      {suffix}
    </span>
  );
}

/** Infinite horizontal marquee. Duplicates children so the loop is seamless. */
export function Marquee({
  children,
  duration = 30,
  reverse = false,
  className,
}: {
  children: ReactNode;
  duration?: number;
  reverse?: boolean;
  className?: string;
}) {
  return (
    <div className={`group relative flex overflow-hidden ${className ?? ""}`}>
      <motion.div
        className="flex shrink-0 items-center gap-4 pr-4"
        animate={{ x: reverse ? ["-50%", "0%"] : ["0%", "-50%"] }}
        transition={{ duration, ease: "linear", repeat: Infinity }}
      >
        {children}
        {children}
      </motion.div>
    </div>
  );
}

/** CTA that leans toward the cursor while hovered (Supanova magnetic physics). */
export function MagneticButton({
  children,
  className,
  href,
  external,
}: {
  children: ReactNode;
  className?: string;
  href: string;
  external?: boolean;
}) {
  const ref = useRef<HTMLAnchorElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 260, damping: 18 });
  const sy = useSpring(y, { stiffness: 260, damping: 18 });
  const [hovered, setHovered] = useState(false);

  const onMove = (e: React.MouseEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    x.set((e.clientX - (r.left + r.width / 2)) * 0.35);
    y.set((e.clientY - (r.top + r.height / 2)) * 0.35);
  };
  const reset = () => {
    x.set(0);
    y.set(0);
    setHovered(false);
  };

  return (
    <motion.a
      ref={ref}
      href={href}
      target={external ? "_blank" : undefined}
      rel={external ? "noopener noreferrer" : undefined}
      onMouseMove={onMove}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={reset}
      style={{ x: sx, y: sy }}
      animate={{ scale: hovered ? 1.03 : 1 }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={className}
    >
      {children}
    </motion.a>
  );
}
