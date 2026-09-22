"use client";

import { useState } from "react";

import { useNowMs } from "./clock";
import Odometer from "./Odometer";

/**
 * 이 페이지를 읽는 동안 벌린 돈.
 *
 * 앱을 깔기 전에도 한 번은 체감해 보라고 둔 자리다. 기준 시점만 "오늘 0시" 가
 * 아니라 "이 페이지를 연 순간" 일 뿐, 계산은 홈 데모와 완전히 같다.
 */

const YEARLY = 40_000_000;
const PER_SECOND = YEARLY / (365 * 24 * 60 * 60);
const APP_TICK_MS = 70;

export default function StayCounter() {
  const now = useNowMs();
  // 서버에서도 한 번 계산되지만 그 값은 그려지지 않는다 — 시계(`now`)가 붙기
  // 전까지는 어느 쪽이든 0원이라, 서버와 브라우저가 어긋날 여지가 없다.
  const [start] = useState(() => Date.now());

  const elapsedMs = now == null ? 0 : now - start;
  const seconds = Math.floor(elapsedMs / 1000);
  const earned = (elapsedMs / 1000) * PER_SECOND;
  const stepped =
    (Math.floor(elapsedMs / APP_TICK_MS) * APP_TICK_MS * PER_SECOND) / 1000;

  const minutes = Math.floor(seconds / 60);
  const spent =
    minutes > 0 ? `${minutes}분 ${seconds % 60}초` : `${seconds}초`;

  return (
    <div className="rounded-[22px] border border-[rgba(52,199,89,0.25)] bg-[rgba(52,199,89,0.06)] p-5 sm:p-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[#248A3D]">
        이 페이지를 연 뒤로 {spent}
      </p>
      <Odometer
        value={earned}
        ratePerSecond={PER_SECOND}
        steppedValue={stepped}
        className="mt-2 block text-[28px] font-semibold leading-none tracking-[-0.8px] text-black sm:text-[34px]"
        decimalClassName="text-[0.5em] text-[rgba(60,60,67,0.35)]"
      />
      <p className="mt-3 text-[13px] leading-[18px] text-[rgba(60,60,67,0.6)]">
        연봉 4,000만 원 기준. 앱은 이걸 당신의 연봉으로 셉니다.
      </p>
    </div>
  );
}
