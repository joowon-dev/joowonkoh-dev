import { SOURCES, type CollectionRun, type Source } from "./types";

/**
 * 수집이 밀린 소스를 찾는다.
 *
 * 낡은 숫자를 아무 표시 없이 보여주는 것이 이 종류 대시보드의 가장 큰 함정이다.
 * 수집은 하루 한 번이므로, 마지막 성공이 36시간을 넘으면 한 번은 건너뛴 것이다.
 */
export const STALE_AFTER_HOURS = 36;

export type FreshnessProblem = {
  source: Source;
  reason: "never" | "stale" | "error";
  lastSuccess: string | null;
  hoursSince: number | null;
  error: string | null;
};

export function findFreshnessProblems(
  runs: readonly CollectionRun[],
  now: Date,
): FreshnessProblem[] {
  const bySource = new Map(runs.map((run) => [run.source, run]));
  const problems: FreshnessProblem[] = [];

  for (const source of SOURCES) {
    const run = bySource.get(source);

    if (!run || !run.last_success) {
      problems.push({
        source,
        reason: "never",
        lastSuccess: null,
        hoursSince: null,
        error: run?.error ?? null,
      });
      continue;
    }

    const hoursSince = hoursBetween(new Date(run.last_success), now);

    if (hoursSince > STALE_AFTER_HOURS) {
      problems.push({
        source,
        reason: "stale",
        lastSuccess: run.last_success,
        hoursSince,
        error: run.error,
      });
      continue;
    }

    // 마지막 시도가 실패했더라도 최근 성공분이 있으면 화면은 유효하다.
    // 다만 조용히 넘기지는 않는다.
    if (run.status === "error") {
      problems.push({
        source,
        reason: "error",
        lastSuccess: run.last_success,
        hoursSince,
        error: run.error,
      });
    }
  }

  return problems;
}

function hoursBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / (1000 * 60 * 60);
}
