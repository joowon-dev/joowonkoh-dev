import { describe, expect, it } from "vitest";
import {
  buildBreakdownRequest,
  buildReportRequest,
  normalizeGa4Breakdown,
  normalizeGa4Report,
} from "./ga4";

// 2026-10-01 에 속성 434494008 로 실제 받은 응답을 줄였다.
const SAMPLE = {
  dimensionHeaders: [{ name: "date" }],
  metricHeaders: [
    { name: "activeUsers", type: "TYPE_INTEGER" },
    { name: "sessions", type: "TYPE_INTEGER" },
    { name: "newUsers", type: "TYPE_INTEGER" },
  ],
  rows: [
    {
      dimensionValues: [{ value: "20260928" }],
      metricValues: [{ value: "204" }, { value: "251" }, { value: "189" }],
    },
    {
      dimensionValues: [{ value: "20260929" }],
      metricValues: [{ value: "172" }, { value: "213" }, { value: "157" }],
    },
  ],
  rowCount: 2,
  metadata: { currencyCode: "USD", timeZone: "Etc/GMT-9" },
};

describe("normalizeGa4Report", () => {
  it("날짜 × 지표마다 한 행으로 눕힌다", () => {
    const rows = normalizeGa4Report(SAMPLE, "434494008");

    expect(rows).toHaveLength(6);
    expect(rows[0]).toEqual({
      source: "ga4",
      metric_date: "2026-09-28",
      entity: "434494008",
      metric_key: "active_users",
      value: 204,
    });
    expect(rows.filter((r) => r.metric_key === "new_users").map((r) => r.value)).toEqual([189, 157]);
  });

  it("헤더 순서를 따른다 — 응답 지표 순서가 바뀌어도 값이 섞이지 않는다", () => {
    const swapped = {
      metricHeaders: [{ name: "sessions" }, { name: "activeUsers" }],
      rows: [{ dimensionValues: [{ value: "20260928" }], metricValues: [{ value: "251" }, { value: "204" }] }],
    };
    const rows = normalizeGa4Report(swapped, "p");

    expect(rows.find((r) => r.metric_key === "active_users")?.value).toBe(204);
    expect(rows.find((r) => r.metric_key === "sessions")?.value).toBe(251);
  });

  it("모르는 지표(비율 등)는 버린다", () => {
    const rows = normalizeGa4Report(
      {
        metricHeaders: [{ name: "bounceRate" }],
        rows: [{ dimensionValues: [{ value: "20260928" }], metricValues: [{ value: "9" }] }],
      },
      "p",
    );
    expect(rows).toEqual([]);
  });

  it("행이 없는 응답(트래픽 0)은 빈 배열", () => {
    expect(normalizeGa4Report({ metricHeaders: SAMPLE.metricHeaders }, "p")).toEqual([]);
  });

  it("날짜 형식이 다르면 조용히 넘기지 않고 던진다", () => {
    expect(() =>
      normalizeGa4Report(
        {
          metricHeaders: [{ name: "activeUsers" }],
          rows: [{ dimensionValues: [{ value: "2026-09-28" }], metricValues: [{ value: "1" }] }],
        },
        "p",
      ),
    ).toThrow(/형식/);
  });
});

describe("buildReportRequest", () => {
  it("어제까지 N일, 합계 지표를 요청한다", () => {
    const req = buildReportRequest(30);
    expect(req.dateRanges).toEqual([{ startDate: "30daysAgo", endDate: "yesterday" }]);
    expect(req.metrics.map((m) => m.name)).toEqual([
      "activeUsers",
      "sessions",
      "newUsers",
      "screenPageViews",
      "engagedSessions",
      "userEngagementDuration",
    ]);
  });
});

// 세부 보고서 — 실제 응답 모양(date, pagePath, pageTitle × 5 지표)을 줄였다.
const PAGE_REPORT = {
  dimensionHeaders: [{ name: "date" }, { name: "pagePath" }, { name: "pageTitle" }],
  metricHeaders: [
    { name: "screenPageViews" },
    { name: "activeUsers" },
    { name: "sessions" },
    { name: "engagedSessions" },
    { name: "userEngagementDuration" },
  ],
  rows: [
    {
      dimensionValues: [{ value: "20260929" }, { value: "/playground/kbo-race" }, { value: "KBO 순위 레이스" }],
      metricValues: [{ value: "120" }, { value: "80" }, { value: "90" }, { value: "60" }, { value: "4000" }],
    },
    // 같은 날 같은 경로, 제목만 다른 행 — 제목을 바꾼 날 GA4 가 이렇게 준다.
    {
      dimensionValues: [{ value: "20260929" }, { value: "/playground/kbo-race" }, { value: "KBO 레이스 (옛 제목)" }],
      metricValues: [{ value: "5" }, { value: "3" }, { value: "3" }, { value: "1" }, { value: "100" }],
    },
  ],
};

describe("normalizeGa4Breakdown", () => {
  it("날짜 × 차원값 × 지표로 눕히고, 제목은 dim_label 로", () => {
    const rows = normalizeGa4Breakdown(PAGE_REPORT, "page");
    const views = rows.find((r) => r.metric_key === "screen_page_views");

    expect(views).toEqual({
      source: "ga4",
      metric_date: "2026-09-29",
      dimension: "page",
      dim_value: "/playground/kbo-race",
      dim_label: "KBO 순위 레이스",
      metric_key: "screen_page_views",
      value: 125,
    });
  });

  it("같은 키가 두 번 오면 합친다 — 안 합치면 upsert 가 통째로 실패한다", () => {
    const rows = normalizeGa4Breakdown(PAGE_REPORT, "page");
    expect(rows).toHaveLength(5);
    expect(rows.find((r) => r.metric_key === "user_engagement_duration")?.value).toBe(4100);
  });

  it("차원 순서를 응답 헤더에서 읽는다", () => {
    const swapped = {
      dimensionHeaders: [{ name: "deviceCategory" }, { name: "date" }],
      metricHeaders: [{ name: "sessions" }],
      rows: [{ dimensionValues: [{ value: "mobile" }, { value: "20260929" }], metricValues: [{ value: "7" }] }],
    };
    expect(normalizeGa4Breakdown(swapped, "device")).toEqual([
      {
        source: "ga4",
        metric_date: "2026-09-29",
        dimension: "device",
        dim_value: "mobile",
        dim_label: null,
        metric_key: "sessions",
        value: 7,
      },
    ]);
  });

  it("요청한 차원이 응답에 없으면 던진다", () => {
    expect(() => normalizeGa4Breakdown({ dimensionHeaders: [{ name: "date" }] }, "country")).toThrow(/countryId/);
  });
});

describe("buildBreakdownRequest", () => {
  it("라벨이 있는 차원은 라벨 차원도 함께 요청한다", () => {
    expect(buildBreakdownRequest("page", 3).dimensions.map((d) => d.name)).toEqual(["date", "pagePath", "pageTitle"]);
    expect(buildBreakdownRequest("channel", 3).dimensions.map((d) => d.name)).toEqual([
      "date",
      "sessionDefaultChannelGroup",
    ]);
  });
});
