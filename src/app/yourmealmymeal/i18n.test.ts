import { describe, expect, it } from "vitest";

import { COPY } from "./copy";
import type { Block } from "./copy/types";
import { appStoreUrl, detectLang, LANGS, pagePath, parsePath, playStoreUrl, redirectScript, type Lang, type Sub } from "./i18n";

describe("detectLang", () => {
  it("브라우저 언어 목록에서 처음 맞는 것을 고른다", () => {
    expect(detectLang(["ko-KR", "en-US"])).toBe("ko");
    expect(detectLang(["fr-CA", "en"])).toBe("fr");
    expect(detectLang(["nl-NL", "de-DE"])).toBe("de");
    expect(detectLang(["pt-PT"])).toBe("pt");
    expect(detectLang(["pt-BR"])).toBe("pt");
    expect(detectLang(["es-419"])).toBe("es");
  });

  it("중국어는 번체 지역이면 번체, 아니면 간체", () => {
    expect(detectLang(["zh-TW"])).toBe("zh-hant");
    expect(detectLang(["zh-Hant-HK"])).toBe("zh-hant");
    expect(detectLang(["zh-HK"])).toBe("zh-hant");
    expect(detectLang(["zh-CN"])).toBe("zh-hans");
    expect(detectLang(["zh-Hans"])).toBe("zh-hans");
    expect(detectLang(["zh"])).toBe("zh-hans");
  });

  it("옛 인도네시아어 코드와 모르는 언어는 영어", () => {
    expect(detectLang(["in-ID"])).toBe("id");
    expect(detectLang(["nl-NL", "sv"])).toBe("en");
    expect(detectLang([])).toBe("en");
    expect(detectLang(["xx"], null)).toBeNull();
  });
});

describe("redirectScript", () => {
  /** 인라인 스크립트를 가짜 브라우저에서 돌려 어디로 보내는지 본다. */
  function run(opts: { lang?: Lang; sub?: Sub; languages: string[]; search?: string; saved?: string; ua?: string }) {
    let replaced: string | null = null;
    const env = {
      navigator: {
        userAgent: opts.ua ?? "Mozilla/5.0 (iPhone) KAKAOTALK 10.0.0",
        languages: opts.languages,
        language: opts.languages[0],
      },
      localStorage: { getItem: () => opts.saved ?? null },
      location: {
        search: opts.search ?? "",
        hash: "",
        replace: (to: string) => {
          replaced = to;
        },
      },
    };
    new Function("navigator", "localStorage", "location", "URLSearchParams", redirectScript(opts.lang ?? "ko", opts.sub ?? ""))(
      env.navigator,
      env.localStorage,
      env.location,
      URLSearchParams,
    );
    return replaced;
  }

  it("한국어 브라우저는 그대로 둔다", () => {
    expect(run({ languages: ["ko-KR"] })).toBeNull();
    expect(run({ sub: "/join", languages: ["ko-KR", "en-US"], search: "?code=AB2K9M" })).toBeNull();
  });

  it("이미 퍼진 초대 링크는 코드를 단 채로 그 언어 주소로 간다", () => {
    expect(run({ sub: "/join", languages: ["ja-JP"], search: "?code=AB2K9M" })).toBe("/yourmealmymeal/ja/join?code=AB2K9M");
    expect(run({ sub: "/join", languages: ["zh-TW"], search: "?code=AB2K9M" })).toBe("/yourmealmymeal/zh-hant/join?code=AB2K9M");
    expect(run({ sub: "/join", languages: ["sv-SE"], search: "?code=AB2-K9M" })).toBe("/yourmealmymeal/en/join?code=AB2-K9M");
    expect(run({ sub: "/privacy", languages: ["pt-BR"] })).toBe("/yourmealmymeal/pt/privacy");
    expect(run({ languages: ["de-DE"] })).toBe("/yourmealmymeal/de");
  });

  it("?lang= 이 브라우저 언어보다 먼저다 — 어느 언어 주소에서든", () => {
    expect(run({ sub: "/join", languages: ["ko-KR"], search: "?code=AB2K9M&lang=en" })).toBe("/yourmealmymeal/en/join?code=AB2K9M&lang=en");
    expect(run({ languages: ["en-US"], search: "?lang=ko" })).toBeNull();
    expect(run({ lang: "en", sub: "/join", languages: ["en-US"], search: "?code=AB2K9M&lang=ko" })).toBe("/yourmealmymeal/join?code=AB2K9M&lang=ko");
    expect(run({ lang: "en", languages: ["en-US"], search: "?lang=zh-TW" })).toBe("/yourmealmymeal/zh-hant?lang=zh-TW");
    // 모르는 값은 무시하고 평소처럼 고른다.
    expect(run({ languages: ["ko-KR"], search: "?lang=xx" })).toBeNull();
  });

  it("다른 언어 주소로 직접 들어오면 브라우저 언어로 다시 보내지 않는다", () => {
    expect(run({ lang: "en", sub: "/join", languages: ["ko-KR"], search: "?code=AB2K9M" })).toBeNull();
  });

  it("직접 고른 언어가 브라우저 언어보다 먼저다", () => {
    expect(run({ languages: ["en-US"], saved: "ko" })).toBeNull();
    expect(run({ languages: ["ko-KR"], saved: "th" })).toBe("/yourmealmymeal/th");
  });

  it("검색 로봇·미리보기 수집기는 보내지 않는다", () => {
    expect(run({ languages: ["en-US"], ua: "Mozilla/5.0 (compatible; Googlebot/2.1)" })).toBeNull();
    expect(run({ sub: "/join", languages: ["en-US"], ua: "facebookexternalhit/1.1" })).toBeNull();
  });
});

describe("주소", () => {
  it("한국어는 원래 주소, 나머지는 언어를 끼워 넣는다", () => {
    expect(pagePath("ko")).toBe("/yourmealmymeal");
    expect(pagePath("ko", "/join")).toBe("/yourmealmymeal/join");
    expect(pagePath("vi", "/delete-account")).toBe("/yourmealmymeal/vi/delete-account");
  });

  it("주소에서 언어와 페이지를 읽는다", () => {
    expect(parsePath("/yourmealmymeal")).toEqual({ lang: "ko", sub: "" });
    expect(parsePath("/yourmealmymeal/join")).toEqual({ lang: "ko", sub: "/join" });
    expect(parsePath("/yourmealmymeal/zh-hans/join")).toEqual({ lang: "zh-hans", sub: "/join" });
    expect(parsePath("/yourmealmymeal/en/")).toEqual({ lang: "en", sub: "" });
    expect(parsePath("/moneytick/en")).toBeNull();
  });

  it("한국어 스토어 주소는 그대로, 다른 언어는 나라를 빼고 소개 언어를 맞춘다", () => {
    expect(appStoreUrl("ko")).toBe("https://apps.apple.com/kr/app/id6812959704");
    expect(appStoreUrl("ja")).toBe("https://apps.apple.com/app/id6812959704");
    expect(playStoreUrl("ko")).toBe("https://play.google.com/store/apps/details?id=com.joowonkoh.yourmealmymeal");
    expect(playStoreUrl("pt")).toContain("&hl=pt-BR");
  });
});

/**
 * 스토어에 올린 앱 이름 — 앱 저장소 store/screenshots/captions.json 의 `<언어>.brand` 와 같다.
 * 스토어 이름을 바꾸면 여기와 copy/<언어>.ts 의 appName·본문을 같이 고친다.
 */
const BRAND: Record<Lang, string> = {
  ko: "네밥내밥",
  en: "Your Meal, My Meal",
  ja: "あなたのごはん、わたしのごはん",
  "zh-hans": "你的饭，我的饭",
  "zh-hant": "你的飯，我的飯",
  es: "Tu comida, mi comida",
  fr: "Ton repas, mon repas",
  de: "Dein Essen, mein Essen",
  pt: "Seu prato, meu prato",
  id: "Makananmu, Makananku",
  vi: "Cơm bạn, cơm mình",
  th: "ข้าวเธอ ข้าวฉัน",
};

/** 블록 모양만 — 문단이면 "p", 목록이면 항목 수. */
const shape = (b: Block) => ("p" in b ? "p" : "ul" in b ? `ul${b.ul.length}` : `ol${b.ol.length}`);
const texts = (b: Block) => ("p" in b ? [b.p] : "ul" in b ? b.ul : b.ol);

describe("문구", () => {
  it.each(LANGS)("%s — 한국어와 같은 모양이다", (lang) => {
    const c = COPY[lang];
    const ko = COPY.ko;
    expect(c.appName).toBe(BRAND[lang]);
    expect(c.landing.features).toHaveLength(ko.landing.features.length);
    expect(c.landing.faq).toHaveLength(ko.landing.faq.length);
    expect(c.landing.greetings).toHaveLength(ko.landing.greetings.length);
    expect(c.join.copyAria).toContain("{code}");
    for (const kind of ["privacy", "deleteAccount"] as const) {
      expect(c[kind].sections.map((s) => s.blocks.map(shape))).toEqual(ko[kind].sections.map((s) => s.blocks.map(shape)));
    }
  });

  it.each(LANGS)("%s — 꾸밈 표시가 짝이 맞고, 링크 이름이 한국어판과 같다", (lang) => {
    for (const kind of ["privacy", "deleteAccount"] as const) {
      const all = COPY[lang][kind].sections.flatMap((s) => s.blocks.flatMap(texts));
      const links = (t: string) => [...t.matchAll(/\]\(([^)]+)\)/g)].map((m) => m[1]);
      expect(all.flatMap(links)).toEqual(COPY.ko[kind].sections.flatMap((s) => s.blocks.flatMap(texts)).flatMap(links));
      for (const t of all) expect((t.match(/\*\*/g) ?? []).length % 2).toBe(0);
    }
  });

  it.each(LANGS.filter((l) => l !== "ko"))("%s — 한국어판이 우선한다는 한 줄이 있다", (lang) => {
    expect(COPY[lang].legal.koreanPrevails.length).toBeGreaterThan(0);
    expect(COPY[lang].legal.koreanLink.length).toBeGreaterThan(0);
  });

  it.each(LANGS.filter((l) => l !== "ko"))("%s — 한국어 이름(네밥내밥)은 개인정보처리방침 첫 문단과 메일 제목에만 남는다", (lang) => {
    const c = COPY[lang];
    // 같은 앱이라는 걸 밝히려고 첫 문단에 한 번 "(네밥내밥)" 을 단다. 메일 제목 머리표는 받는 쪽이 앱을 가려내는 표지다.
    const intro = c.privacy.sections[0].blocks[0];
    expect("p" in intro && intro.p).toContain(`${BRAND[lang]}`);
    expect("p" in intro && intro.p).toContain("네밥내밥");
    const rest = {
      ...c,
      privacy: { ...c.privacy, sections: [{ ...c.privacy.sections[0], blocks: c.privacy.sections[0].blocks.slice(1) }, ...c.privacy.sections.slice(1)] },
      deleteAccount: { ...c.deleteAccount, mailSubject: "" },
    };
    expect(JSON.stringify(rest)).not.toContain("네밥내밥");
  });
});
