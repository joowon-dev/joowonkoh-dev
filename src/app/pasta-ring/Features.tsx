"use client";

import { motion } from "motion/react";

import { EASE } from "./motion";
import { C, CUTE, STICKER } from "./palette";

/**
 * 기능 타일 — 앱의 스티커 카드 모양.
 *
 * 앱에 실제로 들어 있는 것만 적는다. 한 장씩 스크롤을 따라 올라온다.
 */

const FEATURES = [
  { mark: "◎", title: "실물 크기 계량 원", tail: "기종별 화면 정보로 어느 폰에서나 같은 mm 로 그려요" },
  { mark: "½", title: "0.5인분부터 5인분까지", tail: "0.5인분씩. 1인분은 80·100·120g 중에서 골라요" },
  { mark: "38", title: "브랜드별 면 38종", tail: "바릴라·데체코·오뚜기·백설·루모·가로팔로·디벨라·아녜지" },
  { mark: "♥", title: "즐겨찾기", tail: "자주 사는 면은 하트 한 번. 다음부터 맨 위에" },
  { mark: "4", title: "익힘 네 단계", tail: "팬에서 마무리 · 알 덴테 · 적당히 · 부드럽게" },
  { mark: "💧", title: "물과 소금 양", tail: "면 양에 맞춰 냄비에 넣을 물과 소금을 알려 줘요" },
  { mark: "⏱", title: "꺼져도 울리는 타이머", tail: "폰을 내려놔도 다 익으면 알림이 와요" },
  { mark: "2×", title: "화면에 안 들어가면 나눠서", tail: "원을 줄이지 않고 “2번 재세요” 라고 알려요" },
];

export default function Features() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-3 rounded-[28px] p-4 sm:grid-cols-2 sm:p-5"
      style={{ background: C.noodleSoft }}
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: 0.06 } } }}
    >
      {FEATURES.map((f, i) => (
        <motion.div
          key={f.title}
          variants={{
            hidden: { opacity: 0, y: 16, filter: "blur(6px)" },
            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
          }}
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="flex gap-4 rounded-[20px] p-5"
          style={{ background: C.card, ...STICKER }}
        >
          <span
            className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full px-2 text-[17px]"
            style={{
              fontFamily: CUTE,
              background: i % 2 ? C.tomatoSoft : C.noodle,
              color: i % 2 ? C.tomato : C.ink,
            }}
            aria-hidden
          >
            {f.mark}
          </span>
          <div>
            <h3 className="text-[20px] leading-tight" style={{ fontFamily: CUTE, color: C.ink }}>
              {f.title}
            </h3>
            <p className="mt-1 text-[14px] leading-[1.6] break-keep" style={{ color: C.inkSoft }}>
              {f.tail}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
