import { describe, expect, it } from "vitest";
import { CHARACTERS, SOUNDERS, SOUNDS, TALK, type Talker } from "./lexicon";
import { detectMood, toText, translate } from "./translate";

describe("detectMood", () => {
  it.each([
    ["오늘 너무 슬퍼ㅠㅠ", "sad"],
    ["ㅠㅠ", "sad"],
    ["시험 망했어", "sad"],
    ["무서워 어떡해", "scared"],
    ["배고파요", "hungry"],
    ["완전 신나ㅋㅋ", "joy"],
    ["헉 대박", "surprised"],
    ["진짜 짜증나", "angry"],
    ["어디 갈래?", "question"],
    ["학교에 간다", "plain"],
  ])("%s → %s", (s, mood) => expect(detectMood(s)).toBe(mood));
});

describe("translate", () => {
  it("같은 입력은 같은 결과", () => {
    const a = translate("오늘 너무 배고파요 ㅠㅠ 맛있는 거 먹고 싶다!", "usagi");
    const b = translate("오늘 너무 배고파요 ㅠㅠ 맛있는 거 먹고 싶다!", "usagi");
    expect(a).toEqual(b);
  });

  it("빈 입력·공백·기호만이면 빈 결과", () => {
    expect(translate("", "chiikawa")).toEqual([]);
    expect(translate("   \n ", "usagi")).toEqual([]);
    expect(translate("...!!??", "hachiware")).toEqual([]);
  });

  it("non-hangul — 영어·숫자만 있어도 소리가 나온다", () => {
    expect(translate("hello 123", "chiikawa")[0].tokens.length).toBeGreaterThan(0);
  });

  it("ㅠㅠ·ㅋㅋ 뒤에서도 문장을 나눈다", () => {
    expect(translate("배고파요 ㅠㅠ 맛있는 거 먹고 싶다!", "chiikawa").map((s) => s.source)).toEqual([
      "배고파요 ㅠㅠ",
      "맛있는 거 먹고 싶다!",
    ]);
  });

  it("하치와레 — 끝의 ㅠㅠ 는 남기고 어미는 바꾼다", () => {
    const [s] = translate("배고파요 ㅠㅠ", "hachiware");
    expect(s.tokens).toContain("배고파 ㅠㅠ");
  });

  it("문장을 나눈다", () => {
    expect(translate("안녕! 뭐 해? 졸려…", "chiikawa").map((s) => s.source)).toEqual([
      "안녕!",
      "뭐 해?",
      "졸려…",
    ]);
  });

  it("소리만 내는 친구들의 토막은 각자 사전 안의 소리다(끝 문장부호 빼고)", () => {
    for (const who of SOUNDERS) {
      const all = new Set(Object.values(SOUNDS[who]).flat().map(bare));
      for (const s of translate("배고파! 무서워ㅠ 좋아 ㅋㅋ 왜?", who)) {
        for (const t of s.tokens) expect(all.has(bare(t))).toBe(true);
      }
    }
  });

  it("caps tokens — 긴 문장도 토막은 6개까지", () => {
    const long = "가".repeat(600);
    expect(translate(long, "usagi")[0].tokens.length).toBeLessThanOrEqual(6);
  });

  it("원문 끝의 ! ? 를 살린다", () => {
    expect(toText(translate("뭐야?", "usagi")).endsWith("?")).toBe(true);
    expect(toText(translate("좋아!!", "chiikawa")).endsWith("!!")).toBe(true);
  });

  it("하치와레는 원문 낱말이 남는다", () => {
    const text = toText(translate("오늘 떡볶이 먹으러 가자", "hachiware"));
    expect(text).toContain("떡볶이");
  });

  it("hachiware endings — 존댓말이 반말로 깔끔하게", () => {
    const body = (s: string) => translate(s, "hachiware")[0].tokens.find((t) => t.includes(s.slice(0, 2)))!;
    expect(body("이건 사과예요")).toContain("사과야");
    expect(body("정말 감사합니다")).toContain("감사해");
    expect(body("배고파요")).toContain("배고파");
    expect(body("배고파요")).not.toContain("요");
  });

  it("말하는 친구들의 말버릇은 각자 사전 안에 있다", () => {
    for (const who of Object.keys(TALK) as Talker[]) {
      const pool = new Set(Object.values(TALK[who].phrases).flatMap((m) => [...m.before, ...m.after]));
      const [s] = translate("완전 신나!", who);
      const extras = s.tokens.filter((t) => !t.includes("신나"));
      for (const t of extras) expect(pool.has(t)).toBe(true);
    }
  });

  it("일곱 친구 모두 통역된다", () => {
    expect(CHARACTERS).toHaveLength(7);
    for (const { id } of CHARACTERS) expect(translate("오늘 너무 배고파요", id)[0].tokens.length).toBeGreaterThan(0);
  });

  it("밤만쥬는 말수가 적다 — 토막 3개까지", () => {
    expect(translate("가".repeat(100), "kurimanju")[0].tokens.length).toBeLessThanOrEqual(3);
  });

  it("모몽가·랏코도 존댓말을 반말로", () => {
    const body = (s: string, who: Talker) => translate(s, who)[0].tokens.find((t) => t.includes(s.slice(0, 2)))!;
    expect(body("간식 주세요", "momonga")).toContain("간식 주셔");
    expect(body("감사합니다", "rakko")).toContain("감사해.");
  });

  it.each([
    ["배고파", "배고파요—!"],
    ["먹고 싶다", "먹고 싶어요—!"],
    ["오늘 갔다", "오늘 갔어요—!"],
    ["이건 사과야", "이건 사과예요—!"],
    ["감사합니다", "감사합니다—!"],
    ["뭐 해?", "뭐 해요—?"],
  ])("시사 — 반말을 존댓말로, 끝은 늘인다: %s → %s", (s, want) => {
    expect(translate(s, "shisa")[0].tokens).toContain(want);
  });
});

function bare(t: string) {
  return t.replace(/[!?…~.]+$/u, "");
}
