import BreakdownTable from "@/components/admin/BreakdownTable";
import FreshnessBanner from "@/components/admin/FreshnessBanner";
import TrendChart from "@/components/admin/TrendChart";
import { Notice, PageHeader, Panel, Stat, StatGrid, Tabs } from "@/components/admin/ui";
import { ratio } from "@/lib/admin/breakdown";
import type { LabelKind } from "@/lib/admin/columns";
import { formatDuration, formatInt, formatPercent } from "@/lib/admin/format";
import { findFreshnessProblems } from "@/lib/admin/freshness";
import { parsePeriod, previousPeriod } from "@/lib/admin/period";
import { loadBreakdown, loadDaily, loadRuns, settle } from "@/lib/admin/queries";
import { buildSeries, sumPoints } from "@/lib/admin/series";
import type { MetricRow } from "@/lib/admin/types";

export const runtime = "edge";

const METRICS = [
  { key: "active_users", label: "방문자" },
  { key: "screen_page_views", label: "페이지뷰" },
  { key: "sessions", label: "세션" },
  { key: "new_users", label: "신규 방문자" },
] as const;

const DIMENSIONS: readonly { key: string; label: string; kind: LabelKind; name: string }[] = [
  { key: "page", label: "페이지", kind: "page", name: "페이지" },
  { key: "channel", label: "유입 채널", kind: "channel", name: "채널" },
  { key: "source_medium", label: "소스 / 매체", kind: "plain", name: "소스 / 매체" },
  { key: "country", label: "국가", kind: "country", name: "국가" },
  { key: "device", label: "기기", kind: "device", name: "기기" },
];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function WebPage({ searchParams }: Props) {
  const params = await searchParams;
  const now = new Date();
  const period = parsePeriod(params, now);
  const prev = previousPeriod(period);
  const metric = METRICS.find((m) => m.key === params.metric) ?? METRICS[0];
  const dim = DIMENSIONS.find((d) => d.key === params.dim) ?? DIMENSIONS[0];

  const [daily, runs, lines] = await Promise.all([
    settle(loadDaily(prev.start, period.end), [] as MetricRow[]),
    settle(loadRuns(), []),
    settle(loadBreakdown("ga4", dim.key, period.start, period.end), []),
  ]);

  const series = (key: string, end = period.end) =>
    buildSeries(daily.value, { source: "ga4", metricKey: key, endDate: end, days: period.days });
  const now_ = (key: string) => sumPoints(series(key)) ?? undefined;
  const before = (key: string) => sumPoints(series(key, prev.end)) ?? undefined;

  const pageQuery = { ...period.query, metric: metric.key, dim: dim.key };
  const error = daily.error ?? runs.error ?? lines.error;

  return (
    <>
      <PageHeader title="웹" path="/admin/web" period={period} color="var(--web)">
        <p className="mt-1 text-xs text-[var(--ink-faint)]">joowonkoh.com · GA4</p>
      </PageHeader>

      {error ? <Notice>지표를 불러오지 못했어요: {error}</Notice> : <FreshnessBanner problems={findFreshnessProblems(runs.value, now).filter((p) => p.source === "ga4")} />}

      <StatGrid>
        <Stat label="방문자 (일별 합)" value={now_("active_users") ?? null} previous={before("active_users")} format={formatInt} color="var(--web)" />
        <Stat label="신규 방문자" value={now_("new_users") ?? null} previous={before("new_users")} format={formatInt} color="var(--web)" />
        <Stat label="페이지뷰" value={now_("screen_page_views") ?? null} previous={before("screen_page_views")} format={formatInt} color="var(--web)" />
        <Stat label="세션" value={now_("sessions") ?? null} previous={before("sessions")} format={formatInt} color="var(--web)" />
        <Stat
          label="참여율"
          value={ratio(now_("engaged_sessions"), now_("sessions"))}
          previous={ratio(before("engaged_sessions"), before("sessions"))}
          format={formatPercent}
          color="var(--web)"
          hint="10초 넘게 머문 세션 비율"
        />
        <Stat
          label="평균 참여 시간"
          value={ratio(now_("user_engagement_duration"), now_("active_users"))}
          previous={ratio(before("user_engagement_duration"), before("active_users"))}
          format={formatDuration}
          color="var(--web)"
        />
      </StatGrid>

      <Panel title="일별 추이">
        <Tabs path="/admin/web" query={pageQuery} param="metric" active={metric.key} color="var(--web)" items={METRICS} />
        <div className="mt-4">
          <TrendChart
            height={240}
            series={[
              { label: metric.label, color: "var(--web)", points: series(metric.key) },
              { label: "지난 기간", color: "var(--web)", points: series(metric.key, prev.end), muted: true },
            ]}
          />
        </div>
      </Panel>

      <Panel title="어디서, 무엇을" aside="기간 합계 · 머리글을 누르면 정렬">
        <Tabs path="/admin/web" query={pageQuery} param="dim" active={dim.key} color="var(--web)" items={DIMENSIONS} />
        <div className="mt-4">
          <BreakdownTable lines={lines.value} columns="ga4" labelKind={dim.kind} nameHeader={dim.name} color="var(--web)" searchable={dim.key === "page" || dim.key === "source_medium"} />
        </div>
        <p className="mt-3 text-xs text-[var(--ink-faint)]">방문자는 날마다 센 값을 더했어요. 같은 사람이 이틀 오면 2로 셉니다.</p>
      </Panel>
    </>
  );
}
