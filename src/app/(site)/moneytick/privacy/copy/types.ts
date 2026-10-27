/**
 * 개인정보처리방침 한 언어치.
 *
 * 문단은 문자열, 글머리 목록은 문자열 배열이다. 문자열 안에서는 세 가지만 쓴다:
 * `**굵게**`, `[글자](주소)`, `{email}`(문의 메일 링크). 그리는 쪽은 `../Policy.tsx`.
 *
 * 내용은 한국어판(`ko.ts`)이 원본이다. 고칠 때는 한국어를 먼저 고치고, 다른 언어를
 * 같은 뜻으로 맞춘 다음 `updated` 날짜를 모두 같이 옮긴다.
 */

export type Block = string | string[];

export type Privacy = {
  meta: { title: string; description: string };
  badge: string;
  title: string;
  /** "최종 업데이트: 2026년 10월 22일" — 날짜까지 그 언어로. */
  updated: string;
  sections: { h: string; body: Block[] }[];
};
