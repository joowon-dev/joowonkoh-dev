import BreakdownTable from "@/components/admin/BreakdownTable";
import FreshnessBanner from "@/components/admin/FreshnessBanner";
import TrendChart from "@/components/admin/TrendChart";
import { Notice, PageHeader, Panel, Stat, StatGrid, Tabs } from "@/components/admin/ui";
import { type BreakdownLine, ratio } from "@/lib/admin/breakdown";
import type { LabelKind } from "@/lib/admin/columns";
import { formatInt, formatPercent, formatUsd } from "@/lib/admin/format";
import { findFreshnessProblems } from "@/lib/admin/freshness";
import { parsePeriod, previousPeriod } from "@/lib/admin/period";
import { loadBreakdown, loadDaily, loadRuns, settle } from "@/lib/admin/queries";
import { buildSeries } from "@/lib/admin/series";
import type { MetricRow } from "@/lib/admin/types";

export const runtime = "edge";

const METRICS = [
  { key: "estimated_earnings", label: "수익", format: "usd" },
  { key: "impressions", label: "노출", format: "int" },
] as const;

const DIMENSIONS: readonly { key: string; label: string; kind: LabelKind; name: string }[] = [
  { key: "app", label: "앱", kind: "plain", name: "앱" },
  { key: "ad_unit", label: "광고 단위", kind: "plain", name: "광고 단위" },
  { key: "format", label: "광고 형식", kind: "format", name: "형식" },
  { key: "country", label: "국가", kind: "country", name: "국가" },
];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

/** 앱 차원 표의 합 — 클릭·요청 수는 metrics_daily 에 없어서 여기서 낸다 */
function sum(lines: readonly BreakdownLine[], key: string): number | undefined {
  if (lines.length === 0) return undefined;
  return lines.reduce((s, l) => s + (l.metrics[key] ?? 0), 0);
}

export default async function AppsPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();
  const period = parsePeriod(params, now);
  const prev = previousPeriod(period);
  const metric = METRICS.find((m) => m.key === params.metric) ?? METRICS[0];
  const dim = DIMENSIONS.find((d) => d.key === params.dim) ?? DIMENSIONS[0];

  const [daily, runs, lines, appsNow, appsPrev] = await Promise.all([
    settle(loadDaily(prev.start, period.end), [] as MetricRow[]),
    settle(loadRuns(), []),
    settle(loadBreakdown("admob", dim.key, period.start, period.end), []),
    settle(loadBreakdown("admob", "app", period.start, period.end), []),
    settle(loadBreakdown("admob", "app", prev.start, prev.end), []),
  ]);

  const series = (key: string, end = period.end) =>
    buildSeries(daily.value, { source: "admob", metricKey: key, endDate: end, days: period.days });

  const a = (key: string) => sum(appsNow.value, key);
  const b = (key: string) => sum(appsPrev.value, key);
  const ecpm = (e?: number, i?: number) => {
    const r = ratio(e, i);
    return r === null ? null : r * 1000;
  };

  const pageQuery = { ...period.query, metric: metric.key, dim: dim.key };
  const error = daily.error ?? runs.error ?? lines.error;

  return (
    <>
      <PageHeader title="앱" path="/admin/apps" period={period} color="var(--apps)">
        <p className="mt-1 text-xs text-[var(--ink-faint)]">이게내연봉 · 지구미아 · 네밥내밥 · AdMob (USD)</p>
      </PageHeader>

      {error ? <Notice>지표를 불러오지 못했어요: {error}</Notice> : <FreshnessBanner problems={findFreshnessProblems(runs.value, now).filter((p) => p.source === "admob")} />}

      <StatGrid>
        <Stat label="예상 수익" value={a("estimated_earnings") ?? null} previous={b("estimated_earnings")} format={formatUsd} color="var(--apps)" />
        <Stat label="노출" value={a("impressions") ?? null} previous={b("impressions")} format={formatInt} color="var(--apps)" />
        <Stat label="eCPM" value={ecpm(a("estimated_earnings"), a("impressions"))} previous={ecpm(b("estimated_earnings"), b("impressions"))} format={formatUsd} color="var(--apps)" hint="노출 1000번당 수익" />
        <Stat label="클릭" value={a("clicks") ?? null} previous={b("clicks")} format={formatInt} color="var(--apps)" />
        <Stat label="CTR" value={ratio(a("clicks"), a("impressions"))} previous={ratio(b("clicks"), b("impressions"))} format={formatPercent} color="var(--apps)" />
        <Stat label="매치율" value={ratio(a("matched_requests"), a("ad_requests"))} previous={ratio(b("matched_requests"), b("ad_requests"))} format={formatPercent} color="var(--apps)" hint="광고 요청 중 채워진 비율" />
      </StatGrid>

      <Panel title="일별 추이">
        <Tabs path="/admin/apps" query={pageQuery} param="metric" active={metric.key} color="var(--apps)" items={METRICS} />
        <div className="mt-4">
          <TrendChart
            height={240}
            format={metric.format}
            series={[
              { label: metric.label, color: "var(--apps)", points: series(metric.key) },
              { label: "지난 기간", color: "var(--apps)", points: series(metric.key, prev.end), muted: true },
            ]}
          />
        </div>
      </Panel>

      <Panel title="어디서 벌었나" aside="기간 합계 · 머리글을 누르면 정렬">
        <Tabs path="/admin/apps" query={pageQuery} param="dim" active={dim.key} color="var(--apps)" items={DIMENSIONS} />
        <div className="mt-4">
          <BreakdownTable lines={lines.value} columns="admob" labelKind={dim.kind} nameHeader={dim.name} color="var(--apps)" searchable={dim.key === "country"} />
        </div>
      </Panel>
    </>
  );
}
