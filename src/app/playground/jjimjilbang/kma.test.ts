import { describe, it, expect } from "vitest";
import {
  latestFcstBase,
  latestNcstBase,
  parseUltraSrtNcst,
  parseVilageFcst,
} from "./kma";

/** KST 시각을 UTC Date로. 서버가 UTC로 돌아도 같은 답이 나와야 한다 */
function kst(iso: string): Date {
  return new Date(`${iso}+09:00`);
}

describe("latestNcstBase", () => {
  it("40분이 지나면 그 시각 관측을 쓴다", () => {
    expect(latestNcstBase(kst("2026-08-06T14:40"))).toEqual({
      baseDate: "20260806",
      baseTime: "1400",
    });
  });

  it("40분 전에는 한 시간 전 관측을 쓴다", () => {
    expect(latestNcstBase(kst("2026-08-06T14:39"))).toEqual({
      baseDate: "20260806",
      baseTime: "1300",
    });
  });

  it("자정 직후에는 어제 23시 관측으로 넘어간다", () => {
    expect(latestNcstBase(kst("2026-08-06T00:10"))).toEqual({
      baseDate: "20260805",
      baseTime: "2300",
    });
  });
});

describe("latestFcstBase", () => {
  it("발표 10분 뒤부터 그 발표를 쓴다", () => {
    expect(latestFcstBase(kst("2026-08-06T14:10")).baseTime).toBe("1400");
    expect(latestFcstBase(kst("2026-08-06T14:09")).baseTime).toBe("1100");
  });

  it("발표 시각 사이에는 직전 발표에 머문다", () => {
    expect(latestFcstBase(kst("2026-08-06T16:59"))).toEqual({
      baseDate: "20260806",
      baseTime: "1400",
    });
  });

  it("자정~02시 10분에는 어제 23시 발표가 최신이다", () => {
    expect(latestFcstBase(kst("2026-08-06T01:00"))).toEqual({
      baseDate: "20260805",
      baseTime: "2300",
    });
    expect(latestFcstBase(kst("2026-08-06T02:10"))).toEqual({
      baseDate: "20260806",
      baseTime: "0200",
    });
  });
});

function wrap(item: unknown[], resultCode = "00") {
  return {
    response: {
      header: { resultCode, resultMsg: resultCode === "00" ? "NORMAL_SERVICE" : "ERROR" },
      body: { items: { item } },
    },
  };
}

describe("parseVilageFcst", () => {
  const sample = wrap([
    { category: "TMP", fcstDate: "20260806", fcstTime: "1500", fcstValue: "31" },
    { category: "REH", fcstDate: "20260806", fcstTime: "1500", fcstValue: "78" },
    { category: "WSD", fcstDate: "20260806", fcstTime: "1500", fcstValue: "2.1" },
    { category: "SKY", fcstDate: "20260806", fcstTime: "1500", fcstValue: "3" },
    { category: "TMP", fcstDate: "20260806", fcstTime: "1400", fcstValue: "30" },
    { category: "REH", fcstDate: "20260806", fcstTime: "1400", fcstValue: "70" },
    { category: "WSD", fcstDate: "20260806", fcstTime: "1400", fcstValue: "1.8" },
  ]);

  it("시각으로 묶고 시간순으로 준다", () => {
    const readings = parseVilageFcst(sample);
    expect(readings.map((r) => r.time)).toEqual([
      "2026-08-06T14:00",
      "2026-08-06T15:00",
    ]);
  });

  it("습도를 그대로 싣고 체감온도를 계산해 둔다", () => {
    const [, three] = parseVilageFcst(sample);
    expect(three.humidity).toBe(78);
    // 31도 78%는 기온보다 덥게 느껴진다
    expect(three.apparent).toBeGreaterThan(31);
  });

  it("세 값이 다 있지 않은 시각은 버린다", () => {
    const partial = wrap([
      { category: "TMP", fcstDate: "20260806", fcstTime: "1600", fcstValue: "31" },
      { category: "REH", fcstDate: "20260806", fcstTime: "1600", fcstValue: "78" },
    ]);
    expect(parseVilageFcst(partial)).toEqual([]);
  });

  it("기상청이 200에 실어 보내는 오류를 잡아낸다", () => {
    expect(() => parseVilageFcst(wrap([], "03"))).toThrow(/기상청 오류 03/);
    expect(() => parseVilageFcst({})).toThrow();
  });
});

describe("parseUltraSrtNcst", () => {
  const base = { baseDate: "20260806", baseTime: "1400" };

  it("실황 세 값으로 지금 값을 만든다", () => {
    const reading = parseUltraSrtNcst(
      wrap([
        { category: "T1H", obsrValue: "31" },
        { category: "REH", obsrValue: "78" },
        { category: "WSD", obsrValue: "2.1" },
        { category: "PTY", obsrValue: "0" },
      ]),
      base,
    );
    expect(reading.time).toBe("2026-08-06T14:00");
    expect(reading.humidity).toBe(78);
    expect(reading.apparent).toBeGreaterThan(31);
  });

  it("셋 중 하나라도 빠지면 던진다 — 예보로 물러나야 한다", () => {
    expect(() =>
      parseUltraSrtNcst(wrap([{ category: "T1H", obsrValue: "31" }]), base),
    ).toThrow();
  });
});
