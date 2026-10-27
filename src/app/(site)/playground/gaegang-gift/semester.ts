/**
 * 학기가 얼마나 지나갔는지 계산한다.
 *
 * Date 하나를 받아 값만 돌려주는 순수 함수라 «오늘»을 옮겨 가며 경계를 전부
 * 테스트할 수 있다. 종강일이 지난 다음 해에 열어도 음수 일수나 101% 같은 게
 * 뜨지 않는 것이 여기서 지켜야 할 전부다.
 */

/** 2학기 개강. 학사일정은 서버 시간대와 무관하게 한국 기준이라 오프셋을 박아 둔다. */
export const SEMESTER_START = "2026-09-01T00:00:00+09:00";
/** 2학기 종강 */
export const SEMESTER_END = "2026-12-18T00:00:00+09:00";

const DAY_MS = 86_400_000;
const START_MS = new Date(SEMESTER_START).getTime();
const END_MS = new Date(SEMESTER_END).getTime();

export type Phase = "before" | "during" | "after";

export interface SemesterStatus {
  phase: Phase;
  /** 0~1로 자른 학기 진행률 */
  progress: number;
  /** 종강까지 남은 일수. 올림이라 몇 시간이 남아도 «1일»이다 */
  daysLeft: number;
}

export function semesterStatus(now: Date): SemesterStatus {
  const t = now.getTime();
  const phase: Phase = t < START_MS ? "before" : t >= END_MS ? "after" : "during";
  const progress = clamp01((t - START_MS) / (END_MS - START_MS));
  const daysLeft = Math.max(0, Math.ceil((END_MS - t) / DAY_MS));
  return { phase, progress, daysLeft };
}

/**
 * 소수점 셋째 자리까지 보여준다. 한 자리로 끊으면 며칠 내내 같은 숫자로 굳어
 * 죽은 화면처럼 보인다. 셋째 자리는 학기 108일 기준 93초에 한 번 올라가서,
 * 오래 들여다보면 «아주 가끔은» 움직이는 게 보인다.
 * 다 끝난 뒤의 100.000%만 어색해서 그때만 자릿수를 뗀다.
 */
export function formatPercent(progress: number): string {
  const p = clamp01(progress);
  return p >= 1 ? "100%" : `${(p * 100).toFixed(3)}%`;
}

function clamp01(n: number): number {
  return Math.min(1, Math.max(0, n));
}
