import { describe, it, expect } from "vitest";
import { createRng, randRange, randInt, pick } from "./random";

describe("createRng", () => {
  it("같은 시드는 같은 수열을 만든다", () => {
    const a = createRng(12345);
    const b = createRng(12345);
    const seqA = [a(), a(), a(), a(), a()];
    const seqB = [b(), b(), b(), b(), b()];
    expect(seqA).toEqual(seqB);
  });

  it("다른 시드는 다른 수열을 만든다", () => {
    const a = createRng(1);
    const b = createRng(2);
    expect([a(), a(), a()]).not.toEqual([b(), b(), b()]);
  });

  it("항상 0 이상 1 미만이다", () => {
    const rng = createRng(99);
    for (let i = 0; i < 1000; i++) {
      const v = rng();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it("같은 값만 반복하지 않는다", () => {
    const rng = createRng(7);
    const values = new Set(Array.from({ length: 100 }, () => rng()));
    expect(values.size).toBeGreaterThan(90);
  });
});

describe("randRange", () => {
  it("min 이상 max 미만을 만든다", () => {
    const rng = createRng(3);
    for (let i = 0; i < 200; i++) {
      const v = randRange(rng, 10, 20);
      expect(v).toBeGreaterThanOrEqual(10);
      expect(v).toBeLessThan(20);
    }
  });
});

describe("randInt", () => {
  it("정수를 만들고 maxExclusive를 넘지 않는다", () => {
    const rng = createRng(4);
    for (let i = 0; i < 200; i++) {
      const v = randInt(rng, 0, 5);
      expect(Number.isInteger(v)).toBe(true);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(5);
    }
  });
});

describe("pick", () => {
  it("배열 안의 원소를 고른다", () => {
    const rng = createRng(5);
    const items = ["a", "b", "c"] as const;
    for (let i = 0; i < 50; i++) {
      expect(items).toContain(pick(rng, items));
    }
  });
});
