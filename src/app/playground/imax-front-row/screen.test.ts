import { describe, expect, it } from "vitest";
import { cropUv, SCREEN_ASPECT } from "./screen";

/** 크롭 UV를 실제로 텍스처 좌표에 적용해 본다 */
function apply(crop: ReturnType<typeof cropUv>, u: number, v: number) {
  return [crop.scale[0] * u + crop.offset[0], crop.scale[1] * v + crop.offset[1]] as const;
}

describe("센터 크롭", () => {
  it("넓은 영상은 좌우를 잘라내고 위아래는 다 쓴다", () => {
    const crop = cropUv(1280, 720, false); // 16:9, 1.43보다 넓다
    const [x0] = apply(crop, 0, 0);
    const [x1] = apply(crop, 1, 0);
    expect(x0).toBeGreaterThan(0);
    expect(x1).toBeLessThan(1);
    // 세로는 0~1을 그대로 (뒤집혀서) 다 쓴다
    expect(apply(crop, 0, 0)[1]).toBeCloseTo(1);
    expect(apply(crop, 0, 1)[1]).toBeCloseTo(0);
  });

  it("좁은 영상은 위아래를 잘라낸다", () => {
    const crop = cropUv(720, 1280, false); // 세로 영상
    const [, y0] = apply(crop, 0, 0);
    const [, y1] = apply(crop, 0, 1);
    expect(Math.min(y0, y1)).toBeGreaterThan(0);
    expect(Math.max(y0, y1)).toBeLessThan(1);
    expect(apply(crop, 0, 0)[0]).toBeCloseTo(0);
  });

  it("어떤 비율이 들어와도 잘라낸 영역은 1.43:1이다", () => {
    for (const [w, h] of [
      [1280, 720],
      [640, 480],
      [720, 1280],
      [1000, 1000],
      [1920, 800],
    ]) {
      const crop = cropUv(w, h, false);
      const spanU = Math.abs(crop.scale[0]);
      const spanV = Math.abs(crop.scale[1]);
      // 원본 픽셀로 환산한 크롭 영역의 가로세로비
      expect((spanU * w) / (spanV * h)).toBeCloseTo(SCREEN_ASPECT, 4);
    }
  });

  it("잘라낸 영역은 원본 한가운데 있다", () => {
    const crop = cropUv(1920, 800, false);
    const [xa] = apply(crop, 0, 0);
    const [xb] = apply(crop, 1, 0);
    expect((xa + xb) / 2).toBeCloseTo(0.5, 6);
  });

  it("셀피 반전은 좌우만 뒤집고 잘라낸 영역은 그대로다", () => {
    const plain = cropUv(1280, 720, false);
    const mirrored = cropUv(1280, 720, true);
    expect(mirrored.scale[0]).toBeCloseTo(-plain.scale[0]);
    // 뒤집힌 뒤에도 같은 구간을 훑는다
    expect(apply(mirrored, 0, 0)[0]).toBeCloseTo(apply(plain, 1, 0)[0]);
    expect(apply(mirrored, 1, 0)[0]).toBeCloseTo(apply(plain, 0, 0)[0]);
    expect(mirrored.scale[1]).toBeCloseTo(plain.scale[1]);
  });

  it("영상이 아직 없을 때 0으로 나누지 않는다", () => {
    const crop = cropUv(0, 0);
    expect(Number.isFinite(crop.scale[0])).toBe(true);
    expect(Number.isFinite(crop.offset[0])).toBe(true);
  });

  it("텍스처 좌표가 0~1을 벗어나지 않는다", () => {
    for (const [w, h] of [
      [1280, 720],
      [720, 1280],
    ]) {
      for (const mirror of [false, true]) {
        const crop = cropUv(w, h, mirror);
        for (const [u, v] of [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ]) {
          const [x, y] = apply(crop, u, v);
          expect(x).toBeGreaterThanOrEqual(-1e-9);
          expect(x).toBeLessThanOrEqual(1 + 1e-9);
          expect(y).toBeGreaterThanOrEqual(-1e-9);
          expect(y).toBeLessThanOrEqual(1 + 1e-9);
        }
      }
    }
  });
});
