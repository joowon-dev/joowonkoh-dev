/**
 * 네밥내밥 앱과 같은 색 — 앱의 src/theme/tokens.ts에서 그대로 옮겼다.
 * 흰 바탕 · 회색 칸 · 진한 갈색 글자 · 노른자 = 아이콘 바탕·주 행동 · 토마토 = 채워진 칸·강조 · 민트는 수저 무늬에만
 * 페이지만 보고 앱을 떠올릴 수 있어야 해서 사이트 공통 색을 쓰지 않는다.
 */
export const C = {
  bg: "#FFFFFF",
  surface: "#FFFFFF",
  cloth: "#ECECEC",
  ink: "#2E1E14",
  body: "#5A4636",
  sub: "#6E5A48",
  hairline: "rgba(59,36,22,0.10)",
  mint: "#3DB89A",
  mintSoft: "#E3F5ED",
  yolk: "#FFC531",
  yolkSoft: "#FFF3CF",
  tomato: "#E8452F",
  tomatoSoft: "#FDE6E2",
  /** 빈 칸 — 흰 바탕 위의 옅은 회색. 앱의 wellOff. */
  well: "#F4F4F4",
} as const;

/** 글자는 모두 기기 글꼴이다. 앱 로그인 화면처럼 제목도 기기 글꼴을 굵게 쓴다. */
export const SYSTEM = `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Pretendard", "Noto Sans KR", system-ui, sans-serif`;
export const BODY = SYSTEM;
export const DISPLAY = SYSTEM;

/** 앱의 카드 — 머리카락 같은 테두리에 아주 옅게 번지는 그림자. */
export const CARD = {
  border: `1px solid ${C.hairline}`,
  boxShadow: "0 1px 2px rgba(46,30,20,0.04), 0 8px 24px rgba(46,30,20,0.05)",
} as const;
