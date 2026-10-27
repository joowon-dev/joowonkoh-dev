import { describe, expect, it } from "vitest";
import { seamMap, seamPoint, seamStrengthAt } from "./seam";

describe("seamPoint", () => {
  it("전부 구 표면 위에 있다", () => {
    for (let i = 0; i < 32; i++) {
      const [x, y, z] = seamPoint((i / 32) * Math.PI * 2);
      expect(Math.hypot(x, y, z)).toBeCloseTo(1, 9);
    }
  });

  it("한 바퀴 돌면 제자리로 온다", () => {
    const start = seamPoint(0);
    const end = seamPoint(Math.PI * 2);
    expect(end[0]).toBeCloseTo(start[0], 9);
    expect(end[1]).toBeCloseTo(start[1], 9);
    expect(end[2]).toBeCloseTo(start[2], 9);
  });

  it("반 바퀴 돌리면 자기 자신이 된다", () => {
    // 야구공의 두 가죽 조각은 세로축 180° 회전으로 서로 포개진다. 이게
    // 깨지면 야구공 실밥이 아니라 그냥 고리 하나를 그린 것이다
    // 최단거리를 재는 표본 격자(256등분)에 맞춰 잡아, 곡선을 성기게 쪼갠
    // 오차가 아니라 대칭 자체를 본다
    for (let k = 0; k < 256; k += 13) {
      const [x, y, z] = seamPoint((k / 256) * Math.PI * 2);
      expect(seamStrengthAt(-x, -y, z)).toBeCloseTo(1, 6);
    }
  });

  it("곡선 위는 가장 진하고, 곡선에서 먼 방향은 0이다", () => {
    const [x, y, z] = seamPoint((40 / 256) * Math.PI * 2);
    expect(seamStrengthAt(x, y, z)).toBeCloseTo(1, 6);

    // 실밥이 감싸고 남긴 두 조각의 한가운데
    expect(seamStrengthAt(0, 0, 1)).toBe(0);
  });
});

describe("seamMap", () => {
  const map = seamMap(64, 32);

  it("요청한 크기대로 나온다", () => {
    expect(map.width).toBe(64);
    expect(map.height).toBe(32);
    expect(map.data).toHaveLength(64 * 32);
  });

  it("값이 0~255 안에 있다", () => {
    for (const v of map.data) {
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(255);
    }
  });

  it("실밥이 표면의 일부만 덮는다", () => {
    // 다 덮이면 흰 공이 되고, 하나도 없으면 실밥이 안 보인다
    const marked = [...map.data].filter((v) => v > 128).length;
    const ratio = marked / map.data.length;
    expect(ratio).toBeGreaterThan(0.03);
    expect(ratio).toBeLessThan(0.3);
  });

  it("가장 진한 지점과 가장 옅은 지점이 둘 다 있다", () => {
    expect(Math.max(...map.data)).toBeGreaterThan(240);
    expect(Math.min(...map.data)).toBe(0);
  });

  it("경도를 반 바퀴 돌리면 같은 값이 나온다", () => {
    // 세로축 180° 회전 대칭이 지도에도 그대로 남아 있어야 한다
    for (let j = 0; j < map.height; j++) {
      for (let i = 0; i < map.width; i += 7) {
        const mirrored = map.data[j * map.width + ((i + map.width / 2) % map.width)];
        expect(Math.abs(map.data[j * map.width + i] - mirrored)).toBeLessThan(24);
      }
    }
  });
});
