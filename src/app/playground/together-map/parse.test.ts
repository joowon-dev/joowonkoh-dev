import { describe, expect, it } from "vitest";
import { TimelineParseError, detectFormat, parseLatLngString, parseTimeline } from "./parse";

describe("parseLatLngString", () => {
  it("안드로이드 표기 — 도 기호가 붙는다", () => {
    expect(parseLatLngString("37.5665°, 126.9780°")).toEqual({ lat: 37.5665, lon: 126.978 });
  });

  it("아이폰 표기 — geo: URI", () => {
    expect(parseLatLngString("geo:37.5665,126.9780")).toEqual({ lat: 37.5665, lon: 126.978 });
  });

  it("음수 좌표", () => {
    expect(parseLatLngString("-33.8688°, 151.2093°")).toEqual({ lat: -33.8688, lon: 151.2093 });
  });

  it("공백이 없어도 읽는다", () => {
    expect(parseLatLngString("37.5665°,126.9780°")).toEqual({ lat: 37.5665, lon: 126.978 });
  });

  it("RFC 5870 불확실성 지시자를 무시한다", () => {
    expect(parseLatLngString("geo:37.5665,126.9780;u=35")).toEqual({ lat: 37.5665, lon: 126.978 });
  });

  it("읽을 수 없으면 null", () => {
    expect(parseLatLngString("")).toBeNull();
    expect(parseLatLngString("서울")).toBeNull();
    expect(parseLatLngString("37.5665")).toBeNull();
  });

  it("범위를 벗어난 좌표는 null — 잘못 읽은 것이다", () => {
    expect(parseLatLngString("999.0°, 126.0°")).toBeNull();
    expect(parseLatLngString("37.0°, 999.0°")).toBeNull();
  });
});

describe("detectFormat", () => {
  it("안드로이드 — semanticSegments 키", () => {
    expect(detectFormat({ semanticSegments: [] })).toBe("android");
  });

  it("아이폰 — 배열 그 자체", () => {
    expect(detectFormat([{ startTime: "2026-01-01T00:00:00Z" }])).toBe("ios");
  });

  it("옛 Takeout — locations 키", () => {
    expect(detectFormat({ locations: [] })).toBe("records");
  });

  it("모르는 모양은 null", () => {
    expect(detectFormat({ hello: 1 })).toBeNull();
    expect(detectFormat(null)).toBeNull();
    expect(detectFormat("문자열")).toBeNull();
  });
});

describe("parseTimeline — 안드로이드", () => {
  const android = {
    semanticSegments: [
      {
        startTime: "2026-01-01T09:00:00.000+09:00",
        endTime: "2026-01-01T10:00:00.000+09:00",
        visit: {
          topCandidate: {
            placeId: "abc",
            placeLocation: { latLng: "37.5665°, 126.9780°" },
          },
        },
      },
      {
        startTime: "2026-01-01T10:00:00.000+09:00",
        endTime: "2026-01-01T10:30:00.000+09:00",
        timelinePath: [
          { point: "37.5700°, 126.9800°", time: "2026-01-01T10:10:00.000+09:00" },
          { point: "37.5750°, 126.9850°", time: "2026-01-01T10:20:00.000+09:00" },
        ],
      },
    ],
  };

  it("방문과 경로를 모두 읽는다", () => {
    const points = parseTimeline(android);
    expect(points).toHaveLength(3);
  });

  it("방문 점은 kind가 visit", () => {
    expect(parseTimeline(android)[0].kind).toBe("visit");
  });

  it("경로 점은 kind가 path", () => {
    const points = parseTimeline(android);
    expect(points[1].kind).toBe("path");
    expect(points[2].kind).toBe("path");
  });

  it("시간 오름차순으로 정렬된다", () => {
    const points = parseTimeline(android);
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].t).toBeGreaterThanOrEqual(points[i - 1].t);
    }
  });

  it("시각을 epoch ms로 바꾼다", () => {
    const points = parseTimeline(android);
    expect(points[0].t).toBe(Date.parse("2026-01-01T09:00:00.000+09:00"));
  });

  it("activity와 timelinePath가 둘 다 있으면 timelinePath만 쓴다", () => {
    const withBoth = {
      semanticSegments: [
        {
          startTime: "2026-01-01T10:00:00.000+09:00",
          endTime: "2026-01-01T10:30:00.000+09:00",
          activity: {
            start: { latLng: "37.5665°, 126.9780°" },
            end: { latLng: "37.5750°, 126.9850°" },
          },
          timelinePath: [
            { point: "37.5700°, 126.9800°", time: "2026-01-01T10:10:00.000+09:00" },
            { point: "37.5720°, 126.9820°", time: "2026-01-01T10:20:00.000+09:00" },
          ],
        },
      ],
    };
    const points = parseTimeline(withBoth);
    expect(points).toHaveLength(2);
    expect(points.every((p) => p.kind === "path")).toBe(true);
  });
});

describe("parseTimeline — 아이폰", () => {
  const ios = [
    {
      startTime: "2026-01-01T09:00:00.000+09:00",
      endTime: "2026-01-01T10:00:00.000+09:00",
      visit: {
        topCandidate: {
          placeID: "abc",
          placeLocation: "geo:37.5665,126.9780",
        },
      },
    },
    {
      startTime: "2026-01-01T10:00:00.000+09:00",
      endTime: "2026-01-01T10:30:00.000+09:00",
      timelinePath: [
        { point: "geo:37.5700,126.9800", durationMinutesOffsetFromStartTime: "10" },
        { point: "geo:37.5750,126.9850", durationMinutesOffsetFromStartTime: "20" },
      ],
    },
  ];

  it("placeLocation이 문자열인 모양을 읽는다", () => {
    const points = parseTimeline(ios);
    expect(points[0]).toMatchObject({ lat: 37.5665, lon: 126.978, kind: "visit" });
  });

  it("경로 점 시각을 시작시각 + 분 오프셋으로 계산한다", () => {
    const points = parseTimeline(ios);
    const base = Date.parse("2026-01-01T10:00:00.000+09:00");
    expect(points[1].t).toBe(base + 10 * 60_000);
    expect(points[2].t).toBe(base + 20 * 60_000);
  });
});

describe("parseTimeline — 옛 Takeout", () => {
  const records = {
    locations: [
      {
        latitudeE7: 375665000,
        longitudeE7: 1269780000,
        accuracy: 12,
        timestamp: "2026-01-01T09:00:00.000Z",
      },
      {
        latitudeE7: 375700000,
        longitudeE7: 1269800000,
        timestampMs: "1767258000000",
      },
    ],
  };

  it("E7 정수를 도로 되돌린다", () => {
    const points = parseTimeline(records);
    expect(points[0].lat).toBeCloseTo(37.5665, 7);
    expect(points[0].lon).toBeCloseTo(126.978, 7);
  });

  it("정확도를 그대로 가져온다", () => {
    expect(parseTimeline(records)[0].accuracy).toBe(12);
  });

  it("timestamp와 timestampMs를 모두 받는다", () => {
    const points = parseTimeline(records);
    expect(points.every((p) => Number.isFinite(p.t))).toBe(true);
  });
});

describe("parseTimeline — 오류", () => {
  it("모르는 형식이면 무엇으로 보였는지 적어서 던진다", () => {
    expect(() => parseTimeline({ hello: 1 })).toThrow(TimelineParseError);
    try {
      parseTimeline({ hello: 1 });
    } catch (e) {
      expect((e as Error).message).toContain("hello");
    }
  });

  it("형식은 맞는데 점이 하나도 안 나오면 던진다", () => {
    expect(() => parseTimeline({ semanticSegments: [] })).toThrow(TimelineParseError);
  });

  it("읽을 수 없는 좌표가 섞여 있으면 그 점만 건너뛴다", () => {
    const mixed = {
      semanticSegments: [
        {
          startTime: "2026-01-01T09:00:00Z",
          endTime: "2026-01-01T10:00:00Z",
          visit: { topCandidate: { placeLocation: { latLng: "쓰레기" } } },
        },
        {
          startTime: "2026-01-01T11:00:00Z",
          endTime: "2026-01-01T12:00:00Z",
          visit: { topCandidate: { placeLocation: { latLng: "37.5°, 127.0°" } } },
        },
      ],
    };
    expect(parseTimeline(mixed)).toHaveLength(1);
  });

  it("버린 점이 남은 점보다 많으면 형식 인식 오류를 던진다", () => {
    const mostly_garbage = {
      semanticSegments: [
        {
          startTime: "2026-01-01T09:00:00Z",
          endTime: "2026-01-01T10:00:00Z",
          visit: { topCandidate: { placeLocation: { latLng: "쓰레기1" } } },
        },
        {
          startTime: "2026-01-01T10:00:00Z",
          endTime: "2026-01-01T11:00:00Z",
          visit: { topCandidate: { placeLocation: { latLng: "쓰레기2" } } },
        },
        {
          startTime: "2026-01-01T11:00:00Z",
          endTime: "2026-01-01T12:00:00Z",
          visit: { topCandidate: { placeLocation: { latLng: "37.5°, 127.0°" } } },
        },
      ],
    };
    expect(() => parseTimeline(mostly_garbage)).toThrow(TimelineParseError);
    try {
      parseTimeline(mostly_garbage);
    } catch (e) {
      expect((e as Error).message).toContain("2개를 버리고");
    }
  });
});
