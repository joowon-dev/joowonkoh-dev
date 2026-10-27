import { describe, expect, it } from "vitest";
import { isHangulWord, keystrokesOf } from "./hangul";
import { WORDS } from "./words";

describe("낱말 목록", () => {
  it("1000개다", () => {
    expect(WORDS.length).toBe(1000);
  });

  it("전부 세 글자다", () => {
    // 길이가 섞이면 슛마다 조건이 달라진다. 어긴 것만 골라 보여준다.
    const wrong = WORDS.filter((w) => [...w].length !== 3);
    expect(wrong).toEqual([]);
  });

  it("전부 완성형 한글이다", () => {
    const wrong = WORDS.filter((w) => !isHangulWord(w));
    expect(wrong).toEqual([]);
  });

  it("중복이 없다", () => {
    const seen = new Set<string>();
    const dupes = WORDS.filter((w) => (seen.has(w) ? true : (seen.add(w), false)));
    expect(dupes).toEqual([]);
  });

  it("타수가 5~11 사이에 들어온다", () => {
    // 세 글자라도 타수는 다르다. 너무 벌어지면 파워 계산이 단어 운에 휘둘린다.
    const out = WORDS.filter((w) => {
      const k = keystrokesOf(w);
      return k < 5 || k > 11;
    });
    expect(out).toEqual([]);
  });
});
