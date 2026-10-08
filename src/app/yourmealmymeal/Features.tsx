"use client";

import { motion } from "motion/react";

import { EASE } from "./motion";
import { BODY, C, DISPLAY, STICKER } from "./palette";

/**
 * 기능 스티커. 한 장씩 비뚤게 붙어 있다가 커서를 얹으면 똑바로 서며 들린다.
 * 문단으로 설명하지 않는다 — 위의 식판과 밥상이 이미 보여 줬다.
 */
const FEATURES = [
  { icon: "📸", title: "식판 한 칸씩", tail: "찍거나 앨범에서 골라 칸에 쏙", bg: C.surface, tilt: -2 },
  { icon: "✂️", title: "담을 자리는 직접", tail: "밀고 키워서 밥이 안 잘리게", bg: "#E6F6EE", tilt: 1.5 },
  { icon: "👉", title: "빈 칸엔 콕", tail: "아직 안 먹었으면 살짝 찔러요", bg: "#FFE3DB", tilt: -1 },
  { icon: "🍽️", title: "식판은 하나", tail: "한 번 올리면 모든 모임에", bg: "#FFF1C2", tilt: 2 },
  { icon: "💬", title: "반응 · 댓글", tail: "맛있겠다 한마디면 충분", bg: C.surface, tilt: -1.5 },
  { icon: "🖼️", title: "하루를 한 장으로", tail: "그날 식판을 사진첩에 저장", bg: "#E6F6EE", tilt: 1 },
];

export default function Features() {
  return (
    <motion.div
      className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4"
      initial="hidden"
      whileInView="show"
      viewport={{ once: true, margin: "-60px" }}
      variants={{ show: { transition: { staggerChildren: 0.07 } } }}
    >
      {FEATURES.map((f) => (
        <motion.div
          key={f.title}
          variants={{
            hidden: { opacity: 0, y: 30, rotate: f.tilt * 4, scale: 0.9 },
            show: { opacity: 1, y: 0, rotate: f.tilt, scale: 1, transition: { duration: 0.7, ease: EASE } },
          }}
          whileHover={{ rotate: 0, y: -6, scale: 1.04, transition: { type: "spring", stiffness: 380, damping: 18 } }}
          className="rounded-[20px] p-4 sm:p-5"
          style={{ ...STICKER, background: f.bg }}
        >
          <span className="text-[28px] leading-none">{f.icon}</span>
          <h3 className="mt-3 text-[18px] leading-[1.25]" style={{ fontFamily: DISPLAY }}>
            {f.title}
          </h3>
          <p className="mt-1 text-[14px] leading-[1.45] break-keep" style={{ fontFamily: BODY, color: C.body }}>
            {f.tail}
          </p>
        </motion.div>
      ))}
    </motion.div>
  );
}
