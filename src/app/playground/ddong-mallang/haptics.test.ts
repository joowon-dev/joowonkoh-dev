import { describe, it, expect, afterEach, vi } from "vitest";
import { BUZZ_DONE, BUZZ_PRAISE, BUZZ_TICK, buzz } from "./haptics";

const original = globalThis.navigator;

/** navigator를 갈아끼운다. vibrate가 undefined면 미지원 기기를 흉내낸다. */
function stubNavigator(vibrate?: unknown) {
  Object.defineProperty(globalThis, "navigator", {
    value: vibrate === undefined ? {} : { vibrate },
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  Object.defineProperty(globalThis, "navigator", {
    value: original,
    configurable: true,
    writable: true,
  });
});

describe("buzz", () => {
  it("지원하면 그 패턴으로 진동시킨다", () => {
    const vibrate = vi.fn(() => true);
    stubNavigator(vibrate);
    expect(buzz(BUZZ_TICK)).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(BUZZ_TICK);
  });

  it("배열 패턴도 그대로 넘긴다", () => {
    const vibrate = vi.fn(() => true);
    stubNavigator(vibrate);
    buzz(BUZZ_PRAISE);
    expect(vibrate).toHaveBeenCalledWith(BUZZ_PRAISE);
  });

  it("미지원 기기에서는 아무 일도 없다 — iOS 사파리", () => {
    stubNavigator(undefined);
    expect(() => buzz(BUZZ_DONE)).not.toThrow();
    expect(buzz(BUZZ_DONE)).toBe(false);
  });

  it("vibrate가 던져도 삼킨다", () => {
    stubNavigator(() => {
      throw new Error("차단됨");
    });
    expect(buzz(BUZZ_TICK)).toBe(false);
  });
});
