import { Jua } from "next/font/google";

/**
 * 버터 스티커 — 앱(파스타 한 줌)과 같은 색.
 *
 * 앱의 `src/theme/tokens.ts` 에서 그대로 옮겼다. 페이지만 보고 앱을 떠올릴 수 있어야 해서
 * 사이트 공통 색(파랑 accent)을 쓰지 않는다.
 */
export const C = {
  paper: "#FFF4E4",
  card: "#FFFFFF",
  line: "#F0DFC8",
  ink: "#4A3428",
  inkSoft: "#8A6F5C",
  inkFaint: "#BFA894",
  tomato: "#FF6F59",
  tomatoSoft: "#FFE3DB",
  noodle: "#FFCF5C",
  noodleSoft: "#FFF0C7",
  noodleDeep: "#E8A93A",
  blush: "#FFA8A0",
  mint: "#CDEFD9",
} as const;

/** 앱의 둥근 제목 글꼴(주아체). next/font 가 빌드 때 받아 우리 도메인에서 내준다. */
const jua = Jua({ weight: "400", subsets: ["latin"], display: "swap" });

export const CUTE = `${jua.style.fontFamily}, "Pretendard", sans-serif`;

/** 앱의 스티커 카드 — 밤색 테두리에 아래로 2px 밀린 단색 그림자. */
export const STICKER = {
  border: `2px solid ${C.ink}`,
  boxShadow: `0 2px 0 ${C.ink}`,
} as const;
