"use client";

import { motion } from "motion/react";

import { EASE } from "./motion";

/**
 * 기능 타일.
 *
 * 문단으로 설명하지 않는다. 제목 한 줄과 여섯 단어쯤의 꼬리말이면 충분하고,
 * 나머지는 위의 데모가 이미 보여줬다. 스크롤을 따라 한 장씩 올라오고,
 * 커서를 얹으면 살짝 뜬다.
 */

const FEATURES = [
  { title: "1초에 얼마", tail: "연봉·월급·일급 중 편한 걸로" },
  { title: "실시간 · 근무시간", tail: "자는 동안에도, 또는 일하는 동안만" },
  { title: "요일별 출퇴근", tail: "휴게시간 한 구간, 야간 근무까지" },
  { title: "위젯 · 잠금화면 · StandBy", tail: "앱을 열지 않아도" },
  { title: "비교 레이스", tail: "커피 한 잔부터 경차 한 대까지" },
  { title: "내 근무시간 기준으로", tail: "저 사람이 내 시간만큼 일하면" },
  { title: "통화 6종", tail: "원·달러·엔·유로·파운드·위안" },
  { title: "한국어 · English · 日本語", tail: "앱도 위젯도" },
];

export default function Features() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-3 rounded-[28px] bg-[#F2F2F7] p-4 sm:grid-cols-2 sm:p-5"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {FEATURES.map((f) => (
        <motion.div
          key={f.title}
          variants={{
            hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.6, ease: EASE },
            },
          }}
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="rounded-[22px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]"
        >
          <h3 className="text-[17px] font-semibold leading-[22px] tracking-[-0.408px] text-black">
            {f.title}
          </h3>
          <p className="mt-1 text-[14px] leading-[19px] tracking-[-0.24px] text-[rgba(60,60,67,0.6)]">
            {f.tail}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
