import Link from "next/link";
import { notFound } from "next/navigation";
import AutoRefresh from "@/components/admin/AutoRefresh";
import ReviewList from "@/components/admin/ReviewList";
import TrendChart from "@/components/admin/TrendChart";
import { Notice, PageHeader, Panel, Tabs } from "@/components/admin/ui";
import { formatInt, formatUsd } from "@/lib/admin/format";
import { buildAppCards, kstMidnightIso, storeLinks } from "@/lib/admin/live";
import { parsePeriod } from "@/lib/admin/period";
import {
  loadApps,
  loadLive,
  loadStoreListings,
  loadStoreMetrics,
  loadStoreReviews,
  settle,
} from "@/lib/admin/queries";
import {
  dailyStoreSeries,
  rankLabel,
  snapshotAt,
  type Store,
  STORE_LABELS,
  type StoreListingRow,
  type StoreMetric,
} from "@/lib/admin/store";

export const runtime = "edge";

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

const METRICS = [
  { key: "rank_category", label: "카테고리 순위", format: "int" },
  { key: "rank_overall", label: "전체 순위", format: "int" },
  { key: "rating_count", label: "평가 수", format: "int" },
  { key: "installs", label: "Play 설치 수", format: "int" },
] as const;

const STORE_COLORS: Record<Store, string> = { ios: "var(--web)", android: "var(--apps)" };

export default async function AppDetailPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const query = await searchParams;
  const now = new Date();
  const period = parsePeriod(query, now);
  const metric = METRICS.find((m) => m.key === query.metric) ?? METRICS[0];
  const path = `/admin/apps/${slug}`;

  // 기간 첫날 0시(KST) 이전 하루치도 받아 「그날 마지막 값」이 비지 않게 한다.
  const since = new Date(Date.parse(`${period.start}T00:00:00+09:00`) - 86_400_000).toISOString();

  const [apps, rows, listings, reviews, live] = await Promise.all([
    settle(loadApps(), []),
    settle(loadStoreMetrics(since, slug), []),
    settle(loadStoreListings(), []),
    settle(loadStoreReviews({ slug, limit: 200 }), []),
    settle(loadLive(kstMidnightIso(now)), []),
  ]);

  const app = apps.value.find((a) => a.slug === slug && a.kind === "app");
  if (!app && !apps.error) notFound();
  const error = apps.error ?? rows.error ?? listings.error ?? reviews.error;
  if (!app) return <Notice>앱을 불러오지 못했어요: {error}</Notice>;

  const links = storeLinks(app);
  const stores: Store[] = [...(app.app_store_id ? (["ios"] as const) : []), ...(links.play ? (["android"] as const) : [])];
  const [card] = buildAppCards([app], live.value);
  const dayAgo = new Date(now.getTime() - 24 * 3_600_000).toISOString();

  return (
    <>
      <AutoRefresh seconds={60} />
      <Link href="/admin/apps" className="text-sm text-[var(--ink-soft)] hover:text-[var(--ink)]">
        ‹ 앱
      </Link>
      <PageHeader title={app.name} path={path} period={period} color="var(--apps)">
        <p className="mt-1 flex gap-3 text-xs">
          {links.appStore && <a href={links.appStore} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">App Store</a>}
          {links.play && <a href={links.play} target="_blank" rel="noreferrer" className="underline-offset-2 hover:underline">Google Play</a>}
        </p>
      </PageHeader>

      {error && <Notice>일부 지표를 불러오지 못했어요: {error}</Notice>}

      <dl className="admin-num grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-4">
        <Figure label="지금 30분" value={card.liveUsers === null ? (app.ga4_property_id ? "–" : "GA4 미연결") : `${formatInt(card.liveUsers)}명`} />
        <Figure label="오늘 AdMob" value={card.earnings === null ? "–" : formatUsd(card.earnings)} note={card.impressions === null ? undefined : `노출 ${formatInt(card.impressions)}`} />
      </dl>

      {stores.map((store) => (
        <StoreBlock
          key={store}
          store={store}
          rows={rows.value}
          slug={slug}
          dayAgo={dayAgo}
          listing={listings.value.find((l) => l.app_slug === slug && l.store === store)}
        />
      ))}

      <Panel title="추이" aside={metric.key.startsWith("rank") ? "숫자가 작을수록 위 · 끊긴 날은 차트 밖" : "하루 마지막 수집 값"}>
        <Tabs path={path} query={{ ...period.query, metric: metric.key }} param="metric" active={metric.key} color="var(--apps)" items={METRICS} />
        <div className="mt-4">
          <TrendChart
            height={220}
            format={metric.format}
            series={stores
              .filter((s) => metric.key !== "installs" || s === "android")
              .map((store) => ({
                label: STORE_LABELS[store],
                color: STORE_COLORS[store],
                points: dailyStoreSeries(rows.value, { slug, store, metricKey: metric.key, endDate: period.end, days: period.days }),
              }))}
          />
        </div>
      </Panel>

      <Panel title="리뷰" aside={`모은 것 ${formatInt(reviews.value.length)}개 · 한국 스토어`}>
        <ReviewList reviews={reviews.value} now={now} />
      </Panel>
    </>
  );
}

function StoreBlock({
  store,
  rows,
  slug,
  dayAgo,
  listing,
}: {
  store: Store;
  rows: readonly StoreMetric[];
  slug: string;
  dayAgo: string;
  listing?: StoreListingRow;
}) {
  const nowSnap = snapshotAt(rows, slug, store);
  const prevSnap = snapshotAt(rows, slug, store, dayAgo);
  const v = nowSnap.values;
  const p = prevSnap.at ? prevSnap.values : null;

  return (
    <Panel
      title={STORE_LABELS[store]}
      aside={[listing?.genre, listing?.version && `v${listing.version}`, listing?.updated && `업데이트 ${formatUpdated(listing.updated)}`]
        .filter(Boolean)
        .join(" · ")}
    >
      {nowSnap.at === null ? (
        <p className="text-sm text-[var(--ink-faint)]">아직 수집 전이에요.</p>
      ) : (
        <dl className="admin-num grid grid-cols-2 gap-x-4 gap-y-5 sm:grid-cols-5">
          <Figure label="별점" value={v.rating ? v.rating.toFixed(2) : "–"} note={v.rating ? undefined : "평가가 적어 안 보여요"} />
          <Figure label="평가 수" value={formatInt(v.rating_count ?? 0)} note={change(v.rating_count, p?.rating_count)} />
          {store === "android" && <Figure label="설치 수" value={v.installs === undefined ? "–" : formatInt(v.installs)} note={change(v.installs, p?.installs)} />}
          <Figure label={`${listing?.genre ?? "카테고리"} 순위`} value={rankLabel(v.rank_category, store)} note={rankChange(v.rank_category, p?.rank_category, p !== null)} />
          <Figure label="전체 순위" value={rankLabel(v.rank_overall, store)} note={rankChange(v.rank_overall, p?.rank_overall, p !== null)} />
        </dl>
      )}
    </Panel>
  );
}

function Figure({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="border-l-2 border-[var(--rule)] py-1 pl-3">
      <dt className="text-[13px] text-[var(--ink-soft)]">{label}</dt>
      <dd className="mt-0.5 text-[24px] font-semibold leading-tight">{value}</dd>
      {note && <dd className="text-xs text-[var(--ink-faint)]">{note}</dd>}
    </div>
  );
}

/** 24시간 전과의 차이. 같으면 말하지 않는다. */
function change(now?: number, before?: number): string | undefined {
  if (now === undefined || before === undefined || now === before) return undefined;
  return `${now > before ? "+" : "−"}${formatInt(Math.abs(now - before))} · 24시간`;
}

function rankChange(now: number | undefined, before: number | undefined, hadBefore: boolean): string | undefined {
  if (!hadBefore) return undefined;
  if (now !== undefined && before === undefined) return "차트에 새로 들어옴";
  if (now === undefined && before !== undefined) return `차트 밖으로 (어제 ${before}위)`;
  if (now === undefined || before === undefined || now === before) return undefined;
  return `${now < before ? "▲" : "▼"} ${Math.abs(now - before)} · 24시간`;
}

function formatUpdated(s: string): string {
  // App Store 는 ISO, Play 는 「2026. 10. 25.」 그대로
  return /^\d{4}-\d{2}-\d{2}T/.test(s) ? s.slice(0, 10).replaceAll("-", ". ") + "." : s;
}
