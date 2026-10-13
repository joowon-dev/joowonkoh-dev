import { Black_Han_Sans, Nanum_Pen_Script } from "next/font/google";

/**
 * 네밥내밥 앱과 같은 색 — 앱의 새 디자인 시스템(1.4.0)에서 그대로 옮겼다.
 * 밝은 회색 바탕 · 흰 카드 · 진한 갈색 글자 · 노른자 = 주 행동 · 민트 = 급식판 · 토마토 = 챙김
 * 페이지만 보고 앱을 떠올릴 수 있어야 해서 사이트 공통 색을 쓰지 않는다.
 */
export const C = {
  bg: "#F4F4F4",
  surface: "#FFFFFF",
  cloth: "#ECECEC",
  ink: "#2E1E14",
  body: "#5A4636",
  sub: "#6E5A48",
  faint: "#A0948A",
  placeholder: "#9A8B7E",
  hairline: "rgba(59,36,22,0.08)",
  tray: "#9FDCC2",
  trayDeep: "#8CCFB3",
  mint: "#3DB89A",
  wellOn: "#F6EFE3",
  wellOff: "#FFFAF0",
  yolk: "#FFC531",
  yolkSoft: "#FFF3CF",
  tomato: "#E8452F",
  pill: "#D8F6FB",
  pillLine: "#5FD4EE",
} as const;

/** 본문은 기기 글꼴이다. 앱도 시스템 글꼴을 쓴다. */
export const SYSTEM = `-apple-system, BlinkMacSystemFont, "Apple SD Gothic Neo", "Noto Sans KR", "Pretendard", system-ui, sans-serif`;
export const BODY = SYSTEM;
/** 제목도 기기 글꼴의 굵은 꼴. 무거운 글꼴은 워드마크 하나에만 쓴다. */
export const DISPLAY = SYSTEM;

/** "네밥내밥" 워드마크 전용(검은고딕). next/font 가 빌드 때 받아 우리 도메인에서 내준다. */
const wordmark = Black_Han_Sans({ weight: "400", subsets: ["latin"], display: "swap" });
export const WORDMARK = `${wordmark.style.fontFamily}, ${SYSTEM}`;

/** 초대 페이지의 손글씨 메모(나눔손글씨 펜). 코드 옆에 펜으로 끄적인 것처럼 보이게 한다. */
const hand = Nanum_Pen_Script({ weight: "400", subsets: ["latin"], display: "swap" });
export const HAND = `${hand.style.fontFamily}, ${SYSTEM}`;

/** 앱의 카드 — 머리카락 같은 테두리에 아주 옅게 번지는 그림자. */
export const CARD = {
  border: `1px solid ${C.hairline}`,
  boxShadow: "0 1px 2px rgba(46,30,20,0.04), 0 10px 30px rgba(46,30,20,0.06)",
} as const;

/** 떠 있는 버튼의 유리 — 반투명 흰색 뒤를 흐린다. */
export const GLASS = {
  background: "rgba(255,255,255,0.62)",
  border: "1px solid rgba(255,255,255,0.75)",
  boxShadow: "0 1px 0 rgba(255,255,255,0.8) inset, 0 8px 24px rgba(46,30,20,0.08)",
  backdropFilter: "blur(20px) saturate(180%)",
  WebkitBackdropFilter: "blur(20px) saturate(180%)",
} as const;

/** 빈 칸은 살짝 파인 자리다. */
export const WELL_CARVE = "inset 0 2px 4px rgba(46,30,20,0.08)";

export type Slot = "breakfast" | "lunch" | "dinner" | "snack";
export const SLOTS: Slot[] = ["breakfast", "lunch", "dinner", "snack"];
export const SLOT_LABEL: Record<Slot, string> = {
  breakfast: "아침",
  lunch: "점심",
  dinner: "저녁",
  snack: "간식",
};
