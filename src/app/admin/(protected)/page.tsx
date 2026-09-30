import Link from "next/link";
import FreshnessBanner from "@/components/admin/FreshnessBanner";
import TrendChart from "@/components/admin/TrendChart";
import { Notice, PageHeader, Panel, Stat, StatGrid } from "@/components/admin/ui";
import { ratio } from "@/lib/admin/breakdown";
import { formatDay, formatInt, formatPercent, formatUsd } from "@/lib/admin/format";
import { findFreshnessProblems } from "@/lib/admin/freshness";
import { parsePeriod, previousPeriod, withQuery } from "@/lib/admin/period";
import { loadBreakdown, loadDaily, loadRuns, settle } from "@/lib/admin/queries";
import { buildSeries, sumPoints } from "@/lib/admin/series";
import type { MetricRow, Source } from "@/lib/admin/types";

export const runtime = "edge";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function AdminHomePage({ searchParams }: Props) {
  const now = new Date();
  const period = parsePeriod(await searchParams, now);
  const prev = previousPeriod(period);
  const yesterday = period.end;

  const [daily, runs, topPages, apps] = await Promise.all([
    settle(loadDaily(prev.start, period.end), [] as MetricRow[]),
    settle(loadRuns(), []),
    settle(loadBreakdown("ga4", "page", yesterday, yesterday), []),
    settle(loadBreakdown("admob", "app", period.start, period.end), []),
  ]);

  const series = (source: Source, metricKey: string, end = period.end) =>
    buildSeries(daily.value, { source, metricKey, endDate: end, days: period.days });
  const total = (source: Source, key: string) => sumPoints(series(source, key));
  const prevTotal = (source: Source, key: string) => sumPoints(series(source, key, prev.end));
  const lastDay = (source: Source, key: string) => series(source, key).at(-1)?.value ?? null;

  const visitors = series("ga4", "active_users");
  const earnings = series("admob", "estimated_earnings");
  const ecpm = (s: "now" | "prev") => {
    const pick = s === "now" ? total : prevTotal;
    const r = ratio(pick("admob", "estimated_earnings") ?? undefined, pick("admob", "impressions") ?? undefined);
    return r === null ? null : r * 1000;
  };
  const engagement = (s: "now" | "prev") => {
    const pick = s === "now" ? total : prevTotal;
    return ratio(pick("ga4", "engaged_sessions") ?? undefined, pick("ga4", "sessions") ?? undefined);
  };

  const yVisitors = lastDay("ga4", "active_users");
  const yViews = lastDay("ga4", "screen_page_views");
  const yEarnings = lastDay("admob", "estimated_earnings");
  const error = daily.error ?? runs.error;

  const pages = [...topPages.value]
    .sort((a, b) => (b.metrics.screen_page_views ?? 0) - (a.metrics.screen_page_views ?? 0))
    .slice(0, 5);
  const appRank = [...apps.value]
    .sort((a, b) => (b.metrics.estimated_earnings ?? 0) - (a.metrics.estimated_earnings ?? 0))
    .filter((a) => (a.metrics.impressions ?? 0) > 0);
  const appTotal = appRank.reduce((s, a) => s + (a.metrics.estimated_earnings ?? 0), 0);

  return (
    <>
      <PageHeader title="오늘" path="/admin" period={period} />

      {error ? (
        <Notice>지표를 불러오지 못했어요: {error}</Notice>
      ) : (
        <FreshnessBanner problems={findFreshnessProblems(runs.value, now)} />
      )}

      {/* 한 줄 요약 — 이 화면에서 가장 먼저 읽히는 곳 */}
      <p className="max-w-3xl text-[22px] leading-[1.45] font-medium tracking-tight text-balance lg:text-[30px]">
        <span className="text-[var(--ink-soft)]">어제 {formatDay(yesterday)}, </span>
        {yVisitors === null ? (
          "방문 기록이 아직 없고"
        ) : (
          <>
            <Figure color="var(--web)">{formatInt(yVisitors)}명</Figure>이 다녀가 페이지를{" "}
            <Figure color="var(--web)">{formatInt(yViews ?? 0)}번</Figure> 봤고
          </>
        )}
        ,{" "}
        {yEarnings === null ? (
          "앱 수익은 아직 집계 전이에요."
        ) : (
          <>
            앱 광고로 <Figure color="var(--apps)">{formatUsd(yEarnings)}</Figure>를 벌었어요.
          </>
        )}
      </p>

      <Panel title={`${period.days}일 합계`} aside="지난 같은 길이 기간과 비교">
        <StatGrid>
          <Stat label="방문자 (일별 합)" value={total("ga4", "active_users")} previous={prevTotal("ga4", "active_users")} format={formatInt} color="var(--web)" />
          <Stat label="페이지뷰" value={total("ga4", "screen_page_views")} previous={prevTotal("ga4", "screen_page_views")} format={formatInt} color="var(--web)" />
          <Stat label="참여율" value={engagement("now")} previous={engagement("prev")} format={formatPercent} color="var(--web)" />
          <Stat label="앱 수익" value={total("admob", "estimated_earnings")} previous={prevTotal("admob", "estimated_earnings")} format={formatUsd} color="var(--apps)" />
          <Stat label="광고 노출" value={total("admob", "impressions")} previous={prevTotal("admob", "impressions")} format={formatInt} color="var(--apps)" />
          <Stat label="eCPM" value={ecpm("now")} previous={ecpm("prev")} format={formatUsd} color="var(--apps)" />
        </StatGrid>
      </Panel>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Panel title="방문자" aside={<Link href={withQuery("/admin/web", period.query)} className="font-semibold text-[var(--web)]">웹 자세히</Link>}>
          <TrendChart
            series={[
              { label: "이번 기간", color: "var(--web)", points: visitors },
              { label: "지난 기간", color: "var(--web)", points: series("ga4", "active_users", prev.end), muted: true },
            ]}
          />
        </Panel>
        <Panel title="앱 수익" aside={<Link href={withQuery("/admin/apps", period.query)} className="font-semibold text-[var(--apps)]">앱 자세히</Link>}>
          <TrendChart
            format="usd"
            series={[
              { label: "이번 기간", color: "var(--apps)", points: earnings },
              { label: "지난 기간", color: "var(--apps)", points: series("admob", "estimated_earnings", prev.end), muted: true },
            ]}
          />
        </Panel>
      </div>

      <div className="grid gap-x-8 lg:grid-cols-2">
        <Panel title="어제 많이 본 페이지">
          <RankList
            color="var(--web)"
            items={pages.map((p) => ({
              key: p.value,
              title: p.label && p.label !== "(not set)" ? p.label : p.value,
              sub: p.value,
              value: formatInt(p.metrics.screen_page_views ?? 0),
            }))}
            empty="어제 페이지 기록이 아직 없어요"
          />
        </Panel>
        <Panel title={`앱별 수익 · ${period.days}일`}>
          <RankList
            color="var(--apps)"
            items={appRank.map((a) => ({
              key: a.value,
              title: a.label ?? a.value,
              sub: appTotal > 0 ? `${(((a.metrics.estimated_earnings ?? 0) / appTotal) * 100).toFixed(0)}%` : null,
              value: formatUsd(a.metrics.estimated_earnings ?? 0),
            }))}
            empty="이 기간 앱 수익이 없어요"
          />
        </Panel>
      </div>
    </>
  );
}

function Figure({ color, children }: { color: string; children: React.ReactNode }) {
  return (
    <span className="admin-num font-semibold" style={{ color }}>
      {children}
    </span>
  );
}

function RankList({
  items,
  color,
  empty,
}: {
  items: { key: string; title: string; sub: string | null; value: string }[];
  color: string;
  empty: string;
}) {
  if (items.length === 0) return <p className="rounded-xl bg-[var(--paper-raised)] px-4 py-8 text-center text-sm text-[var(--ink-faint)]">{empty}</p>;
  return (
    <ol className="divide-y divide-[var(--grid)] rounded-xl bg-[var(--paper-raised)] px-4">
      {items.map((item, i) => (
        <li key={item.key} className="flex items-center gap-3 py-3">
          <span className="admin-num w-4 text-sm font-semibold" style={{ color }}>
            {i + 1}
          </span>
          <span className="min-w-0 flex-1">
            <span className="block truncate text-sm">{item.title}</span>
            {item.sub && <span className="block truncate text-[12px] text-[var(--ink-faint)]">{item.sub}</span>}
          </span>
          <span className="admin-num text-[15px] font-semibold">{item.value}</span>
        </li>
      ))}
    </ol>
  );
}
