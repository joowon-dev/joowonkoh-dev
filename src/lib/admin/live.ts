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
  payload: { minutes: number[]; screens: Ranked[]; countries: Ranked[] };
};

export const LIVE_SOURCES = ["ga4_live", "admob_today"] as const;
export type LiveSource = (typeof LIVE_SOURCES)[number];

/** 이만큼 넘게 성공이 없으면 「실시간」이 아니다. 수집 주기(1분·10분)의 몇 배. */
export const LIVE_STALE_MINUTES: Record<LiveSource, number> = { ga4_live: 5, admob_today: 30 };

/**
 * 한 소스에서 가장 최근 수집 시각의 행만. 수집은 엔티티를 한꺼번에 적으므로
 * 마지막 at 하나가 「지금」이다. 그 분에 실패한 속성은 빠진다 — 옛 숫자를 섞지 않는다.
 */
export function latestSnapshot(rows: readonly LiveRow[], source: LiveRow["source"]) {
  let at: string | null = null;
  for (const r of rows) if (r.source === source && (at === null || r.at > at)) at = r.at;
  const values = new Map<string, Record<string, number>>();
  if (at === null) return { at, values };
  for (const r of rows) {
    if (r.source !== source || r.at !== at) continue;
    const m = values.get(r.entity) ?? {};
    m[r.metric_key] = r.value;
    values.set(r.entity, m);
  }
  return { at, values };
}

export type AppCard = {
  app: AppEntry;
  /** null = GA4 속성이 아직 연결되지 않았거나 이번 분에 못 받았다 */
  liveUsers: number | null;
  earnings: number | null;
  impressions: number | null;
};

export function buildAppCards(apps: readonly AppEntry[], rows: readonly LiveRow[]): AppCard[] {
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
    }));
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
  const byAt = new Map<string, number>();
  for (const r of rows) {
    if (r.source !== "ga4" || r.metric_key !== "active_users_30m") continue;
    byAt.set(r.at, (byAt.get(r.at) ?? 0) + r.value);
  }
  return [...byAt.entries()].sort(([a], [b]) => (a < b ? -1 : 1)).map(([at, value]) => ({ at, value }));
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
