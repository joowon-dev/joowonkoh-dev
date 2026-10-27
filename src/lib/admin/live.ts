import { APP_PLATFORMS, ga4Platform, type Platform } from "./platform";
import type { CollectionRun } from "./types";

/** apps 한 행 — 앱 등록부. */
export type AppEntry = {
  slug: string;
  name: string;
  kind: "app" | "web";
  sort: number;
  ios_bundle_id: string | null;
  android_package: string | null;
  app_store_id: number | null;
  play_listed: boolean;
  admob_app_ids: string[];
  /** AdMob 앱 id → 플랫폼 */
  admob_platforms: Record<string, Platform>;
  ga4_property_id: string | null;
};

/** live_metrics 한 행. */
export type LiveRow = {
  source: "ga4" | "admob";
  at: string;
  entity: string;
  metric_key: string;
  value: number;
};

export type Ranked = { label: string; users: number };

/** live_detail 한 행(GA4 속성마다 최신 한 장). */
export type LiveDetailRow = {
  entity: string;
  at: string;
  /** platforms 는 2026-10-27 부터 — 그 전 행에는 없다 */
  payload: { minutes: number[]; screens: Ranked[]; countries: Ranked[]; platforms?: Ranked[] };
};

export const LIVE_SOURCES = ["ga4_live", "admob_today", "store"] as const;
export type LiveSource = (typeof LIVE_SOURCES)[number];

/** 이만큼 넘게 성공이 없으면 밀린 것이다. 수집 주기(1분·10분·1시간)의 몇 배. */
export const LIVE_STALE_MINUTES: Record<LiveSource, number> = { ga4_live: 5, admob_today: 30, store: 150 };

/** 비어 있는 분은 속성마다 이만큼 전까지의 마지막 값으로 메운다. 앱 속성은 2분마다 받는다. */
const CARRY_MS = 2 * 60_000;

/**
 * 한 소스의 「지금」. 마지막 at 부터 CARRY_MS 안에서 엔티티마다 가장 최근 값을 쓴다 —
 * 앱 속성은 2분마다 받으므로 홀수 분에는 바로 전 분 값을 쓴다. 그보다 오래 못 받은 속성은 빠진다.
 */
export function latestSnapshot(rows: readonly LiveRow[], source: LiveRow["source"]) {
  let at: string | null = null;
  for (const r of rows) if (r.source === source && (at === null || r.at > at)) at = r.at;
  const values = new Map<string, Record<string, number>>();
  if (at === null) return { at, values };
  const from = Date.parse(at) - CARRY_MS;
  const newest = new Map<string, string>();
  for (const r of rows) {
    if (r.source !== source || Date.parse(r.at) < from) continue;
    const seen = newest.get(r.entity);
    if (seen === undefined || r.at > seen) newest.set(r.entity, r.at);
  }
  for (const r of rows) {
    if (r.source !== source || newest.get(r.entity) !== r.at) continue;
    const m = values.get(r.entity) ?? {};
    m[r.metric_key] = r.value;
    values.set(r.entity, m);
  }
  return { at, values };
}

export type PlatformLine = {
  platform: Platform;
  users: number | null;
  earnings: number | null;
  impressions: number | null;
};

export type AppCard = {
  app: AppEntry;
  /** null = GA4 속성이 아직 연결되지 않았거나 이번 분에 못 받았다 */
  liveUsers: number | null;
  earnings: number | null;
  impressions: number | null;
  /** iOS · Android 한 줄씩(+ 웹 버전에 사람이 있으면 웹). 웹사이트 자체는 빈 배열. */
  platforms: PlatformLine[];
};

export function buildAppCards(
  apps: readonly AppEntry[],
  rows: readonly LiveRow[],
  details: readonly LiveDetailRow[] = [],
): AppCard[] {
  const ga4 = latestSnapshot(rows, "ga4").values;
  const admob = latestSnapshot(rows, "admob").values;

  const pick = (ids: readonly string[], key: string) => {
    const vals = ids.map((id) => admob.get(id)?.[key]).filter((v): v is number => v !== undefined);
    return vals.length === 0 ? null : vals.reduce((s, v) => s + v, 0);
  };

  return [...apps]
    .sort((a, b) => a.sort - b.sort)
    .map((app) => ({
      app,
      liveUsers: app.ga4_property_id ? (ga4.get(app.ga4_property_id)?.active_users_30m ?? null) : null,
      earnings: app.admob_app_ids.length > 0 ? (pick(app.admob_app_ids, "estimated_earnings") ?? 0) : null,
      impressions: app.admob_app_ids.length > 0 ? (pick(app.admob_app_ids, "impressions") ?? 0) : null,
      platforms: app.kind === "app" ? platformLines(app, details, pick) : [],
    }));
}

function platformLines(
  app: AppEntry,
  details: readonly LiveDetailRow[],
  pick: (ids: readonly string[], key: string) => number | null,
): PlatformLine[] {
  const split = details.find((d) => d.entity === app.ga4_property_id)?.payload.platforms;
  const hasWeb = split?.some((r) => ga4Platform(r.label) === "web" && r.users > 0) ?? false;
  return [...APP_PLATFORMS, ...(hasWeb ? (["web"] as const) : [])].map((platform) => {
    const ids = app.admob_app_ids.filter((id) => app.admob_platforms[id] === platform);
    return {
      platform,
      // GA4 는 아무도 없는 플랫폼을 빼고 보낸다 — 플랫폼 기록이 있으면 없는 쪽은 0명
      users: split ? split.filter((r) => ga4Platform(r.label) === platform).reduce((s, r) => s + r.users, 0) : null,
      earnings: ids.length > 0 ? (pick(ids, "estimated_earnings") ?? 0) : null,
      impressions: ids.length > 0 ? (pick(ids, "impressions") ?? 0) : null,
    };
  });
}

/** 마지막 수집의 합. 앱 등록부에 없는 AdMob 앱(옛 앱 등)도 수익에는 넣는다. */
export function liveTotals(rows: readonly LiveRow[]) {
  const sum = (source: LiveRow["source"], key: string) => {
    const snap = latestSnapshot(rows, source);
    if (snap.at === null) return { at: null, value: null };
    let value = 0;
    for (const m of snap.values.values()) value += m[key] ?? 0;
    return { at: snap.at, value };
  };
  return {
    users: sum("ga4", "active_users_30m"),
    earnings: sum("admob", "estimated_earnings"),
    impressions: sum("admob", "impressions"),
  };
}

/** 분마다 모든 속성의 30분 사용자 합. 오늘 추이 그래프용. */
export function minuteSeries(rows: readonly LiveRow[]): { at: string; value: number }[] {
  const ga4 = rows
    .filter((r) => r.source === "ga4" && r.metric_key === "active_users_30m")
    .sort((a, b) => (a.at < b.at ? -1 : a.at > b.at ? 1 : 0));
  const last = new Map<string, { t: number; value: number }>();
  const series: { at: string; value: number }[] = [];
  for (let i = 0; i < ga4.length; i++) {
    const r = ga4[i];
    last.set(r.entity, { t: Date.parse(r.at), value: r.value });
    if (ga4[i + 1]?.at === r.at) continue;
    const t = Date.parse(r.at);
    let value = 0;
    for (const v of last.values()) if (t - v.t <= CARRY_MS) value += v.value;
    series.push({ at: r.at, value });
  }
  return series;
}

/** 속성마다의 상위 목록을 이름으로 합쳐 다시 줄 세운다. */
export function mergeRanked(details: readonly LiveDetailRow[], key: "screens" | "countries", top = 8): Ranked[] {
  const sum = new Map<string, number>();
  for (const d of details) {
    for (const r of d.payload[key] ?? []) sum.set(r.label, (sum.get(r.label) ?? 0) + r.users);
  }
  return [...sum.entries()]
    .map(([label, users]) => ({ label, users }))
    .sort((a, b) => b.users - a.users || a.label.localeCompare(b.label))
    .slice(0, top);
}

/** 30분 분별 곡선의 합(0 = 지금, 29 = 29분 전). */
export function mergeMinutes(details: readonly LiveDetailRow[]): number[] {
  const out = Array.from({ length: 30 }, () => 0);
  for (const d of details) d.payload.minutes?.forEach((v, i) => i < 30 && (out[i] += v));
  return out;
}

export type LiveProblem = { source: LiveSource; minutesSince: number | null; error: string | null };

export function findLiveProblems(runs: readonly CollectionRun[], now: Date): LiveProblem[] {
  const problems: LiveProblem[] = [];
  for (const source of LIVE_SOURCES) {
    const run = runs.find((r) => r.source === source);
    const minutesSince = run?.last_success ? (now.getTime() - Date.parse(run.last_success)) / 60_000 : null;
    const stale = minutesSince === null || minutesSince > LIVE_STALE_MINUTES[source];
    if (stale || run?.status === "error") problems.push({ source, minutesSince, error: run?.error ?? null });
  }
  return problems;
}

/** 오늘 0시(KST)를 UTC ISO 로. */
export function kstMidnightIso(now: Date): string {
  const kst = new Date(now.getTime() + 9 * 3_600_000);
  return new Date(Date.UTC(kst.getUTCFullYear(), kst.getUTCMonth(), kst.getUTCDate()) - 9 * 3_600_000).toISOString();
}

export function storeLinks(app: AppEntry) {
  return {
    appStore: app.app_store_id ? `https://apps.apple.com/kr/app/id${app.app_store_id}` : null,
    play: app.play_listed && app.android_package
      ? `https://play.google.com/store/apps/details?id=${app.android_package}`
      : null,
  };
}
