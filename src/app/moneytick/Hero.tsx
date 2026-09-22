"use client";

import { motion } from "motion/react";
import type { ReactNode } from "react";

import { EASE } from "./motion";

/**
 * 첫 화면 — 한 줄로 끝낸다.
 *
 * 무슨 앱인지는 바로 아래 숫자가 스스로 증명하므로, 여기서 설명을 늘어놓을
 * 이유가 없다. 아이콘·이름·한 줄·버튼이 차례로 올라오고 끝.
 */

const RISE = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function Hero({
  appStoreUrl,
  children,
}: {
  appStoreUrl: string;
  /** 앱 아이콘 — next/image 는 서버에서 넘겨받는다. */
  children: ReactNode;
}) {
  return (
    <motion.div
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <motion.span
        variants={RISE}
        transition={{ duration: 0.6, ease: EASE }}
        className="mb-4 inline-block rounded-full bg-[rgba(52,199,89,0.12)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em] text-[#248A3D]"
      >
        iOS App
      </motion.span>

      <motion.div
        variants={RISE}
        transition={{ duration: 0.6, ease: EASE }}
        className="flex items-center gap-5"
      >
        <motion.div whileHover={{ rotate: -3, scale: 1.04 }} transition={{ type: "spring", stiffness: 300, damping: 18 }}>
          {children}
        </motion.div>
        <div>
          <h1 className="text-[28px] font-bold leading-[34px] tracking-[-0.5px] md:text-[34px] md:leading-[41px]">
            이게내연봉
          </h1>
          <p className="mt-1 text-[15px] tracking-[-0.24px] text-[rgba(60,60,67,0.6)]">
            1초에 얼마 버는지 보는 앱
          </p>
        </div>
      </motion.div>

      <motion.div
        variants={RISE}
        transition={{ duration: 0.6, ease: EASE }}
        className="mt-7 flex flex-wrap items-center gap-3"
      >
        <motion.a
          href={appStoreUrl}
          target="_blank"
          rel="noopener noreferrer"
          whileHover={{ scale: 1.035 }}
          whileTap={{ scale: 0.97 }}
          transition={{ type: "spring", stiffness: 420, damping: 24 }}
          className="rounded-full bg-[#34C759] px-6 py-3 text-[17px] font-semibold tracking-[-0.408px] text-white"
        >
          App Store에서 받기
        </motion.a>
        <span className="text-[13px] leading-[18px] text-[rgba(60,60,67,0.6)]">
          iPhone · iOS 17 이상 · 무료
        </span>
      </motion.div>
    </motion.div>
  );
}
