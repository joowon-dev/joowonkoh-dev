import BreakdownTable from "@/components/admin/BreakdownTable";
import TrendChart from "@/components/admin/TrendChart";
import { Notice, PageHeader, Panel, Stat, StatGrid } from "@/components/admin/ui";
import { formatInt } from "@/lib/admin/format";
import { parsePeriod, previousPeriod } from "@/lib/admin/period";
import { loadBreakdown, loadDaily, settle } from "@/lib/admin/queries";
import { buildSeries, sumPoints } from "@/lib/admin/series";
import type { MetricRow } from "@/lib/admin/types";

export const runtime = "edge";

type Props = { searchParams: Promise<Record<string, string | string[] | undefined>> };

export default async function InstagramPage({ searchParams }: Props) {
  const now = new Date();
  const period = parsePeriod(await searchParams, now);
  const prev = previousPeriod(period);

  const [daily, posts] = await Promise.all([
    settle(loadDaily(prev.start, period.end), [] as MetricRow[]),
    // 게시물 지표는 누적값 스냅숏이라 기간의 마지막 날 하루치만 본다
    settle(loadBreakdown("instagram", "post", period.end, period.end), []),
  ]);

  const series = (key: string, end = period.end) =>
    buildSeries(daily.value, { source: "instagram", metricKey: key, endDate: end, days: period.days });
  const hasData = daily.value.some((r) => r.source === "instagram");

  return (
    <>
      <PageHeader title="인스타그램" path="/admin/instagram" period={period} color="var(--insta)">
        <p className="mt-1 text-xs text-[var(--ink-faint)]">@baribari.dev</p>
      </PageHeader>

      {daily.error && <Notice>지표를 불러오지 못했어요: {daily.error}</Notice>}

      {!hasData ? (
        <ConnectGuide />
      ) : (
        <>
          <StatGrid>
            <Stat label="팔로워" value={series("followers").at(-1)?.value ?? null} previous={series("followers", prev.end).at(-1)?.value ?? null} format={formatInt} color="var(--insta)" />
            <Stat label="도달 (일별 합)" value={sumPoints(series("reach"))} previous={sumPoints(series("reach", prev.end))} format={formatInt} color="var(--insta)" />
            <Stat label="조회" value={sumPoints(series("views"))} previous={sumPoints(series("views", prev.end))} format={formatInt} color="var(--insta)" />
            <Stat label="프로필 방문" value={sumPoints(series("profile_views"))} previous={sumPoints(series("profile_views", prev.end))} format={formatInt} color="var(--insta)" />
          </StatGrid>

          <div className="grid gap-x-8 lg:grid-cols-2">
            <Panel title="팔로워">
              <TrendChart series={[{ label: "팔로워", color: "var(--insta)", points: series("followers") }]} />
            </Panel>
            <Panel title="도달">
              <TrendChart
                series={[
                  { label: "이번 기간", color: "var(--insta)", points: series("reach") },
                  { label: "지난 기간", color: "var(--insta)", points: series("reach", prev.end), muted: true },
                ]}
              />
            </Panel>
          </div>

          <Panel title="게시물별 성과" aside="게시 후 누적 · 기간 마지막 날 기준">
            <BreakdownTable lines={posts.value} columns="instagram" labelKind="plain" nameHeader="게시물" color="var(--insta)" searchable />
          </Panel>
        </>
      )}
    </>
  );
}

/** 수집 전 화면 — 무엇이 남았는지 알려 준다 */
function ConnectGuide() {
  return (
    <section className="admin-graph rounded-2xl p-5 lg:p-8">
      <h2 className="text-lg font-semibold">아직 연결 전이에요</h2>
      <p className="mt-2 max-w-xl text-sm leading-relaxed text-[var(--ink-soft)]">
        인스타그램 지표는 Meta 의 Instagram API 로 받아요. 아래 세 가지를 마치면 팔로워·도달 추이와 게시물별 조회·좋아요·저장이
        여기에 쌓여요.
      </p>
      <ol className="mt-5 max-w-xl space-y-3 text-sm">
        {[
          ["계정을 프로페셔널로", "인스타 앱 › 설정 › 계정 유형 › 크리에이터(또는 비즈니스)로 전환"],
          ["Meta 개발자 앱", "developers.facebook.com 에서 앱을 만들고 ‘Instagram API (Instagram 로그인)’ 추가"],
          ["권한 동의", "instagram_business_basic · instagram_business_manage_insights 에 동의하면 토큰을 받아 Vault 에 넣어요"],
        ].map(([title, body], i) => (
          <li key={title} className="flex gap-3">
            <span className="admin-num flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--insta)] text-xs font-semibold text-white">{i + 1}</span>
            <span>
              <span className="font-semibold">{title}</span>
              <span className="block text-[var(--ink-soft)]">{body}</span>
            </span>
          </li>
        ))}
      </ol>
    </section>
  );
}
