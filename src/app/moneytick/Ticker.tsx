"use client";

import { motion } from "motion/react";
import { useState } from "react";

import { useNowMs } from "./clock";
import Odometer from "./Odometer";
import { EASE } from "./motion";

/**
 * 앱 홈 화면을 그대로 옮긴 데모.
 *
 * 앱과 같은 규칙으로 돈다: 오늘 0시를 기준 시점으로 잡고, 그때부터 지금까지
 * 흐른 시간에 초당 수입을 곱한다. 숫자는 연봉 4,000만 원을 예로 든 것이고,
 * 실제 앱은 사용자가 넣은 금액을 쓴다.
 */

const YEARLY = 40_000_000;
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
const PER_SECOND = YEARLY / SECONDS_PER_YEAR; // 1.2684…
const DAY_MS = 24 * 60 * 60 * 1000;

/** 앱이 다시 그리는 간격. 소수점 아래는 이 눈금에 맞춰 끊는다. */
const APP_TICK_MS = 70;

const UNITS = [
  { id: "year", label: "연봉", caption: "연봉 4,000만 원" },
  { id: "month", label: "월급", caption: "월급 333만 원" },
  { id: "day", label: "일급", caption: "일급 11만 원" },
] as const;

function midnight(now: number): number {
  const d = new Date(now);
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

function clock(now: number): string {
  return new Date(now).toLocaleTimeString("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  });
}

export default function Ticker() {
  const [unit, setUnit] = useState<(typeof UNITS)[number]["id"]>("year");
  const now = useNowMs();

  const elapsedMs = now == null ? 0 : now - midnight(now);
  const total = (elapsedMs / 1000) * PER_SECOND;
  const stepped =
    (Math.floor(elapsedMs / APP_TICK_MS) * APP_TICK_MS * PER_SECOND) / 1000;
  const dayPct = (elapsedMs / DAY_MS) * 100;
  const active = UNITS.find((u) => u.id === unit)!;

  return (
    <div className="rounded-[28px] bg-[#F2F2F7] p-4 sm:p-6">
      {/* 세그먼티드 컨트롤 — 앱 홈 맨 위의 그 줄 */}
      <div className="flex gap-1 rounded-full bg-[rgba(118,118,128,0.12)] p-1">
        {UNITS.map((u) => (
          <button
            key={u.id}
            type="button"
            onClick={() => setUnit(u.id)}
            aria-pressed={unit === u.id}
            className="relative flex-1 rounded-full py-2 text-[15px] font-semibold tracking-[-0.24px]"
          >
            {/* 고른 칸으로 흰 알약이 미끄러진다 — iOS 세그먼티드 컨트롤 그대로. */}
            {unit === u.id && (
              <motion.span
                layoutId="unit-pill"
                className="absolute inset-0 rounded-full bg-white shadow-[0_3px_8px_rgba(0,0,0,0.12)]"
                transition={{ type: "spring", stiffness: 420, damping: 36 }}
              />
            )}
            <span
              className={`relative ${
                unit === u.id ? "text-black" : "text-[rgba(60,60,67,0.6)]"
              }`}
            >
              {u.label}
            </span>
          </button>
        ))}
      </div>

      <div className="flex flex-col items-center py-12 sm:py-16">
        <p className="flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.6px] text-[rgba(60,60,67,0.3)]">
          <span className="relative flex h-1.5 w-1.5">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#34C759] opacity-60" />
            <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#34C759]" />
          </span>
          오늘 0시부터
        </p>

        <Odometer
          value={total}
          ratePerSecond={PER_SECOND}
          steppedValue={stepped}
          className="mt-3.5 block text-[40px] font-semibold leading-none tracking-[-1.4px] text-black sm:text-[52px] sm:tracking-[-1.9px]"
          decimalClassName="text-[0.5em] text-[rgba(60,60,67,0.3)]"
        />

        <motion.p
          key={active.id}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: EASE }}
          className="mt-6 text-[13px] leading-[18px] text-[rgba(60,60,67,0.6)]"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          1초에 1.27원 · {active.caption}
        </motion.p>

        {/* 오늘이 얼마나 흘렀는지 — 자정에 비고 자정에 찬다. */}
        <div className="mt-7 w-full max-w-[420px]">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-[rgba(120,120,128,0.16)]">
            <div
              className="h-full rounded-full bg-[#34C759]"
              style={{ width: `${dayPct}%` }}
            />
          </div>
          <div
            className="mt-2 flex justify-between text-[11px] font-semibold tracking-[0.6px] text-[rgba(60,60,67,0.3)]"
            style={{ fontVariantNumeric: "tabular-nums" }}
          >
            <span>00:00:00</span>
            <span>{now == null ? "--:--:--" : clock(now)}</span>
            <span>24:00:00</span>
          </div>
        </div>
      </div>
    </div>
  );
}
