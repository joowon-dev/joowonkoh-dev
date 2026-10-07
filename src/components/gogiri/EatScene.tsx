"use client";

import { AnimatePresence, motion, useAnimate, useReducedMotion } from "motion/react";
import { useEffect, useReducer, useRef, useState, type ReactNode } from "react";
import { BITES, eat, initialEat, type EatPhase } from "./eat";
import { G, IMG, SERIF } from "./palette";
import { Caption, Grain, Photo, useTilt } from "./stage";

const GUIDE: Record<EatPhase, string> = {
  dry: "나온 그대로, 비비지 말고 김가루째 한 젓가락씩.",
  pour: "1/3 남았다. 주전자를 꾹 누르고 있으면 동치미 육수가 들어간다.",
  broth: "고소한 면에 시원한 국물이 얹혔다. 마저 후루룩.",
  done: "한 그릇 끝.",
};

/** 육수를 그릇 가득 붓는 데 걸리는 시간(ms) */
const POUR_MS = 1800;
const RING = 2 * Math.PI * 48;

/** 직접 먹어 보는 장면. 위에서 본 진짜 그릇 사진 위에서 젓가락질하고 육수를 붓는다. */
export default function EatScene({ children }: { children?: ReactNode }) {
  const [state, dispatch] = useReducer(eat, initialEat);
  const [pouring, setPouring] = useState(false);
  const raf = useRef<number | null>(null);
  const reduce = useReducedMotion();
  const { rotateX, rotateY, handlers } = useTilt(12);
  const [scope, animate] = useAnimate();

  const eaten = (BITES - state.noodles) / BITES;

  function bite() {
    if (state.phase === "pour" || state.phase === "done") return;
    dispatch({ type: "bite" });
    if (reduce) return;
    animate(scope.current, { scale: [1, 0.965, 1] }, { duration: 0.45 });
    animate(".strand", { y: ["10%", "-85%"], opacity: [0, 1, 0] }, { duration: 0.9, ease: [0.16, 1, 0.3, 1] });
  }

  function stopPour() {
    if (raf.current !== null) cancelAnimationFrame(raf.current);
    raf.current = null;
    setPouring(false);
  }

  function startPour() {
    if (raf.current !== null || state.phase !== "pour") return;
    setPouring(true);
    let last = performance.now();
    // 가득 차면 주전자 버튼이 사라져 pointerup 이 안 올 수 있다. 여기서 직접 멈춘다.
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

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current);
    },
    [],
  );

  return (
    <section
      className="relative flex min-h-svh flex-col items-center justify-center gap-6 overflow-hidden px-5 pt-28 pb-16"
      style={{ background: G.inkDeep }}
    >
      <div className="absolute inset-0" aria-hidden>
        <Photo name="spread" alt="" className="scale-110 opacity-50 blur-xl" />
        <div className="absolute inset-0" style={{ background: "radial-gradient(circle at 50% 50%, rgba(20,18,16,0.35), rgba(20,18,16,0.9) 70%)" }} />
      </div>
      <Grain />

      <AnimatePresence mode="wait" initial={false}>
        <motion.p
          key={state.phase}
          aria-live="polite"
          className="relative max-w-md text-center text-xl font-bold leading-snug sm:text-2xl"
          style={{ fontFamily: SERIF, color: G.mist }}
          initial={{ opacity: 0, y: 10, filter: "blur(6px)" }}
          animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
          exit={{ opacity: 0, y: -10, filter: "blur(6px)" }}
          transition={{ duration: 0.4 }}
        >
          {GUIDE[state.phase]}
        </motion.p>
      </AnimatePresence>

      <div className="relative" style={{ perspective: 1000 }} {...handlers}>
        {/* 먹은 만큼 차오르는 테두리 */}
        <svg viewBox="0 0 100 100" className="pointer-events-none absolute -inset-[5%] h-[110%] w-[110%] -rotate-90" aria-hidden>
          <circle cx="50" cy="50" r="48" fill="none" stroke="rgba(239,233,220,0.12)" strokeWidth="0.6" />
          <circle
            cx="50"
            cy="50"
            r="48"
            fill="none"
            stroke={G.oil}
            strokeWidth="0.8"
            strokeLinecap="round"
            strokeDasharray={RING}
            strokeDashoffset={RING * (1 - eaten)}
            style={{ transition: "stroke-dashoffset 0.6s cubic-bezier(0.16,1,0.3,1)" }}
          />
        </svg>

        <motion.button
          ref={scope}
          type="button"
          onClick={bite}
          disabled={state.phase === "pour" || state.phase === "done"}
          aria-label={`한 젓가락 먹기, ${state.noodles} 젓가락 남음`}
          className="relative block aspect-square w-[min(74vw,440px,54svh)] rounded-full focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-[#F3CD72] disabled:cursor-default"
          style={{ rotateX, rotateY, filter: "drop-shadow(0 30px 40px rgba(0,0,0,0.55))" }}
        >
          <Photo name="bowl_top" alt="위에서 본 들기름막국수 한 그릇" className="object-contain!" />
          <motion.div className="absolute inset-0" animate={{ opacity: state.broth }} transition={{ duration: 0.2 }}>
            <Photo name="bowl_broth" alt="" className="object-contain!" />
          </motion.div>

          {/* 젓가락에 딸려 올라오는 면 */}
          <span
            className="strand pointer-events-none absolute left-[41%] top-[18%] block h-[48%] w-[18%] rounded-full opacity-0"
            style={{
              backgroundImage: `url(${IMG}/lift.webp)`,
              backgroundSize: "560% auto",
              backgroundPosition: "52% 18%",
              maskImage: "linear-gradient(black 55%, transparent)",
              WebkitMaskImage: "linear-gradient(black 55%, transparent)",
            }}
            aria-hidden
          />

          {/* 붓는 동안 퍼지는 물결 */}
          {pouring && !reduce && (
            <span className="pointer-events-none absolute inset-0" aria-hidden>
              {[0, 1, 2].map((i) => (
                <motion.span
                  key={i}
                  className="absolute left-1/2 top-1/2 block h-[30%] w-[30%] -translate-x-1/2 -translate-y-1/2 rounded-full border"
                  style={{ borderColor: "rgba(214,234,238,0.7)" }}
                  initial={{ scale: 0.2, opacity: 0.9 }}
                  animate={{ scale: 2.4, opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, delay: i * 0.45, ease: "easeOut" }}
                />
              ))}
            </span>
          )}
        </motion.button>

        {/* 동치미 줄기 */}
        <AnimatePresence>
          {pouring && (
            <motion.span
              className="pointer-events-none absolute left-1/2 top-[-60%] block h-[110%] w-[6px] -translate-x-1/2 rounded-full"
              style={{ background: `linear-gradient(transparent, ${G.broth} 30%, ${G.broth})`, originY: 0 }}
              initial={{ scaleY: 0, opacity: 0 }}
              animate={{ scaleY: 1, opacity: 0.85 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              aria-hidden
            />
          )}
        </AnimatePresence>
      </div>

      <div className="relative flex items-center gap-6 text-sm tabular-nums" style={{ color: G.mistDim }}>
        <span>
          남은 젓가락 <b style={{ color: G.mist }}>{state.noodles}</b> / {BITES}
        </span>
        <span>
          육수 <b style={{ color: G.mist }}>{Math.round(state.broth * 100)}%</b>
        </span>
      </div>

      <div className="relative flex gap-3">
        {state.phase === "pour" ? (
          <button
            type="button"
            className="touch-none select-none rounded-full px-6 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3CD72]"
            style={{ background: G.broth, color: G.gim }}
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
            {pouring ? "붓는 중…" : "꾹 눌러 육수 붓기"}
          </button>
        ) : state.phase !== "done" ? (
          <button
            type="button"
            onClick={bite}
            className="rounded-full px-6 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3CD72]"
            style={{ background: G.oil, color: G.gim }}
          >
            한 젓가락
          </button>
        ) : (
          <button
            type="button"
            onClick={() => dispatch({ type: "reset" })}
            className="rounded-full px-6 py-3 text-sm font-semibold focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3CD72]"
            style={{ background: G.oil, color: G.gim }}
          >
            한 그릇 더
          </button>
        )}
      </div>

      <Caption className="relative">{children}</Caption>
    </section>
  );
}
