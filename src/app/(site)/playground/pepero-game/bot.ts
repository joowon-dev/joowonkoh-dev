import { dist, eatenAt, freshInput, type Input, STICK_MM } from "./rules";

/**
 * 혼자 연습할 때의 상대. 판마다 성격이 다르다 —
 * 얼마나 욕심낼지, 얼마나 가까워지면 겁먹을지, 내가 멈춘 걸 보고 얼마나 빨리 따라 멈출지.
 */
export type Bot = (mine: Input, now: number) => Input;

export function makeBot(rand: () => number = Math.random): Bot {
  const press = 0.05 + rand() * 0.4;
  const greedy = 38 + rand() * 50; // 여기까지 먹으면 스스로 멈춘다(mm)
  const nerve = 3 + rand() * 24; // 내가 계속 먹는데 틈이 이만큼 좁아지면 겁먹고 멈춘다(mm)
  const react = 0.15 + rand() * 0.35; // 내가 멈춘 걸 알아채는 데 걸리는 시간(초)
  const stubborn = rand() < 0.22; // 가끔은 내가 멈춰도 못 보고 계속 먹는다
  const plan = timeToEat(press, greedy);
  const st = freshInput();

  return (mine, now) => {
    if (now < 0) return { ...st };
    st.until = now;
    if (st.press === null && now >= press) st.press = press;
    if (st.press !== null && st.release === null) {
      let stopAt = plan;
      if (mine.release !== null && !stubborn) stopAt = Math.min(stopAt, mine.release + react);
      const gap = STICK_MM - eatenAt(mine, now) - eatenAt(st, now);
      if (mine.release === null && gap < nerve) stopAt = Math.min(stopAt, now);
      if (now >= stopAt) st.release = Math.max(st.press, Math.min(stopAt, now));
    }
    return { ...st };
  };
}

/** press 초에 누르기 시작해 mm 만큼 먹으려면 언제 떼야 하나 */
function timeToEat(press: number, mm: number) {
  let lo = press;
  let hi = press + 20;
  for (let k = 0; k < 40; k++) {
    const mid = (lo + hi) / 2;
    if (dist(mid) - dist(press) >= mm) hi = mid;
    else lo = mid;
  }
  return hi;
}
