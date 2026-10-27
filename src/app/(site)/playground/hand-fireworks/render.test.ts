import { describe, it, expect } from "vitest";
import { drawHands, drawWorld } from "./render";
import { createWorld, type Flash, type Particle, type World } from "./firework";
import { coverRect } from "./viewport";
import type { HandState } from "./gesture";

/**
 * 캔버스 대역. 실제로 그림이 나오는지는 여기서 알 수 없지만, «무엇을 어떤 순서로
 * 그리라고 시켰는가»는 알 수 있다. 섬광은 0.25초만 살아서 사람 눈으로 확인하기
 * 어려운 물건이라, 이쪽이라도 고정해 둔다.
 */
function fakeCtx() {
  const calls: string[] = [];
  const ctx = {
    calls,
    globalCompositeOperation: "",
    lineCap: "",
    lineWidth: 0,
    strokeStyle: "" as unknown,
    fillStyle: "" as unknown,
    clearRect: () => calls.push("clearRect"),
    beginPath: () => {},
    moveTo: () => {},
    lineTo: () => {},
    arc: () => {},
    stroke: () => calls.push("stroke"),
    fill: () => calls.push("fill"),
    createRadialGradient: (...args: number[]) => {
      calls.push(`gradient(r=${args[5].toFixed(1)})`);
      return { addColorStop: () => {} };
    },
  };
  return ctx as unknown as CanvasRenderingContext2D & { calls: string[] };
}

const VP = { w: 600, h: 400 };

const particle = (over: Partial<Particle> = {}): Particle => ({
  x: 0.5,
  y: 0.5,
  px: 0.49,
  py: 0.5,
  vx: 0,
  vy: 0,
  life: 1,
  maxLife: 1,
  hue: 30,
  size: 3,
  gravity: 1,
  drag: 1,
  twinkle: false,
  ...over,
});

const flash = (over: Partial<Flash> = {}): Flash => ({
  x: 0.5,
  y: 0.3,
  hue: 30,
  life: 0.25,
  maxLife: 0.25,
  radius: 0.3,
  ...over,
});

const world = (over: Partial<World> = {}): World => ({ ...createWorld(), ...over });

describe("drawWorld", () => {
  it("매 프레임 캔버스를 지우고 가산 합성으로 그린다", () => {
    const ctx = fakeCtx();
    drawWorld(ctx, world({ particles: [particle()] }), VP, 0);
    expect(ctx.calls[0]).toBe("clearRect");
    // 다 그린 뒤에는 되돌려 놓는다. 안 그러면 다음에 캔버스를 쓰는 쪽이 물든다.
    expect(ctx.globalCompositeOperation).toBe("source-over");
  });

  it("섬광을 알갱이보다 먼저 그린다 — 빛이 밑에 깔려야 폭발로 보인다", () => {
    const ctx = fakeCtx();
    drawWorld(ctx, world({ flashes: [flash()], particles: [particle()] }), VP, 0);
    const gradientAt = ctx.calls.findIndex((c) => c.startsWith("gradient"));
    const strokeAt = ctx.calls.indexOf("stroke");
    expect(gradientAt).toBeGreaterThanOrEqual(0);
    expect(gradientAt).toBeLessThan(strokeAt);
  });

  it("섬광 반지름은 화면 높이 기준이다", () => {
    const ctx = fakeCtx();
    drawWorld(ctx, world({ flashes: [flash({ radius: 0.3 })] }), VP, 0);
    // 갓 터진 섬광은 반지름의 1.0배(1.35 - 0.35). 400 × 0.3 = 120
    expect(ctx.calls).toContain("gradient(r=120.0)");
  });

  it("사그라든 섬광은 아예 안 그린다", () => {
    const ctx = fakeCtx();
    drawWorld(ctx, world({ flashes: [flash({ life: 0.001 })] }), VP, 0);
    expect(ctx.calls.some((c) => c.startsWith("gradient"))).toBe(false);
  });

  it("올라가는 불꽃탄은 꼬리·빛무리·탄두 세 겹으로 그린다", () => {
    const ctx = fakeCtx();
    const shell = {
      x: 0.5,
      y: 0.6,
      px: 0.5,
      py: 0.62,
      vx: 0,
      vy: -0.7,
      hue: 30,
      power: 0.7,
      kind: "peony" as const,
      trailDue: 0,
    };
    drawWorld(ctx, world({ shells: [shell] }), VP, 0);
    // 빛무리가 없으면 아무리 굵게 그어도 «점»으로 보인다
    expect(ctx.calls.some((c) => c.startsWith("gradient"))).toBe(true);
    expect(ctx.calls.filter((c) => c === "fill")).toHaveLength(2);
    expect(ctx.calls).toContain("stroke");
  });

  it("다 꺼진 알갱이는 건너뛴다", () => {
    const ctx = fakeCtx();
    drawWorld(ctx, world({ particles: [particle({ life: 0.001 })] }), VP, 0);
    expect(ctx.calls).not.toContain("stroke");
  });
});

describe("drawHands", () => {
  const hand = (over: Partial<HandState> = {}): HandState => ({
    key: "Right",
    openness: 0.5,
    palm: { x: 0.5, y: 0.5 },
    cocked: false,
    cooldown: 0,
    ...over,
  });

  it("손 하나에 고리 두 개 — 바탕과 펼침도", () => {
    const ctx = fakeCtx();
    drawHands(ctx, [hand()], coverRect(VP.w, VP.h, 4 / 3), true);
    expect(ctx.calls.filter((c) => c === "stroke")).toHaveLength(2);
  });

  it("잠긴 손은 색이 다르다 — 장전됐다는 신호", () => {
    const cocked = fakeCtx();
    const open = fakeCtx();
    const rect = coverRect(VP.w, VP.h, 4 / 3);
    drawHands(cocked, [hand({ cocked: true })], rect, true);
    drawHands(open, [hand({ cocked: false })], rect, true);
    expect(cocked.strokeStyle).not.toBe(open.strokeStyle);
  });
});
