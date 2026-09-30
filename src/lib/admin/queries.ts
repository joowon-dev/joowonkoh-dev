import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { dateRange, kstDate } from "./series";
import type { CollectionRun, MetricRow } from "./types";

export const WINDOW_DAYS = 30;

export type DashboardData = {
  rows: MetricRow[];
  runs: CollectionRun[];
  endDate: string;
  /** 테이블이 아직 없거나 조회가 막힌 경우. 화면은 빈 골격으로 뜬다. */
  unavailable: string | null;
};

export async function loadDashboard(now: Date): Promise<DashboardData> {
  const endDate = dashboardEndDate(now);
  const dates = dateRange(endDate, WINDOW_DAYS);
  const startDate = dates[0];

  const supabase = await createServerSupabase();

  const [metrics, runs] = await Promise.all([
    supabase
      .from("metrics_daily")
      .select("source, metric_date, entity, metric_key, value")
      .gte("metric_date", startDate)
      .lte("metric_date", endDate),
    supabase
      .from("collection_runs")
      .select("source, last_run_at, last_success, status, error"),
  ]);

  const failure = metrics.error ?? runs.error;

  return {
    rows: (metrics.data ?? []) as MetricRow[],
    runs: (runs.data ?? []) as CollectionRun[],
    endDate,
    unavailable: failure ? failure.message : null,
  };
}

/**
 * 대시보드는 어제(KST)까지를 완성된 하루로 본다. 오늘 값은 수집 중이라 불완전하다.
 * 조회 범위와 화면 범위가 같은 끝 날짜를 써야 차트 첫날이 비지 않는다.
 */
export function dashboardEndDate(now: Date): string {
  return kstDate(now, -1);
}
