import { describe, expect, it } from "vitest";
import { keystrokesOf } from "./hangul";
import {
  BANDS,
  FIRST_SHOT_M,
  LAST_SHOT_M,
  POWER_AT_FAR,
  POWER_AT_NEAR,
  SHOTS_PER_GAME,
  THREE_POINT_M,
  createGame,
  distanceForShot,
  grade,
  isMade,
  livePower,
  outcomeFor,
  pointsFor,
  powerOf,
  requiredPower,
  step,
  strokesPerMinute,
  summarize,
  type Game,
} from "./game";
import { createRng } from "../_shared/random";

const T0 = 10_000;

/** 이 타수를 이 파워로 치려면 몇 밀리초가 걸리는지. powerOf의 역함수다 */
function msForPower(keystrokes: number, power: number): number {
  const speed = 1.5 + (power / 100) * 8.5;
  return (keystrokes / speed) * 1000;
}

/** 첫 글자를 치고 ms 뒤에 단어를 완성한다 */
function shootIn(game: Game, ms: number): Game {
  const word = game.shot.word;
  const first = [...word][0];
  const started = step(game, { type: "type", value: first, now: T0 });
  return step(started, { type: "type", value: word, now: T0 + ms });
}

/** 이번 슛을 목표 파워로 던진다 */
function shootAtPower(game: Game, power: number): Game {
  return shootIn(game, msForPower(game.shot.keystrokes, power));
}

function started(seed = 7): Game {
  return step(createGame(seed), { type: "start" });
}

describe("powerOf", () => {
  it("아직 안 쳤으면 0이다", () => {
    expect(powerOf(8, 0)).toBe(0);
  });

  it("1.5타/초에서 0이고 10타/초에서 100이다", () => {
    expect(powerOf(15, 10_000)).toBeCloseTo(0, 5);
    expect(powerOf(100, 10_000)).toBeCloseTo(100, 5);
  });

  it("아래로만 자른다 — 아주 느려도 음수는 없다", () => {
    expect(powerOf(1, 10_000)).toBe(0);
  });

  it("위로는 안 자른다. 안 자르면 먼 슛에서도 오버가 나올 수 있다", () => {
    expect(powerOf(200, 10_000)).toBeGreaterThan(100);
  });

  it("빨리 칠수록 파워가 크다", () => {
    expect(powerOf(8, 800)).toBeGreaterThan(powerOf(8, 1600));
  });
});

describe("requiredPower", () => {
  it("가장 가까운 슛과 가장 먼 슛의 요구치가 상수와 맞는다", () => {
    expect(requiredPower(FIRST_SHOT_M)).toBeCloseTo(POWER_AT_NEAR, 5);
    expect(requiredPower(LAST_SHOT_M)).toBeCloseTo(POWER_AT_FAR, 5);
  });

  it("멀수록 더 빨리 쳐야 한다", () => {
    expect(requiredPower(7)).toBeGreaterThan(requiredPower(4));
  });

  it("어느 거리에서든 아주 느리게 치면 짧게 던질 수 있다", () => {
    // 파워는 0 아래로 안 내려가므로, 요구치가 낮으면 못 넣는 게 불가능해진다.
    // 흔들림으로 가장 가까워졌을 때까지 포함해 확인한다.
    const nearest = FIRST_SHOT_M - 0.5;
    expect(outcomeFor(0 - requiredPower(nearest))).toBe("short");
  });
});

describe("distanceForShot", () => {
  it("뒤로 갈수록 멀어진다", () => {
    const rng = createRng(1);
    const first = distanceForShot(0, rng);
    const last = distanceForShot(SHOTS_PER_GAME - 1, rng);
    expect(last).toBeGreaterThan(first);
  });

  it("흔들림을 넣어도 상식적인 범위 안이다", () => {
    const rng = createRng(99);
    for (let i = 0; i < SHOTS_PER_GAME; i++) {
      const d = distanceForShot(i, rng);
      expect(d).toBeGreaterThanOrEqual(FIRST_SHOT_M - 0.5);
      expect(d).toBeLessThanOrEqual(LAST_SHOT_M + 0.5);
    }
  });
});

describe("outcomeFor", () => {
  it("요구치에 딱 맞으면 클린샷이다", () => {
    expect(outcomeFor(0)).toBe("clean");
  });

  it("약한 쪽부터 순서대로 갈린다", () => {
    expect(outcomeFor(-30)).toBe("short");
    expect(outcomeFor(-10)).toBe("frontRim");
    expect(outcomeFor(-4)).toBe("clean");
  });

  it("센 쪽도 순서대로 갈린다", () => {
    expect(outcomeFor(4)).toBe("clean");
    expect(outcomeFor(8)).toBe("backRim");
    expect(outcomeFor(15)).toBe("bank");
    expect(outcomeFor(30)).toBe("long");
  });

  it("칸 경계는 아래쪽 칸에 붙는다", () => {
    expect(outcomeFor(-14)).toBe("frontRim");
    expect(outcomeFor(-5)).toBe("clean");
    expect(outcomeFor(5)).toBe("backRim");
    expect(outcomeFor(12)).toBe("bank");
    expect(outcomeFor(20)).toBe("long");
  });

  it("칸이 빈틈없이 이어져 있다", () => {
    for (let i = 1; i < BANDS.length; i++) {
      expect(BANDS[i].min).toBe(BANDS[i - 1].max);
    }
    expect(BANDS[0].min).toBe(-Infinity);
    expect(BANDS[BANDS.length - 1].max).toBe(Infinity);
  });
});

describe("pointsFor", () => {
  it("못 넣으면 0점이다", () => {
    expect(pointsFor("short", 5)).toBe(0);
    expect(pointsFor("long", 8)).toBe(0);
  });

  it("3점 라인 안이면 2점, 밖이면 3점이다", () => {
    expect(pointsFor("backRim", THREE_POINT_M - 0.1)).toBe(2);
    expect(pointsFor("backRim", THREE_POINT_M)).toBe(3);
  });

  it("클린샷은 1점을 더 받는다", () => {
    expect(pointsFor("clean", 4)).toBe(3);
    expect(pointsFor("clean", 8)).toBe(4);
  });

  it("링·백보드를 맞고 들어간 건 보너스가 없다", () => {
    expect(pointsFor("frontRim", 4)).toBe(2);
    expect(pointsFor("bank", 4)).toBe(2);
  });
});

describe("isMade", () => {
  it("링과 백보드를 맞아도 들어간 건 들어간 것이다", () => {
    expect(isMade("clean")).toBe(true);
    expect(isMade("frontRim")).toBe(true);
    expect(isMade("backRim")).toBe(true);
    expect(isMade("bank")).toBe(true);
    expect(isMade("short")).toBe(false);
    expect(isMade("long")).toBe(false);
  });
});

describe("livePower", () => {
  it("첫 글자를 치기 전에는 보여줄 값이 없다", () => {
    expect(livePower(started().shot, T0)).toBeNull();
  });

  it("시간이 갈수록 줄어든다 — 바늘이 오른쪽에서 내려온다", () => {
    const g = step(started(), { type: "type", value: "가", now: T0 });
    const early = livePower(g.shot, T0 + 600);
    const late = livePower(g.shot, T0 + 1600);
    expect(early).not.toBeNull();
    expect(late).not.toBeNull();
    expect(early!).toBeGreaterThan(late!);
  });
});

describe("step", () => {
  it("ready에서는 아무리 쳐도 시작되지 않는다", () => {
    const g = createGame(1);
    expect(step(g, { type: "type", value: "가", now: T0 }).shot.typed).toBe("");
  });

  it("start로 typing에 들어간다", () => {
    expect(started().phase).toBe("typing");
  });

  it("첫 입력에서 시계가 켜진다", () => {
    const g = started();
    expect(g.shot.startedAt).toBeNull();
    const after = step(g, { type: "type", value: "가", now: T0 });
    expect(after.shot.startedAt).toBe(T0);
  });

  it("빈 값으로는 시계가 켜지지 않는다", () => {
    const after = step(started(), { type: "type", value: "", now: T0 });
    expect(after.shot.startedAt).toBeNull();
  });

  it("시계는 한 번만 켜진다", () => {
    const g = step(started(), { type: "type", value: "가", now: T0 });
    const later = step(g, { type: "type", value: "가나", now: T0 + 500 });
    expect(later.shot.startedAt).toBe(T0);
  });

  it("단어를 완성하면 공이 날아간다", () => {
    const g = shootAtPower(started(), started().shot.required);
    expect(g.phase).toBe("flying");
    expect(g.last).not.toBeNull();
  });

  it("요구치대로 치면 클린샷이다", () => {
    const g = started();
    const after = shootAtPower(g, g.shot.required);
    expect(after.last!.outcome).toBe("clean");
  });

  it("너무 느리면 짧고, 너무 빠르면 넘어간다", () => {
    const g = started();
    // 파워는 0 아래로 안 내려간다. 요구치보다 30 낮게 겨냥하면 바닥에 붙는데,
    // 그래도 diff가 -14 밑으로 벌어지는지가 근거리 요구치를 24로 올린 이유다.
    expect(shootAtPower(g, g.shot.required - 30).last!.outcome).toBe("short");
    expect(shootAtPower(g, g.shot.required + 25).last!.outcome).toBe("long");
  });

  it("살짝 약하면 앞 링, 살짝 세면 뒤 링이다", () => {
    const g = started();
    expect(shootAtPower(g, g.shot.required - 9).last!.outcome).toBe("frontRim");
    expect(shootAtPower(g, g.shot.required + 8).last!.outcome).toBe("backRim");
  });

  it("더 세면 백보드를 맞는다", () => {
    const g = started();
    expect(shootAtPower(g, g.shot.required + 16).last!.outcome).toBe("bank");
  });

  it("넣으면 점수와 콤보가 오른다", () => {
    const g = started();
    const after = shootAtPower(g, g.shot.required);
    expect(after.score).toBeGreaterThan(0);
    expect(after.combo).toBe(1);
    expect(after.bestCombo).toBe(1);
  });

  it("못 넣으면 콤보가 끊기지만 최고 기록은 남는다", () => {
    let g = started();
    g = shootAtPower(g, g.shot.required);
    g = step(step(g, { type: "landed" }), { type: "next" });
    g = shootAtPower(g, g.shot.required - 30);
    expect(g.combo).toBe(0);
    expect(g.bestCombo).toBe(1);
    expect(g.last!.points).toBe(0);
  });

  it("날아가는 중에는 입력을 받지 않는다", () => {
    const g = shootAtPower(started(), started().shot.required);
    const typed = step(g, { type: "type", value: "아무거나", now: T0 + 9999 });
    expect(typed).toBe(g);
  });

  it("landed로 결과 화면에 들어간다", () => {
    const g = shootAtPower(started(), started().shot.required);
    expect(step(g, { type: "landed" }).phase).toBe("result");
  });

  it("next로 다음 슛이 뜨고 시계는 다시 꺼진다", () => {
    let g = shootAtPower(started(), started().shot.required);
    g = step(step(g, { type: "landed" }), { type: "next" });
    expect(g.phase).toBe("typing");
    expect(g.shotIndex).toBe(1);
    expect(g.shot.startedAt).toBeNull();
    expect(g.shot.typed).toBe("");
    expect(g.last).toBeNull();
  });

  it("정해진 횟수를 다 던지면 끝난다", () => {
    let g = started();
    for (let i = 0; i < SHOTS_PER_GAME; i++) {
      g = shootAtPower(g, g.shot.required);
      g = step(step(g, { type: "landed" }), { type: "next" });
    }
    expect(g.phase).toBe("done");
    expect(g.history).toHaveLength(SHOTS_PER_GAME);
  });

  it("오타는 길에서 벗어난 순간에만 한 번 센다", () => {
    let g = started();
    const word = g.shot.word;
    const wrong = word[0] === "하" ? "바" : "하";
    g = step(g, { type: "type", value: wrong, now: T0 });
    g = step(g, { type: "type", value: wrong + "하", now: T0 + 100 });
    g = step(g, { type: "type", value: wrong + "하하", now: T0 + 200 });
    expect(g.shot.mistakes).toBe(1);
  });

  it("조합 중간 상태는 오타가 아니다", () => {
    let g = started();
    const word = g.shot.word;
    for (let i = 1; i <= word.length; i++) {
      g = step(g, { type: "type", value: word.slice(0, i), now: T0 + i * 300 });
      if (g.phase !== "typing") break;
    }
    expect(g.last!.mistakes).toBe(0);
  });
});

describe("summarize", () => {
  it("넣은 수·클린 수·타수를 모은다", () => {
    let g = started();
    g = shootAtPower(g, g.shot.required);
    g = step(step(g, { type: "landed" }), { type: "next" });
    g = shootAtPower(g, g.shot.required - 40);
    const s = summarize(g);
    expect(s.attempts).toBe(2);
    expect(s.made).toBe(1);
    expect(s.cleans).toBe(1);
    expect(s.spm).toBeGreaterThan(0);
  });

  it("한 번도 안 던졌으면 0으로 나온다", () => {
    const s = summarize(started());
    expect(s.attempts).toBe(0);
    expect(s.spm).toBe(0);
  });
});

describe("strokesPerMinute", () => {
  it("8타를 1초에 치면 480타/분이다", () => {
    expect(strokesPerMinute(8, 1000)).toBeCloseTo(480, 5);
  });

  it("시간이 0이면 0이다", () => {
    expect(strokesPerMinute(8, 0)).toBe(0);
  });
});

describe("grade", () => {
  it("성공률에 따라 다른 평이 나온다", () => {
    const base = { score: 0, bestCombo: 0, spm: 0, mistakes: 0, cleans: 0, totalMs: 0 };
    expect(grade({ ...base, made: 10, attempts: 10 })).not.toBe(
      grade({ ...base, made: 1, attempts: 10 }),
    );
  });

  it("클린샷이 많으면 따로 알아준다", () => {
    const base = { score: 0, bestCombo: 0, spm: 0, mistakes: 0, totalMs: 0, made: 10, attempts: 10 };
    expect(grade({ ...base, cleans: 8 })).not.toBe(grade({ ...base, cleans: 0 }));
  });
});

describe("낱말 타수", () => {
  it("게임이 고른 단어의 타수가 실제 타수와 같다", () => {
    const g = started();
    expect(g.shot.keystrokes).toBe(keystrokesOf(g.shot.word));
  });
});
