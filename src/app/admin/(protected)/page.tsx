import FreshnessBanner from "@/components/admin/FreshnessBanner";
import Sparkline from "@/components/admin/Sparkline";
import StatCard from "@/components/admin/StatCard";
import { findFreshnessProblems } from "@/lib/admin/freshness";
import { loadDashboard, WINDOW_DAYS, yesterdayOf } from "@/lib/admin/queries";
import { buildSeries, computeDelta } from "@/lib/admin/series";
import { SOURCE_LABELS, type Source } from "@/lib/admin/types";

/**
 * 화면에 세울 지표. 소스를 붙일 때마다 여기에 한 줄씩 는다.
 * 수집 파이프라인이 아직 없는 소스도 자리를 비워 두고 먼저 보여준다.
 */
const PANELS: {
  source: Source;
  metricKey: string;
  label: string;
  format: (value: number) => string;
}[] = [
  {
    source: "ga4",
    metricKey: "active_users",
    label: "방문자 (GA4)",
    format: (v) => v.toLocaleString("ko-KR"),
  },
  {
    source: "admob",
    metricKey: "estimated_earnings",
    label: "수익 (AdMob)",
    format: (v) => `$${v.toFixed(2)}`,
  },
  {
    source: "instagram",
    metricKey: "followers",
    label: "팔로워 (Instagram)",
    format: (v) => v.toLocaleString("ko-KR"),
  },
];

export default async function AdminDashboardPage() {
  const now = new Date();
  const { rows, runs, unavailable } = await loadDashboard(now);

  // 오늘 값은 수집 중이라 불완전하다. 어제를 마지막 날로 놓는다.
  const endDate = yesterdayOf(now).toISOString().slice(0, 10);

  const panels = PANELS.map((panel) => {
    const series = buildSeries(rows, {
      source: panel.source,
      metricKey: panel.metricKey,
      endDate,
      days: WINDOW_DAYS,
    });
    return { ...panel, series, delta: computeDelta(series) };
  });

  return (
    <div>
      {unavailable ? (
        <div className="mb-6 rounded-lg border border-red-900/60 bg-red-950/30 px-4 py-3 text-xs text-red-200">
          <p className="font-medium">지표를 불러오지 못했습니다</p>
          <p className="mt-1 text-red-200/80">{unavailable}</p>
          <p className="mt-2 text-red-200/60">
            마이그레이션이 아직 적용되지 않았거나 권한이 없습니다.
          </p>
        </div>
      ) : (
        <FreshnessBanner problems={findFreshnessProblems(runs, now)} />
      )}

      <p className="mb-4 text-xs text-neutral-500">{endDate} 기준</p>

      <div className="grid gap-4 sm:grid-cols-3">
        {panels.map((panel) => (
          <StatCard
            key={`${panel.source}:${panel.metricKey}`}
            label={panel.label}
            delta={panel.delta}
            format={panel.format}
          />
        ))}
      </div>

      <div className="mt-10 space-y-8">
        {panels.map((panel) => (
          <section key={`${panel.source}:${panel.metricKey}`}>
            <h2 className="mb-3 text-xs font-medium text-neutral-400">
              {SOURCE_LABELS[panel.source]} · 최근 {WINDOW_DAYS}일
            </h2>
            <div className="rounded-xl border border-neutral-800 bg-neutral-900/50 p-4 text-neutral-400">
              <Sparkline series={panel.series} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
