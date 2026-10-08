"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

/** 사이트 공통 모션 곡선 — 빠르게 나가고 천천히 앉는다. */
export const EASE: [number, number, number, number] = [0.16, 1, 0.3, 1];

/** 식판에 무언가 떨어질 때의 탄성. 살짝 튀고 바로 앉는다. */
export const DROP = { type: "spring", stiffness: 520, damping: 17 } as const;

/** 화면에 들어올 때 한 번 떠오르는 껍데기. */
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      className={className}
      initial={{ opacity: 0, y: 20, filter: "blur(6px)" }}
      whileInView={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.7, delay, ease: EASE }}
    >
      {children}
    </motion.div>
  );
}
