"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import BowlArt from "./BowlArt";
import { MENU, type MenuKey } from "./info";
import { G, SERIF } from "./palette";
import { Caption } from "./stage";

/** 메뉴판. 이름을 누르면 가운데 그릇이 바뀐다. */
export default function MenuScene({ children }: { children?: ReactNode }) {
  const [selected, setSelected] = useState<MenuKey>("deulgireum");
  const reduce = useReducedMotion();
  const item = MENU.find((m) => m.key === selected)!;

  return (
    <section
      className="relative flex min-h-svh flex-col items-center justify-center gap-8 px-5 pt-28 pb-16"
      style={{ background: G.moss }}
    >
      <div className="grid w-full max-w-4xl items-center gap-8 md:grid-cols-[1fr_1.1fr]">
        {/* 나무 메뉴판 */}
        <div className="rounded-3xl p-6 sm:p-8" style={{ background: "#3A2A1B", boxShadow: "inset 0 0 0 6px #4C3825" }}>
          <p className="text-center text-xl font-bold" style={{ fontFamily: SERIF, color: G.oilLight }}>
            차림표
          </p>
          <div role="tablist" aria-label="메뉴" className="mt-5 flex flex-col">
            {MENU.map((m) => {
              const on = m.key === selected;
              return (
                <button
                  key={m.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setSelected(m.key)}
                  className="flex items-baseline justify-between gap-3 rounded-xl px-3 py-3 text-left transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#F3CD72]"
                  style={{ background: on ? "rgba(243, 205, 114, 0.14)" : "transparent" }}
                >
                  <span className="text-lg" style={{ fontFamily: SERIF, color: on ? G.oilLight : "#E9DCC6" }}>
                    {m.name}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums" style={{ color: on ? G.oilLight : "#B8A78C" }}>
                    {m.price}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="mt-4 px-3 text-xs" style={{ color: "#B8A78C" }}>
            가격은 바뀔 수 있어요. 방문 전 확인
          </p>
        </div>

        {/* 고른 그릇 */}
        <div role="tabpanel" className="flex flex-col items-center text-center">
          <div className="relative aspect-square w-[min(70vw,380px)]">
            <AnimatePresence mode="popLayout" initial={false}>
              <motion.div
                key={selected}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { opacity: 0, rotate: -40, scale: 0.8 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={reduce ? { opacity: 0 } : { opacity: 0, rotate: 40, scale: 0.8 }}
                transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
              >
                <BowlArt kind={selected} className="w-full" title={item.name} />
              </motion.div>
            </AnimatePresence>
          </div>
          <p className="mt-4 max-w-xs text-[15px] leading-[1.7]" style={{ color: G.mist }}>
            {item.note}
          </p>
        </div>
      </div>

      <Caption>{children}</Caption>
    </section>
  );
}
