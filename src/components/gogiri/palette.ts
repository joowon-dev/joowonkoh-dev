/**
 * 고기리 한 그릇의 색과 글꼴.
 *
 * 사진이 주인공이라 바탕은 사진 속 나무와 밤하늘에 가까운 먹색으로 낮추고,
 * 눈에 띄는 색은 들기름(호박색) 하나만 쓴다.
 */
export const G = {
  /** 기본 바탕 */
  ink: "#1F1B18",
  inkDeep: "#141210",
  /** 선·게이지 바닥 */
  line: "#3E342B",
  oil: "#E3A72F",
  oilLight: "#F3CD72",
  gim: "#16130F",
  broth: "#D6EAEE",
  mist: "#EFE9DC",
  mistDim: "#B8AC98",
} as const;

/** 사진 폴더. 주원이 찍은 사진을 Higgsfield 로 다듬어 넣었다. */
export const IMG = "/blog/2026100501-gogiri";

/**
 * 제목 글꼴(고운바탕). next/font 로 받으면 한글 조각 수백 개를 빌드 때 내려받아야 해서
 * 한 조각만 실패해도 빌드가 깨진다. 사이트의 Outfit 처럼 구글 폰트 CSS 로 받는다.
 */
export const SERIF_HREF = "https://fonts.googleapis.com/css2?family=Gowun+Batang:wght@400;700&display=swap";

export const SERIF = `"Gowun Batang", "Nanum Myeongjo", serif`;
