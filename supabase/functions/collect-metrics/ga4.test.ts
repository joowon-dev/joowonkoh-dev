import { describe, expect, it } from "vitest";
import { buildReportRequest, normalizeGa4Report } from "./ga4";

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

  it("모르는 지표는 버린다", () => {
    const rows = normalizeGa4Report(
      {
        metricHeaders: [{ name: "screenPageViews" }],
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
  it("어제까지 N일, 세 지표를 요청한다", () => {
    const req = buildReportRequest(30);
    expect(req.dateRanges).toEqual([{ startDate: "30daysAgo", endDate: "yesterday" }]);
    expect(req.metrics.map((m) => m.name)).toEqual(["activeUsers", "sessions", "newUsers"]);
  });
});
