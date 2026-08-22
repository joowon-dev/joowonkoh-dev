import { describe, expect, it } from "vitest";
import type { View } from "./camera";
import type { RawPoint } from "./parse";
import {
  blurRadiusScreen,
  currentPosition,
  formatDate,
  meetingPulse,
  pulseMsFor,
  tailMsFor,
  tailSegments,
  viewToScreen,
} from "./render";

const VIEW: View = { centerLat: 37.5, centerLon: 127.0, zoom: 12 };
const SIZE = { w: 1080, h: 1080 };
const T0 = Date.parse("2026-01-01T00:00:00Z");
const MIN = 60_000;

function p(minute: number, lat: number, lon: number): RawPoint {
  return { t: T0 + minute * MIN, lat, lon, kind: "path" };
}

function visit(minute: number, untilMinute: number, lat: number, lon: number): RawPoint {
  return { t: T0 + minute * MIN, until: T0 + untilMinute * MIN, lat, lon, kind: "visit" };
}

describe("viewToScreen", () => {
  it("시야 중심은 화면 한가운데", () => {
    const s = viewToScreen({ lat: VIEW.centerLat, lon: VIEW.centerLon }, VIEW, SIZE);
    expect(s.x).toBeCloseTo(540, 6);
    expect(s.y).toBeCloseTo(540, 6);
  });

  it("동쪽은 오른쪽, 북쪽은 위쪽", () => {
    const east = viewToScreen({ lat: 37.5, lon: 127.1 }, VIEW, SIZE);
    const north = viewToScreen({ lat: 37.6, lon: 127.0 }, VIEW, SIZE);
    expect(east.x).toBeGreaterThan(540);
    expect(north.y).toBeLessThan(540);
  });

  it("줌이 한 단계 오르면 중심에서의 거리가 두 배", () => {
    const at = { lat: 37.52, lon: 127.02 };
    const near = viewToScreen(at, VIEW, SIZE);
    const far = viewToScreen(at, { ...VIEW, zoom: 13 }, SIZE);
    expect(far.x - 540).toBeCloseTo((near.x - 540) * 2, 4);
  });

  it("세로 화면에서도 중심은 가운데", () => {
    const s = viewToScreen({ lat: 37.5, lon: 127.0 }, VIEW, { w: 1080, h: 1920 });
    expect(s.x).toBeCloseTo(540, 6);
    expect(s.y).toBeCloseTo(960, 6);
  });
});

describe("tailSegments", () => {
  it("꼬리 길이 안의 점만 남는다", () => {
    const points = [p(0, 37, 127), p(10, 37, 127), p(20, 37, 127)];
    const segs = tailSegments(points, T0 + 20 * MIN, 15 * MIN, 30 * MIN);
    expect(segs.flat()).toHaveLength(2);
  });

  it("현재 시각보다 미래의 점은 안 나온다", () => {
    const points = [p(0, 37, 127), p(50, 37, 127)];
    const segs = tailSegments(points, T0 + 10 * MIN, 60 * MIN, 30 * MIN);
    expect(segs.flat()).toHaveLength(1);
  });

  it("구멍이 있으면 선을 끊어서 여러 조각으로 준다", () => {
    // 두 점 사이가 60분 — 이으면 없는 길이 그어진다
    const points = [p(0, 37, 127), p(60, 38, 128), p(65, 38, 128)];
    const segs = tailSegments(points, T0 + 65 * MIN, 120 * MIN, 30 * MIN);
    expect(segs).toHaveLength(2);
    expect(segs[0]).toHaveLength(1);
    expect(segs[1]).toHaveLength(2);
  });

  it("점이 없으면 빈 배열", () => {
    expect(tailSegments([], T0, 30 * MIN, 30 * MIN)).toEqual([]);
  });

  it("한 조각도 못 만들면 빈 배열", () => {
    const points = [p(100, 37, 127)];
    expect(tailSegments(points, T0, 30 * MIN, 30 * MIN)).toEqual([]);
  });

  it("구멍이 정확히 maxGapMs이면 끊지 않는다", () => {
    // 두 점 사이가 정확히 maxGapMs — 끊지 않아야 한다
    const points = [p(0, 37, 127), p(30, 38, 128), p(35, 38, 128)];
    const segs = tailSegments(points, T0 + 35 * MIN, 120 * MIN, 30 * MIN);
    expect(segs).toHaveLength(1);
    expect(segs[0]).toHaveLength(3);
  });

  it("구멍이 maxGapMs를 넘으면 끊는다", () => {
    // 두 점 사이가 maxGapMs보다 조금 더 많음 — 끊어야 한다
    const points = [p(0, 37, 127), p(30.5, 38, 128), p(35, 38, 128)];
    const segs = tailSegments(points, T0 + 35 * MIN, 120 * MIN, 30 * MIN);
    expect(segs).toHaveLength(2);
    expect(segs[0]).toHaveLength(1);
    expect(segs[1]).toHaveLength(2);
  });
});

describe("meetingPulse", () => {
  const meeting = { start: T0, end: T0 + 60 * MIN, lat: 37.5, lon: 127, minDistance: 10 };

  it("시작 직전엔 0", () => {
    expect(meetingPulse(meeting, T0 - MIN, 20 * MIN)).toBe(0);
  });

  it("시작 순간이 가장 세다", () => {
    expect(meetingPulse(meeting, T0, 20 * MIN)).toBeCloseTo(1, 6);
  });

  it("시간이 지나면 잦아든다", () => {
    const early = meetingPulse(meeting, T0 + 5 * MIN, 20 * MIN);
    const late = meetingPulse(meeting, T0 + 30 * MIN, 20 * MIN);
    expect(late).toBeLessThan(early);
  });

  it("0과 1 사이를 벗어나지 않는다", () => {
    for (let m = -10; m < 120; m += 5) {
      const v = meetingPulse(meeting, T0 + m * MIN, 20 * MIN);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});

describe("tailMsFor / pulseMsFor — 압축률에 맞춰 늘어난다", () => {
  // 이 도구의 실제 최악 조건: 90일을 10초(30fps)에 담으면 한 프레임이 약 7.17시간.
  const PACE_90D_10S = (90 * 24 * 3_600_000) / (10 * 30);

  it("꼬리는 한 프레임보다 반드시 길다 — 짧으면 선이 아예 안 그려진다", () => {
    // 예전엔 꼬리가 타임라인 6시간 고정이라 7.17시간짜리 한 프레임보다 짧았다.
    // 두 점 이상 담기려면 최소한 프레임 한 칸보다는 길어야 한다.
    expect(tailMsFor(PACE_90D_10S)).toBeGreaterThan(PACE_90D_10S);
  });

  it("링은 한 프레임보다 반드시 길다 — 짧으면 만남이 프레임 사이로 빠진다", () => {
    expect(pulseMsFor(PACE_90D_10S)).toBeGreaterThan(PACE_90D_10S);
  });

  it("압축이 심할수록 길어진다", () => {
    expect(tailMsFor(PACE_90D_10S)).toBeGreaterThan(tailMsFor(PACE_90D_10S / 6));
  });

  it("pace가 0이어도 최소 길이가 남는다 — 꼬리가 사라지지 않는다", () => {
    expect(tailMsFor(0)).toBeGreaterThan(0);
    expect(pulseMsFor(0)).toBeGreaterThan(0);
  });
});

describe("meetingPulse — 긴 만남", () => {
  it("두 시간짜리 만남은 두 시간 내내 링이 남는다", () => {
    // 창이 max(만남 길이, pulseMs)가 아니라 pulseMs 고정이면, 20분이 지난 뒤
    // 아직 함께 있는데도 링이 꺼진다.
    const long = { start: T0, end: T0 + 120 * MIN, lat: 37.5, lon: 127, minDistance: 10 };
    expect(meetingPulse(long, T0 + 100 * MIN, 20 * MIN)).toBeGreaterThan(0);
  });

  it("만남이 끝난 한참 뒤에는 꺼진다", () => {
    const long = { start: T0, end: T0 + 120 * MIN, lat: 37.5, lon: 127, minDistance: 10 };
    expect(meetingPulse(long, T0 + 200 * MIN, 20 * MIN)).toBe(0);
  });
});

describe("currentPosition", () => {
  it("머문 구간(until) 안이면 그 점 자체를 준다", () => {
    // 방문 기록: 0분부터 30분까지 머묾. 15분 시점은 사이지만 다음 점이 없다 —
    // until 처리가 없다면 «다음 점 없음»으로 오인해 null이 나온다.
    const points = [visit(0, 30, 37.1, 127.1)];
    const pos = currentPosition(points, T0 + 15 * MIN);
    expect(pos).toEqual({ lat: 37.1, lon: 127.1, stale: false });
  });

  it("머문 구간의 끝 경계(until)에서도 여전히 그 점이다", () => {
    const points = [visit(0, 30, 37.1, 127.1)];
    const pos = currentPosition(points, T0 + 30 * MIN);
    expect(pos).toEqual({ lat: 37.1, lon: 127.1, stale: false });
  });

  it("머문 구간 밖에서 다음 점까지 간격은 머문 «시작»부터 잰다", () => {
    // 방문은 0~10분 머묾. 다음 점은 35분. 20분 시점(머문 구간 밖, 다음 점 이전)에서
    // 간격을 어디서부터 잴지에 따라 답이 갈린다:
    //   - 머문 시작(0분)부터 재면: 35 - 0 = 35분 > MAX_GAP_MS(30분) → 구멍
    //   - 머문 끝(10분)부터 재면: 35 - 10 = 25분 <= 30분 → 구멍이 아니라 보간
    // resample()이 prev.t(구간의 시작)로 간격을 재는 것과 같은 규칙을 따르기로
    // 했다 — 방문 한 점은 시작 시각 하나로 존재하는 기록이고, "몇 시에 그 자리를
    // 벗어났는지"는 모르므로 머문 끝을 기준으로 재는 것은 모르는 것을 안다고 치는
    // 셈이다. 그래서 이 시나리오는 구멍이어야 한다 — 즉 보간하지 않고 stale로
    // 표시된 마지막 자리가 나와야 한다. 끝(10분)을 기준으로 재는 구현으로 바뀌면
    // stale이 false가 되고 좌표도 38.2 쪽으로 끌려가서 이 테스트가 실패한다 —
    // 두 관례가 실제로 갈리는 지점에서 검증하기 위해 일부러 이 숫자들을 골랐다.
    const points = [visit(0, 10, 37.1, 127.1), p(35, 38.2, 128.2)];
    const pos = currentPosition(points, T0 + 20 * MIN);
    expect(pos).toEqual({ lat: 37.1, lon: 127.1, stale: true });
  });

  it("구멍 안에서는 보간하지 않고 마지막으로 알던 자리를 stale로 준다", () => {
    // 40분 간격(> MAX_GAP_MS 30분)의 한가운데. 이동을 지어내면 안 되므로
    // 중간 지점(37.5, 127.5)이 나와서는 안 되고, 그렇다고 점이 사라져서도 안 된다
    // — 사라지면 영상에서 두 사람이 프레임의 42%에서 함께 안 보였다.
    const points = [p(0, 37, 127), p(40, 38, 128)];
    const pos = currentPosition(points, T0 + 20 * MIN);
    expect(pos).toEqual({ lat: 37, lon: 127, stale: true });
  });

  it("구멍이 아닌 구간은 stale이 아니다 — 두 상태가 실제로 갈린다", () => {
    // 위 테스트와 짝이다. 간격만 30분 이내로 줄이면 stale이 false가 되어야 한다.
    // stale을 항상 true로 두는 구현은 이 테스트가 잡는다.
    const points = [p(0, 37, 127), p(20, 38, 128)];
    expect(currentPosition(points, T0 + 10 * MIN)!.stale).toBe(false);
  });

  it("간격이 정확히 MAX_GAP_MS면 끊지 않고 보간한다", () => {
    const points = [p(0, 37, 127), p(30, 38, 128)]; // 정확히 30분
    const pos = currentPosition(points, T0 + 15 * MIN);
    expect(pos).toEqual({ lat: 37.5, lon: 127.5, stale: false });
  });

  it("첫 기록보다 이전이면 null", () => {
    const points = [p(10, 37, 127), p(20, 38, 128)];
    const pos = currentPosition(points, T0);
    expect(pos).toBeNull();
  });

  it("마지막 기록 이후이면 null", () => {
    const points = [p(0, 37, 127), p(10, 38, 128)];
    const pos = currentPosition(points, T0 + 20 * MIN);
    expect(pos).toBeNull();
  });

  it("평범한 두 점 사이는 시간 비율로 보간한다", () => {
    const points = [p(0, 37, 127), p(10, 39, 129)];
    const pos = currentPosition(points, T0 + 4 * MIN); // f = 0.4
    expect(pos).not.toBeNull();
    expect(pos!.lat).toBeCloseTo(37.8, 6);
    expect(pos!.lon).toBeCloseTo(127.8, 6);
  });

  it("점이 하나도 없으면 null", () => {
    expect(currentPosition([], T0)).toBeNull();
  });

  it("until이 MAX_STAY_MS(24시간)를 넘게 적혀 있어도 24시간에서 잘린다", () => {
    // until을 48시간 뒤로 적어 둔 손상된/조작된 기록. 뒤에 다음 점이 없으므로
    // 클램프가 없다면 30시간 시점에도 여전히 그 자리에 있다고 답한다.
    // Math.min(cur.until, cur.t + MAX_STAY_MS)를 plain cur.until로 바꾸면
    // 이 테스트가 실패해야 한다.
    const points = [visit(0, 48 * 60, 37.1, 127.1)];
    const pos = currentPosition(points, T0 + 30 * 60 * MIN);
    expect(pos).toBeNull();
  });

  it("now가 점의 시각과 정확히 같으면 그 점을 준다 — 앞의 구멍과 무관하게", () => {
    // now가 두 번째 점의 시각과 정확히 일치한다. 첫 점과 이 점 사이는 50분 간격
    // (MAX_GAP_MS=30분보다 큼)이지만, «지금 있는 자리»를 찾을 때는 그 간격이
    // 상관없다 — 이 점 자체가 바로 지금 시각의 기록이기 때문이다.
    // points[i].t > now를 >= now로 바꾸면(경계 하나 밀림), idx가 앞 점(0분)에
    // 머무르고 그 앞 점을 기준으로 간격을 재 50분짜리 구멍에 걸려 null이 나온다 —
    // 이 테스트는 그 실수를 잡는다.
    const points = [p(0, 37, 127), p(50, 38, 128), p(55, 38.1, 128.1)];
    const pos = currentPosition(points, T0 + 50 * MIN);
    expect(pos).toEqual({ lat: 38, lon: 128, stale: false });
  });
});

describe("blurRadiusScreen", () => {
  it("구체적인 값 검증: 위도 37.5°, 줌 15, 반경 200m은 52.76908084053102px", () => {
    const view: View = { centerLat: 37.5, centerLon: 127.0, zoom: 15 };
    const radius = blurRadiusScreen(200, 37.5, view);
    expect(radius).toBeCloseTo(52.76908084053102, 8);
  });

  it("줌이 한 단계 오르면 픽셀 반경이 두 배", () => {
    const lat = 37.5;
    const view12: View = { centerLat: 37.5, centerLon: 127.0, zoom: 12 };
    const view13: View = { centerLat: 37.5, centerLon: 127.0, zoom: 13 };
    const radius12 = blurRadiusScreen(200, lat, view12);
    const radius13 = blurRadiusScreen(200, lat, view13);
    expect(radius13).toBeCloseTo(radius12 * 2, 4);
  });

  it("거리를 두 배로 늘리면 픽셀도 두 배", () => {
    const view: View = { centerLat: 37.5, centerLon: 127.0, zoom: 15 };
    const radius200 = blurRadiusScreen(200, 37.5, view);
    const radius400 = blurRadiusScreen(400, 37.5, view);
    expect(radius400).toBeCloseTo(radius200 * 2, 4);
  });

  it("위도가 다르면 같은 거리도 다른 픽셀이 된다", () => {
    const view: View = { centerLat: 37.5, centerLon: 127.0, zoom: 15 };
    const radiusEq = blurRadiusScreen(200, 0, view); // 적도: cos(0) = 1
    const radiusHigh = blurRadiusScreen(200, 60, view); // 고위도: cos(60°) ≈ 0.5
    expect(radiusHigh).toBeGreaterThan(radiusEq);
    // 위도 차이가 클수록 cos 차이도 크므로, 테스트는 충분히 다른 픽셀 값을 확인한다
    expect(Math.abs(radiusEq - radiusHigh)).toBeGreaterThan(5);
  });
});

describe("formatDate", () => {
  it("UTC가 아니라 보는 사람의 시간대로 적는다", () => {
    // 한국(UTC+9) 기준 2026-03-02 오전 8시. toISOString()으로 적으면
    // UTC로는 아직 3월 1일이라 «하루 전날»이 찍힌다. 만남 목록은 현지 시각으로
    // 보여 주므로, 그렇게 두면 같은 순간이 카드와 목록에서 다른 날짜가 된다.
    const t = new Date(2026, 2, 2, 8, 0, 0).getTime();
    const shown = formatDate(t, "ko");
    const localDay = new Date(t).getDate();
    expect(shown).toContain(String(localDay));
  });

  it("로캘에 따라 표기가 달라진다", () => {
    const t = Date.parse("2026-05-02T12:00:00Z");
    expect(formatDate(t, "ko")).not.toBe(formatDate(t, "en"));
  });
});
