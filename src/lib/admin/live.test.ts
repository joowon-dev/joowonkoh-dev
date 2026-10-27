import { describe, expect, it } from "vitest";
import {
  type AppEntry,
  buildAppCards,
  findLiveProblems,
  kstMidnightIso,
  type LiveDetailRow,
  type LiveRow,
  liveTotals,
  mergeMinutes,
  mergeRanked,
  minuteSeries,
  storeLinks,
} from "./live";

const app = (over: Partial<AppEntry>): AppEntry => ({
  slug: "x",
  name: "X",
  kind: "app",
  sort: 0,
  ios_bundle_id: null,
  android_package: null,
  app_store_id: null,
  play_listed: false,
  admob_app_ids: [],
  admob_platforms: {},
  ga4_property_id: null,
  ...over,
});

const T1 = "2026-10-26T05:40:00.000Z";
const T2 = "2026-10-26T05:41:00.000Z";

const rows: LiveRow[] = [
  { source: "ga4", at: T1, entity: "web", metric_key: "active_users_30m", value: 3 },
  { source: "ga4", at: T1, entity: "p1", metric_key: "active_users_30m", value: 10 },
  { source: "ga4", at: T2, entity: "web", metric_key: "active_users_30m", value: 4 },
  { source: "ga4", at: T2, entity: "p1", metric_key: "active_users_30m", value: 12 },
  { source: "admob", at: T1, entity: "a~1", metric_key: "estimated_earnings", value: 0.5 },
  { source: "admob", at: T1, entity: "a~2", metric_key: "estimated_earnings", value: 0.25 },
  { source: "admob", at: T1, entity: "a~1", metric_key: "impressions", value: 100 },
  { source: "admob", at: T1, entity: "old~9", metric_key: "estimated_earnings", value: 1 },
];

describe("liveTotals", () => {
  it("마지막 수집 시각의 합만 — 앞선 분은 섞지 않는다", () => {
    const t = liveTotals(rows);
    expect(t.users).toEqual({ at: T2, value: 16 });
    expect(t.earnings).toEqual({ at: T1, value: 1.75 });
  });

  it("홀수 분에 건너뛴 앱 속성은 1분 전 값을 쓰고, 2분보다 오래된 건 뺀다", () => {
    const T3 = "2026-10-26T05:42:00.000Z";
    const T5 = "2026-10-26T05:45:00.000Z";
    const users = (at: string, entity: string, value: number): LiveRow => ({
      source: "ga4",
      at,
      entity,
      metric_key: "active_users_30m",
      value,
    });
    expect(liveTotals([users(T1, "web", 3), users(T1, "p1", 10), users(T2, "web", 4)]).users).toEqual({ at: T2, value: 14 });
    expect(liveTotals([users(T1, "p1", 10), users(T3, "p1", 11), users(T5, "web", 5)]).users).toEqual({ at: T5, value: 5 });
  });

  it("행이 없으면 null", () => {
    expect(liveTotals([]).users).toEqual({ at: null, value: null });
  });
});

describe("buildAppCards", () => {
  it("앱의 AdMob id 들(iOS·Android)을 더하고, GA4 는 속성으로 찾는다", () => {
    const cards = buildAppCards(
      [
        app({ slug: "b", sort: 2, admob_app_ids: ["a~1", "a~2"], ga4_property_id: "p1" }),
        app({ slug: "a", sort: 1, admob_app_ids: ["none~0"] }),
      ],
      rows,
    );
    expect(cards.map((c) => c.app.slug)).toEqual(["a", "b"]);
    expect(cards[1]).toMatchObject({ liveUsers: 12, earnings: 0.75, impressions: 100 });
    // 광고가 아직 안 나간 앱은 0, GA4 미연결은 null
    expect(cards[0]).toMatchObject({ liveUsers: null, earnings: 0, impressions: 0 });
  });

  it("웹처럼 AdMob 이 없으면 수익도 null", () => {
    const [card] = buildAppCards([app({ kind: "web", ga4_property_id: "web" })], rows);
    expect(card).toMatchObject({ liveUsers: 4, earnings: null });
  });
});

describe("buildAppCards — iOS · Android 나눠 보기", () => {
  const moneytick = app({
    slug: "m",
    admob_app_ids: ["a~1", "a~2"],
    admob_platforms: { "a~1": "ios", "a~2": "android" },
    ga4_property_id: "p1",
  });
  const detail = (platforms?: { label: string; users: number }[]): LiveDetailRow => ({
    entity: "p1",
    at: T2,
    payload: { minutes: [], screens: [], countries: [], ...(platforms ? { platforms } : {}) },
  });

  it("AdMob 은 앱 id 의 플랫폼으로, GA4 는 platform 차원으로 나눈다", () => {
    const [card] = buildAppCards([moneytick], rows, [detail([{ label: "iOS", users: 9 }, { label: "Android", users: 3 }])]);
    expect(card.platforms).toEqual([
      { platform: "ios", users: 9, earnings: 0.5, impressions: 100 },
      { platform: "android", users: 3, earnings: 0.25, impressions: 0 },
    ]);
  });

  it("GA4 가 그 플랫폼에 아무도 없다고 하면 0명, 플랫폼 기록이 없는 옛 수집이면 null", () => {
    const [now] = buildAppCards([moneytick], rows, [detail([{ label: "iOS", users: 9 }])]);
    expect(now.platforms.map((p) => p.users)).toEqual([9, 0]);
    const [old] = buildAppCards([moneytick], rows, [detail()]);
    expect(old.platforms.map((p) => p.users)).toEqual([null, null]);
  });

  it("앱의 웹 버전에 사람이 있으면 웹 줄을 붙인다 — AdMob 은 없다", () => {
    const [card] = buildAppCards([moneytick], rows, [detail([{ label: "web", users: 4 }, { label: "iOS", users: 1 }])]);
    expect(card.platforms.map((p) => [p.platform, p.users, p.earnings])).toEqual([
      ["ios", 1, 0.5],
      ["android", 0, 0.25],
      ["web", 4, null],
    ]);
  });

  it("웹사이트는 나누지 않는다", () => {
    const [card] = buildAppCards([app({ kind: "web", ga4_property_id: "p1" })], rows, [detail([{ label: "web", users: 4 }])]);
    expect(card.platforms).toEqual([]);
  });
});

describe("minuteSeries", () => {
  it("분마다 속성 합", () => {
    expect(minuteSeries(rows)).toEqual([
      { at: T1, value: 13 },
      { at: T2, value: 16 },
    ]);
  });

  it("앱 속성이 건너뛴 분은 바로 전 값으로 메운다", () => {
    const at = (m: number) => `2026-10-26T05:${String(m).padStart(2, "0")}:00.000Z`;
    const r = (m: number, entity: string, value: number): LiveRow => ({
      source: "ga4",
      at: at(m),
      entity,
      metric_key: "active_users_30m",
      value,
    });
    expect(minuteSeries([r(40, "web", 3), r(40, "app", 10), r(41, "web", 4), r(44, "web", 5)])).toEqual([
      { at: at(40), value: 13 },
      { at: at(41), value: 14 },
      { at: at(44), value: 5 },
    ]);
  });
});

describe("mergeRanked / mergeMinutes", () => {
  const details = [
    { entity: "p1", at: T2, payload: { minutes: [1, 2], screens: [{ label: "Home", users: 3 }], countries: [] } },
    {
      entity: "p2",
      at: T2,
      payload: { minutes: [4], screens: [{ label: "Home", users: 1 }, { label: "Feed", users: 2 }], countries: [] },
    },
  ];

  it("같은 이름은 더해서 다시 줄 세운다", () => {
    expect(mergeRanked(details, "screens")).toEqual([
      { label: "Home", users: 4 },
      { label: "Feed", users: 2 },
    ]);
  });

  it("분별 곡선은 칸마다 더한다", () => {
    const m = mergeMinutes(details);
    expect(m.slice(0, 3)).toEqual([5, 2, 0]);
    expect(m).toHaveLength(30);
  });
});

describe("findLiveProblems", () => {
  const now = new Date("2026-10-26T06:00:00Z");

  it("GA4 5분, AdMob 30분, 스토어 150분 넘게 성공이 없으면 문제", () => {
    const problems = findLiveProblems(
      [
        { source: "ga4_live", last_run_at: null, last_success: "2026-10-26T05:54:00Z", status: "ok", error: null },
        { source: "admob_today", last_run_at: null, last_success: "2026-10-26T05:40:00Z", status: "ok", error: null },
        { source: "store", last_run_at: null, last_success: "2026-10-26T05:07:00Z", status: "ok", error: null },
      ],
      now,
    );
    expect(problems.map((p) => p.source)).toEqual(["ga4_live"]);
  });

  it("한 번도 안 돈 소스, 일부 실패도 알린다", () => {
    const problems = findLiveProblems(
      [{ source: "ga4_live", last_run_at: null, last_success: "2026-10-26T05:59:00Z", status: "error", error: "jigumia: 403" }],
      now,
    );
    expect(problems).toEqual([
      { source: "ga4_live", minutesSince: 1, error: "jigumia: 403" },
      { source: "admob_today", minutesSince: null, error: null },
      { source: "store", minutesSince: null, error: null },
    ]);
  });
});

describe("kstMidnightIso", () => {
  it("KST 자정 = 전날 15:00Z", () => {
    expect(kstMidnightIso(new Date("2026-10-26T05:00:00Z"))).toBe("2026-10-25T15:00:00.000Z");
    expect(kstMidnightIso(new Date("2026-10-25T16:00:00Z"))).toBe("2026-10-25T15:00:00.000Z");
  });
});

describe("storeLinks", () => {
  it("Play 에 없는 앱은 Play 링크가 없다", () => {
    const links = storeLinks(app({ app_store_id: 6820956430, android_package: "dev.joowon.wapanyang", play_listed: false }));
    expect(links).toEqual({ appStore: "https://apps.apple.com/kr/app/id6820956430", play: null });
  });
});
