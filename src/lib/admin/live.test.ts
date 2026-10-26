import { describe, expect, it } from "vitest";
import {
  type AppEntry,
  buildAppCards,
  findLiveProblems,
  kstMidnightIso,
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

describe("minuteSeries", () => {
  it("분마다 속성 합", () => {
    expect(minuteSeries(rows)).toEqual([
      { at: T1, value: 13 },
      { at: T2, value: 16 },
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

  it("GA4 는 5분, AdMob 은 30분 넘게 성공이 없으면 문제", () => {
    const problems = findLiveProblems(
      [
        { source: "ga4_live", last_run_at: null, last_success: "2026-10-26T05:54:00Z", status: "ok", error: null },
        { source: "admob_today", last_run_at: null, last_success: "2026-10-26T05:40:00Z", status: "ok", error: null },
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
