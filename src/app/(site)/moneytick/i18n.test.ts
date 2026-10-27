import { describe, expect, it } from "vitest";

import { LANDING } from "./copy";
import { detectLang, LANGS, pagePath, playStoreUrl, redirectScript } from "./i18n";
import { formatMoney, SECONDS_PER_YEAR, tickDecimals } from "./money";
import { PRIVACY } from "./privacy/copy";

describe("detectLang", () => {
  it("브라우저 언어 목록에서 처음 맞는 것을 고른다", () => {
    expect(detectLang(["ko-KR", "en-US"])).toBe("ko");
    expect(detectLang(["fr-CA", "en"])).toBe("fr");
    expect(detectLang(["nl-NL", "de-DE"])).toBe("de");
    expect(detectLang(["pt-PT"])).toBe("pt");
    expect(detectLang(["es-419"])).toBe("es");
  });

  it("중국어는 번체 지역이면 번체, 아니면 간체", () => {
    expect(detectLang(["zh-TW"])).toBe("zh-hant");
    expect(detectLang(["zh-Hant-HK"])).toBe("zh-hant");
    expect(detectLang(["zh-HK"])).toBe("zh-hant");
    expect(detectLang(["zh-CN"])).toBe("zh-hans");
    expect(detectLang(["zh"])).toBe("zh-hans");
  });

  it("옛 인도네시아어 코드와 모르는 언어", () => {
    expect(detectLang(["in-ID"])).toBe("id");
    expect(detectLang(["nl-NL", "sv"])).toBe("en");
    expect(detectLang([])).toBe("en");
  });
});

describe("redirectScript", () => {
  /** 인라인 스크립트를 가짜 브라우저에서 돌려 어디로 보내는지 본다. */
  function run(opts: { languages: string[]; saved?: string; ua?: string; sub?: "" | "/privacy" }) {
    let replaced: string | null = null;
    const env = {
      navigator: {
        userAgent: opts.ua ?? "Mozilla/5.0 (iPhone)",
        languages: opts.languages,
        language: opts.languages[0],
      },
      localStorage: { getItem: () => opts.saved ?? null },
      location: {
        search: "?a=1",
        hash: "",
        replace: (to: string) => {
          replaced = to;
        },
      },
    };
    new Function("navigator", "localStorage", "location", redirectScript(opts.sub ?? ""))(
      env.navigator,
      env.localStorage,
      env.location,
    );
    return replaced;
  }

  it("한국어 브라우저는 그대로 둔다", () => {
    expect(run({ languages: ["ko-KR"] })).toBeNull();
  });

  it("다른 언어 브라우저는 그 언어 주소로 보낸다 (쿼리 유지)", () => {
    expect(run({ languages: ["ja-JP"] })).toBe("/moneytick/ja?a=1");
    expect(run({ languages: ["zh-TW"], sub: "/privacy" })).toBe("/moneytick/zh-hant/privacy?a=1");
    expect(run({ languages: ["sv-SE"] })).toBe("/moneytick/en?a=1");
  });

  it("직접 고른 언어가 브라우저 언어보다 먼저다", () => {
    expect(run({ languages: ["en-US"], saved: "ko" })).toBeNull();
    expect(run({ languages: ["ko-KR"], saved: "de" })).toBe("/moneytick/de?a=1");
  });

  it("검색 로봇은 보내지 않는다", () => {
    expect(run({ languages: ["en-US"], ua: "Mozilla/5.0 (compatible; Googlebot/2.1)" })).toBeNull();
  });
});

describe("주소", () => {
  it("한국어는 원래 주소, 나머지는 언어를 덧붙인다", () => {
    expect(pagePath("ko")).toBe("/moneytick");
    expect(pagePath("ko", "/privacy")).toBe("/moneytick/privacy");
    expect(pagePath("vi", "/privacy")).toBe("/moneytick/vi/privacy");
  });

  it("Play 주소는 언어를 붙인다", () => {
    expect(playStoreUrl("pt")).toContain("&hl=pt-BR");
  });
});

describe("금액", () => {
  it("버리고, 그 나라 자릿수 구분을 쓴다", () => {
    expect(formatMoney(LANDING.ko.money, 25_000)).toBe("25,000원");
    expect(formatMoney(LANDING.en.money, 16.999)).toBe("$16");
    expect(formatMoney(LANDING.de.money, 48_000)).toBe("€48.000");
    expect(formatMoney(LANDING.vi.money, 120_000_000)).toBe("₫120.000.000");
  });

  it("살아 있는 숫자의 소수 자리는 앱과 같다", () => {
    expect(tickDecimals(40_000_000 / SECONDS_PER_YEAR)).toBe(2);
    expect(tickDecimals(60_000 / SECONDS_PER_YEAR)).toBe(4);
  });
});

describe("문구", () => {
  it.each(LANGS)("%s — 소개 문구가 한국어와 같은 모양이다", (lang) => {
    const c = LANDING[lang];
    expect(c.features).toHaveLength(LANDING.ko.features.length);
    expect(c.faq).toHaveLength(LANDING.ko.faq.length);
    // 레이스는 부장님이 1~3시간 안에 도착해야 1000배속으로 4~11초에 끝난다.
    const leaderHours = c.race.goal / (c.salary.boss / SECONDS_PER_YEAR) / 3600;
    expect(leaderHours).toBeGreaterThan(1);
    expect(leaderHours).toBeLessThan(3);
  });

  it.each(LANGS)("%s — 개인정보처리방침이 한국어판과 같은 절을 가진다", (lang) => {
    const p = PRIVACY[lang];
    const ko = PRIVACY.ko;
    expect(p.sections).toHaveLength(ko.sections.length);
    p.sections.forEach((s, i) => {
      expect(s.h.split(".")[0]).toBe(ko.sections[i].h.split(".")[0]);
      expect(s.body.map((b) => (Array.isArray(b) ? b.length : 0))).toEqual(
        ko.sections[i].body.map((b) => (Array.isArray(b) ? b.length : 0)),
      );
    });
    // 굵게 표시가 짝이 맞아야 그대로 별표가 찍히지 않는다.
    const all = p.sections.flatMap((s) => s.body.flat()).join("\n");
    expect((all.match(/\*\*/g) ?? []).length % 2).toBe(0);
    expect(all).toContain("{email}");
  });
});
