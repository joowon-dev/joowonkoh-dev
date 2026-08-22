import { describe, expect, it } from "vitest";
import { DEFAULT_MEET_MIN_MS, DEFAULT_MEET_RADIUS_M, GRID_MS, MAX_GAP_MS, findMeetings, resample } from "./meet";
import { haversineMeters } from "./geo";
import { parseTimeline, type RawPoint } from "./parse";
import {
  SAMPLE_BUSAN_RANGE,
  SAMPLE_JEJU_RANGE,
  SAMPLE_NAMES,
  SAMPLE_START,
  buildSampleTimeline,
} from "./sample";

const OPTS = { radiusM: DEFAULT_MEET_RADIUS_M, minDurationMs: DEFAULT_MEET_MIN_MS };

const DAY_MS = 86_400_000;
const HOUR_MS = 3_600_000;

/** 방문 점은 시작 시각 하나만으로 배열에 들어가 있어도 until까지는 위치를 안다. */
function knownEnd(p: RawPoint): number {
  return p.until !== undefined && p.until > p.t ? p.until : p.t;
}

/**
 * 사람이 실제로 낼 수 없는 속도(m/s). 상용기 순항 속도(약 250m/s)보다도
 * 훨씬 빠르게 잡아서, 어쩌다 비행기를 탄 것과 GPS 튐을 확실히 구분한다.
 */
const IMPLAUSIBLE_SPEED_MPS = 400;

/** 그 epoch ms가 속한 KST 날의 자정(00:00). SAMPLE_START가 KST 자정이라 성립한다. */
function dayStartOf(t: number): number {
  const offset = (((t - SAMPLE_START) % DAY_MS) + DAY_MS) % DAY_MS;
  return t - offset;
}

/**
 * [gapStart, gapEnd) 구간이 «깨어있는 시간대»(매일 09:00~22:00 KST)와 겹치는
 * 총 길이(ms). 밤새 기록이 없는 것(23시~다음날 7시)은 이 시간대와 전혀 겹치지
 * 않으므로 0이 나온다 — «다들 잔다»와 «낮에 기록이 통째로 빈다»를 이 값으로
 * 구분한다.
 */
function daytimeOverlapMs(gapStart: number, gapEnd: number): number {
  let total = 0;
  for (let cursor = dayStartOf(gapStart); cursor < gapEnd; cursor += DAY_MS) {
    const wakeStart = cursor + 9 * HOUR_MS;
    const wakeEnd = cursor + 22 * HOUR_MS;
    const overlapStart = Math.max(gapStart, wakeStart);
    const overlapEnd = Math.min(gapEnd, wakeEnd);
    if (overlapEnd > overlapStart) total += overlapEnd - overlapStart;
  }
  return total;
}

/**
 * activity 전용 통근 세그먼트(끝점 두 개뿐, timelinePath 없음)는 그 자체로
 * 1시간짜리 «구멍»(30분보다 길다)을 매 통근마다 만든다 — 정상이고 의도된
 * 동작이다(중간 경로를 모르니 모른다고 하는 것이 맞다). 제주 진입/이탈 날의
 * 21시 종료 같은 경계 효과도 낮 시간대와 한두 시간 겹칠 수 있다. 이런 «항상
 * 있는» 짧은 겹침과 day % 11 === 5가 만드는 진짜 이상 상황(약 13시간짜리
 * 낮 공백)을 구분하려면 겹침 길이 자체로 걸러야 한다.
 */
const ANOMALOUS_DAYTIME_GAP_MS = 6 * HOUR_MS;

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

  it("낮 시간대(09~22시)에 몇 시간씩 이어지는 이상 구멍이 있다 — 다들 자는 것과는 다르다", () => {
    // 위 테스트만으로는 부족하다: 매일 밤 23시~다음날 7시는 아무 것도 기록하지
    // 않는데, 그 평범한 야간 공백만으로도 30분 넘는 구멍 테스트는 통과해 버린다.
    // day % 11 === 5 주입이 만드는 것은 «낮에» 기록이 통째로 비는 이상 상황이다.
    //
    // 겹침이 있다는 것만으로도 부족하다: activity 전용 통근(끝점 두 개, 1시간)이
    // 매번 30분을 넘는 «구멍»을 만들고, 제주 진입/이탈 경계도 한두 시간 겹칠 수
    // 있다. 둘 다 정상적인 부산물이다. day % 11 === 5는 약 13시간을 통째로
    // 지우므로, ANOMALOUS_DAYTIME_GAP_MS(6시간)보다 훨씬 긴 겹침만 «진짜
    // 이상 상황»으로 센다.
    let found = false;
    for (let i = 1; i < points.length; i += 1) {
      const gapStart = knownEnd(points[i - 1]);
      const gapEnd = points[i].t;
      if (gapEnd - gapStart > MAX_GAP_MS && daytimeOverlapMs(gapStart, gapEnd) > ANOMALOUS_DAYTIME_GAP_MS) {
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

  it("제주 기간에는 두 사람이 실제로 수백 km 떨어져 있다", () => {
    // 위 «만남이 없다» 테스트만으로는 부족하다: A와 B는 애초에 집도 회사도
    // 다르므로, 지호가 제주에 아예 안 갔어도(평범한 화요일이어도) 이 테스트는
    // 그냥 통과해 버린다. findMeetings의 결과가 아니라 실제 좌표 사이 거리를
    // 직접 재야 «450km 떨어진 제주»와 «8km 떨어진 강남·홍대»를 구분할 수 있다.
    const gridA = resample(a, SAMPLE_JEJU_RANGE.from, SAMPLE_JEJU_RANGE.to, GRID_MS, MAX_GAP_MS);
    const gridB = resample(b, SAMPLE_JEJU_RANGE.from, SAMPLE_JEJU_RANGE.to, GRID_MS, MAX_GAP_MS);

    let minDistance = Infinity;
    let sampled = 0;
    for (let i = 0; i < gridA.length; i += 1) {
      const pa = gridA[i];
      const pb = gridB[i];
      if (pa !== null && pb !== null) {
        sampled += 1;
        minDistance = Math.min(minDistance, haversineMeters(pa, pb));
      }
    }

    // 두 기록이 겹치는 칸이 하나도 없으면 minDistance가 그냥 Infinity로 남아
    // 아래 단언이 실제로는 아무것도 못 재고도 통과해 버린다 — 먼저 표본이
    // 있는지부터 확인한다.
    expect(sampled).toBeGreaterThan(0);
    // 서울↔제주 실거리는 약 450km. 100m 반경 판정과 헷갈릴 수 없는 자릿수로
    // 200km를 기준선으로 둔다.
    expect(minDistance).toBeGreaterThan(200_000);
  });

  it("같이 부산에 간 기간에는 만남이 있다", () => {
    const during = meets.filter(
      (m) => m.end > SAMPLE_BUSAN_RANGE.from && m.start < SAMPLE_BUSAN_RANGE.to,
    );
    expect(during.length).toBeGreaterThan(0);
  });
});
