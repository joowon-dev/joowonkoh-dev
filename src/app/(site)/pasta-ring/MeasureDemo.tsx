"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { C, CUTE, STICKER } from "./palette";

/**
 * 첫 화면의 계량 원 — 앱의 양 재기 화면을 흉내 낸다.
 *
 * 인분을 바꾸면 원이 커지고 작아진다. 지름은 앱과 같은 식(25cm 스파게티 100g = 21mm,
 * 지름 ∝ √무게)으로 구한다. 다만 웹은 기기마다 화면 밀도를 알 수 없어서 **실물 크기가 아니다** —
 * 그래서 원 아래에 그렇게 적어 둔다. 실물 크기는 앱만 낸다.
 */

const MM_PER_100G = 21;
const PX_PER_MM = 5.2;

function diameterMm(grams: number): number {
  return MM_PER_100G * Math.sqrt(grams / 100);
}

export default function MeasureDemo() {
  const [servings, setServings] = useState(1);
  const grams = servings * 100;
  const mm = diameterMm(grams);
  const px = mm * PX_PER_MM;

  const step = (d: number) => setServings((s) => Math.min(5, Math.max(0.5, Math.round((s + d) * 2) / 2)));

  return (
    <div
      className="mx-auto w-[280px] rounded-[28px] p-5"
      style={{ background: C.card, ...STICKER }}
    >
      <div className="flex h-[300px] items-center justify-center">
        <motion.div
          className="relative flex items-center justify-center rounded-full"
          animate={{ width: px, height: px }}
          transition={{ type: "spring", stiffness: 260, damping: 22 }}
          style={{ background: C.tomatoSoft, border: `3px solid ${C.tomato}` }}
        >
          <span className="absolute h-[2px] w-3.5 rounded" style={{ background: C.tomato }} />
          <span className="absolute h-3.5 w-[2px] rounded" style={{ background: C.tomato }} />
        </motion.div>
      </div>

      <div className="mt-2 flex items-center justify-between">
        <RoundButton label="−" disabled={servings <= 0.5} onClick={() => step(-0.5)} />
        <div className="text-center">
          <p className="text-[40px] leading-none" style={{ fontFamily: CUTE, color: C.ink }}>
            {Number.isInteger(servings) ? servings : servings.toFixed(1)}
            <span className="ml-1 text-[18px]" style={{ color: C.inkSoft }}>
              인분
            </span>
          </p>
          <p className="mt-1 text-[13px] tabular-nums" style={{ color: C.inkSoft }}>
            {grams}g · 지름 {mm.toFixed(1)}mm
          </p>
        </div>
        <RoundButton label="+" disabled={servings >= 5} onClick={() => step(0.5)} />
      </div>

      <p className="mt-4 text-center text-[11px] leading-snug" style={{ color: C.inkFaint }}>
        웹에서는 예시 크기예요. 앱에서는 폰 기종에 맞춘 실제 크기로 그려요.
      </p>
    </div>
  );
}

function RoundButton({ label, onClick, disabled }: { label: string; onClick(): void; disabled: boolean }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label === "+" ? "1인분 늘리기" : "1인분 줄이기"}
      className="flex h-12 w-12 items-center justify-center rounded-full text-[26px] transition-transform active:translate-y-[2px] disabled:opacity-35"
      style={{ background: C.noodle, fontFamily: CUTE, color: C.ink, ...STICKER }}
    >
      {label}
    </button>
  );
}
