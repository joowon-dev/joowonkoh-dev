"use client";

import { motion } from "motion/react";

import Greeting from "./Greeting";
import TrayMark from "./Mark";
import { EASE } from "./motion";
import { C } from "./palette";
import StoreButtons from "./StoreButtons";

const RISE = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/**
 * 첫 화면은 앱의 로그인 화면과 같다 — 빈 민트 급식판, 이름, 천천히 바뀌는 인사, 그리고 내려받는 곳.
 * 가운데 한 줄로만 쌓고 꾸밈은 바탕의 옅은 수저 무늬에 맡긴다.
 */
export default function Hero() {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="flex flex-col items-center text-center"
    >
      <motion.div variants={RISE}>
        <TrayMark size={148} title="네밥내밥 빈 급식판" />
      </motion.div>

      <motion.h1 variants={RISE} className="mt-6 text-[30px] font-bold leading-[1.2] tracking-[-0.02em]" style={{ color: C.ink }}>
        네밥내밥
      </motion.h1>

      <motion.div variants={RISE} className="mt-2 h-[28px]">
        <Greeting className="text-[17px] font-medium leading-[28px] whitespace-nowrap" style={{ color: C.sub }} />
      </motion.div>

      <motion.p
        variants={RISE}
        className="mt-5 max-w-[26ch] text-[16px] leading-[1.7] break-keep"
        style={{ color: C.body }}
      >
        밥 사진 한 장으로 가족·친구와 오늘의 식판을 나눠요.
      </motion.p>

      <motion.div variants={RISE} className="mt-9 w-full max-w-[360px]">
        <StoreButtons />
      </motion.div>
    </motion.section>
  );
}
