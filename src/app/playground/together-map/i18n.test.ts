import { describe, expect, it } from "vitest";
import { LANGS, resolveLang, t } from "./i18n";

describe("LANGS", () => {
  it("레퍼런스와 같은 9개 언어 + 시스템 기본", () => {
    expect(LANGS).toHaveLength(9);
    expect(LANGS.map((l) => l.code)).toContain("ko");
    expect(LANGS.map((l) => l.code)).toContain("en");
  });

  it("각 언어에 표시 이름이 있다", () => {
    for (const lang of LANGS) {
      expect(lang.label.length).toBeGreaterThan(0);
    }
  });
});

describe("t", () => {
  // DICT가 Record<Lang, Strings>로 타입이 잡혀 있어서, 키가 하나라도 빠지거나
  // 잘못 적히면 컴파일이 안 된다. 즉 이 테스트는 통과가 보장돼 있는 동어반복이라
  // "실제로 실패할 수 있는" 검증이 아니다 — 그래도 문서 삼아 남겨 둔다.
  it("모든 언어가 같은 키를 갖는다 — 타입이 이미 강제하므로 이 테스트 자체는 실패할 수 없다", () => {
    const koKeys = Object.keys(t("ko")).sort();
    for (const lang of LANGS) {
      expect(Object.keys(t(lang.code)).sort()).toEqual(koKeys);
    }
  });

  // 반면 {n} 같은 플레이스홀더는 타입 시스템에 보이지 않는 "그냥 문자열 안의 텍스트"라서
  // 번역하다가 실수로 지우거나 이름을 바꿔도 컴파일러도, 위의 키 검사도 못 잡는다.
  // 그래서 각 언어 문자열에서 {...} 토큰 집합을 뽑아 한국어(원본)와 정확히 같은지 비교한다.
  it("플레이스홀더({n} 등)가 모든 언어에서 그대로 살아 있다", () => {
    const placeholderTokens = (s: string) => {
      const matches = s.match(/\{[^}]*\}/g) ?? [];
      return matches.sort();
    };

    const ko = t("ko");
    for (const lang of LANGS) {
      if (lang.code === "ko") continue;
      const translated = t(lang.code);
      for (const key of Object.keys(ko) as (keyof typeof ko)[]) {
        expect(
          placeholderTokens(translated[key]),
          `${lang.code}.${key}`,
        ).toEqual(placeholderTokens(ko[key]));
      }
    }
  });

  it("빈 문자열인 항목이 없다", () => {
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(t(lang.code))) {
        expect(value, `${lang.code}.${key}`).not.toBe("");
      }
    }
  });

  it("한국어와 영어가 실제로 다르다", () => {
    expect(t("ko").title).not.toBe(t("en").title);
  });
});

describe("resolveLang", () => {
  it("직접 고르면 그것을 쓴다", () => {
    expect(resolveLang("ja", ["ko-KR"])).toBe("ja");
  });

  it("시스템 기본이면 브라우저 언어를 따른다", () => {
    expect(resolveLang("system", ["ja-JP", "en-US"])).toBe("ja");
  });

  it("지역 코드가 붙어 있어도 알아본다", () => {
    expect(resolveLang("system", ["ko-KR"])).toBe("ko");
    expect(resolveLang("system", ["pt-BR"])).toBe("pt");
  });

  it("중국어는 간체와 번체를 가른다", () => {
    expect(resolveLang("system", ["zh-TW"])).toBe("zh-Hant");
    expect(resolveLang("system", ["zh-CN"])).toBe("zh-Hans");
  });

  it("홍콩·마카오도 번체로 묶인다", () => {
    // zh-TW만 테스트하면 정규식에서 hk|mo를 빼도 안 걸린다 — 따로 확인한다
    expect(resolveLang("system", ["zh-HK"])).toBe("zh-Hant");
    expect(resolveLang("system", ["zh-MO"])).toBe("zh-Hant");
  });

  it("모르는 언어면 한국어로 떨어진다 — 이 사이트의 기본 언어다", () => {
    expect(resolveLang("system", ["sw-KE"])).toBe("ko");
    expect(resolveLang("system", [])).toBe("ko");
  });
});
