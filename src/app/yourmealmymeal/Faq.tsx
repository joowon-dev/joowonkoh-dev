"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { EASE } from "./motion";
import { C, CARD } from "./palette";

/** 누르면 열리는 질문 카드. 하나를 열면 나머지는 닫힌다. */
export default function Faq({ items }: { items: { q: string; a: string }[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const on = open === i;
        return (
          <motion.div
            key={item.q}
            layout
            className="overflow-hidden rounded-[22px] text-left"
            style={{ ...CARD, background: C.surface }}
          >
            <button
              type="button"
              aria-expanded={on}
              onClick={() => setOpen(on ? null : i)}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[16px] font-semibold leading-[1.4] tracking-[-0.01em] break-keep" style={{ color: C.ink }}>
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: on ? 45 : 0, backgroundColor: on ? C.yolk : C.surface, color: C.ink }}
                transition={{ type: "spring", stiffness: 400, damping: 22 }}
                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[20px] font-light"
                style={{ border: `1px solid ${on ? C.yolk : C.hairline}` }}
                aria-hidden
              >
                +
              </motion.span>
            </button>
            <AnimatePresence initial={false}>
              {on ? (
                <motion.div
                  key="a"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                >
                  <p
                    className="px-5 pb-5 text-[15px] leading-[1.8] break-keep"
                    style={{ color: C.body }}
                  >
                    {item.a}
                  </p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </motion.div>
        );
      })}
    </div>
  );
}
