import { Jua } from "next/font/google";

/**
 * 낙서 스티커 — 앱(와파냥)과 같은 색.
 *
 * 앱의 `src/theme/tokens.ts` 에서 그대로 옮겼다. 흰 종이 바탕에 검정 마커 선, 색은 등급(안전·주의·위험)과
 * 형광펜 노랑에만 쓴다. 페이지만 보고 앱을 떠올릴 수 있어야 해서 사이트 공통 색(파랑 accent)을 쓰지 않는다.
 */
export const C = {
  paper: "#F6F5F1",
  card: "#FFFFFF",
  line: "#E2E0D8",
  ink: "#111111",
  inkSoft: "#4A4A4A",
  inkFaint: "#9C9A94",
  gold: "#FFE45C",
  goldSoft: "#FFF6C2",
  good: "#22A06B",
  goodSoft: "#DDF3E7",
  fair: "#E8930C",
  fairSoft: "#FDEFD6",
  poor: "#E0443E",
  poorSoft: "#FBE1DF",
} as const;

/** 앱의 둥근 제목 글꼴(주아체). next/font 가 빌드 때 받아 우리 도메인에서 내준다. */
const jua = Jua({ weight: "400", subsets: ["latin"], display: "swap" });

export const CUTE = `${jua.style.fontFamily}, "Pretendard", sans-serif`;

/** 앱의 스티커 카드 — 마커로 그은 듯한 3px 검정 테두리에 오른쪽 아래로 2px 밀린 그림자. */
export const STICKER = {
  border: `3px solid ${C.ink}`,
  boxShadow: `2px 2px 0 ${C.ink}`,
} as const;
