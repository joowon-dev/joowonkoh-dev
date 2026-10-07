"use client";

import { motion } from "motion/react";

import Mascot from "./Mascot";
import MeasureDemo from "./MeasureDemo";
import { EASE } from "./motion";
import { C, CUTE } from "./palette";

/**
 * 첫 화면 — 설명보다 원을 먼저 키워 보게 한다.
 *
 * 왼쪽은 이름과 한 줄, 오른쪽은 인분을 바꿔 볼 수 있는 계량 원. 아직 출시 전이라
 * 내려받기 버튼 대신 준비 중이라는 표시만 둔다.
 */

const RISE = {
  hidden: { opacity: 0, y: 18, filter: "blur(6px)" },
  show: { opacity: 1, y: 0, filter: "blur(0px)" },
};

export default function Hero() {
  return (
    <motion.div
      className="grid items-center gap-10 md:grid-cols-[1fr_auto]"
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
    >
      <div>
        <motion.div variants={RISE} transition={{ duration: 0.6, ease: EASE }} className="mb-4 flex items-center gap-3">
          <Mascot size={56} />
          <span
            className="inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
            style={{ background: C.noodleSoft, color: C.ink }}
          >
            iOS · Android · 출시 준비 중
          </span>
        </motion.div>

        <motion.h1
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[46px] leading-[1.05] md:text-[54px]"
          style={{ fontFamily: CUTE, color: C.ink }}
        >
          파스타 한 줌
        </motion.h1>

        <motion.p
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-3 text-[22px] leading-snug md:text-[24px]"
          style={{ fontFamily: CUTE, color: C.tomato }}
        >
          저울 없이, 화면 속 원에 면을 대 보세요
        </motion.p>

        <motion.p
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-5 max-w-[40ch] text-[15px] leading-[1.8] break-keep"
          style={{ color: C.inkSoft }}
        >
          마른 면 다발을 세워 화면의 원에 대면, 원이 꽉 찰 때가 딱 그 인분입니다.
          어느 폰에서나 원의 실제 크기가 같도록 기종마다 맞춰 그립니다. 다 쟀으면
          면에 맞는 익힘 시간으로 타이머까지 켜 드려요.
        </motion.p>

        <motion.div
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-7 flex flex-wrap items-center gap-3"
        >
          <span
            className="rounded-[18px] px-6 py-3 text-[19px] text-white"
            style={{
              fontFamily: CUTE,
              background: C.tomato,
              border: `2px solid ${C.ink}`,
              boxShadow: `0 2px 0 ${C.ink}`,
            }}
          >
            App Store 출시 준비 중
          </span>
          <span className="text-[13px]" style={{ color: C.inkSoft }}>
            iPhone · Android · 무료
          </span>
        </motion.div>
      </div>

      <motion.div variants={RISE} transition={{ duration: 0.8, ease: EASE }}>
        <MeasureDemo />
      </motion.div>
    </motion.div>
  );
}
