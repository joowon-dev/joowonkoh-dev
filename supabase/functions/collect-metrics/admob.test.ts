import { describe, expect, it } from "vitest";
import {
  buildAdmobBreakdownRequest,
  buildNetworkReportRequest,
  normalizeAdmobBreakdown,
  normalizeAdmobReport,
} from "./admob";

// 2026-10-01 에 pub-7807290470382730 으로 실제 받은 응답을 줄였다.
const SAMPLE = [
  {
    header: {
      dateRange: {
        startDate: { year: 2026, month: 9, day: 27 },
        endDate: { year: 2026, month: 9, day: 27 },
      },
      localizationSettings: { currencyCode: "USD" },
    },
  },
  {
    row: {
      dimensionValues: {
        DATE: { value: "20260927" },
        APP: { value: "ca-app-pub-7807290470382730~9813704971", displayLabel: "이게내연봉" },
      },
      metricValues: {
        ESTIMATED_EARNINGS: { microsValue: "818804" },
        IMPRESSIONS: { integerValue: "2651" },
      },
    },
  },
  {
    row: {
      dimensionValues: {
        DATE: { value: "20260927" },
        APP: { value: "ca-app-pub-7807290470382730~3274994627", displayLabel: "지구미아" },
      },
      metricValues: {
        ESTIMATED_EARNINGS: { microsValue: "50319" },
        IMPRESSIONS: { integerValue: "118" },
      },
    },
  },
  { footer: { matchingRowCount: "2" } },
];

describe("normalizeAdmobReport", () => {
  it("앱 × 지표마다 한 행, 수익은 마이크로를 달러로", () => {
    const rows = normalizeAdmobReport(SAMPLE);

    expect(rows).toHaveLength(4);
    expect(rows[0]).toEqual({
      source: "admob",
      metric_date: "2026-09-27",
      entity: "ca-app-pub-7807290470382730~9813704971",
      metric_key: "estimated_earnings",
      value: 0.818804,
    });
    expect(rows.find((r) => r.metric_key === "impressions" && r.entity.endsWith("3274994627"))?.value).toBe(118);
  });

  it("header·footer 만 있는 응답(광고 0)은 빈 배열", () => {
    expect(normalizeAdmobReport([SAMPLE[0], SAMPLE[3]])).toEqual([]);
  });

  it("USD 가 아닌 보고서는 섞지 않고 던진다", () => {
    const krw = [{ header: { localizationSettings: { currencyCode: "KRW" } } }, SAMPLE[1]];
    expect(() => normalizeAdmobReport(krw)).toThrow(/USD/);
  });

  it("모르는 지표(IMPRESSION_RPM 등)는 버린다", () => {
    const withRpm = [
      {
        row: {
          dimensionValues: { DATE: { value: "20260927" }, APP: { value: "app" } },
          metricValues: { IMPRESSION_RPM: { doubleValue: 0.3 } },
        },
      },
    ];
    expect(normalizeAdmobReport(withRpm)).toEqual([]);
  });
});

describe("buildNetworkReportRequest", () => {
  it("KST 기준 어제까지 N일 — UTC 로는 전날인 새벽에도", () => {
    const now = new Date("2026-09-30T17:40:00Z"); // 2026-10-01 02:40 KST
    const { reportSpec } = buildNetworkReportRequest(now, 3);

    expect(reportSpec.dateRange).toEqual({
      startDate: { year: 2026, month: 9, day: 28 },
      endDate: { year: 2026, month: 9, day: 30 },
    });
    expect(reportSpec.metrics).toEqual(["ESTIMATED_EARNINGS", "IMPRESSIONS"]);
    expect(reportSpec.localizationSettings).toEqual({ currencyCode: "USD" });
  });
});

describe("normalizeAdmobReport — 광고가 없던 날", () => {
  it("요청 범위 안에서 행이 없는 날은 0 으로 채운다 — 차트가 '수집 누락'처럼 끊기지 않게", () => {
    const spec = {
      startDate: { year: 2026, month: 9, day: 26 },
      endDate: { year: 2026, month: 9, day: 27 },
    };
    const rows = normalizeAdmobReport(SAMPLE, spec);

    const sept26 = rows.filter((r) => r.metric_date === "2026-09-26");
    expect(sept26).toEqual([
      { source: "admob", metric_date: "2026-09-26", entity: "none", metric_key: "estimated_earnings", value: 0 },
      { source: "admob", metric_date: "2026-09-26", entity: "none", metric_key: "impressions", value: 0 },
    ]);
    // 행이 있는 날은 건드리지 않는다.
    expect(rows.filter((r) => r.metric_date === "2026-09-27" && r.entity === "none")).toEqual([]);
  });
});

describe("normalizeAdmobBreakdown", () => {
  const AD_UNIT_REPORT = [
    { header: { localizationSettings: { currencyCode: "USD" } } },
    {
      row: {
        dimensionValues: {
          DATE: { value: "20260929" },
          AD_UNIT: { value: "ca-app-pub-7807290470382730/1111111111", displayLabel: "연봉 결과 배너" },
        },
        metricValues: {
          ESTIMATED_EARNINGS: { microsValue: "1200000" },
          IMPRESSIONS: { integerValue: "4000" },
          CLICKS: { integerValue: "12" },
          AD_REQUESTS: { integerValue: "5000" },
          MATCHED_REQUESTS: { integerValue: "4500" },
        },
      },
    },
    { footer: {} },
  ];

  it("광고단위 × 지표로 눕히고, 이름은 displayLabel 에서", () => {
    const rows = normalizeAdmobBreakdown(AD_UNIT_REPORT, "ad_unit");

    expect(rows).toHaveLength(5);
    expect(rows[0]).toEqual({
      source: "admob",
      metric_date: "2026-09-29",
      dimension: "ad_unit",
      dim_value: "ca-app-pub-7807290470382730/1111111111",
      dim_label: "연봉 결과 배너",
      metric_key: "estimated_earnings",
      value: 1.2,
    });
    expect(rows.find((r) => r.metric_key === "matched_requests")?.value).toBe(4500);
  });

  it("USD 가 아니면 세부도 던진다", () => {
    expect(() =>
      normalizeAdmobBreakdown([{ header: { localizationSettings: { currencyCode: "KRW" } } }], "app"),
    ).toThrow(/USD/);
  });
});

describe("buildAdmobBreakdownRequest", () => {
  it("DATE 와 해당 차원, 세부 지표 다섯", () => {
    const { reportSpec } = buildAdmobBreakdownRequest(new Date("2026-09-30T17:40:00Z"), 3, "format");
    expect(reportSpec.dimensions).toEqual(["DATE", "FORMAT"]);
    expect(reportSpec.metrics).toEqual([
      "ESTIMATED_EARNINGS",
      "IMPRESSIONS",
      "CLICKS",
      "AD_REQUESTS",
      "MATCHED_REQUESTS",
    ]);
    expect(reportSpec.dateRange.endDate).toEqual({ year: 2026, month: 9, day: 30 });
  });
});
