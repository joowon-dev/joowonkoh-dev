import { describe, expect, it } from "vitest";
import { DEFAULT_MEET_MIN_MS, DEFAULT_MEET_RADIUS_M, MAX_GAP_MS, findMeetings } from "./meet";
import { haversineMeters } from "./geo";
import { parseTimeline, type RawPoint } from "./parse";
import {
  SAMPLE_BUSAN_RANGE,
  SAMPLE_JEJU_RANGE,
  SAMPLE_NAMES,
  buildSampleTimeline,
} from "./sample";

const OPTS = { radiusM: DEFAULT_MEET_RADIUS_M, minDurationMs: DEFAULT_MEET_MIN_MS };

/** 방문 점은 시작 시각 하나만으로 배열에 들어가 있어도 until까지는 위치를 안다. */
function knownEnd(p: RawPoint): number {
  return p.until !== undefined && p.until > p.t ? p.until : p.t;
}

/**
 * 사람이 실제로 낼 수 없는 속도(m/s). 상용기 순항 속도(약 250m/s)보다도
 * 훨씬 빠르게 잡아서, 어쩌다 비행기를 탄 것과 GPS 튐을 확실히 구분한다.
 */
const IMPLAUSIBLE_SPEED_MPS = 400;

describe("buildSampleTimeline", () => {
  it("안드로이드 모양은 semanticSegments를 갖는다", () => {
    const data = buildSampleTimeline("a", "android") as Record<string, unknown>;
    expect(Array.isArray(data.semanticSegments)).toBe(true);
  });

  it("아이폰 모양은 배열 그 자체다", () => {
    expect(Array.isArray(buildSampleTimeline("a", "ios"))).toBe(true);
  });

  it("양쪽 모양 모두 파서가 읽는다", () => {
    expect(parseTimeline(buildSampleTimeline("a", "android")).length).toBeGreaterThan(100);
    expect(parseTimeline(buildSampleTimeline("a", "ios")).length).toBeGreaterThan(100);
  });

  it("같은 시드면 같은 결과", () => {
    const one = JSON.stringify(buildSampleTimeline("a", "android", 42));
    const two = JSON.stringify(buildSampleTimeline("a", "android", 42));
    expect(one).toBe(two);
  });

  it("시드가 다르면 결과가 다르다", () => {
    const one = JSON.stringify(buildSampleTimeline("a", "android", 1));
    const two = JSON.stringify(buildSampleTimeline("a", "android", 2));
    expect(one).not.toBe(two);
  });

  it("두 사람은 서로 다른 기록을 갖는다", () => {
    const a = JSON.stringify(buildSampleTimeline("a", "android"));
    const b = JSON.stringify(buildSampleTimeline("b", "android"));
    expect(a).not.toBe(b);
  });

  it("두 사람 이름이 정해져 있다", () => {
    expect(SAMPLE_NAMES.a).toBeTruthy();
    expect(SAMPLE_NAMES.b).toBeTruthy();
    expect(SAMPLE_NAMES.a).not.toBe(SAMPLE_NAMES.b);
  });

  it("시간 오름차순이다", () => {
    const points = parseTimeline(buildSampleTimeline("a", "android"));
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].t).toBeGreaterThanOrEqual(points[i - 1].t);
    }
  });
});

describe("샘플에 구멍과 튄 점이 실제로 살아 있다", () => {
  // 이 주입 코드를 통째로 지워도 나머지 테스트가 전부 통과한다면, 필터와
  // 구멍 처리가 아무것도 시험하지 않는 샘플을 조용히 검증하고 있다는 뜻이다.
  const points = parseTimeline(buildSampleTimeline("a", "android"));

  it("30분 넘는 기록 구멍이 실제로 있다", () => {
    let found = false;
    for (let i = 1; i < points.length; i += 1) {
      const gap = points[i].t - knownEnd(points[i - 1]);
      if (gap > MAX_GAP_MS) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });

  it("비현실적 속도로만 설명되는 튄 점이 실제로 있다", () => {
    let found = false;
    for (let i = 1; i < points.length; i += 1) {
      const dtSec = (points[i].t - points[i - 1].t) / 1000;
      if (dtSec <= 0) continue;
      const speed = haversineMeters(points[i - 1], points[i]) / dtSec;
      if (speed > IMPLAUSIBLE_SPEED_MPS) {
        found = true;
        break;
      }
    }
    expect(found).toBe(true);
  });
});

describe("activity 전용 세그먼트가 실제로 섞여 있다", () => {
  // parse.ts는 timelinePath 없이 activity.start/end만 있는 세그먼트를 읽는 길을
  // 갖고 있다. 샘플이 그 길을 한 번도 안 밟으면 그 코드는 시험대에 오르지 못한다.
  function activityOnlySegments(shape: "android" | "ios") {
    const data = buildSampleTimeline("a", shape);
    const segments = (shape === "android" ? (data as { semanticSegments: unknown[] }).semanticSegments : (data as unknown[])) as Record<string, unknown>[];
    return segments.filter((s) => s.activity !== undefined && s.timelinePath === undefined);
  }

  it("안드로이드 샘플에 activity 전용 세그먼트가 있고, 거리는 숫자다", () => {
    const found = activityOnlySegments("android");
    expect(found.length).toBeGreaterThan(0);
    const activity = found[0].activity as Record<string, unknown>;
    expect(typeof activity.distanceMeters).toBe("number");
  });

  it("아이폰 샘플에 activity 전용 세그먼트가 있고, 거리는 문자열이다", () => {
    const found = activityOnlySegments("ios");
    expect(found.length).toBeGreaterThan(0);
    const activity = found[0].activity as Record<string, unknown>;
    expect(typeof activity.distanceMeters).toBe("string");
  });
});

describe("가상 여행이 검출기를 제대로 돌린다", () => {
  const a = parseTimeline(buildSampleTimeline("a", "android"));
  const b = parseTimeline(buildSampleTimeline("b", "android"));
  const meets = findMeetings(a, b, OPTS);

  it("만남이 여러 건 잡힌다 — 안 잡히면 볼 게 없다", () => {
    expect(meets.length).toBeGreaterThanOrEqual(5);
  });

  it("만남이 너무 많지도 않다 — 매일 잡히면 검출기가 헐거운 것이다", () => {
    expect(meets.length).toBeLessThan(60);
  });

  it("한 명만 제주에 간 기간에는 만남이 없다", () => {
    // 이 기간에 만남이 잡히면 검출기가 헐거운 것이다. 샘플에서 가장 중요한 시험이다.
    const during = meets.filter(
      (m) => m.end > SAMPLE_JEJU_RANGE.from && m.start < SAMPLE_JEJU_RANGE.to,
    );
    expect(during).toEqual([]);
  });

  it("같이 부산에 간 기간에는 만남이 있다", () => {
    const during = meets.filter(
      (m) => m.end > SAMPLE_BUSAN_RANGE.from && m.start < SAMPLE_BUSAN_RANGE.to,
    );
    expect(during.length).toBeGreaterThan(0);
  });
});
