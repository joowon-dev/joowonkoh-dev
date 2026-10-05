/**
 * 고기리 한 그릇의 색.
 *
 * 바탕은 계곡 숲색, 눈에 띄는 색은 들기름 하나만 쓴다.
 * 나머지는 그릇 안에 실제로 있는 것들의 색이다.
 */
export const G = {
  forest: "#163126",
  forestDeep: "#0F241B",
  moss: "#2C4A3B",
  oil: "#E3A72F",
  oilLight: "#F3CD72",
  noodle: "#C2B49A",
  noodleDark: "#9C8C70",
  gim: "#141A15",
  broth: "#D6EAEE",
  bowl: "#F6F6F1",
  bowlShade: "#D9DAD2",
  mist: "#E4ECE6",
  mistDim: "#A9BDB1",
} as const;

/**
 * 제목 글꼴(고운바탕). next/font 로 받으면 한글 조각 수백 개를 빌드 때 내려받아야 해서
 * 한 조각만 실패해도 빌드가 깨진다. 사이트의 Outfit 처럼 구글 폰트 CSS 로 받는다.
 */
export const SERIF_HREF = "https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap";

export const SERIF = `"Gowun Batang", "Nanum Myeongjo", serif`;
