import CsvButton from "@/components/admin/CsvButton";
import { Notice, PageHeader, Panel } from "@/components/admin/ui";
import { formatDuration, formatInt, formatShortDay, formatUsd } from "@/lib/admin/format";
import { parsePeriod } from "@/lib/admin/period";
import { loadDaily, settle } from "@/lib/admin/queries";
import { dateRange } from "@/lib/admin/series";
import type { MetricRow, Source } from "@/lib/admin/types";
import SignOutButton from "../SignOutButton";

export const runtime = "edge";

/** 원본 표의 열. 소스 합계(metrics_daily) 그대로, 날짜마다 한 줄. */
const COLUMNS: { source: Source; key: string; label: string; format: (v: number) => string; color: string }[] = [
  { source: "ga4", key: "active_users", label: "방문자", format: formatInt, color: "var(--web)" },
  { source: "ga4", key: "new_users", label: "신규", format: formatInt, color: "var(--web)" },
  { source: "ga4", key: "sessions", label: "세션", format: formatInt, color: "var(--web)" },
  { source: "ga4", key: "engaged_sessions", label: "참여 세션", format: formatInt, color: "var(--web)" },
  { source: "ga4", key: "screen_page_views", label: "페이지뷰", format: formatInt, color: "var(--web)" },
  { source: "ga4", key: "user_engagement_duration", label: "참여 시간", format: formatDuration, color: "var(--web)" },
  { source: "admob", key: "estimated_earnings", label: "앱 수익", format: formatUsd, color: "var(--apps)" },
  { source: "admob", key: "impressions", label: "광고 노출", format: formatInt, color: "var(--apps)" },
  { source: "instagram", key: "followers", label: "팔로워", format: formatInt, color: "var(--insta)" },
  { source: "instagram", key: "reach", label: "도달", format: formatInt, color: "var(--insta)" },
];

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function DataPage({ searchParams }: Props) {
  const period = parsePeriod(await searchParams, new Date());
  const daily = await settle(loadDaily(period.start, period.end), [] as MetricRow[]);

  // 날짜 × (소스, 지표) → 합계. 앱은 여러 앱을 더한다.
  const cell = new Map<string, number>();
  for (const r of daily.value) {
    const k = `${r.metric_date}|${r.source}|${r.metric_key}`;
    cell.set(k, (cell.get(k) ?? 0) + r.value);
  }
  const dates = dateRange(period.end, period.days).reverse(); // 최신이 위
  const value = (date: string, c: (typeof COLUMNS)[number]) => cell.get(`${date}|${c.source}|${c.key}`) ?? null;
  const columns = COLUMNS.filter((c) => daily.value.some((r) => r.source === c.source));

  return (
    <>
      <PageHeader title="원본" path="/admin/data" period={period}>
        <p className="mt-1 text-xs text-[var(--ink-faint)]">날짜별 합계를 그대로 — 비어 있는 칸은 수집되지 않은 날</p>
      </PageHeader>

      {daily.error && <Notice>지표를 불러오지 못했어요: {daily.error}</Notice>}

      <Panel
        title={`${dates.length}일`}
        aside={
          <CsvButton
            filename={`joowonkoh-metrics_${period.start}_${period.end}.csv`}
            header={["date", ...columns.map((c) => `${c.source}.${c.key}`)]}
            rows={dates.map((d) => [d, ...columns.map((c) => value(d, c))])}
          />
        }
      >
        <div className="-mx-4 overflow-x-auto sm:mx-0">
          <table className="w-full min-w-[720px] border-separate border-spacing-0 text-sm">
            <thead>
              <tr className="text-[12px] text-[var(--ink-soft)] [&>th]:border-b [&>th]:border-[var(--rule)]">
                <th scope="col" className="sticky left-0 bg-[var(--paper)] py-2 pl-4 pr-3 text-left font-medium sm:pl-0">
                  날짜
                </th>
                {columns.map((c) => (
                  <th key={`${c.source}.${c.key}`} scope="col" className="px-3 py-2 text-right font-medium whitespace-nowrap">
                    <span className="mr-1 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full" style={{ background: c.color }} />
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {dates.map((d) => (
                <tr key={d}>
                  <th scope="row" className="admin-num sticky left-0 border-b border-[var(--grid)] bg-[var(--paper)] py-2 pl-4 pr-3 text-left font-medium sm:pl-0">
                    {formatShortDay(d)}
                  </th>
                  {columns.map((c) => {
                    const v = value(d, c);
                    return (
                      <td key={`${c.source}.${c.key}`} className={`admin-num border-b border-[var(--grid)] px-3 py-2 text-right ${v === null ? "text-[var(--ink-faint)]" : ""}`}>
                        {v === null ? "–" : c.format(v)}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* 모바일엔 사이드바가 없어서 계정·로그아웃을 여기에 둔다 */}
      <div className="mt-10 flex items-center justify-between border-t border-[var(--rule)] pt-4 text-xs text-[var(--ink-faint)] lg:hidden">
        <span>관리자 계정으로 로그인됨</span>
        <SignOutButton />
      </div>
    </>
  );
}
