import { describe, expect, it } from "vitest";
import {
  buildAdmobTodayRequest,
  matchProperties,
  minuteFloor,
  normalizeAdmobToday,
  normalizeRealtime,
  propertyIds,
} from "./live";

const AT = "2026-10-26T05:41:00.000Z";

describe("minuteFloor", () => {
  it("초 아래를 잘라 같은 분에 다시 돌면 같은 키가 된다", () => {
    expect(minuteFloor(new Date("2026-10-26T05:41:37.912Z"))).toBe(AT);
  });
});

describe("normalizeRealtime", () => {
  const reports = {
    total: { rows: [{ metricValues: [{ value: "7" }] }] },
    minutes: {
      rows: [
        { dimensionValues: [{ value: "00" }], metricValues: [{ value: "3" }] },
        { dimensionValues: [{ value: "05" }], metricValues: [{ value: "2" }] },
        { dimensionValues: [{ value: "29" }], metricValues: [{ value: "1" }] },
      ],
    },
    screens: {
      rows: [
        { dimensionValues: [{ value: "Home" }], metricValues: [{ value: "5" }] },
        { dimensionValues: [{ value: "Settings" }], metricValues: [{ value: "2" }] },
      ],
    },
    countries: { rows: [{ dimensionValues: [{ value: "South Korea" }], metricValues: [{ value: "7" }] }] },
  };

  it("합계는 차원 없는 보고서에서 읽는다", () => {
    const { row } = normalizeRealtime(reports, "111", AT);
    expect(row).toEqual({ at: AT, source: "ga4", entity: "111", metric_key: "active_users_30m", value: 7 });
  });

  it("분별 곡선은 30칸, 비는 분은 0", () => {
    const { detail } = normalizeRealtime(reports, "111", AT);
    expect(detail.payload.minutes).toHaveLength(30);
    expect(detail.payload.minutes[0]).toBe(3);
    expect(detail.payload.minutes[5]).toBe(2);
    expect(detail.payload.minutes[29]).toBe(1);
    expect(detail.payload.minutes[1]).toBe(0);
  });

  it("화면·국가는 이름과 사용자 수로", () => {
    const { detail } = normalizeRealtime(reports, "111", AT);
    expect(detail.payload.screens).toEqual([
      { label: "Home", users: 5 },
      { label: "Settings", users: 2 },
    ]);
    expect(detail.payload.countries).toEqual([{ label: "South Korea", users: 7 }]);
  });

  it("아무도 없으면 GA4 는 rows 를 뺀다 — 0명으로 적는다", () => {
    const empty = { total: {}, minutes: {}, screens: {}, countries: {} };
    const { row, detail } = normalizeRealtime(empty, "111", AT);
    expect(row.value).toBe(0);
    expect(detail.payload.minutes.every((v) => v === 0)).toBe(true);
    expect(detail.payload.screens).toEqual([]);
  });
});

describe("buildAdmobTodayRequest", () => {
  it("오늘 하루를 KST 로 — UTC 로는 아직 어제인 시각", () => {
    const req = buildAdmobTodayRequest(new Date("2026-10-25T16:30:00Z")); // KST 10/26 01:30
    expect(req.reportSpec.dateRange).toEqual({
      startDate: { year: 2026, month: 10, day: 26 },
      endDate: { year: 2026, month: 10, day: 26 },
    });
    expect(req.reportSpec.dimensions).toEqual(["APP"]);
  });
});

describe("normalizeAdmobToday", () => {
  const chunks = [
    { header: { localizationSettings: { currencyCode: "USD" } } },
    {
      row: {
        dimensionValues: { APP: { value: "ca-app-pub-1~9", displayLabel: "이게내연봉" } },
        metricValues: {
          ESTIMATED_EARNINGS: { microsValue: "412000" },
          IMPRESSIONS: { integerValue: "1300" },
          CLICKS: { integerValue: "4" },
          AD_REQUESTS: { integerValue: "1500" },
        },
      },
    },
    { footer: {} },
  ];

  it("앱 × 지표마다 한 행, 수익은 달러로", () => {
    const rows = normalizeAdmobToday(chunks, AT);
    expect(rows).toHaveLength(4);
    expect(rows.find((r) => r.metric_key === "estimated_earnings")).toEqual({
      at: AT,
      source: "admob",
      entity: "ca-app-pub-1~9",
      metric_key: "estimated_earnings",
      value: 0.412,
    });
  });

  it("달러가 아니면 멈춘다", () => {
    expect(() => normalizeAdmobToday([{ header: { localizationSettings: { currencyCode: "KRW" } } }], AT)).toThrow(
      /USD/,
    );
  });
});

describe("matchProperties", () => {
  const apps = [
    { slug: "moneytick", ios_bundle_id: "dev.joowon.moneytick", android_package: "dev.joowon.moneytick" },
    { slug: "wapanyang", ios_bundle_id: "dev.joowon.wapanyang", android_package: null },
    { slug: "jigumia", ios_bundle_id: "com.jigumia.app", android_package: "com.jigumia.app" },
  ];

  it("패키지명이나 번들 id 가 같은 스트림의 속성을 고른다", () => {
    const found = matchProperties(apps, {
      "434494008": [{ type: "WEB_DATA_STREAM" }],
      "500": [{ type: "ANDROID_APP_DATA_STREAM", androidAppStreamData: { packageName: "dev.joowon.moneytick" } }],
      "600": [{ type: "IOS_APP_DATA_STREAM", iosAppStreamData: { bundleId: "dev.joowon.wapanyang" } }],
    });
    expect(found).toEqual({ moneytick: "500", wapanyang: "600" });
  });

  it("못 찾은 앱은 결과에 없다", () => {
    expect(matchProperties(apps, {})).toEqual({});
  });
});

describe("propertyIds", () => {
  it("계정 여러 개의 속성을 펼친다", () => {
    expect(
      propertyIds({
        accountSummaries: [
          { propertySummaries: [{ property: "properties/434494008" }] },
          { propertySummaries: [{ property: "properties/500" }, { property: "properties/600" }] },
          {},
        ],
      }),
    ).toEqual(["434494008", "500", "600"]);
  });
});
