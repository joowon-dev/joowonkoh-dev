import { describe, expect, it } from "vitest";
import { HACHIWARE, MEANINGS, SOUNDS } from "./lexicon";
import { translate, toText } from "./translate";
import { untranslate } from "./untranslate";

describe("untranslate", () => {
  it("하치와레 감탄사와 치이카와·우사기 소리는 겹치지 않는다", () => {
    const sounds = new Set([...Object.values(SOUNDS.chiikawa), ...Object.values(SOUNDS.usagi)].flat());
    for (const { before, after } of Object.values(HACHIWARE)) {
      for (const p of [...before, ...after]) expect(sounds.has(p)).toBe(false);
    }
  });

  it("빈 입력·공백이면 빈 결과", () => {
    expect(untranslate("")).toEqual({ who: null, parts: [] });
    expect(untranslate("  \n ")).toEqual({ who: null, parts: [] });
  });

  it("우사기 소리 → 우사기, 화남", () => {
    const r = untranslate("우라아앗!! 이야하!!");
    expect(r.who).toBe("usagi");
    expect(r.parts).toHaveLength(1);
    expect(r.parts[0].mood).toBe("angry");
    expect(MEANINGS.angry).toContain(r.parts[0].meaning);
  });

  it("치이카와 소리 → 치이카와, 슬픔", () => {
    const r = untranslate("흐에에… 우…");
    expect(r.who).toBe("chiikawa");
    expect(r.parts[0].mood).toBe("sad");
  });

  it("감정이 바뀌면 나눈다", () => {
    const r = untranslate("흐에에… 우… 꼬르륵… 냠…");
    expect(r.parts.map((p) => p.mood)).toEqual(["sad", "hungry"]);
  });

  it("하치와레 감탄사를 걷어 내고 남은 말은 그대로", () => {
    const r = untranslate("와아~ 오늘 떡볶이 먹으러 가자~ 최고야~");
    expect(r.who).toBe("hachiware");
    expect(r.parts.map((p) => p.meaning).join(" ")).toBe("오늘 떡볶이 먹으러 가자");
  });

  it("여러 낱말짜리 감탄사도 걷어 낸다", () => {
    const r = untranslate("시험 망했어… 괜찮아 괜찮아… 어떻게든 되라─!");
    expect(r.parts.map((p) => p.meaning).join(" ")).toBe("시험 망했어…");
  });

  it("모르는 소리는 문장부호로 짐작", () => {
    expect(untranslate("뿌잉?").parts[0].mood).toBe("question");
  });

  it("같은 입력은 같은 결과", () => {
    expect(untranslate("야하! 푸루루루")).toEqual(untranslate("야하! 푸루루루"));
  });

  it("앞으로 통역한 치이카와 말을 거꾸로 하면 감정이 돌아온다", () => {
    for (const s of ["너무 슬퍼ㅠㅠ", "배고파", "무서워 어떡해", "헉 대박"]) {
      const there = translate(s, "chiikawa");
      const back = untranslate(toText(there));
      expect(back.who).toBe("chiikawa");
      expect(back.parts[0].mood).toBe(there[0].mood);
    }
  });
});
