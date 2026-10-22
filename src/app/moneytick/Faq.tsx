"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { LANDING } from "./copy";
import type { Lang } from "./i18n";
import { EASE } from "./motion";

/**
 * 자주 묻는 질문 — 접어 둔다.
 *
 * 답은 궁금한 사람만 읽으면 되는 글이라, 펼쳐 놓으면 페이지가 설명서가 된다.
 * 질문 여섯 줄만 보이고, 누른 것 하나만 열린다. 질문과 답은 언어별 문구(`copy/*.ts`)에 있다.
 */


export default function Faq({ lang }: { lang: Lang }) {
  const FAQ = LANDING[lang].faq;
  const [open, setOpen] = useState<string | null>(null);

  return (
    <div className="overflow-hidden rounded-[22px] bg-[#F2F2F7]">
      {FAQ.map((item, i) => {
        const isOpen = open === item.q;
        return (
          <div
            key={item.q}
            className={i > 0 ? "border-t border-[rgba(0,0,0,0.08)]" : ""}
          >
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : item.q)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left"
            >
              <span className="text-[16px] font-semibold leading-[22px] tracking-[-0.408px] text-black">
                {item.q}
              </span>
              <motion.span
                animate={{ rotate: isOpen ? 45 : 0 }}
                transition={{ duration: 0.3, ease: EASE }}
                className="shrink-0 text-[20px] font-light leading-none text-[rgba(60,60,67,0.4)]"
                aria-hidden
              >
                +
              </motion.span>
            </button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="body"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.35, ease: EASE }}
                  className="overflow-hidden"
                >
                  <p className="max-w-[58ch] px-5 pb-5 text-[15px] leading-[1.7] tracking-[-0.24px] text-[rgba(60,60,67,0.7)]">
                    {item.a}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
