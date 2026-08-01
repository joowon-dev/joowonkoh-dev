import { describe, it, expect } from "vitest";
import {
  BREATHE_MS,
  PUSH_MS,
  TEMPO_NOTE_MS,
  MAX_TICK_MS,
  createSession,
  label,
  secondsLeft,
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

  it("5초를 다 쓰면 심호흡으로 넘어간다", () => {
    const s = run(pushing(), PUSH_MS);
    expect(s.phase).toBe("breathing");
    expect(s.remainingMs).toBe(BREATHE_MS);
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
  it("5초를 채우면 칭찬이 붙는다", () => {
    const s = run(pushing(), PUSH_MS);
    expect(s.praise).toBe(true);
    expect(label(s)).toBe("잘했어요, 심호흡하세요");
  });

  it("일찍 떼면 칭찬도 지적도 없다", () => {
    const s = feed(run(pushing(), 1000), { type: "release" });
    expect(s.praise).toBe(false);
    expect(label(s)).toBe("심호흡하세요");
  });

  it("칭찬은 다음 힘주기로 넘어가지 않는다", () => {
    const s = feed(
      run(run(pushing(), PUSH_MS), BREATHE_MS),
      { type: "press" },
    );
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
      TEMPO_NOTE_MS,
    );
    expect(s.phase).toBe("pushing");
    expect(label(s)).toBe("조금만 더 힘내보세요");
  });

  it("1.5초가 되기 전에는 아직 보인다", () => {
    const s = run(
      feed(
        pushing(),
        { type: "release" },
        { type: "press" },
      ),
      TEMPO_NOTE_MS - 100,
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
    expect(label(s)).toBe("조금만 더 힘내보세요");
  });
});

describe("문구", () => {
  it("시작 전과 끝난 뒤에는 지시가 없다", () => {
    expect(label(createSession())).toBe("");
  });

  it("힘주기를 기다린다", () => {
    expect(label(step(createSession(), { type: "start" }))).toBe("배를 꾹 눌러보세요");
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
    s = feed(s, { type: "press" });
    s = run(s, PUSH_MS);
    s = run(s, BREATHE_MS);
    s = feed(s, { type: "press" });
    s = feed(s, { type: "release" });
    s = run(s, BREATHE_MS);
    s = feed(s, { type: "press" });
    s = feed(s, { type: "finish" });
    expect(s.pushCount).toBe(3);
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
