"use client";

import { useCallback, useEffect, useRef, useState } from "react";

/**
 * The app's central idea, running in the page: type and he speeds up.
 *
 * The Mac app reads the system idle-time clock so it can feel typing anywhere
 * without a permission. A web page has no such reach and should not want one,
 * so this listens to a text box the visitor is actually typing in. Same
 * response curve, honest about its scope.
 */

const FRAME_COUNT = 84;
const COLUMNS = 12;
const ROWS = 7;
const FRAME_W = 156;
const FRAME_H = 210;
const FPS = 24;

// Matches Tuning.swift, so the page and the app behave the same.
const MAX_TEMPO = 2.4;
const TEMPO_ATTACK = 2.4;
const TEMPO_RELEASE = 0.75;
const KEYS_PER_SECOND_FOR_MAX = 7;
const TYPING_WINDOW = 1.6;
const EXCITEMENT_HOLD = 1.2;
const SWELL = 0.06;
const SWELL_FOLLOW = 3;

const PROMPTS = [
  "여기에 아무거나 쳐보세요",
  "빠르게 칠수록 신나 합니다",
  "손을 멈추면 천천히 가라앉아요",
];

export default function DancePreview() {
  const [frame, setFrame] = useState(0);
  const [scale, setScale] = useState(1);
  const [tempo, setTempo] = useState(1);
  const [prompt, setPrompt] = useState(PROMPTS[0]);

  // Kept in refs, not state: these change every animation frame and every
  // keystroke, and re-rendering React for each one would cost more than the
  // animation itself.
  const strokes = useRef<number[]>([]);
  const cursor = useRef(0);
  const tempoScale = useRef(1);
  const swell = useRef(0);
  const lastFrame = useRef(-1);

  const registerKey = useCallback(() => {
    strokes.current.push(performance.now() / 1000);
  }, []);

  useEffect(() => {
    // Respect a visitor who has asked for less motion: never start the loop, so
    // he holds the pose he already renders with rather than dancing.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let raf = 0;
    let last = performance.now() / 1000;

    const tick = () => {
      const now = performance.now() / 1000;
      // Clamp: a backgrounded tab can hand back a dt of many seconds, which
      // would fling the cursor and spike the tempo filter.
      const dt = Math.min(0.1, Math.max(0, now - last));
      last = now;

      const cutoff = now - TYPING_WINDOW;
      while (strokes.current.length && strokes.current[0] < cutoff) {
        strokes.current.shift();
      }
      const rate = strokes.current.length / TYPING_WINDOW;
      const excitement = Math.min(1, rate / KEYS_PER_SECOND_FOR_MAX);

      let target = 1 + excitement * (MAX_TEMPO - 1);
      const lastKey = strokes.current[strokes.current.length - 1];
      if (lastKey !== undefined && now - lastKey < EXCITEMENT_HOLD) {
        target = Math.max(target, 1 + 0.35 * (MAX_TEMPO - 1));
      }
      const speed = target > tempoScale.current ? TEMPO_ATTACK : TEMPO_RELEASE;
      tempoScale.current += (target - tempoScale.current) * Math.min(1, speed * dt);
      tempoScale.current = Math.max(1, Math.min(MAX_TEMPO, tempoScale.current));

      const excited = (tempoScale.current - 1) / (MAX_TEMPO - 1);
      swell.current += (excited - swell.current) * Math.min(1, SWELL_FOLLOW * dt);

      cursor.current = (cursor.current + dt * FPS * tempoScale.current) % FRAME_COUNT;
      const index = Math.floor(cursor.current);
      // Only ask React to render when the drawn frame actually changes: at the
      // base tempo that is 24 times a second, not 60.
      if (index !== lastFrame.current) {
        lastFrame.current = index;
        setFrame(index);
        setScale(1 + SWELL * swell.current);
        setTempo(tempoScale.current);
      }
      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  useEffect(() => {
    const id = setInterval(() => {
      setPrompt((current) => {
        const next = PROMPTS.indexOf(current) + 1;
        return PROMPTS[next % PROMPTS.length];
      });
    }, 5200);
    return () => clearInterval(id);
  }, []);

  const column = frame % COLUMNS;
  const row = Math.floor(frame / COLUMNS);

  return (
    <div className="overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient">
      <div className="flex items-end justify-center bg-tag-bg px-5 pt-8 pb-4">
        <div
          aria-hidden
          style={{
            width: FRAME_W,
            height: FRAME_H,
            backgroundImage: "url(/gaebari-dance/frames.webp)",
            backgroundSize: `${FRAME_W * COLUMNS}px ${FRAME_H * ROWS}px`,
            backgroundPosition: `-${column * FRAME_W}px -${row * FRAME_H}px`,
            transform: `scale(${scale})`,
            transformOrigin: "bottom center",
          }}
        />
      </div>

      <div className="border-t border-border p-5">
        <label
          htmlFor="dance-input"
          className="block text-[11px] font-medium uppercase tracking-[0.15em] text-text-muted"
        >
          쳐보기
        </label>
        <input
          id="dance-input"
          type="text"
          onKeyDown={registerKey}
          placeholder={prompt}
          autoComplete="off"
          className="mt-2 w-full rounded-xl border border-border bg-bg px-4 py-3 text-sm text-text-primary outline-none transition-colors placeholder:text-text-muted focus:border-accent"
        />
        <div className="mt-3 flex items-center gap-3">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-tag-bg">
            <div
              className="h-full rounded-full bg-accent transition-[width] duration-100"
              style={{ width: `${((tempo - 1) / (MAX_TEMPO - 1)) * 100}%` }}
            />
          </div>
          <span className="w-14 shrink-0 text-right font-mono text-[11px] text-text-muted">
            {tempo.toFixed(2)}×
          </span>
        </div>
        <p className="mt-3 text-[11px] leading-relaxed text-text-muted">
          여기서는 이 칸에 치는 것만 셉니다. 앱은 어느 창에서 치든 반응합니다 —
          권한 없이요.
        </p>
      </div>
    </div>
  );
}
