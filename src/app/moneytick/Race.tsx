"use client";

import { AnimatePresence, motion } from "motion/react";
import { useState } from "react";

import { useNowMs, prefersReducedMotion } from "./clock";
import { EASE } from "./motion";

/**
 * 비교 레이스 — 실제로 달린다.
 *
 * 앱의 1000배속을 그대로 쓴다. 등배속이면 치킨 한 마리에 두 시간이 걸려 아무도
 * 끝까지 못 보지만, 1000배속이면 8초 안에 승부가 난다. 앱에 있는 기능으로
 * 빨리 감는 것이라, 보여주는 장면과 실제가 어긋나지 않는다.
 *
 * 부장님이 결승선을 끊으면 잠깐 멈춰 결과를 보여주고 처음부터 다시 달린다.
 */

const GOAL = 25_000; // 치킨 한 마리
const SPEED = 1000;
const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;

const RUNNERS = [
  { name: "나", sub: "연봉 4,000만 원", yearly: 40_000_000, tone: "me" },
  { name: "부장님", sub: "연봉 1억 원", yearly: 100_000_000, tone: "them" },
] as const;

const LEADER_RATE = RUNNERS[1].yearly / SECONDS_PER_YEAR;
/** 부장님이 결승선을 끊기까지의 실제 시간(ms). */
const RUN_MS = (GOAL / LEADER_RATE / SPEED) * 1000;
/** 끝난 화면을 보여주는 시간. */
const HOLD_MS = 2_500;

function stopwatch(seconds: number): string {
  const s = Math.floor(seconds);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${h}:${String(m).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export default function Race() {
  const now = useNowMs();
  // 페이지를 연 순간을 출발선으로 삼는다. 전역 시계를 그냥 나머지 연산하면
  // 들어오자마자 레이스 중반부터 보게 된다.
  const [start] = useState(() => Date.now());
  const still = now == null || prefersReducedMotion();

  // 움직임을 줄이기로 한 사용자에게는 결승선을 끊은 장면을 정지 화면으로 준다.
  const phase = still ? RUN_MS : (now - start) % (RUN_MS + HOLD_MS);
  const runMs = Math.min(phase, RUN_MS);
  const raceSeconds = (runMs / 1000) * SPEED;

  return (
    <div className="rounded-[28px] bg-[#F2F2F7] p-4 sm:p-5">
      <div className="rounded-[22px] bg-white p-5 shadow-[0_1px_3px_rgba(0,0,0,0.06)]">
        <div className="flex items-baseline justify-between">
          <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[rgba(60,60,67,0.3)]">
            치킨 한 마리 · 25,000원 벌기까지
          </p>
          <p className="rounded-full bg-[rgba(52,199,89,0.12)] px-2.5 py-1 text-[11px] font-semibold tracking-[0.6px] text-[#248A3D]">
            1000배속
          </p>
        </div>

        <motion.p
          initial={{ opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: EASE }}
          className="mt-2 text-[40px] font-semibold leading-[1.1] tracking-[-1.4px] text-black"
          style={{ fontVariantNumeric: "tabular-nums" }}
        >
          {stopwatch(raceSeconds)}
        </motion.p>

        <div className="mt-6 space-y-5">
          {RUNNERS.map((r) => {
            const earned = Math.min(
              (r.yearly / SECONDS_PER_YEAR) * raceSeconds,
              GOAL,
            );
            const pct = (earned / GOAL) * 100;
            const done = earned >= GOAL;
            return (
              <div key={r.name}>
                <div className="flex items-baseline justify-between">
                  <p className="flex items-baseline gap-2 text-[17px] font-semibold leading-[22px] tracking-[-0.408px] text-black">
                    {r.name}
                    <span className="text-[13px] font-normal text-[rgba(60,60,67,0.6)]">
                      {r.sub}
                    </span>
                    <AnimatePresence>
                      {done && (
                        <motion.span
                          initial={{ opacity: 0, scale: 0.6 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.6 }}
                          transition={{ type: "spring", stiffness: 500, damping: 24 }}
                          className="rounded-full bg-[rgba(52,199,89,0.14)] px-2 py-0.5 text-[11px] font-semibold text-[#248A3D]"
                        >
                          도착
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </p>
                  <p
                    className={`text-[15px] font-semibold tracking-[-0.24px] ${
                      done ? "text-[#248A3D]" : "text-black"
                    }`}
                    style={{ fontVariantNumeric: "tabular-nums" }}
                  >
                    {Math.floor(earned).toLocaleString("ko-KR")}원
                  </p>
                </div>
                <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[rgba(120,120,128,0.16)]">
                  <div
                    className={`h-full rounded-full ${
                      r.tone === "me" ? "bg-[#34C759]" : "bg-[#0088FF]"
                    }`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <p className="px-2 pt-4 text-center text-[13px] leading-[18px] text-[rgba(60,60,67,0.6)]">
        부장님이 치킨 한 마리를 버는 2시간 11분 동안, 나는 10,000원까지.
      </p>
    </div>
  );
}
