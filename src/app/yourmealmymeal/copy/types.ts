/**
 * 네밥내밥 페이지 한 언어치 글. 한국어(ko.ts)가 원본이고, 다른 언어는 이 모양을 그대로 채운다.
 *
 * 글 안의 꾸밈은 두 가지만 쓴다(Rich.tsx 가 그린다).
 * - `**굵게**`
 * - `[보이는 글](링크 이름)` — 링크 이름은 `LinkKey` 중 하나. 주소는 언어에 맞게 Rich.tsx 가 붙인다.
 */

export type LinkKey = "contact" | "privacy" | "terms" | "deleteAccount" | "google" | "deleteMail";

/** 개인정보처리방침·계정 삭제 안내의 한 덩어리. */
export type Block = { p: string } | { ul: string[] } | { ol: string[] };

export type LegalDoc = {
  /** 페이지 제목(h1)과 탭 제목. */
  title: string;
  description: string;
  /** "2026년 10월 16일" 처럼 그 언어로 쓴 날짜. */
  updatedAt: string;
  sections: { h: string; blocks: Block[] }[];
};

export type PageMeta = {
  title: string;
  description: string;
  ogTitle: string;
  ogDescription: string;
  ogAlt: string;
};

export type Copy = {
  appName: string;
  /** 인사말을 감싸는 따옴표 — 앱의 auth.quote 와 같다. */
  quote: [string, string];
  store: { download: string };

  landing: {
    meta: PageMeta;
    trayTitle: string;
    /** 앱 로그인 화면과 같은 인사. 돌아가며 바뀐다. */
    greetings: string[];
    tagline: string;
    together: { title: string; lead: string };
    featuresTitle: string;
    /** 여섯 개. 순서가 무늬·색과 짝이다. */
    features: { title: string; tail: string }[];
    /** 큰 한 줄. em 만 토마토색이다. */
    statement: { before: string; em: string; after: string };
    story: string[];
    faqTitle: string;
    faq: { q: string; a: string }[];
    closing: { title: string; body: string; privacy: string; deleteAccount: string };
  };

  join: {
    meta: PageMeta;
    trayTitle: string;
    title: string;
    sub: string;
    pill: string;
    step1: string;
    /** `{code}` 자리에 코드가 들어간다. */
    copyAria: string;
    noCodeAria: string;
    copied: string;
    missing: [string, string];
    step2: string;
    /** "앱 아래 **모임** 탭 → 모임 추가 → 초대코드로 참여하기" — tab 만 굵게. */
    hint: { before: string; tab: string; after: string; add: string; join: string };
    openInApp: string;
    limit: string;
    about: string;
    privacy: string;
  };

  /** 머리·꼬리와 언어 고르기. */
  shell: {
    homeAria: string;
    about: string;
    privacy: string;
    terms: string;
    deleteAccount: string;
    language: string;
  };

  legal: {
    badge: string;
    updated: string;
    /** 한국어가 아닌 판에 다는 한 줄 — 어긋나면 한국어판이 우선한다. 한국어는 빈 글. */
    koreanPrevails: string;
    /** "한국어판 보기" 링크 글. 한국어는 빈 글. */
    koreanLink: string;
  };
  privacy: LegalDoc;
  /** 이용약관. 맨 끝 절에 사업자 정보(상호·대표·등록번호·통신판매업 신고번호·주소)를 둔다. */
  terms: LegalDoc;
  deleteAccount: LegalDoc & { mailSubject: string };
};
