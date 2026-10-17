import { describe, expect, it } from "vitest";
import { MAX_CHARS, decodeHash, encodeHash, splitChars, tidy } from "./message";

describe("링크에 싣는 글", () => {
  it("한글·이모지·줄바꿈이 그대로 돌아온다", () => {
    const text = "생일 축하해 🎂\n화성까지 배송 완료!";
    expect(decodeHash(encodeHash(text))).toBe(text);
  });

  it("해시는 주소에 그대로 붙일 수 있는 글자만 쓴다", () => {
    expect(encodeHash("하이?&=+/ 테스트")).toMatch(/^#m=[A-Za-z0-9_-]+$/);
  });

  it("글이 없거나 깨진 해시면 null", () => {
    expect(decodeHash("")).toBeNull();
    expect(decodeHash("#m=")).toBeNull();
    expect(decodeHash("#m=%%%")).toBeNull();
    expect(decodeHash("#m=_w")).toBeNull(); // 0xFF — UTF-8 이 아니다
  });

  it("너무 긴 글은 잘린다", () => {
    expect(splitChars(tidy("가".repeat(MAX_CHARS + 20)))).toHaveLength(MAX_CHARS);
  });

  it("이모지를 반쪽으로 쪼개지 않는다", () => {
    expect(splitChars("👨‍👩‍👧🚗")).toEqual(["👨‍👩‍👧", "🚗"]);
  });

  it("빈 줄 여러 개는 하나로 줄인다", () => {
    expect(tidy("  안녕\n\n\n\n잘 가  ")).toBe("안녕\n\n잘 가");
  });
});
