import { describe, expect, it } from "vitest";
import { decompose, isHangulWord, isOnTrack, keystrokesOf, toJamo } from "./hangul";

describe("decompose", () => {
  it("받침 없는 음절은 초성과 중성으로 쪼갠다", () => {
    expect(decompose("가")).toEqual(["ㄱ", "ㅏ"]);
  });

  it("받침이 있으면 셋으로 쪼갠다", () => {
    expect(decompose("각")).toEqual(["ㄱ", "ㅏ", "ㄱ"]);
  });

  it("겹자모는 쪼개지 않고 한 덩어리로 둔다", () => {
    // ㅘ를 ㅗ+ㅏ로 미리 쪼개면 타수와 조합 판정이 서로 다른 규칙을 쓰게 된다.
    expect(decompose("과")).toEqual(["ㄱ", "ㅘ"]);
    expect(decompose("닭")).toEqual(["ㄷ", "ㅏ", "ㄺ"]);
  });

  it("완성형이 아닌 낱자는 그대로 둔다", () => {
    expect(decompose("ㅅ")).toEqual(["ㅅ"]);
  });
});

describe("keystrokesOf", () => {
  it("받침 없는 두 글자는 네 타다", () => {
    expect(keystrokesOf("바다")).toBe(4);
  });

  it("받침은 한 타를 더한다", () => {
    expect(keystrokesOf("강")).toBe(3);
  });

  it("쌍자음은 시프트라 한 타다", () => {
    expect(keystrokesOf("까")).toBe(2);
  });

  it("이중모음과 겹받침은 두 타다", () => {
    expect(keystrokesOf("과")).toBe(3); // ㄱ ㅗ ㅏ
    expect(keystrokesOf("닭")).toBe(4); // ㄷ ㅏ ㄹ ㄱ
  });

  it("세 글자 낱말의 타수는 낱말마다 다르다", () => {
    // 이 차이 때문에 파워를 음절이 아니라 타수로 잰다
    expect(keystrokesOf("아이들")).toBe(7);
    expect(keystrokesOf("닭갈비")).toBe(9);
  });
});

describe("isOnTrack", () => {
  it("빈 값은 아직 아무것도 틀리지 않았다", () => {
    expect(isOnTrack("", "사과잼")).toBe(true);
  });

  it("앞부분이 맞으면 통과한다", () => {
    expect(isOnTrack("사", "사과잼")).toBe(true);
    expect(isOnTrack("사과", "사과잼")).toBe(true);
    expect(isOnTrack("사과잼", "사과잼")).toBe(true);
  });

  it("조합 중인 낱자를 오타로 보지 않는다", () => {
    // 한글 IME는 "ㅅ" → "사" 순서로 값을 흘린다
    expect(isOnTrack("ㅅ", "사과잼")).toBe(true);
    expect(isOnTrack("사ㄱ", "사과잼")).toBe(true);
  });

  it("이중모음이 덜 조합된 중간 상태를 통과시킨다", () => {
    // "과"를 치는 도중에는 "고"가 먼저 보인다
    expect(isOnTrack("사고", "사과잼")).toBe(true);
  });

  it("겹받침·쌍받침이 덜 조합된 중간 상태를 통과시킨다", () => {
    expect(isOnTrack("달", "닭갈비")).toBe(true);
    expect(isOnTrack("박", "밖에서")).toBe(true);
  });

  it("다른 글자를 치면 벗어난 것이다", () => {
    expect(isOnTrack("바", "사과잼")).toBe(false);
    expect(isOnTrack("사자", "사과잼")).toBe(false);
  });

  it("목표보다 길면 벗어난 것이다", () => {
    expect(isOnTrack("사과잼과", "사과잼")).toBe(false);
  });
});

describe("isHangulWord", () => {
  it("완성형만 통과한다", () => {
    expect(isHangulWord("사과잼")).toBe(true);
    expect(isHangulWord("사과ㅈ")).toBe(false);
    expect(isHangulWord("사과 잼")).toBe(false);
    expect(isHangulWord("")).toBe(false);
  });
});

describe("toJamo", () => {
  it("여러 글자를 이어서 편다", () => {
    expect(toJamo("한글")).toEqual(["ㅎ", "ㅏ", "ㄴ", "ㄱ", "ㅡ", "ㄹ"]);
  });
});
