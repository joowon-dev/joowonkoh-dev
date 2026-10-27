/**
 * 파워 게이지의 눈금 계산.
 *
 * 판정 구간(BANDS)은 "요구치에서 얼마나 벗어났는가"로 정의돼 있어서 그대로는
 * 화면에 못 그린다. 여기서 절대 파워 축으로 옮기고, 게이지 폭에 대한 퍼센트로
 * 바꾼다. 이 변환을 컴포넌트 안에 두면 눈으로만 확인하게 되어 손대기 무섭다.
 */

import { BANDS, type Outcome } from "./game";

/** 게이지 오른쪽 끝. 이보다 빠르게 치는 건 사실상 없다 */
export const METER_MAX = 120;

export interface Segment {
  outcome: Outcome;
  /** 게이지 왼쪽 끝에서부터의 위치(%) */
  leftPct: number;
  widthPct: number;
}

/** 파워를 게이지 위 위치(%)로. 축 밖으로 나가면 끝에 붙인다 */
export function meterPct(power: number): number {
  return Math.min(100, Math.max(0, (power / METER_MAX) * 100));
}

/**
 * 이 거리에서 각 판정 칸이 게이지의 어디를 차지하는지.
 *
 * 축 밖으로 완전히 벗어난 칸은 빼고 돌려준다. 실제 거리 범위에서는 여섯 칸이
 * 항상 다 살아 있어야 하고(meter.test.ts가 지킨다), 이 가지치기는 상수를
 * 잘못 고쳤을 때 폭이 음수인 칸이 화면에 남지 않게 하는 그물이다.
 */
export function meterSegments(required: number): Segment[] {
  const out: Segment[] = [];
  for (const band of BANDS) {
    const lo = Math.max(0, required + band.min);
    const hi = Math.min(METER_MAX, required + band.max);
    if (hi <= lo) continue;
    out.push({
      outcome: band.outcome,
      leftPct: (lo / METER_MAX) * 100,
      widthPct: ((hi - lo) / METER_MAX) * 100,
    });
  }
  return out;
}
