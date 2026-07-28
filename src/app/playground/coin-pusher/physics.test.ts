import { describe, it, expect } from "vitest";
import {
  COIN_RADIUS,
  createCoin,
  resolvePair,
  clampToWalls,
  type Board,
} from "./physics";

const board: Board = { width: 400, fallLine: 320 };

describe("createCoin", () => {
  it("기본값은 중립 코인이다", () => {
    const c = createCoin({ id: 1, x: 10, y: 20 });
    expect(c.ownerIndex).toBe(-1);
    expect(c.kind).toBe("neutral");
    expect(c.vx).toBe(0);
    expect(c.vy).toBe(0);
    expect(c.mass).toBe(1);
  });

  it("전달한 값으로 덮어쓴다", () => {
    const c = createCoin({ id: 2, x: 0, y: 0, ownerIndex: 3, kind: "player", mass: 2 });
    expect(c.ownerIndex).toBe(3);
    expect(c.kind).toBe("player");
    expect(c.mass).toBe(2);
  });
});

describe("resolvePair", () => {
  it("겹친 코인을 반지름 두 배까지 밀어낸다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100 });
    const b = createCoin({ id: 2, x: 110, y: 100 });
    resolvePair(a, b);
    expect(Math.hypot(b.x - a.x, b.y - a.y)).toBeCloseTo(COIN_RADIUS * 2, 5);
  });

  it("떨어져 있으면 아무것도 하지 않는다", () => {
    const a = createCoin({ id: 1, x: 0, y: 0 });
    const b = createCoin({ id: 2, x: 200, y: 0 });
    resolvePair(a, b);
    expect(a.x).toBe(0);
    expect(b.x).toBe(200);
  });

  it("정면 충돌에서 운동량이 보존된다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100, vx: 50 });
    const b = createCoin({ id: 2, x: 120, y: 100, vx: -50 });
    const before = a.mass * a.vx + b.mass * b.vx;
    resolvePair(a, b);
    const after = a.mass * a.vx + b.mass * b.vx;
    expect(after).toBeCloseTo(before, 5);
  });

  it("다가오는 코인끼리는 서로 멀어지는 속도가 된다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100, vx: 50 });
    const b = createCoin({ id: 2, x: 120, y: 100, vx: -50 });
    resolvePair(a, b);
    expect(a.vx).toBeLessThan(0);
    expect(b.vx).toBeGreaterThan(0);
  });

  it("멀어지는 중이면 속도를 바꾸지 않는다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100, vx: -30 });
    const b = createCoin({ id: 2, x: 120, y: 100, vx: 30 });
    resolvePair(a, b);
    expect(a.vx).toBe(-30);
    expect(b.vx).toBe(30);
  });

  it("완전히 같은 위치여도 NaN이 나오지 않는다", () => {
    const a = createCoin({ id: 1, x: 100, y: 100 });
    const b = createCoin({ id: 2, x: 100, y: 100 });
    resolvePair(a, b);
    expect(Number.isFinite(a.x)).toBe(true);
    expect(Number.isFinite(b.x)).toBe(true);
    expect(a.x).not.toBe(b.x);
  });

  it("무거운 코인이 가벼운 코인보다 덜 밀린다", () => {
    const heavy = createCoin({ id: 1, x: 100, y: 100, mass: 2.5 });
    const light = createCoin({ id: 2, x: 110, y: 100, mass: 1 });
    const heavyStart = heavy.x;
    const lightStart = light.x;
    resolvePair(heavy, light);
    expect(Math.abs(heavy.x - heavyStart)).toBeLessThan(Math.abs(light.x - lightStart));
  });
});

describe("clampToWalls", () => {
  it("왼쪽 벽을 뚫지 않는다", () => {
    const c = createCoin({ id: 1, x: -5, y: 100, vx: -40 });
    clampToWalls(c, board);
    expect(c.x).toBe(COIN_RADIUS);
    expect(c.vx).toBeGreaterThan(0);
  });

  it("오른쪽 벽을 뚫지 않는다", () => {
    const c = createCoin({ id: 1, x: 410, y: 100, vx: 40 });
    clampToWalls(c, board);
    expect(c.x).toBe(board.width - COIN_RADIUS);
    expect(c.vx).toBeLessThan(0);
  });

  it("가운데 코인은 건드리지 않는다", () => {
    const c = createCoin({ id: 1, x: 200, y: 100, vx: 40 });
    clampToWalls(c, board);
    expect(c.x).toBe(200);
    expect(c.vx).toBe(40);
  });
});
