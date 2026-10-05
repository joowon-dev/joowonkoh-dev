import { describe, expect, it } from "vitest";
import { BITES, POUR_AT, eat, initialEat, type EatState } from "./eat";

function bites(state: EatState, n: number): EatState {
  let s = state;
  for (let i = 0; i < n; i++) s = eat(s, { type: "bite" });
  return s;
}

describe("고기리 먹기 순서", () => {
  it("처음엔 나온 그대로 — 면이 다 있고 육수는 없다", () => {
    expect(initialEat).toEqual({ noodles: BITES, broth: 0, phase: "dry" });
  });

  it("한 젓가락씩 줄다가 1/3 남으면 육수를 부을 차례가 된다", () => {
    const s = bites(initialEat, BITES - POUR_AT);
    expect(s.noodles).toBe(POUR_AT);
    expect(s.phase).toBe("pour");
  });

  it("육수를 붓기 전엔 더 먹지 않는다", () => {
    const s = bites(initialEat, BITES - POUR_AT);
    expect(eat(s, { type: "bite" })).toEqual(s);
  });

  it("육수가 다 차야 다시 먹는다", () => {
    let s = bites(initialEat, BITES - POUR_AT);
    s = eat(s, { type: "pour", amount: 0.6 });
    expect(s.phase).toBe("pour");
    s = eat(s, { type: "pour", amount: 0.6 });
    expect(s.broth).toBe(1);
    expect(s.phase).toBe("broth");
  });

  it("말아서 마저 먹으면 그릇이 빈다", () => {
    let s = bites(initialEat, BITES - POUR_AT);
    s = eat(s, { type: "pour", amount: 1 });
    s = bites(s, POUR_AT);
    expect(s).toMatchObject({ noodles: 0, phase: "done" });
    expect(eat(s, { type: "bite" })).toEqual(s);
  });

  it("마른 그릇엔 육수를 붓지 않는다", () => {
    expect(eat(initialEat, { type: "pour", amount: 1 })).toEqual(initialEat);
  });

  it("한 그릇 더 하면 처음으로", () => {
    const s = bites(initialEat, 4);
    expect(eat(s, { type: "reset" })).toEqual(initialEat);
  });
});
