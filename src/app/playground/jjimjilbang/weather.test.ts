import { describe, it, expect } from "vitest";
import { parseForecast, hourOf } from "./weather";

const ok = {
  current: {
    time: "2026-08-06T14:00",
    apparent_temperature: 34.2,
    relative_humidity_2m: 78,
  },
  hourly: {
    time: ["2026-08-06T00:00", "2026-08-06T01:00"],
    apparent_temperature: [27.1, 26.4],
    relative_humidity_2m: [82, 84],
  },
};

describe("parseForecast", () => {
  it("현재 값과 시간대를 읽는다", () => {
    const weather = parseForecast(ok);
    expect(weather.now).toEqual({
      time: "2026-08-06T14:00",
      apparent: 34.2,
      humidity: 78,
    });
    expect(weather.hourly).toHaveLength(2);
    expect(weather.hourly[1]).toEqual({
      time: "2026-08-06T01:00",
      apparent: 26.4,
      humidity: 84,
    });
  });

  it("현재 값이 없으면 오류를 낸다", () => {
    expect(() => parseForecast({ ...ok, current: {} })).toThrow();
    expect(() => parseForecast(null)).toThrow();
  });

  it("시간대 값이 없으면 오류를 낸다", () => {
    expect(() =>
      parseForecast({ ...ok, hourly: { time: ok.hourly.time } }),
    ).toThrow();
  });

  it("시간대 개수가 어긋나면 오류를 낸다", () => {
    expect(() =>
      parseForecast({
        ...ok,
        hourly: { ...ok.hourly, apparent_temperature: [27.1] },
      }),
    ).toThrow();
  });
});

describe("hourOf", () => {
  it("현지 시각에서 시를 뽑는다", () => {
    expect(hourOf("2026-08-06T00:00")).toBe(0);
    expect(hourOf("2026-08-06T14:00")).toBe(14);
  });
});
