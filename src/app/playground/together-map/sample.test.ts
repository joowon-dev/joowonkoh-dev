import { describe, expect, it } from "vitest";
import { DEFAULT_MEET_MIN_MS, DEFAULT_MEET_RADIUS_M, findMeetings } from "./meet";
import { parseTimeline } from "./parse";
import {
  SAMPLE_BUSAN_RANGE,
  SAMPLE_JEJU_RANGE,
  SAMPLE_NAMES,
  buildSampleTimeline,
} from "./sample";

const OPTS = { radiusM: DEFAULT_MEET_RADIUS_M, minDurationMs: DEFAULT_MEET_MIN_MS };

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
