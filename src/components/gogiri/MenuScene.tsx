"use client";

import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useState, type ReactNode } from "react";
import { MENU, type MenuKey } from "./info";
import { G, SERIF } from "./palette";
import { Caption, Grain, Photo } from "./stage";

/** 메뉴판. 이름을 누르면 옆 사진이 그 메뉴로 바뀐다. */
export default function MenuScene({ children }: { children?: ReactNode }) {
  const [selected, setSelected] = useState<MenuKey>("deulgireum");
  const reduce = useReducedMotion();
  const item = MENU.find((m) => m.key === selected)!;

  return (
    <section className="relative min-h-svh overflow-hidden px-5 pt-28 pb-16 sm:px-10" style={{ background: G.inkDeep }}>
      <div className="relative mx-auto grid max-w-5xl items-center gap-10 md:grid-cols-[1fr_1.1fr]">
        <div>
          {/* 벽에 걸린 진짜 차림표 */}
          <div className="relative mb-6 aspect-[4/3] max-h-[30svh] overflow-hidden rounded-2xl">
            <Photo name="menu" alt="벽에 걸린 고기리막국수 차림표. 들기름막국수 12,000원, 수육 소 18,000원 중 27,000원" />
          </div>
          <p className="text-sm" style={{ color: G.mistDim }}>
            차림표
          </p>
          <div role="tablist" aria-label="메뉴" className="mt-4 flex flex-col">
            {MENU.map((m) => {
              const on = m.key === selected;
              return (
                <button
                  key={m.key}
                  role="tab"
                  aria-selected={on}
                  onClick={() => setSelected(m.key)}
                  onPointerEnter={(e) => e.pointerType === "mouse" && setSelected(m.key)}
                  className="group relative flex items-baseline justify-between gap-4 border-b py-4 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#F3CD72]"
                  style={{ borderColor: G.line }}
                >
                  <span
                    className="text-[clamp(1.4rem,3.4vw,2.1rem)] font-bold transition-colors duration-300"
                    style={{ fontFamily: SERIF, color: on ? G.oilLight : G.mistDim }}
                  >
                    {m.name}
                  </span>
                  <span className="shrink-0 text-sm tabular-nums" style={{ color: on ? G.mist : G.mistDim }}>
                    {m.price}
                  </span>
                  {on && (
                    <motion.span
                      layoutId="menu-underline"
                      className="absolute -bottom-px left-0 right-0 h-px"
                      style={{ background: G.oil }}
                    />
                  )}
                </button>
              );
            })}
          </div>
          <p className="mt-5 text-xs" style={{ color: G.mistDim }}>
            {MENU_NOTE}
          </p>
        </div>

        <div role="tabpanel" aria-label={item.name}>
          <div className="relative aspect-[4/5] w-full overflow-hidden rounded-[28px] shadow-[0_30px_100px_rgba(0,0,0,0.55)]">
            <AnimatePresence initial={false}>
              <motion.div
                key={selected}
                className="absolute inset-0"
                initial={reduce ? { opacity: 0 } : { clipPath: "inset(100% 0 0 0)", scale: 1.12 }}
                animate={reduce ? { opacity: 1 } : { clipPath: "inset(0% 0 0 0)", scale: 1 }}
                exit={{ opacity: 0.999 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <Photo name={item.photo} alt={item.name} />
              </motion.div>
            </AnimatePresence>
            <Grain />
          </div>
          <AnimatePresence mode="wait" initial={false}>
            <motion.p
              key={selected}
              className="mt-4 text-[15px] leading-[1.7]"
              style={{ color: G.mist }}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.3 }}
            >
              {item.note}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>

      <Caption className="relative mx-auto mt-12">{children}</Caption>
    </section>
  );
}

const MENU_NOTE = "벽에 걸린 차림표 기준. 가격은 바뀔 수 있으니 가기 전에 확인하세요.";
