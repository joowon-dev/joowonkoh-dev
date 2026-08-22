import { describe, expect, it } from "vitest";
import { DURATIONS, SIZES, pickMimeType } from "./encode";

describe("SIZES", () => {
  it("레퍼런스와 같은 다섯 가지", () => {
    expect(SIZES).toHaveLength(5);
  });

  it("정사각 세 가지와 세로·가로가 있다", () => {
    const squares = SIZES.filter((s) => s.w === s.h);
    expect(squares).toHaveLength(3);
    expect(SIZES.some((s) => s.w === 1080 && s.h === 1920)).toBe(true);
    expect(SIZES.some((s) => s.w === 1920 && s.h === 1080)).toBe(true);
  });

  it("모든 변이 짝수다 — 홀수면 인코더가 거부하는 경우가 있다", () => {
    for (const s of SIZES) {
      expect(s.w % 2).toBe(0);
      expect(s.h % 2).toBe(0);
    }
  });
});

describe("DURATIONS", () => {
  it("레퍼런스와 같은 여섯 가지", () => {
    expect(DURATIONS).toEqual([10, 15, 20, 30, 45, 60]);
  });
});

describe("pickMimeType", () => {
  it("mp4를 지원하면 mp4", () => {
    const got = pickMimeType((type) => type.includes("mp4"));
    expect(got.mimeType).toContain("mp4");
    expect(got.ext).toBe("mp4");
  });

  it("mp4가 안 되면 webm으로 떨어진다", () => {
    const got = pickMimeType((type) => type.includes("webm"));
    expect(got.mimeType).toContain("webm");
    expect(got.ext).toBe("webm");
  });

  it("아무것도 지원 안 하면 빈 mimeType으로 브라우저 기본에 맡긴다", () => {
    const got = pickMimeType(() => false);
    expect(got.mimeType).toBe("");
    expect(got.ext).toBe("webm");
  });

  it("mp4와 webm이 둘 다 되면 mp4를 고른다 — 공유가 쉽다", () => {
    const got = pickMimeType(() => true);
    expect(got.ext).toBe("mp4");
  });
});
