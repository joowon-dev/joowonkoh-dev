import { timeToEat, type Turn } from "./rules";

/**
 * 혼자 연습할 때의 상대. 사람처럼 상대 기록을 모른 채 정한다 —
 * 판마다 겁쟁이·보통·욕심쟁이 중 하나로, 얼마나 먹을지 대충 정하고 거기서 손을 뗀다.
 */
export function botTurn(rand: () => number = Math.random): Turn {
  const press = 0.08 + rand() * 0.5;
  const mood = rand();
  const target = mood < 0.3 ? 22 + rand() * 30 : mood < 0.8 ? 52 + rand() * 26 : 78 + rand() * 30;
  return { name: "컴퓨터", press, release: timeToEat(press, target) };
}
