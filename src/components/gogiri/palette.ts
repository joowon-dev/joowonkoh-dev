/**
 * 고기리 한 그릇의 색.
 *
 * 가게가 한옥이라 바탕은 기와 먹색과 나무 갈색, 빛은 창살 너머 한지 불빛이다.
 * 눈에 띄는 색은 들기름(호박색) 하나만 쓰고, 나머지는 그릇 안에 실제로
 * 있는 것들의 색이다.
 */
export const G = {
  /** 기본 바탕 */
  ink: "#26211D",
  inkDeep: "#1A1714",
  /** 선·게이지 바닥 */
  line: "#4A3B2E",
  oil: "#E3A72F",
  oilLight: "#F3CD72",
  noodle: "#C9B592",
  noodleDark: "#9C8A6E",
  gim: "#1B241C",
  broth: "#D6EAEE",
  bowl: "#F6F6F1",
  bowlShade: "#D9DAD2",
  mist: "#EFE9DC",
  mistDim: "#B8AC98",
} as const;

/** 한옥 재료의 색 */
export const H = {
  giwa: "#3A3F44",
  giwaDark: "#272B2F",
  giwaLine: "#555B61",
  wall: "#F1EEE6",
  wood: "#5A3923",
  woodLight: "#7B5032",
  woodDark: "#3B2416",
  hanji: "#F6DDA6",
  hanjiDim: "#C9A86A",
  stone: "#4B4D4F",
  stoneLight: "#6C6F72",
  sky: "#1C2530",
  skyLow: "#3B3A44",
  table: "#6E4528",
  tableLight: "#87583A",
} as const;

/**
 * 제목 글꼴(고운바탕). next/font 로 받으면 한글 조각 수백 개를 빌드 때 내려받아야 해서
 * 한 조각만 실패해도 빌드가 깨진다. 사이트의 Outfit 처럼 구글 폰트 CSS 로 받는다.
 */
export const SERIF_HREF = "https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap";

export const SERIF = `"Gowun Batang", "Nanum Myeongjo", serif`;
