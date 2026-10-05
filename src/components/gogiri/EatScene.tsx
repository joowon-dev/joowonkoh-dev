"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import BowlArt from "./BowlArt";
import { BITES, eat, initialEat, type EatPhase } from "./eat";
import { G, SERIF } from "./palette";
import { Caption } from "./stage";

const GUIDE: Record<EatPhase, string> = {
  dry: "나온 그대로, 비비지 말고 김가루째 한 젓가락씩.",
  pour: "1/3 남았다. 주전자를 꾹 누르고 있으면 동치미 육수가 들어간다.",
  broth: "고소한 면에 시원한 국물이 얹혔다. 마저 후루룩.",
  done: "한 그릇 끝.",
};

/** 육수를 그릇 가득 붓는 데 걸리는 시간(ms) */
const POUR_MS = 1800;

/** 직접 먹어 보는 장면. 젓가락으로 집고, 1/3 남으면 육수를 붓는다. */
export default function EatScene({ children }: { children?: ReactNode }) {
  const [state, dispatch] = useReducer(eat, initialEat);
  const [pouring, setPouring] = useState(false);
  const raf = useRef<number | null>(null);
  const reduce = useReducedMotion();

  const eaten = BITES - state.noodles + (state.phase === "done" ? 1 : 0);

  function stopPour() {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
    setPouring(false);
  }

  function startPour() {
    if (raf.current !== null || state.phase !== "pour") return;
    setPouring(true);
    let last = performance.now();
    // 가득 차면 주전자가 사라져 pointerup 이 안 올 수 있다. 여기서 직접 멈춘다.
    let filled = state.broth;
    const tick = (now: number) => {
      const amount = (now - last) / POUR_MS;
      dispatch({ type: "pour", amount });
      last = now;
      filled += amount;
      if (filled >= 1) {
        stopPour();
        return;
      }
      raf.current = requestAnimationFrame(tick);
    };
    raf.current = requestAnimationFrame(tick);
  }

  useEffect(() => () => {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
  }, []);

  const tasteSavory = 1 - state.broth * 0.35;
  const tasteCool = state.broth;

  return (
    <section
      className="relative flex min-h-svh flex-col items-center justify-center gap-6 px-5 pt-28 pb-16"
      style={{ background: G.forest }}
    >
      <p
        aria-live="polite"
        className="max-w-md text-center text-xl font-bold leading-snug sm:text-2xl"
        style={{ fontFamily: SERIF, color: G.mist }}
      >
        {GUIDE[state.phase]}
      </p>

      <div className="relative flex items-end justify-center gap-2">
        {/* 그릇 — 눌러도 한 젓가락 */}
        <button
          type="button"
          onClick={() => dispatch({ type: "bite" })}
          disabled={state.phase === "pour" || state.phase === "done"}
          aria-label={`한 젓가락 먹기, ${state.noodles} 젓가락 남음`}
          className="relative aspect-square w-[min(68vw,400px,52svh)] rounded-full focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F3CD72] disabled:cursor-default"
        >
          <BowlArt
            className="w-full"
            noodles={state.noodles / BITES}
            broth={state.broth}
            title=""
          />
          {/* 젓가락이 면을 집어 올린다 */}
          <AnimatePresence>
            {eaten > 0 && state.phase !== "done" && !reduce && (
              <motion.svg
                key={eaten}
                viewBox="0 0 60 160"
                className="pointer-events-none absolute left-[46%] top-[-18%] w-[16%]"
                initial={{ y: "55%", opacity: 1 }}
                animate={{ y: "-35%", opacity: 0 }}
                transition={{ duration: 0.75, ease: [0.16, 1, 0.3, 1] }}
                aria-hidden
              >
                <rect x="18" y="0" width="5" height="120" rx="2" fill="#B88A55" transform="rotate(-4 20 60)" />
                <rect x="36" y="0" width="5" height="120" rx="2" fill="#B88A55" transform="rotate(4 38 60)" />
                {[0, 1, 2, 3, 4].map((i) => (
                  <path
                    key={i}
                    d={`M${22 + i * 3} 112 C${16 + i * 4} 132 ${30 + i * 2} 140 ${24 + i * 3} 158`}
                    stroke={state.phase === "broth" ? G.noodleDark : G.noodle}
                    strokeWidth="2.6"
                    fill="none"
                    strokeLinecap="round"
                  />
                ))}
              </motion.svg>
            )}
          </AnimatePresence>
        </button>

        {/* 동치미 주전자 */}
        <AnimatePresence>
          {state.phase === "pour" && (
            <motion.button
              type="button"
              aria-label="육수 붓기 — 누르고 있기"
              className="absolute -right-2 top-[-10%] w-[30%] max-w-[130px] touch-none select-none focus-visible:outline-2 focus-visible:outline-[#F3CD72] sm:-right-16"
              initial={{ opacity: 0, x: 40 }}
              animate={{ opacity: 1, x: 0, rotate: pouring ? -38 : 0 }}
              exit={{ opacity: 0, x: 40 }}
              transition={{ duration: 0.35 }}
              style={{ originX: 0.2, originY: 0.8 }}
              onPointerDown={(e) => {
                e.currentTarget.setPointerCapture(e.pointerId);
                startPour();
              }}
              onPointerUp={stopPour}
              onPointerCancel={stopPour}
              onKeyDown={(e) => {
                if (e.key === " " || e.key === "Enter") {
                  e.preventDefault();
                  dispatch({ type: "pour", amount: 0.34 });
                }
              }}
            >
              <svg viewBox="0 0 100 110" className="w-full" aria-hidden>
                <path d="M22 30 Q20 100 30 104 L74 104 Q84 100 82 30 Z" fill={G.bowl} />
                <path d="M22 30 L6 18 L12 14 L28 26" fill={G.bowl} />
                <path d="M82 40 Q100 48 94 70 Q90 82 80 80" fill="none" stroke={G.bowl} strokeWidth="7" />
                <rect x="20" y="26" width="64" height="8" rx="3" fill={G.bowlShade} />
                <path d="M26 60 Q52 54 78 60 L76 100 L30 100 Z" fill={G.broth} />
              </svg>
              {pouring && (
                <span
                  className="absolute left-[2%] top-[14%] block h-[120%] w-[5px] rounded-full"
                  style={{ background: G.broth, transform: "rotate(38deg)", transformOrigin: "top" }}
                  aria-hidden
                />
              )}
              <span className="mt-1 block text-center text-xs" style={{ color: G.mistDim }}>
                꾹 누르기
              </span>
            </motion.button>
          )}
        </AnimatePresence>
      </div>

      {/* 맛 */}
      <div className="grid w-[min(86vw,360px)] grid-cols-2 gap-4 text-sm" style={{ color: G.mistDim }}>
        <Meter label="고소함" value={tasteSavory} color={G.oil} />
        <Meter label="시원함" value={tasteCool} color={G.broth} />
      </div>

      <div className="flex gap-3">
        {state.phase !== "done" ? (
          <button
            type="button"
            onClick={() => dispatch({ type: "bite" })}
            disabled={state.phase === "pour"}
            className="rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3CD72]"
            style={{ background: G.oil, color: G.gim }}
          >
            한 젓가락
          </button>
        ) : (
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="rounded-full px-5 py-2.5 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3CD72]"
            style={{ background: G.oil, color: G.gim }}
          >
            한 그릇 더
          </button>
        )}
      </div>

      <Caption>{children}</Caption>
    </section>
  );
}

function Meter({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div>
      <span>{label}</span>
      <div className="mt-1.5 h-2 overflow-hidden rounded-full" style={{ background: G.moss }}>
        <div
          className="h-full rounded-full transition-[width] duration-300"
          style={{ width: `${Math.round(value * 100)}%`, background: color }}
        />
      </div>
    </div>
  );
}
