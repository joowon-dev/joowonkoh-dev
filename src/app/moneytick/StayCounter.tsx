"use client";

import { useState } from "react";

import { useNowMs } from "./clock";
import { LANDING } from "./copy";
import type { Lang } from "./i18n";
import { SECONDS_PER_YEAR, tickDecimals } from "./money";
import Odometer from "./Odometer";

/**
 * 이 페이지를 읽는 동안 벌린 돈.
 *
 * 앱을 깔기 전에도 한 번은 체감해 보라고 둔 자리다. 기준 시점만 "오늘 0시" 가
 * 아니라 "이 페이지를 연 순간" 일 뿐, 계산은 홈 데모와 완전히 같다.
 */

const APP_TICK_MS = 70;

export default function StayCounter({ lang }: { lang: Lang }) {
  const copy = LANDING[lang];
  const PER_SECOND = copy.salary.me / SECONDS_PER_YEAR;
  const now = useNowMs();
  // 서버에서도 한 번 계산되지만 그 값은 그려지지 않는다 — 시계(`now`)가 붙기
  // 전까지는 어느 쪽이든 0원이라, 서버와 브라우저가 어긋날 여지가 없다.
  const [start] = useState(() => Date.now());

  const elapsedMs = now == null ? 0 : now - start;
  const seconds = Math.floor(elapsedMs / 1000);
  const earned = (elapsedMs / 1000) * PER_SECOND;
  const stepped =
    (Math.floor(elapsedMs / APP_TICK_MS) * APP_TICK_MS * PER_SECOND) / 1000;

  const spent = copy.stay.spent(Math.floor(seconds / 60), seconds % 60);

  return (
    <div className="rounded-[22px] border border-[rgba(52,199,89,0.25)] bg-[rgba(52,199,89,0.06)] p-5 sm:p-6">
      <p className="text-[12px] font-semibold uppercase tracking-[0.6px] text-[#248A3D]">
        {copy.stay.since(spent)}
      </p>
      <Odometer
        value={earned}
        ratePerSecond={PER_SECOND}
        steppedValue={stepped}
        decimals={tickDecimals(PER_SECOND)}
        locale={copy.money.locale}
        prefix={copy.money.prefix}
        suffix={copy.money.suffix}
        className="mt-2 block text-[28px] font-semibold leading-none tracking-[-0.8px] text-black sm:text-[34px]"
        decimalClassName="text-[0.5em] text-[rgba(60,60,67,0.35)]"
      />
      <p className="mt-3 text-[13px] leading-[18px] text-[rgba(60,60,67,0.6)]">
        {copy.stay.footnote}
      </p>
    </div>
  );
}
