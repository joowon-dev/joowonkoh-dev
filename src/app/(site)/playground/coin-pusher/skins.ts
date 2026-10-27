/**
 * 판 위에 무엇이 쌓이는지만 바꾸는 겉모습 설정. 물리·이벤트·추첨 결과에는 전혀 영향이 없다 —
 * 같은 시드로 같은 스킨을 골라도, 다른 스킨을 골라도 당첨자는 똑같이 나온다.
 */
export type SkinId = "coin" | "character";

export interface Skin {
  id: SkinId;
  label: string;
  /** 설정 화면 카드에 들어가는 한 줄 설명 */
  description: string;
  /** 시작 버튼 문구 */
  startLabel: string;
  /** 판 위의 것들을 섞을 때 뜨는 배너 */
  scrambleLabel: string;
  /** 당첨 오버레이 부제 */
  winnerSubtitle: string;
}

export const SKINS: readonly Skin[] = [
  {
    id: "coin",
    label: "코인",
    description: "은화와 동화가 섞인 기본 모드",
    startLabel: "코인 쏟아붓기",
    scrambleLabel: "코인을 뒤섞는다!",
    winnerSubtitle: "가장 먼저 떨어졌습니다 🪙",
  },
  {
    id: "character",
    label: "귀여운 친구들",
    description: "콩·병아리·고양이·곰·토끼·개구리가 밀려 떨어진다",
    startLabel: "친구들 쏟아붓기",
    scrambleLabel: "친구들을 뒤섞는다!",
    winnerSubtitle: "가장 먼저 떨어졌습니다 🐾",
  },
];

export const DEFAULT_SKIN: SkinId = "coin";

export function skinOf(id: SkinId): Skin {
  return SKINS.find((s) => s.id === id) ?? SKINS[0];
}
