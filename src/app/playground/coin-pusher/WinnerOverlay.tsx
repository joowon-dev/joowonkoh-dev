"use client";

import { useMemo } from "react";
import { createRng, randRange } from "./random";
import styles from "./confetti.module.css";

const CONFETTI_COUNT = 60;
const CONFETTI_COLORS = ["#f2c23e", "#5ec9a5", "#2563eb", "#ef6f6c", "#c9ced6"];

interface WinnerOverlayProps {
  name: string;
  seed: number;
  onRestart: () => void;
  onEdit: () => void;
}

export default function WinnerOverlay({ name, seed, onRestart, onEdit }: WinnerOverlayProps) {
  const confetti = useMemo(() => {
    const rng = createRng(seed);
    return Array.from({ length: CONFETTI_COUNT }, (_, i) => ({
      id: i,
      left: randRange(rng, 0, 100),
      delay: randRange(rng, 0, 1.2),
      duration: randRange(rng, 1.8, 3.4),
      size: randRange(rng, 6, 12),
      color: CONFETTI_COLORS[Math.floor(rng() * CONFETTI_COLORS.length)],
      tilt: randRange(rng, -60, 60),
    }));
  }, [seed]);

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-bg/92 backdrop-blur-sm">
      <div
        className="pointer-events-none absolute inset-0 overflow-hidden"
        role="presentation"
        aria-hidden="true"
      >
        {confetti.map((c) => (
          <span
            key={c.id}
            className={`absolute top-[-8%] block rounded-[2px] ${styles.piece}`}
            style={{
              left: `${c.left}%`,
              width: c.size,
              height: c.size * 1.6,
              backgroundColor: c.color,
              rotate: `${c.tilt}deg`,
              animationDuration: `${c.duration}s`,
              animationDelay: `${c.delay}s`,
            }}
          />
        ))}
      </div>

      <div
        className="relative z-10 px-6 text-center"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-accent">
          당첨
        </p>
        <p className="mt-4 font-display text-4xl font-bold leading-tight tracking-tight text-text-primary md:text-6xl">
          {name}
        </p>
        <p className="mt-3 text-sm text-text-secondary">가장 먼저 떨어졌습니다 🪙</p>

        <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <button
            type="button"
            onClick={onRestart}
            className="rounded-2xl bg-accent px-8 py-3.5 font-display text-sm font-semibold text-white shadow-ambient transition hover:shadow-ambient-hover active:scale-[0.98]"
          >
            같은 인원으로 다시
          </button>
          <button
            type="button"
            onClick={onEdit}
            className="rounded-2xl border border-border bg-card-bg px-8 py-3.5 font-display text-sm font-semibold text-text-primary transition hover:border-accent active:scale-[0.98]"
          >
            참가자 수정
          </button>
        </div>
      </div>
    </div>
  );
}
