import { describe, expect, it } from "vitest";
import { isAllowedEmail, normalizeEmail } from "./allowlist";

const ALLOWLIST = ["joowonkoh0505@gmail.com"];

describe("normalizeEmail", () => {
  it("앞뒤 공백과 대소문자를 지운다", () => {
    expect(normalizeEmail("  JooWon@Gmail.COM ")).toBe("joowon@gmail.com");
  });

  it("null과 undefined를 빈 문자열로 만든다", () => {
    expect(normalizeEmail(null)).toBe("");
    expect(normalizeEmail(undefined)).toBe("");
  });
});

describe("isAllowedEmail", () => {
  it("등록된 이메일을 통과시킨다", () => {
    expect(isAllowedEmail("joowonkoh0505@gmail.com", ALLOWLIST)).toBe(true);
  });

  it("대소문자가 달라도 통과시킨다", () => {
    expect(isAllowedEmail("JoowonKoh0505@Gmail.com", ALLOWLIST)).toBe(true);
  });

  it("등록되지 않은 이메일을 막는다", () => {
    expect(isAllowedEmail("attacker@gmail.com", ALLOWLIST)).toBe(false);
  });

  it("세션이 없어 이메일이 비면 막는다", () => {
    expect(isAllowedEmail(null, ALLOWLIST)).toBe(false);
    expect(isAllowedEmail("", ALLOWLIST)).toBe(false);
    expect(isAllowedEmail("   ", ALLOWLIST)).toBe(false);
  });

  it("허용목록이 비면 아무도 통과시키지 않는다", () => {
    expect(isAllowedEmail("joowonkoh0505@gmail.com", [])).toBe(false);
  });

  it("부분 일치로는 통과하지 못한다", () => {
    expect(isAllowedEmail("joowonkoh0505@gmail.com.evil.com", ALLOWLIST)).toBe(
      false,
    );
    expect(isAllowedEmail("joowonkoh0505", ALLOWLIST)).toBe(false);
  });
});
