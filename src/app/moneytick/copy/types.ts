/**
 * 소개 페이지 한 장에 들어가는 글과 숫자.
 *
 * 언어마다 한 파일이다. 숫자(연봉·목표 금액)도 여기 둔다 — 환율로 바꾼 값이 아니라
 * 그 나라에서 그럴듯한 금액을 따로 고른 것이라 글과 함께 고치는 게 맞다.
 */

export type Money = {
  /** 자릿수 구분·소수점 기호를 정하는 로케일 — 그 돈을 쓰는 나라의 것. */
  locale: string;
  /** 앞에 붙는 기호. 앱처럼 기호는 늘 앞이다. 한국어만 뒤에 "원" 을 붙인다. */
  prefix: string;
  suffix: string;
};

export type Landing = {
  meta: { title: string; description: string };
  appName: string;
  tagline: string;
  iconAlt: string;
  /** 언어 고르기 칸의 이름(화면 낭독기용). */
  languageLabel: string;
  hero: { appStore: string; play: string; requirements: string };
  money: Money;
  /** 데모의 "나" 와 비교 상대의 연봉. 레이스는 상대가 나의 2.5배일 때 보기 좋다. */
  salary: { me: number; boss: number };
  eyebrow: { features: string; race: string; faq: string; support: string };
  ticker: {
    /** 세그먼티드 컨트롤 — 앱 홈 맨 위의 그 글자. */
    units: { year: string; month: string; day: string };
    /** 아래 한 줄 — "연봉 4,000만 원". 비워 두면 단위 이름과 금액을 이어 붙인다. */
    captions?: { year: string; month: string; day: string };
    unitNames: { year: string; month: string; day: string };
    since: string;
    perSecond: (amount: string) => string;
  };
  features: { title: string; tail: string }[];
  race: {
    me: string;
    boss: string;
    /** 이름 옆 작은 글씨. 비워 두면 연봉 단위 이름과 금액. */
    subs?: [string, string];
    /** 결승선 — 그 나라에서 한 번 사 먹을 만한 것. */
    goal: number;
    goalTitle: (amount: string) => string;
    speed: string;
    arrived: string;
    summary: (time: string, amount: string) => string;
    duration: (h: number, m: number) => string;
  };
  stay: {
    since: (spent: string) => string;
    spent: (m: number, s: number) => string;
    footnote: string;
  };
  statement: { headline: string; body: string };
  faq: { q: string; a: string }[];
  support: { privacy: string };
};
