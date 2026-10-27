import type { Money } from "./copy/types";

/**
 * 금액 글자.
 *
 * 앱(`src/core/currency.ts`)과 같은 규칙: 반올림하지 않고 버린다 — 아직 못 번 돈을
 * 올려서 보여주면 안 된다.
 */
export function formatMoney(m: Money, n: number, decimals = 0): string {
  const factor = 10 ** decimals;
  const floored = Math.floor(n * factor + 1e-9) / factor;
  const body = floored.toLocaleString(m.locale, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
  return `${m.prefix}${body}${m.suffix}`;
}

/** 이 로케일의 천 단위 구분 기호와 소수점 기호. 주행거리계가 직접 찍는다. */
export function separators(locale: string): { group: string; point: string } {
  const parts = new Intl.NumberFormat(locale).formatToParts(1234567.5);
  return {
    group: parts.find((p) => p.type === "group")?.value ?? ",",
    point: parts.find((p) => p.type === "decimal")?.value ?? ".",
  };
}

/**
 * 살아 움직이는 숫자의 소수 자리수 — 앱의 `tickDecimals` 그대로.
 *
 * 맨 끝자리가 초당 3번 이상 바뀌는 가장 짧은 자리수다. 연봉 4,000만 원은 초당 1.27원이라
 * 2자리, 연봉 $60,000 은 초당 $0.0019 라 4자리가 된다. 통화마다 못 박으면 달러는 4초에
 * 한 번 바뀌어 멈춘 것처럼 보인다.
 */
export function tickDecimals(ratePerSecond: number): number {
  for (let d = 2; d < 6; d++) {
    if (ratePerSecond * 10 ** d >= 3) return d;
  }
  return 6;
}

export const SECONDS_PER_YEAR = 365 * 24 * 60 * 60;
