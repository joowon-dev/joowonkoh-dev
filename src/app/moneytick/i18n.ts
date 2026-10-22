/**
 * 이게내연봉 소개 페이지의 언어.
 *
 * 앱이 내는 12개 언어를 그대로 따른다. 한국어는 원래 주소(`/moneytick`)에 두고,
 * 나머지는 `/moneytick/en` 처럼 언어 하나를 덧붙인다. 한국어 주소로 들어온 사람의
 * 브라우저가 다른 말을 쓰면 그 언어 페이지로 보낸다 — `redirectScript` 참고.
 *
 * 금액은 언어마다 그 나라 돈으로 보인다. 앱과 같은 규칙이다: 기호는 앞에 두고
 * 자릿수 구분은 그 돈을 쓰는 나라의 관습을 따른다. 환율로 바꾸지 않고, 그 나라에서
 * 그럴듯한 연봉을 따로 정해 둔다(`copy/*.ts`).
 */

export const LANGS = [
  "ko",
  "en",
  "ja",
  "zh-hans",
  "zh-hant",
  "de",
  "fr",
  "es",
  "pt",
  "id",
  "th",
  "vi",
] as const;
export type Lang = (typeof LANGS)[number];

/** 한국어를 뺀 나머지 — `[lang]` 경로가 미리 만들어 둘 목록. */
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
    /**
     * 낱말 중간에서 줄을 바꾸지 않는다(`word-break: keep-all`).
     *
     * 한국어에만 켠다. 일본어·중국어·태국어는 낱말 사이에 띄어쓰기가 없어서
     * 켜면 한 줄이 통째로 넘쳐 버린다.
     */
    keepAll: boolean;
  }
> = {
  ko: { tag: "ko", label: "한국어", playHl: "ko", ogLocale: "ko_KR", keepAll: true },
  en: { tag: "en", label: "English", playHl: "en", ogLocale: "en_US", keepAll: false },
  ja: { tag: "ja", label: "日本語", playHl: "ja", ogLocale: "ja_JP", keepAll: false },
  "zh-hans": { tag: "zh-Hans", label: "简体中文", playHl: "zh-CN", ogLocale: "zh_CN", keepAll: false },
  "zh-hant": { tag: "zh-Hant", label: "繁體中文", playHl: "zh-TW", ogLocale: "zh_TW", keepAll: false },
  de: { tag: "de", label: "Deutsch", playHl: "de", ogLocale: "de_DE", keepAll: false },
  fr: { tag: "fr", label: "Français", playHl: "fr", ogLocale: "fr_FR", keepAll: false },
  es: { tag: "es", label: "Español", playHl: "es", ogLocale: "es_ES", keepAll: false },
  pt: { tag: "pt-BR", label: "Português", playHl: "pt-BR", ogLocale: "pt_BR", keepAll: false },
  id: { tag: "id", label: "Bahasa Indonesia", playHl: "id", ogLocale: "id_ID", keepAll: false },
  th: { tag: "th", label: "ไทย", playHl: "th", ogLocale: "th_TH", keepAll: false },
  vi: { tag: "vi", label: "Tiếng Việt", playHl: "vi", ogLocale: "vi_VN", keepAll: false },
};

export function isLang(s: string): s is Lang {
  return (LANGS as readonly string[]).includes(s);
}

/** 이 언어의 소개(`""`) 또는 개인정보처리방침(`"/privacy"`) 주소. */
export function pagePath(lang: Lang, sub: "" | "/privacy" = ""): string {
  return lang === "ko" ? `/moneytick${sub}` : `/moneytick/${lang}${sub}`;
}

/** 검색엔진에 알려 줄 언어별 주소 — 모든 언어 페이지가 같은 목록을 단다. */
export function languageAlternates(sub: "" | "/privacy" = ""): Record<string, string> {
  const out: Record<string, string> = {};
  for (const l of LANGS) out[LANG_INFO[l].tag] = `https://joowonkoh.com${pagePath(l, sub)}`;
  // 언어를 모르는 사람은 한국어 주소로 — 거기서 브라우저 언어를 보고 보낸다.
  out["x-default"] = `https://joowonkoh.com${pagePath("ko", sub)}`;
  return out;
}

/**
 * App Store 주소에는 나라를 넣지 않는다.
 *
 * `apps.apple.com/kr/...` 처럼 나라를 박으면 다른 나라 계정으로 연 사람은 "이 스토어에는
 * 없다" 는 안내를 먼저 본다. 나라를 빼면 애플이 보는 사람의 스토어로 보내 주고, 소개는
 * 그 사람 기기 언어로 뜬다 — 스토어 소개를 12개 언어로 올려 둔 그대로다.
 */
export const APP_STORE_URL = "https://apps.apple.com/app/id6795989020";

export function playStoreUrl(lang: Lang): string {
  return `https://play.google.com/store/apps/details?id=dev.joowon.moneytick&hl=${LANG_INFO[lang].playHl}`;
}

/** 언어 고르기에서 고른 값을 기억하는 자리. 고른 적이 있으면 브라우저 언어보다 먼저다. */
export const STORAGE_KEY = "moneytick-lang";

/**
 * 브라우저 언어 목록에서 페이지 언어를 고른다. 맞는 게 하나도 없으면 영어.
 *
 * `redirectScript` 가 이 함수를 문자열로 바꿔 페이지에 그대로 심으므로, 바깥 변수를
 * 쓰지 않고 이 안에서 끝나야 한다.
 */
export function detectLang(languages: readonly string[]): string {
  for (const raw of languages) {
    const t = raw.toLowerCase();
    const base = t.split("-")[0];
    if (base === "zh") {
      return /hant|-tw|-hk|-mo/.test(t) ? "zh-hant" : "zh-hans";
    }
    if (base === "in") return "id"; // 옛 안드로이드가 인도네시아어를 이렇게 적는다.
    if (["ko", "en", "ja", "de", "fr", "es", "pt", "id", "th", "vi"].includes(base)) {
      return base;
    }
  }
  return "en";
}

/**
 * 한국어 페이지 맨 앞에 심는 한 줄짜리 스크립트.
 *
 * React 가 붙기 전에 돈다 — 화면이 한국어로 그려졌다가 바뀌는 깜빡임을 줄이려고
 * 컴포넌트 대신 인라인 스크립트로 둔다. 검색 로봇은 보내지 않는다: 구글 로봇은
 * 영어 브라우저라서 보내면 한국어 페이지가 색인에서 사라진다.
 *
 * 다른 언어 주소로 직접 들어온 사람은 보내지 않는다. 링크를 받아 연 사람이 고른 건
 * 그 언어라고 본다.
 */
export function redirectScript(sub: "" | "/privacy"): string {
  return `(function(){try{
if(/bot|crawl|spider|slurp|lighthouse/i.test(navigator.userAgent))return;
var detect=${detectLang.toString()};
var saved=null;try{saved=localStorage.getItem(${JSON.stringify(STORAGE_KEY)})}catch(e){}
var langs=${JSON.stringify(LANGS)};
var to=saved&&langs.indexOf(saved)>=0?saved:detect(navigator.languages&&navigator.languages.length?navigator.languages:[navigator.language||"ko"]);
if(to!=="ko")location.replace("/moneytick/"+to+${JSON.stringify(sub)}+location.search+location.hash);
}catch(e){}})();`;
}
