"use client";

import { motion } from "motion/react";

import { EASE } from "./motion";
import { C, HAND } from "./palette";

/**
 * 기능 타일 — 실로 꿰맨 듯한 점선 테두리 카드.
 *
 * 앱에 실제로 들어 있는 것만 적는다. 한 장씩 스크롤을 따라 올라온다.
 */

const FEATURES = [
  {
    mark: "✎",
    title: "하루 한 장, 서로에게",
    tail: "글·사진·스티커로 상대의 오늘을 꾸며요",
  },
  {
    mark: "♡",
    title: "쭉— 뜯어서 보기",
    tail: "벽엔 마지막으로 뜯은 장. 아래로 당기면 다음 날",
  },
  {
    mark: "»",
    title: "오늘까지 한 번에 뜯기",
    tail: "며칠 밀렸으면 버튼 하나로 따라잡아요",
  },
  {
    mark: "✉",
    title: "다정한 알림 한 번",
    tail: "오늘 장을 뜯으면 상대에게 살짝 알려요",
  },
  {
    mark: "100",
    title: "1일부터 세는 디데이",
    tail: "사귄 날이 1일. 100일·주년은 알아서 챙겨요",
  },
  {
    mark: "↺",
    title: "빈 날엔 예전 한 장",
    tail: "오늘이 비어 있으면 전에 주고받은 장을 꺼내요",
  },
  {
    mark: "∞",
    title: "혼자서도 다 써 봐요",
    tail: "연결 전에도 기기 안에서 전부 돌아가요",
  },
  {
    mark: "●",
    title: "다이내믹 아일랜드 집게",
    tail: "화면 위 섬이 일력을 무는 집게가 돼요",
  },
];

export default function Features() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-3 rounded-[28px] p-4 sm:grid-cols-2 sm:p-5"
      style={{ background: C.kraft }}
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
            show: {
              opacity: 1,
              y: 0,
              filter: "blur(0px)",
              transition: { duration: 0.6, ease: EASE },
            },
          }}
          whileHover={{ y: -3, rotate: i % 2 ? 0.6 : -0.6 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="flex gap-4 rounded-[22px] p-5"
          style={{
            background: C.paper,
            border: `2px dashed ${C.stitch}`,
          }}
        >
          <span
            className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full px-2 text-[18px] font-bold"
            style={{
              fontFamily: HAND,
              background: i % 3 === 1 ? C.mint : C.blushLight,
              color: i % 3 === 1 ? C.cocoaDeep : C.cherry,
            }}
            aria-hidden
          >
            {f.mark}
          </span>
          <div>
            <h3
              className="text-[21px] font-bold leading-tight"
              style={{ fontFamily: HAND, color: C.cherryDeep }}
            >
              {f.title}
            </h3>
            <p
              className="mt-1 text-[14px] leading-[1.6] break-keep"
              style={{ color: C.cocoaDeep }}
            >
              {f.tail}
            </p>
          </div>
        </motion.div>
      ))}
    </motion.div>
  );
}
