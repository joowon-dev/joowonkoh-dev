/**
 * 네밥내밥 페이지의 언어.
 *
 * 앱이 내는 12개 언어를 그대로 따른다(앱은 기기 언어를 따르고, 없으면 영어). 이게내연봉(`/moneytick`)과
 * 같은 방식이다: 한국어는 원래 주소(`/yourmealmymeal`, `/yourmealmymeal/join` …)에 그대로 두고,
 * 나머지는 `/yourmealmymeal/en/join` 처럼 언어 하나를 끼워 넣는다. 페이지는 전부 빌드 때 미리 만든다.
 *
 * 한국어 주소로 들어온 사람의 브라우저가 다른 말을 쓰면 그 언어 주소로 보낸다(`redirectScript`).
 * 이미 퍼져 있는 초대 링크(`/yourmealmymeal/join?code=…`)도 그래서 그대로 열린다 — 코드는 주소 뒤에 붙어 따라간다.
 * `?lang=en` 을 붙이면 브라우저 언어 대신 그 언어로 연다.
 */

export const LANGS = ["ko", "en", "ja", "zh-hans", "zh-hant", "es", "fr", "de", "pt", "id", "vi", "th"] as const;
export type Lang = (typeof LANGS)[number];

/** 한국어를 뺀 나머지 — `[...path]` 가 미리 만들어 둘 목록. */
export const OTHER_LANGS = LANGS.filter((l) => l !== "ko");

export const LANG_INFO: Record<
  Lang,
  {
    /** `lang` 속성·hreflang 에 쓰는 BCP 47 태그. */
    tag: string;
    /** 언어 고르기 목록에 보일 이름 — 그 언어로 쓴다. */
    label: string;
    /** Google Play 소개를 이 언어로 띄우는 `hl` 값. */
    playHl: string;
    /** og:locale. */
    ogLocale: string;
  }
> = {
  ko: { tag: "ko", label: "한국어", playHl: "ko", ogLocale: "ko_KR" },
  en: { tag: "en", label: "English", playHl: "en", ogLocale: "en_US" },
  ja: { tag: "ja", label: "日本語", playHl: "ja", ogLocale: "ja_JP" },
  "zh-hans": { tag: "zh-Hans", label: "简体中文", playHl: "zh-CN", ogLocale: "zh_CN" },
  "zh-hant": { tag: "zh-Hant", label: "繁體中文", playHl: "zh-TW", ogLocale: "zh_TW" },
  es: { tag: "es", label: "Español", playHl: "es", ogLocale: "es_ES" },
  fr: { tag: "fr", label: "Français", playHl: "fr", ogLocale: "fr_FR" },
  de: { tag: "de", label: "Deutsch", playHl: "de", ogLocale: "de_DE" },
  pt: { tag: "pt-BR", label: "Português (Brasil)", playHl: "pt-BR", ogLocale: "pt_BR" },
  id: { tag: "id", label: "Bahasa Indonesia", playHl: "id", ogLocale: "id_ID" },
  vi: { tag: "vi", label: "Tiếng Việt", playHl: "vi", ogLocale: "vi_VN" },
  th: { tag: "th", label: "ไทย", playHl: "th", ogLocale: "th_TH" },
};

export function isLang(s: string | undefined): s is Lang {
  return s !== undefined && (LANGS as readonly string[]).includes(s);
}

export const BASE = "/yourmealmymeal";
export const ORIGIN = "https://joowonkoh.com";

/** 언어마다 있는 네 장. `""` 는 소개. */
export type Sub = "" | "/join" | "/privacy" | "/delete-account";
export const SUBS: Sub[] = ["", "/join", "/privacy", "/delete-account"];

/** 이 언어의 그 페이지 주소. 한국어는 원래 주소다. */
export function pagePath(lang: Lang, sub: Sub = ""): string {
  return lang === "ko" ? `${BASE}${sub}` : `${BASE}/${lang}${sub}`;
}

/** 지금 주소가 어느 언어의 어느 페이지인지. 네밥내밥 밖이면 null. */
export function parsePath(pathname: string): { lang: Lang; sub: string } | null {
  if (pathname !== BASE && !pathname.startsWith(`${BASE}/`)) return null;
  const rest = pathname.slice(BASE.length).replace(/\/$/, "");
  const first = rest.split("/")[1];
  if (isLang(first) && first !== "ko") return { lang: first, sub: rest.slice(first.length + 1) };
  return { lang: "ko", sub: rest };
}

/** 검색엔진에 알려 줄 언어별 주소 — 모든 언어 페이지가 같은 목록을 단다. */
export function languageAlternates(sub: Sub = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of LANGS) out[LANG_INFO[l].tag] = `${ORIGIN}${pagePath(l, sub)}`;
  // 언어를 모르는 사람은 한국어 주소로 — 거기서 브라우저 언어를 보고 보낸다.
  out["x-default"] = `${ORIGIN}${pagePath("ko", sub)}`;
  return out;
}

/**
 * 스토어 주소. ASC 앱 ID(eas.json ascAppId)와 안드로이드 패키지 이름(app.json)으로 만든다.
 *
 * 한국어 페이지는 원래 쓰던 한국 스토어 주소 그대로다. 다른 언어는 App Store 주소에 나라를 넣지 않는다 —
 * `apps.apple.com/kr/...` 은 다른 나라 계정으로 열면 "이 스토어에는 없다" 는 안내부터 보여서다.
 * 나라를 빼면 애플이 보는 사람의 스토어로 보낸다. Play 는 `hl` 로 소개 언어를 맞춘다.
 */
export function appStoreUrl(lang: Lang): string {
  return lang === "ko" ? "https://apps.apple.com/kr/app/id6812959704" : "https://apps.apple.com/app/id6812959704";
}

export function playStoreUrl(lang: Lang): string {
  const base = "https://play.google.com/store/apps/details?id=com.joowonkoh.yourmealmymeal";
  return lang === "ko" ? base : `${base}&hl=${LANG_INFO[lang].playHl}`;
}

/** 언어 고르기에서 고른 값을 기억하는 자리. 고른 적이 있으면 브라우저 언어보다 먼저다. */
export const STORAGE_KEY = "yourmealmymeal-lang";

/**
 * 언어 태그 목록에서 페이지 언어를 고른다. 맞는 게 하나도 없으면 fallback(기본 영어).
 *
 * `redirectScript` 가 이 함수를 문자열로 바꿔 페이지에 그대로 심으므로, 바깥 변수를
 * 쓰지 않고 이 안에서 끝나야 한다.
 */
export function detectLang(languages: readonly string[], fallback: string | null = "en"): string | null {
  for (const raw of languages) {
    const t = String(raw).toLowerCase().replace(/_/g, "-");
    const base = t.split("-")[0];
    if (base === "zh") return /hant|-tw|-hk|-mo/.test(t) ? "zh-hant" : "zh-hans";
    if (base === "in") return "id"; // 옛 안드로이드가 인도네시아어를 이렇게 적는다.
    if (["ko", "en", "ja", "es", "fr", "de", "pt", "id", "vi", "th"].indexOf(base) >= 0) return base;
  }
  return fallback;
}

/**
 * 페이지 맨 앞에 심는 한 줄짜리 스크립트. React 가 붙기 전에 돌아 깜빡임을 줄인다.
 *
 * - `?lang=xx` 가 있으면 그 언어로 간다(어느 언어 페이지에서든). 값은 주소에 남겨 둔다 —
 *   지우면 한국어 주소에 닿은 뒤 브라우저 언어를 보고 다시 튕겨 나간다.
 * - 한국어 주소에서만 브라우저 언어(또는 언어 고르기에서 고른 값)를 본다. 다른 언어 주소로
 *   직접 들어온 사람은 그 언어를 고른 것으로 본다.
 * - 검색 로봇은 보내지 않는다: 구글 로봇은 영어 브라우저라 보내면 한국어 페이지가 색인에서 사라진다.
 * - 주소 뒤의 `?code=…` 와 `#…` 는 그대로 따라간다. 초대코드가 사라지지 않게.
 */
export function redirectScript(lang: Lang, sub: Sub): string {
  return `(function(){try{
var detect=${detectLang.toString()};
var cur=${JSON.stringify(lang)},langs=${JSON.stringify(LANGS)};
var forced=new URLSearchParams(location.search).get("lang");
var to=forced?detect([forced],null):null;
if(!to&&cur==="ko"){
if(/bot|crawl|spider|slurp|lighthouse|facebookexternalhit|kakaotalk-scrap|yeti/i.test(navigator.userAgent))return;
var saved=null;try{saved=localStorage.getItem(${JSON.stringify(STORAGE_KEY)})}catch(e){}
to=saved&&langs.indexOf(saved)>=0?saved:detect(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||"ko"]);
}
if(to&&to!==cur)location.replace(${JSON.stringify(BASE)}+(to==="ko"?"":"/"+to)+${JSON.stringify(sub)}+location.search+location.hash);
}catch(e){}})();`;
}
