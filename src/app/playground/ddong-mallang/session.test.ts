import { describe, it, expect } from "vitest";
import {
  BREATHE_MS,
  PUSH_MS,
  STRAIN_FLOOR,
  NOTE_MS,
  MAX_TICK_MS,
  createSession,
  label,
  secondsLeft,
  strainLevel,
  step,
  canFinish,
  type Session,
  type SessionEvent,
} from "./session";

/** 이벤트를 순서대로 먹인다 */
function feed(s: Session, ...events: SessionEvent[]): Session {
  return events.reduce(step, s);
}

/** ms를 클램프 상한 이하로 쪼개서 먹인다 — 실제 rAF가 하는 방식이다 */
function run(s: Session, ms: number, stepMs = 50): Session {
  let out = s;
  for (let left = ms; left > 0; left -= stepMs) {
    out = step(out, { type: "tick", dt: Math.min(stepMs, left) });
  }
  return out;
}

/** 시작해서 힘주는 중까지 가 있는 상태 */
function pushing(): Session {
  const s = feed(createSession(), { type: "start" }, { type: "press" });
  expect(s.phase).toBe("pushing");
  return s;
}

describe("시작", () => {
  it("처음에는 ready다", () => {
    expect(createSession().phase).toBe("ready");
  });

  it("ready에서 누르면 아무 일도 없다 — 시작 버튼을 거쳐야 한다", () => {
    expect(step(createSession(), { type: "press" }).phase).toBe("ready");
  });

  it("start를 받으면 힘주기를 기다린다", () => {
    expect(step(createSession(), { type: "start" }).phase).toBe("waiting");
  });

  it("ready에서 시간은 흐르지 않는다", () => {
    const s = step(createSession(), { type: "tick", dt: 1000 });
    expect(s.elapsedMs).toBe(0);
  });
});

describe("힘주기", () => {
  it("누르면 pushing으로 가고 5초가 걸린다", () => {
    expect(pushing().remainingMs).toBe(PUSH_MS);
  });

  it("누른 횟수를 센다", () => {
    expect(pushing().pushCount).toBe(1);
  });

  it("pushing 중에 또 눌러도 카운트가 리셋되지 않는다", () => {
    const s = feed(run(pushing(), 2000), { type: "press" });
    expect(s.remainingMs).toBe(PUSH_MS - 2000);
    expect(s.pushCount).toBe(1);
  });

  it("5초를 다 써도 누르고 있으면 버티기로 간다", () => {
    const s = run(pushing(), PUSH_MS);
    expect(s.phase).toBe("extra");
    expect(s.extraMs).toBe(0);
  });

  it("버티기는 저절로 끝나지 않는다 — 손을 떼야 끝난다", () => {
    const s = run(pushing(), PUSH_MS + 9000);
    expect(s.phase).toBe("extra");
  });

  it("버티기에서 손을 떼면 심호흡이다", () => {
    const s = feed(run(pushing(), PUSH_MS), { type: "release" });
    expect(s.phase).toBe("breathing");
    expect(s.remainingMs).toBe(BREATHE_MS);
  });

  it("버틴 시간은 다음 힘주기로 넘어가지 않는다", () => {
    const s = feed(
      run(run(pushing(), PUSH_MS + 3000), 0),
      { type: "release" },
      { type: "press" },
    );
    expect(s.extraMs).toBe(0);
  });

  it("tick이 쪼개져 들어와도 누적이 맞는다", () => {
    const split50 = run(pushing(), 150, 50);
    const split100 = run(pushing(), 150, 100);
    expect(split50.phase).toBe(split100.phase);
    expect(split50.remainingMs).toBe(split100.remainingMs);
    expect(split50.elapsedMs).toBe(split100.elapsedMs);
  });
});

describe("심호흡", () => {
  it("힘주는 중에 손을 떼면 바로 심호흡이다 — 실패가 없다", () => {
    const s = feed(run(pushing(), 1000), { type: "release" });
    expect(s.phase).toBe("breathing");
    expect(s.remainingMs).toBe(BREATHE_MS);
  });

  it("3초가 지나면 다시 힘주기를 기다린다", () => {
    const s = feed(pushing(), { type: "release" });
    const s2 = run(s, BREATHE_MS);
    expect(s2.phase).toBe("waiting");
  });

  it("waiting에서는 카운트다운이 없다", () => {
    let s = feed(pushing(), { type: "release" });
    s = run(s, BREATHE_MS);
    s = run(s, 9000);
    expect(s.phase).toBe("waiting");
    expect(s.remainingMs).toBe(0);
  });

  it("waiting에서도 총 시간은 흐른다", () => {
    let s = feed(createSession(), { type: "start" });
    s = run(s, 4000);
    expect(s.elapsedMs).toBe(4000);
  });
});

describe("secondsLeft", () => {
  it("5초 남았으면 5다", () => {
    expect(secondsLeft(pushing())).toBe(5);
  });

  it("조금 지났어도 아직 5다 — 올림이라 0이 화면에 안 뜬다", () => {
    expect(secondsLeft(step(pushing(), { type: "tick", dt: 1 }))).toBe(5);
  });

  it("4.0초 남으면 4다", () => {
    expect(secondsLeft(run(pushing(), 1000))).toBe(4);
  });
});

describe("클램핑", () => {
  it("화면이 잠겼다 돌아와도 단계를 건너뛰지 않는다", () => {
    const s = step(pushing(), { type: "tick", dt: 600000 });
    expect(s.phase).toBe("pushing");
    expect(s.remainingMs).toBe(PUSH_MS - MAX_TICK_MS);
  });

  it("자리를 비운 시간은 총 시간에 안 들어간다", () => {
    const s = step(pushing(), { type: "tick", dt: 600000 });
    expect(s.elapsedMs).toBe(MAX_TICK_MS);
  });
});

describe("칭찬", () => {
  it("5초를 채우고 떼면 칭찬이 붙는다", () => {
    const s = feed(run(pushing(), PUSH_MS), { type: "release" });
    expect(s.praise).toBe(true);
    expect(label(s)).toBe("잘했어요, 심호흡하세요");
  });

  it("일찍 떼면 칭찬은 없고 아쉬움 한마디가 붙는다", () => {
    const s = feed(run(pushing(), 1000), { type: "release" });
    expect(s.praise).toBe(false);
    expect(label(s)).toBe("아쉬워요, 다음엔 끝까지 힘줘 봐요");
  });

  it("아쉬움 한마디는 1.5초 뒤 사라지고 평소 문구로 돌아온다", () => {
    const s = run(feed(run(pushing(), 1000), { type: "release" }), NOTE_MS);
    expect(s.phase).toBe("breathing");
    expect(label(s)).toBe("심호흡하세요");
  });

  it("채우고 떼면 아쉬움 대신 칭찬이다", () => {
    const s = feed(run(pushing(), PUSH_MS), { type: "release" });
    expect(s.note).toBe("none");
    expect(label(s)).toBe("잘했어요, 심호흡하세요");
  });

  it("칭찬은 다음 힘주기로 넘어가지 않는다", () => {
    const s = feed(
      run(feed(run(pushing(), PUSH_MS), { type: "release" }), BREATHE_MS),
      { type: "press" },
    );
    expect(s.praise).toBe(false);
  });

  it("심호흡 도중에 눌러도 칭찬이 남지 않는다", () => {
    const breathing = feed(run(pushing(), PUSH_MS), { type: "release" });
    expect(breathing.praise).toBe(true);
    const s = step(breathing, { type: "press" });
    expect(s.phase).toBe("pushing");
    expect(s.praise).toBe(false);
  });
});

describe("템포 알림", () => {
  it("심호흡 중에 누르면 받아준다 — 무시하지 않는다", () => {
    const s = feed(pushing(), { type: "release" }, { type: "press" });
    expect(s.phase).toBe("pushing");
    expect(s.remainingMs).toBe(PUSH_MS);
    expect(s.pushCount).toBe(2);
  });

  it("템포가 빨랐다고 알려준다", () => {
    const s = feed(pushing(), { type: "release" }, { type: "press" });
    expect(label(s)).toBe("템포가 빨랐어요");
  });

  it("1.5초 뒤에는 평소 문구로 돌아온다", () => {
    const s = run(
      feed(
        pushing(),
        { type: "release" },
        { type: "press" },
      ),
      NOTE_MS,
    );
    expect(s.phase).toBe("pushing");
    expect(label(s)).toBe("조금만 힘내주세요");
  });

  it("1.5초가 되기 전에는 아직 보인다", () => {
    const s = run(
      feed(
        pushing(),
        { type: "release" },
        { type: "press" },
      ),
      NOTE_MS - 100,
    );
    expect(label(s)).toBe("템포가 빨랐어요");
  });

  it("제 타이밍에 누르면 알림이 없다", () => {
    const s = feed(
      run(
        feed(pushing(), { type: "release" }),
        BREATHE_MS,
      ),
      { type: "press" },
    );
    expect(label(s)).toBe("자, 힘줘볼까요");
  });
});

describe("문구", () => {
  it("시작 전과 끝난 뒤에는 지시가 없다", () => {
    expect(label(createSession())).toBe("");
  });

  it("힘주기를 기다린다", () => {
    expect(label(step(createSession(), { type: "start" }))).toBe("배를 꾹 눌러보세요");
  });

  it("남은 초마다 문구가 바뀐다", () => {
    // 각 초의 한가운데를 집어서 경계에 걸리지 않게 한다
    const at = (secondsRemaining: number) =>
      label(run(pushing(), PUSH_MS - secondsRemaining * 1000 + 500));
    expect(at(5)).toBe("자, 힘줘볼까요");
    expect(at(4)).toBe("조금만 힘내주세요");
    expect(at(3)).toBe("더");
    expect(at(2)).toBe("더더");
    expect(at(1)).toBe("거의 다 왔다!");

    // 다섯 초가 모두 다른 말이어야 한다 — 같은 말이 두 번 뜨면 시간이 안 간다
    const all = [at(5), at(4), at(3), at(2), at(1)];
    expect(new Set(all).size).toBe(5);
  });

  it("버틸수록 문구가 바뀐다", () => {
    const held = (ms: number) => label(run(run(pushing(), PUSH_MS), ms));
    expect(held(0)).toBe("더 힘준다고?");
    expect(held(1500)).toBe("아직도?!");
    expect(held(2500)).toBe("대단한데요");
    expect(held(3500)).toBe("이쯤이면 프로");
  });

  it("아무리 오래 버텨도 마지막 문구에서 멈춘다", () => {
    expect(label(run(run(pushing(), PUSH_MS), 60000))).toBe("무리하진 마세요");
  });
});

describe("버티기 카운트", () => {
  it("1부터 올라간다", () => {
    expect(secondsLeft(run(pushing(), PUSH_MS))).toBe(1);
  });

  it("버틴 만큼 커진다", () => {
    expect(secondsLeft(run(run(pushing(), PUSH_MS), 2500))).toBe(3);
  });
});

describe("템포 기록", () => {
  it("처음에는 비어 있다", () => {
    expect(createSession().pushes).toEqual([]);
  });

  it("손을 뗄 때마다 버틴 시간이 쌓인다", () => {
    const s = feed(run(pushing(), 2000), { type: "release" });
    expect(s.pushes).toEqual([2000]);
  });

  it("5초를 채우고 떼면 5초로 남는다", () => {
    const s = feed(run(pushing(), PUSH_MS), { type: "release" });
    expect(s.pushes).toEqual([PUSH_MS]);
  });

  it("버틴 시간까지 더해서 남는다", () => {
    const s = feed(run(run(pushing(), PUSH_MS), 2000), { type: "release" });
    expect(s.pushes).toEqual([PUSH_MS + 2000]);
  });

  it("여러 번 하면 순서대로 쌓인다", () => {
    let s = feed(createSession(), { type: "start" });
    s = feed(run(feed(s, { type: "press" }), 1500), { type: "release" });
    s = run(s, BREATHE_MS);
    s = feed(run(feed(s, { type: "press" }), 3000), { type: "release" });
    expect(s.pushes).toEqual([1500, 3000]);
    expect(s.pushCount).toBe(2);
  });

  it("누른 채로 끝내도 그 한 번이 사라지지 않는다", () => {
    const s = feed(run(pushing(), 2500), { type: "finish" });
    expect(s.phase).toBe("done");
    expect(s.pushes).toEqual([2500]);
  });

  it("누르지 않은 채 끝내면 빈 기록이 안 붙는다", () => {
    const s = feed(
      run(feed(run(pushing(), 1000), { type: "release" }), BREATHE_MS),
      { type: "finish" },
    );
    expect(s.pushes).toEqual([1000]);
  });

  it("다시 하면 기록도 지워진다", () => {
    const s = feed(run(pushing(), 2000), { type: "finish" }, { type: "restart" });
    expect(s.pushes).toEqual([]);
  });
});

describe("힘주는 세기", () => {
  it("누르기 전에는 0이다", () => {
    expect(strainLevel(step(createSession(), { type: "start" }))).toBe(0);
  });

  it("누르자마자 바닥값이 잡힌다 — 무반응으로 보이면 안 된다", () => {
    expect(strainLevel(pushing())).toBe(STRAIN_FLOOR);
  });

  it("5초에 걸쳐 바닥값에서 1까지 오른다", () => {
    const half = strainLevel(run(pushing(), PUSH_MS / 2));
    expect(half).toBeCloseTo(STRAIN_FLOOR + (1 - STRAIN_FLOOR) / 2, 5);
    expect(half).toBeGreaterThan(strainLevel(pushing()));
    expect(strainLevel(run(pushing(), PUSH_MS - 1))).toBeLessThanOrEqual(1);
  });

  it("버티는 동안에는 계속 최대다", () => {
    expect(strainLevel(run(run(pushing(), PUSH_MS), 4000))).toBe(1);
  });

  it("심호흡할 때는 0이다", () => {
    expect(strainLevel(feed(pushing(), { type: "release" }))).toBe(0);
  });
});

describe("마무리", () => {
  it("힘주는 중에도 끝낼 수 있다", () => {
    expect(step(pushing(), { type: "finish" }).phase).toBe("done");
  });

  it("심호흡 중에도 끝낼 수 있다", () => {
    const s = feed(pushing(), { type: "release" }, { type: "finish" });
    expect(s.phase).toBe("done");
  });

  it("시작도 안 했으면 끝낼 수 없다", () => {
    expect(step(createSession(), { type: "finish" }).phase).toBe("ready");
    expect(canFinish(createSession())).toBe(false);
  });

  it("시작한 뒤에는 끝낼 수 있다", () => {
    expect(canFinish(step(createSession(), { type: "start" }))).toBe(true);
  });

  it("끝난 화면에서는 종료 버튼이 없다", () => {
    expect(canFinish(step(pushing(), { type: "finish" }))).toBe(false);
  });

  it("총 걸린 시간을 집계한다", () => {
    const s = feed(
      run(
        feed(
          run(
            feed(createSession(), { type: "start" }),
            2000
          ),
          { type: "press" }
        ),
        PUSH_MS
      ),
      { type: "finish" }
    );
    expect(s.elapsedMs).toBe(2000 + PUSH_MS);
  });

  it("힘준 횟수를 집계한다 — 채운 것과 일찍 뗀 것을 함께 센다", () => {
    let s = feed(createSession(), { type: "start" });
    s = feed(s, { type: "press" }); // 1 — 5초를 채운다
    s = run(s, PUSH_MS);
    s = feed(s, { type: "release" });
    s = run(s, BREATHE_MS);
    s = feed(s, { type: "press" }); // 2 — 일찍 뗀다
    s = feed(s, { type: "release" });
    s = run(s, BREATHE_MS);
    s = feed(s, { type: "press" }); // 3 — 누른 채로 끝낸다
    s = feed(s, { type: "finish" });
    expect(s.pushCount).toBe(3);
  });

  it("버티는 중에도 끝낼 수 있다", () => {
    const s = feed(run(pushing(), PUSH_MS), { type: "finish" });
    expect(s.phase).toBe("done");
    expect(s.extraMs).toBe(0);
  });

  it("끝난 뒤에는 눌러도 시간이 안 흐른다", () => {
    const done = step(pushing(), { type: "finish" });
    let after = feed(done, { type: "press" });
    after = run(after, 5000);
    expect(after.phase).toBe("done");
    expect(after.elapsedMs).toBe(done.elapsedMs);
  });

  it("다시 하면 처음으로 돌아간다", () => {
    const s = feed(pushing(), { type: "finish" }, { type: "restart" });
    expect(s).toEqual(createSession());
  });
});
