import { describe, expect, it } from "vitest";
import { DEFAULT_ACCURACY_LIMIT_M, filterPoints } from "./filter";
import type { RawPoint } from "./parse";

const T0 = Date.parse("2026-01-01T00:00:00Z");
const MIN = 60_000;

function p(minute: number, lat: number, lon: number, accuracy?: number): RawPoint {
  return { t: T0 + minute * MIN, lat, lon, accuracy, kind: "path" };
}

const OFF = { accuracyLimitM: DEFAULT_ACCURACY_LIMIT_M, outlier: "off" } as const;
const ON = { accuracyLimitM: DEFAULT_ACCURACY_LIMIT_M, outlier: "conservative" } as const;

describe("정확도 필터", () => {
  it("한계를 넘는 점을 버린다", () => {
    const points = [p(0, 37.5, 127.0, 10), p(1, 37.5, 127.0, 500)];
    expect(filterPoints(points, OFF)).toHaveLength(1);
  });

  it("경계값은 남긴다", () => {
    const points = [p(0, 37.5, 127.0, DEFAULT_ACCURACY_LIMIT_M)];
    expect(filterPoints(points, OFF)).toHaveLength(1);
  });

  it("accuracy가 없는 점은 버리지 않는다 — 옛 형식엔 이 값이 아예 없다", () => {
    const points = [p(0, 37.5, 127.0), p(1, 37.5, 127.0)];
    expect(filterPoints(points, OFF)).toHaveLength(2);
  });

  it("한계를 0으로 두면 accuracy 있는 점은 다 버리고 없는 점은 남는다", () => {
    const points = [p(0, 37.5, 127.0, 5), p(1, 37.5, 127.0)];
    const kept = filterPoints(points, { accuracyLimitM: 0, outlier: "off" });
    expect(kept).toHaveLength(1);
    expect(kept[0].accuracy).toBeUndefined();
  });
});

describe("이상치 필터 (보수적)", () => {
  it("혼자 튄 점 하나를 버린다", () => {
    // 1분 만에 서울에서 도쿄로 갔다가 돌아온다 — GPS가 튄 것이다
    const points = [p(0, 37.5, 127.0), p(1, 35.68, 139.65), p(2, 37.5, 127.0)];
    const kept = filterPoints(points, ON);
    expect(kept).toHaveLength(2);
    expect(kept.every((q) => q.lon < 130)).toBe(true);
  });

  it("연속으로 빠르면 남긴다 — 실제 비행일 수 있다", () => {
    // 서울에서 도쿄로 가서 그대로 머문다
    const points = [p(0, 37.5, 127.0), p(60, 35.68, 139.65), p(120, 35.68, 139.65)];
    expect(filterPoints(points, ON)).toHaveLength(3);
  });

  it("끄면 튄 점도 남는다", () => {
    const points = [p(0, 37.5, 127.0), p(1, 35.68, 139.65), p(2, 37.5, 127.0)];
    expect(filterPoints(points, OFF)).toHaveLength(3);
  });

  it("점 3개 미만이면 이상치 필터 없이 정확도 필터 결과를 그대로 반환한다", () => {
    const points = [p(0, 37.5, 127.0), p(1, 37.5, 127.0)];
    expect(filterPoints(points, ON)).toHaveLength(2);
  });

  it("마지막 점이 튄 것이어도 버리지 않는다 — 앞에서만 속도를 본다", () => {
    // 정상적인 서울 근처 점 3개, 마지막이 도쿄로 튄다
    const points = [
      p(0, 37.5, 127.0),
      p(5, 37.5, 127.01),
      p(10, 37.5, 127.02),
      p(11, 35.68, 139.65), // 1분 만에 도쿄로 — 마지막이므로 통과
    ];
    const kept = filterPoints(points, ON);
    expect(kept).toHaveLength(4);
  });

  it("첫 점이 튄 것이어도 버리지 않는다 — 뒤에서만 속도를 본다", () => {
    // 첫 점이 도쿄, 그 다음부터 정상적인 서울
    const points = [
      p(0, 35.68, 139.65), // 첫 점이므로 통과
      p(1, 37.5, 127.0),
      p(6, 37.5, 127.01),
      p(11, 37.5, 127.02),
    ];
    const kept = filterPoints(points, ON);
    expect(kept).toHaveLength(4);
  });

  it("같은 시각의 점 양쪽에서 만나면 버린다 — 깨진 기록", () => {
    // 같은 순간(0분)에 서로 다른 좌표 세 점, 그 다음 1분에 원래 위치로 돌아옴
    // 점: [0] (37.5, 127.0)
    //     [1] (37.501, 127.001) ← 검사 대상: fromPrev(0→0)=Inf, toNext(0→0)=Inf
    //     [2] (37.502, 127.002)
    //     [3] (37.5, 127.0)
    // 점 [1]은 앞뒤 모두 시간 간격 0이므로 버려진다
    const points = [
      p(0, 37.5, 127.0),
      p(0, 37.501, 127.001),  // 양쪽 모두 시간 0 → Infinity > 900 버려짐
      p(0, 37.502, 127.002),
      p(1, 37.5, 127.0),
    ];
    const kept = filterPoints(points, ON);
    expect(kept).toHaveLength(3);
    // 점 (37.501, 127.001)이 제거되었는지 확인
    expect(kept.some((q) => Math.abs(q.lat - 37.501) < 0.0001)).toBe(false);
  });

  it("같은 시각의 점이 한쪽에만 있으면 남긴다 — 한쪽만 Infinity", () => {
    // 같은 순간(0분)에 다른 좌표, 60분 뒤에 원래 위치
    // 점: [0] (37.5, 127.0)
    //     [1] (37.501, 127.001) ← 검사 대상: fromPrev(0→0)=Inf, toNext(0→60분)=정상
    //     [2] (37.5, 127.0)
    // 점 [1]은 한쪽만 Infinity이므로 둘 다 > 900 조건을 만족하지 않아 남는다
    const points = [
      p(0, 37.5, 127.0),
      p(0, 37.501, 127.001),  // fromPrev=Inf, toNext=정상 → 한쪽만 Infinity
      p(60, 37.5, 127.0),     // 60분 뒤
    ];
    const kept = filterPoints(points, ON);
    expect(kept).toHaveLength(3);
    // 점 (37.501, 127.001)이 남았는지 확인
    expect(kept.some((q) => Math.abs(q.lat - 37.501) < 0.0001)).toBe(true);
  });

  it("정상적인 도보 이동은 전부 남는다", () => {
    const points = Array.from({ length: 10 }, (_, i) => p(i, 37.5 + i * 0.0005, 127.0));
    expect(filterPoints(points, ON)).toHaveLength(10);
  });
});

describe("빈 입력", () => {
  it("빈 배열은 빈 배열", () => {
    expect(filterPoints([], ON)).toEqual([]);
  });
});
