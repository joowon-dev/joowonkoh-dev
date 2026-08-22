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
  it("모든 언어가 같은 키를 갖는다 — 하나라도 빠지면 그 자리가 빈다", () => {
    const koKeys = Object.keys(t("ko")).sort();
    for (const lang of LANGS) {
      expect(Object.keys(t(lang.code)).sort()).toEqual(koKeys);
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

  it("모르는 언어면 한국어로 떨어진다 — 이 사이트의 기본 언어다", () => {
    expect(resolveLang("system", ["sw-KE"])).toBe("ko");
    expect(resolveLang("system", [])).toBe("ko");
  });
});
