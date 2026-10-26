/**
 * 실시간 — GA4 Realtime(최근 30분)과 AdMob 오늘치 → live_metrics / live_detail 행,
 * 그리고 GA4 속성 찾기(ga4_discover).
 *
 * ga4.ts 와 같은 이유로 외부 패키지를 쓰지 않는다.
 */
import { assertUsd, type Chunk, kstDay, readMetric } from "./admob.ts";

/** live_metrics 한 행. at 은 분 단위로 자른 수집 시각이라 같은 분에 다시 돌면 덮어쓴다. */
export type LiveRow = {
  at: string;
  source: "ga4" | "admob";
  entity: string; // GA4 속성 id 또는 AdMob 앱 id
  metric_key: string;
  value: number;
};

/** live_detail 한 행 — 엔티티마다 최신 한 장만 둔다. */
export type LiveDetail = {
  source: "ga4";
  entity: string;
  at: string;
  payload: Ga4LivePayload;
};

export type Ga4LivePayload = {
  /** 0분 전 → 29분 전. 그 분에 활동한 사용자. */
  minutes: number[];
  screens: { label: string; users: number }[];
  countries: { label: string; users: number }[];
  /** GA4 platform 차원 그대로 — "iOS" · "Android" · "web" */
  platforms: { label: string; users: number }[];
};

/** 상위 몇 줄만 남긴다. 화면은 합쳐서 다시 자르므로 넉넉히. */
const TOP = 10;

export function minuteFloor(now: Date): string {
  const d = new Date(now);
  d.setUTCSeconds(0, 0);
  return d.toISOString();
}

// ---------------------------------------------------------------- GA4 Realtime

/**
 * 속성 하나에 보내는 요청 다섯. 합계는 차원 없이 따로 받는다 — 차원별 행을 더하면
 * 화면 두 개를 본 사람이 두 번 세어진다.
 */
export const REALTIME_REQUESTS = {
  total: { metrics: [{ name: "activeUsers" }] },
  minutes: {
    dimensions: [{ name: "minutesAgo" }],
    metrics: [{ name: "activeUsers" }],
  },
  screens: {
    dimensions: [{ name: "unifiedScreenName" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: TOP,
  },
  countries: {
    dimensions: [{ name: "country" }],
    metrics: [{ name: "activeUsers" }],
    orderBys: [{ metric: { metricName: "activeUsers" }, desc: true }],
    limit: TOP,
  },
  platforms: {
    dimensions: [{ name: "platform" }],
    metrics: [{ name: "activeUsers" }],
  },
} as const;

type RealtimeReport = {
  rows?: { dimensionValues?: { value: string }[]; metricValues: { value: string }[] }[];
};

export type RealtimeReports = Record<keyof typeof REALTIME_REQUESTS, RealtimeReport>;

/** 사용자가 0명이면 GA4 는 rows 를 아예 빼고 보낸다. 0 으로 읽는다. */
export function normalizeRealtime(
  reports: RealtimeReports,
  propertyId: string,
  at: string,
): { row: LiveRow; detail: LiveDetail } {
  const total = Number(reports.total.rows?.[0]?.metricValues[0]?.value ?? 0);

  const minutes = Array.from({ length: 30 }, () => 0);
  for (const r of reports.minutes.rows ?? []) {
    const ago = Number(r.dimensionValues?.[0]?.value);
    if (Number.isInteger(ago) && ago >= 0 && ago < 30) minutes[ago] = Number(r.metricValues[0]?.value ?? 0);
  }

  const list = (report: RealtimeReport) =>
    (report.rows ?? [])
      .map((r) => ({ label: r.dimensionValues?.[0]?.value ?? "(not set)", users: Number(r.metricValues[0]?.value ?? 0) }))
      .filter((x) => Number.isFinite(x.users) && x.users > 0)
      .slice(0, TOP);

  return {
    row: { at, source: "ga4", entity: propertyId, metric_key: "active_users_30m", value: Number.isFinite(total) ? total : 0 },
    detail: {
      source: "ga4",
      entity: propertyId,
      at,
      payload: {
        minutes,
        screens: list(reports.screens),
        countries: list(reports.countries),
        platforms: list(reports.platforms),
      },
    },
  };
}

// ---------------------------------------------------------------- AdMob 오늘

/** AdMob 지표 → live_metrics.metric_key. 오늘치라 확정값이 아니다. */
export const ADMOB_TODAY_METRICS = {
  ESTIMATED_EARNINGS: "estimated_earnings",
  IMPRESSIONS: "impressions",
  CLICKS: "clicks",
  AD_REQUESTS: "ad_requests",
} as const;

/** 오늘(KST) 하루. 계정 보고 시간대가 Asia/Seoul 이다(admob.ts 참고). */
export function buildAdmobTodayRequest(now: Date) {
  const today = kstDay(now, 0);
  return {
    reportSpec: {
      dateRange: { startDate: today, endDate: today },
      dimensions: ["APP"],
      metrics: Object.keys(ADMOB_TODAY_METRICS),
      localizationSettings: { currencyCode: "USD" },
    },
  };
}

export function normalizeAdmobToday(chunks: readonly Chunk[], at: string): LiveRow[] {
  assertUsd(chunks);
  const rows: LiveRow[] = [];
  for (const { row } of chunks) {
    const appId = row?.dimensionValues.APP?.value;
    if (!row || !appId) continue;
    for (const [name, metricKey] of Object.entries(ADMOB_TODAY_METRICS)) {
      const value = readMetric(row.metricValues[name]);
      if (value === null) continue;
      rows.push({ at, source: "admob", entity: appId, metric_key: metricKey, value });
    }
  }
  return rows;
}

// ---------------------------------------------------------------- GA4 속성 찾기

type DataStream = {
  type?: string;
  androidAppStreamData?: { packageName?: string };
  iosAppStreamData?: { bundleId?: string };
};

export type AppIds = { slug: string; ios_bundle_id: string | null; android_package: string | null };

/**
 * 속성마다의 데이터 스트림 → 앱 slug 별 속성 id. 패키지명이나 번들 id 가 같은 앱 스트림이
 * 있는 속성을 그 앱의 속성으로 본다. 못 찾은 앱은 결과에 없다(기존 값을 지우지 않는다).
 */
export function matchProperties(
  apps: readonly AppIds[],
  streamsByProperty: Readonly<Record<string, readonly DataStream[]>>,
): Record<string, string> {
  const found: Record<string, string> = {};
  for (const [propertyId, streams] of Object.entries(streamsByProperty)) {
    const ids = new Set<string>();
    for (const s of streams) {
      if (s.androidAppStreamData?.packageName) ids.add(s.androidAppStreamData.packageName);
      if (s.iosAppStreamData?.bundleId) ids.add(s.iosAppStreamData.bundleId);
    }
    for (const app of apps) {
      if (found[app.slug]) continue;
      if ((app.android_package && ids.has(app.android_package)) || (app.ios_bundle_id && ids.has(app.ios_bundle_id))) {
        found[app.slug] = propertyId;
      }
    }
  }
  return found;
}

/** accountSummaries 응답 → 속성 id 목록("properties/123" → "123"). */
export function propertyIds(summaries: {
  accountSummaries?: { propertySummaries?: { property: string }[] }[];
}): string[] {
  return (summaries.accountSummaries ?? [])
    .flatMap((a) => a.propertySummaries ?? [])
    .map((p) => p.property.replace(/^properties\//, ""));
}
