import { describe, it, expect } from "vitest";
import { parseForecast, hourOf, fromNow, type Weather } from "./weather";

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

/** 2026-08-06 00시부터 hours칸을 만든다 */
function fakeWeather(nowTime: string, hours: number): Weather {
  return {
    now: { time: nowTime, apparent: 30, humidity: 50 },
    hourly: Array.from({ length: hours }, (_, i) => ({
      time: `2026-08-0${6 + Math.floor(i / 24)}T${String(i % 24).padStart(2, "0")}:00`,
      apparent: i,
      humidity: 50,
    })),
  };
}

describe("fromNow", () => {
  it("지금 시각이 첫 칸이 된다", () => {
    const slice = fromNow(fakeWeather("2026-08-06T14:20", 48));
    expect(slice[0].time).toBe("2026-08-06T14:00");
    expect(slice).toHaveLength(24);
  });

  it("자정을 넘어 다음 날까지 이어진다", () => {
    const slice = fromNow(fakeWeather("2026-08-06T22:00", 48));
    expect(slice[0].time).toBe("2026-08-06T22:00");
    expect(slice[2].time).toBe("2026-08-07T00:00");
    expect(slice).toHaveLength(24);
  });

  it("남은 칸이 모자라면 있는 만큼만 준다", () => {
    expect(fromNow(fakeWeather("2026-08-06T22:00", 24))).toHaveLength(2);
  });

  it("지금 이후 칸이 아예 없으면 마지막 칸들을 준다", () => {
    const slice = fromNow(fakeWeather("2026-08-09T10:00", 24), 3);
    expect(slice).toHaveLength(3);
    expect(slice.at(-1)?.time).toBe("2026-08-06T23:00");
  });
});

describe("hourOf", () => {
  it("현지 시각에서 시를 뽑는다", () => {
    expect(hourOf("2026-08-06T00:00")).toBe(0);
    expect(hourOf("2026-08-06T14:00")).toBe(14);
  });
});
