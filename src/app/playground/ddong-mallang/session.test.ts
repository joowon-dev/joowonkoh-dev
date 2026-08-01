import { describe, it, expect } from "vitest";
import {
  BREATHE_MS,
  PUSH_MS,
  createSession,
  secondsLeft,
  step,
  type Session,
  type SessionEvent,
} from "./session";

/** 이벤트를 순서대로 먹인다 */
function feed(s: Session, ...events: SessionEvent[]): Session {
  return events.reduce(step, s);
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
    const s = feed(pushing(), { type: "tick", dt: 2000 }, { type: "press" });
    expect(s.remainingMs).toBe(PUSH_MS - 2000);
    expect(s.pushCount).toBe(1);
  });

  it("5초를 다 쓰면 심호흡으로 넘어간다", () => {
    const s = step(pushing(), { type: "tick", dt: PUSH_MS });
    expect(s.phase).toBe("breathing");
    expect(s.remainingMs).toBe(BREATHE_MS);
  });

  it("tick이 쪼개져 들어와도 누적이 맞는다", () => {
    const split = feed(
      pushing(),
      { type: "tick", dt: 2000 },
      { type: "tick", dt: 2000 },
      { type: "tick", dt: 2000 },
    );
    const once = step(pushing(), { type: "tick", dt: 6000 });
    expect(split.phase).toBe(once.phase);
    expect(split.remainingMs).toBe(once.remainingMs);
    expect(split.elapsedMs).toBe(once.elapsedMs);
  });
});

describe("심호흡", () => {
  it("힘주는 중에 손을 떼면 바로 심호흡이다 — 실패가 없다", () => {
    const s = feed(pushing(), { type: "tick", dt: 1000 }, { type: "release" });
    expect(s.phase).toBe("breathing");
    expect(s.remainingMs).toBe(BREATHE_MS);
  });

  it("3초가 지나면 다시 힘주기를 기다린다", () => {
    const s = feed(pushing(), { type: "release" }, { type: "tick", dt: BREATHE_MS });
    expect(s.phase).toBe("waiting");
  });

  it("waiting에서는 카운트다운이 없다", () => {
    const s = feed(
      pushing(),
      { type: "release" },
      { type: "tick", dt: BREATHE_MS },
      { type: "tick", dt: 9000 },
    );
    expect(s.phase).toBe("waiting");
    expect(s.remainingMs).toBe(0);
  });

  it("waiting에서도 총 시간은 흐른다", () => {
    const s = feed(createSession(), { type: "start" }, { type: "tick", dt: 4000 });
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
    expect(secondsLeft(step(pushing(), { type: "tick", dt: 1000 }))).toBe(4);
  });
});
