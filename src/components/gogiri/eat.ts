/**
 * 들기름막국수 한 그릇을 먹는 순서.
 *
 * 나온 그대로(비비지 않고) 먹다가, 1/3쯤 남으면 차가운 육수를 부어
 * 마저 먹는다. 화면은 이 상태만 보고 그린다.
 */

/** 한 그릇을 몇 젓가락에 먹는지 */
export const BITES = 9;
/** 이만큼 남으면 육수를 부을 차례 */
export const POUR_AT = 3;

export type EatPhase = "dry" | "pour" | "broth" | "done";

export interface EatState {
  /** 남은 젓가락 수 */
  noodles: number;
  /** 육수가 찬 정도 0–1 */
  broth: number;
  phase: EatPhase;
}

export type EatAction =
  | { type: "bite" }
  | { type: "pour"; amount: number }
  | { type: "reset" };

export const initialEat: EatState = { noodles: BITES, broth: 0, phase: "dry" };

export function eat(state: EatState, action: EatAction): EatState {
  switch (action.type) {
    case "bite": {
      if (state.phase === "dry") {
        const noodles = state.noodles - 1;
        return { ...state, noodles, phase: noodles <= POUR_AT ? "pour" : "dry" };
      }
      if (state.phase === "broth") {
        const noodles = state.noodles - 1;
        return { ...state, noodles, phase: noodles <= 0 ? "done" : "broth" };
      }
      return state;
    }
    case "pour": {
      if (state.phase !== "pour") return state;
      const broth = Math.min(1, state.broth + action.amount);
      return { ...state, broth, phase: broth >= 1 ? "broth" : "pour" };
    }
    case "reset":
      return initialEat;
  }
}
