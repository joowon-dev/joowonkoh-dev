"use client";

import { motion } from "motion/react";

import Greeting from "./Greeting";
import type { Lang } from "./i18n";
import TrayMark from "./Mark";
import { EASE } from "./motion";
import { C } from "./palette";
import StoreButtons from "./StoreButtons";

const RISE = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: EASE } },
};

/**
 * 첫 화면은 앱의 로그인 화면과 같다 — 흰 식판(점심 칸만 토마토), 이름, 천천히 바뀌는 인사, 그리고 내려받는 곳.
 * 가운데 한 줄로만 쌓고 꾸밈은 바탕의 옅은 수저 무늬에 맡긴다.
 */
export default function Hero({
  lang,
  appName,
  trayTitle,
  greetings,
  quote,
  tagline,
  download,
}: {
  lang: Lang;
  appName: string;
  trayTitle: string;
  greetings: string[];
  quote: [string, string];
  tagline: string;
  download: string;
}) {
  return (
    <motion.section
      initial="hidden"
      animate="show"
      variants={{ show: { transition: { staggerChildren: 0.08 } } }}
      className="flex flex-col items-center text-center"
    >
      <motion.div variants={RISE}>
        <TrayMark size={148} title={trayTitle} />
      </motion.div>

      <motion.h1 variants={RISE} className="mt-6 text-[30px] font-bold leading-[1.2] tracking-[-0.02em]" style={{ color: C.ink }}>
        {appName}
      </motion.h1>

      <motion.div variants={RISE} className="mt-2 h-[28px]">
        <Greeting
          lines={greetings}
          quote={quote}
          className="text-[17px] font-medium leading-[28px] whitespace-nowrap"
          style={{ color: C.sub }}
        />
      </motion.div>

      <motion.p
        variants={RISE}
        className="mt-5 max-w-[26ch] text-[16px] leading-[1.7] break-keep"
        style={{ color: C.body }}
      >
        {tagline}
      </motion.p>

      <motion.div variants={RISE} className="mt-9 w-full max-w-[360px]">
        <StoreButtons lang={lang} download={download} />
      </motion.div>
    </motion.section>
  );
}
