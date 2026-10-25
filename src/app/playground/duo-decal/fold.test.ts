import { describe, expect, it } from "vitest";

import { angleFor, coverCrop, drawDecal, isShut, otherSide } from "./fold";

describe("angleFor", () => {
  it("다 펼치면 0도, 다 닫으면 180도", () => {
    expect(angleFor(100)).toBe(0);
    expect(angleFor(0)).toBe(180);
    expect(angleFor(50)).toBe(90);
  });

  it("범위를 넘는 값은 끝에 붙는다", () => {
    expect(angleFor(140)).toBe(0);
    expect(angleFor(-5)).toBe(180);
  });
});

describe("isShut / otherSide", () => {
  it("거의 다 닫혀야 찍힌다", () => {
    expect(isShut(0)).toBe(true);
    expect(isShut(1)).toBe(true);
    expect(isShut(3)).toBe(false);
  });

  it("반대쪽", () => {
    expect(otherSide("left")).toBe("right");
    expect(otherSide("right")).toBe("left");
  });
});

describe("coverCrop", () => {
  it("가로로 긴 사진은 양옆을 똑같이 잘라낸다", () => {
    // 2000×1000 을 1.4:1 상자에 → 높이 다 쓰고 가로 1400 만
    const c = coverCrop(2000, 1000, 1400, 1000);
    expect(c.sw).toBeCloseTo(1400);
    expect(c.sh).toBeCloseTo(1000);
    expect(c.sx).toBeCloseTo(300);
    expect(c.sy).toBeCloseTo(0);
  });

  it("세로 사진은 위아래를 똑같이 잘라낸다", () => {
    const c = coverCrop(1000, 2000, 1400, 1000);
    expect(c.sw).toBeCloseTo(1000);
    expect(c.sh).toBeCloseTo(1000 / 1.4);
    expect(c.sy).toBeCloseTo((2000 - 1000 / 1.4) / 2);
  });
});

/** 캔버스 대신 호출만 적어 두는 가짜 ctx. */
function fakeCtx() {
  const calls: string[] = [];
  const ctx = new Proxy(
    {},
    {
      get: (_, name: string) =>
        (...args: unknown[]) =>
          calls.push(`${name}(${args.filter((a) => typeof a === "number").join(",")})`),
    },
  ) as unknown as CanvasRenderingContext2D;
  return { ctx, calls };
}

describe("drawDecal", () => {
  const img = { width: 1400, height: 1000 } as unknown as HTMLImageElement;

  it("안 찍혔으면 그림 한 장만 깐다", () => {
    const { ctx, calls } = fakeCtx();
    drawDecal(ctx, img, 1400, 1000, false, "right");
    expect(calls).toEqual(["drawImage(0,0,1400,1000,0,0,1400,1000)"]);
  });

  it("오른쪽을 찍으면 왼쪽 반에 뒤집은 그림을 덮는다", () => {
    const { ctx, calls } = fakeCtx();
    drawDecal(ctx, img, 1400, 1000, true, "right");
    expect(calls).toContain("rect(0,0,700,1000)");
    expect(calls).toContain("scale(-1,1)");
  });

  it("한쪽에만 넣으면 그 반 칸에만 그리고 나머지는 빈 종이", () => {
    const { ctx, calls } = fakeCtx();
    drawDecal(ctx, img, 1400, 1000, false, "right", true);
    // 700×1000 칸에 맞춰 1400×1000 사진의 가운데 700 폭만 쓴다
    expect(calls).toEqual(["fillRect(0,0,1400,1000)", "drawImage(350,0,700,1000,700,0,700,1000)"]);
  });

  it("한쪽에만 넣고 찍으면 반대쪽 반에 뒤집어 덮는다", () => {
    const { ctx, calls } = fakeCtx();
    drawDecal(ctx, img, 1400, 1000, true, "right", true);
    expect(calls).toContain("rect(0,0,700,1000)");
    expect(calls.at(-2)).toBe("drawImage(350,0,700,1000,700,0,700,1000)");
  });

  it("왼쪽을 찍으면 오른쪽 반에 덮는다", () => {
    const { ctx, calls } = fakeCtx();
    drawDecal(ctx, img, 1400, 1000, true, "left");
    expect(calls).toContain("rect(700,0,700,1000)");
  });
});
