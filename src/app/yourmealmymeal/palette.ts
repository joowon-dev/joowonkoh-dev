import { Black_Han_Sans, Jua } from "next/font/google";

/**
 * 네밥내밥 앱과 같은 색 — 앱의 `src/theme/tokens.ts` 에서 그대로 옮겼다.
 * 크림 = 쌀 · 누룽지 = 테두리와 글자 · 민트 = 급식판 플라스틱 · 노른자 = 주 행동 · 토마토 = 챙김
 * 페이지만 보고 앱을 떠올릴 수 있어야 해서 사이트 공통 색을 쓰지 않는다.
 */
export const C = {
  bg: "#FFF6E4",
  surface: "#FFFDF7",
  cloth: "#FFF0D6",
  ink: "#3B2416",
  body: "#6B4A30",
  sub: "#816A4E",
  faint: "#A48561",
  placeholder: "#9B825D",
  tray: "#9FDCC2",
  wellOn: "#F2E2C8",
  wellOff: "#FFFAF0",
  yolk: "#FFC531",
  tomato: "#E8452F",
  tomatoDeep: "#B92F1E",
} as const;

/** 앱의 제목 글꼴(검은고딕)과 본문 글꼴(주아). next/font 가 빌드 때 받아 우리 도메인에서 내준다. */
const display = Black_Han_Sans({ weight: "400", subsets: ["latin"], display: "swap" });
const body = Jua({ weight: "400", subsets: ["latin"], display: "swap" });

export const DISPLAY = `${display.style.fontFamily}, "Pretendard", sans-serif`;
export const BODY = `${body.style.fontFamily}, "Pretendard", sans-serif`;

/** 앱의 카드 — 굵은 누룽지 테두리에 번지지 않는 얇은 그림자. */
export const STICKER = {
  border: `3px solid ${C.ink}`,
  boxShadow: `2px 2px 0 ${C.ink}`,
} as const;

/** 큰 제목 뒤에 노른자 한 겹. 그림자가 아니라 두께다. */
export const YOLK_SHADOW = `2px 2px 0 ${C.yolk}`;

/** 빈 칸은 파인 자리다: 위는 그늘, 아래는 빛. */
export const WELL_CARVE = "inset 0 3px 0 rgba(59,36,22,0.14), inset 0 -2px 0 rgba(255,255,255,0.75)";

export type Slot = "breakfast" | "lunch" | "dinner" | "snack";
export const SLOTS: Slot[] = ["breakfast", "lunch", "dinner", "snack"];
export const SLOT_LABEL: Record<Slot, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};
