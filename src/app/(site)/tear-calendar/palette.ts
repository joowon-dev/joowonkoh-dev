import { Gaegu } from "next/font/google";

/**
 * 체리 크래프트 — 앱과 같은 색.
 *
 * 앱의 theme 에서 그대로 옮겼다. 페이지만 보고 앱을 떠올릴 수 있어야 해서
 * 사이트 공통 색(파랑 accent)을 쓰지 않는다.
 */
export const C = {
  paper: "#FFFCF6",
  paperOld: "#FBF4EA",
  kraft: "#F8E9DA",
  cherry: "#F0738F",
  cherryDeep: "#D4728A",
  clip: "#E88BA0",
  blush: "#F7A1B3",
  blushLight: "#FFD9E0",
  mint: "#BDE6D3",
  mintDeep: "#7CC4A5",
  cocoa: "#B58E86",
  cocoaDeep: "#9C7A72",
  stitch: "#F2B8C4",
  gold: "#F2C14E",
} as const;

/**
 * 앱의 손글씨(Gaegu 700). next/font 가 빌드 때 받아 우리 도메인에서 내준다.
 * subsets 는 미리 불러올(preload) 범위일 뿐이고, 한글 조각도 함께 받아 둔다.
 */
const gaegu = Gaegu({ weight: "700", subsets: ["latin"], display: "swap" });

export const HAND = `${gaegu.style.fontFamily}, "Pretendard", cursive`;
