"use client";

import { motion } from "motion/react";

import { EASE } from "./motion";
import { C, HAND } from "./palette";
import TearPage from "./TearPage";

/**
 * 첫 화면 — 설명보다 한 장을 먼저 뜯어 보게 한다.
 *
 * 왼쪽은 이름과 한 줄, 오른쪽은 직접 뜯어 볼 수 있는 일력. 아직 출시 전이라
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
        <motion.span
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mb-4 inline-block rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.15em]"
          style={{ background: C.blushLight, color: C.cherryDeep }}
        >
          iOS App · 출시 준비 중
        </motion.span>

        <motion.h1
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="text-[44px] font-bold leading-[1.05] md:text-[50px]"
          style={{ fontFamily: HAND, color: C.cherry }}
        >
          뜯어쓰는 달력 ♡
        </motion.h1>

        <motion.p
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-3 text-[22px] leading-snug md:text-[24px]"
          style={{ fontFamily: HAND, color: C.cocoaDeep }}
        >
          둘이 서로에게 하루 한 장씩 꾸며 주는 커플 일력
        </motion.p>

        <motion.p
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-5 max-w-[40ch] text-[15px] leading-[1.8] break-keep"
          style={{ color: C.cocoaDeep }}
        >
          오늘 날짜의 페이지는 상대가 꾸며 둡니다. 나는 진짜 일력처럼 한 장을
          쭉— 뜯어서 그 안에 뭐가 들었는지 봅니다. 글, 사진, 스티커로 채운
          하루치 마음이 그렇게 오갑니다.
        </motion.p>

        <motion.div
          variants={RISE}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-7 flex flex-wrap items-center gap-3"
        >
          <span
            className="rounded-full px-6 py-3 text-[18px] font-bold"
            style={{
              fontFamily: HAND,
              background: C.cherry,
              color: "#fff",
              boxShadow: `inset 0 -3px 0 ${C.cherryDeep}`,
            }}
          >
            App Store 출시 준비 중
          </span>
          <span className="text-[13px]" style={{ color: C.cocoa }}>
            iPhone · 무료
          </span>
        </motion.div>
      </div>

      <motion.div
        variants={RISE}
        transition={{ duration: 0.8, ease: EASE }}
      >
        <TearPage />
      </motion.div>
    </motion.div>
  );
}
