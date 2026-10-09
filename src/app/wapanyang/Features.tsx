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
  { mark: "🔒", title: "보안 점수와 등급", tail: "100점에서 깎아 안전 · 주의 · 위험으로 알려 줘요" },
  { mark: "WPA", title: "암호 방식", tail: "암호 없음 · WEP · WPA · WPA2 · WPA3 를 가려내요" },
  { mark: "👀", title: "HTTPS 가로채기 · DNS 변조", tail: "누가 통신을 엿보거나 주소를 바꿔치기하는지 봐요" },
  { mark: "↓↑", title: "다운로드 · 업로드 · 핑", tail: "지터와 패킷 손실까지. 빠름 · 보통 · 느림으로" },
  { mark: "▶", title: "용도별 판정", tail: "넷플릭스 4K · 화상회의 · 온라인 게임 되나요?" },
  { mark: "📱", title: "기기 수 · 로그인 페이지", tail: "같은 와이파이에 붙은 기기와 공용 와이파이 로그인 확인" },
  { mark: "LTE", title: "모바일 데이터와 비교", tail: "지금 와이파이보다 데이터가 빠른지 한 번에" },
  { mark: "▦", title: "기록 · 위젯 · 공유 카드", tail: "와이파이별 기록과 느린 시간대, 홈 화면 위젯까지" },
];

export default function Features() {
  return (
    <motion.div
      className="grid grid-cols-1 gap-3 rounded-[28px] p-4 sm:grid-cols-2 sm:p-5"
      style={{ background: C.goldSoft }}
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
            show: { opacity: 1, y: 0, filter: "blur(0px)", transition: { duration: 0.6, ease: EASE } },
          }}
          whileHover={{ y: -3 }}
          transition={{ type: "spring", stiffness: 400, damping: 28 }}
          className="flex gap-4 rounded-[20px] p-5"
          style={{ background: C.card, ...STICKER }}
        >
          <span
            className="flex h-10 min-w-10 shrink-0 items-center justify-center rounded-full px-2 text-[15px]"
            style={{ fontFamily: CUTE, background: C.paper, color: C.ink, border: `2px solid ${C.ink}` }}
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
