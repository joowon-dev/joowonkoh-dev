import { describe, expect, it } from "vitest";

import {
  dist,
  eatenAt,
  type Input,
  isRoomCode,
  meetAt,
  newRoomCode,
  PRESS_WINDOW,
  STICK_MM,
  viewAt,
  winnerOf,
} from "./rules";

const inp = (press: number | null, release: number | null, until = 99): Input => ({ press, release, until });

describe("먹는 길이", () => {
  it("시간이 갈수록 빨라진다", () => {
    expect(dist(1) - dist(0)).toBeLessThan(dist(3) - dist(2));
  });

  it("누른 때부터 뗀 때까지만 먹는다", () => {
    const i = inp(1, 2);
    expect(eatenAt(i, 0.5)).toBe(0);
    expect(eatenAt(i, 1.5)).toBeCloseTo(dist(1.5) - dist(1));
    expect(eatenAt(i, 5)).toBeCloseTo(dist(2) - dist(1));
  });

  it("둘 다 처음부터 끝까지 누르면 가운데쯤에서 만난다", () => {
    const t = meetAt(inp(0, null), inp(0, null), 20)!;
    expect(dist(t)).toBeCloseTo(STICK_MM / 2);
  });
});

describe("판정", () => {
  it("둘 다 멈추면 더 많이 먹은 사람이 이긴다", () => {
    const v = viewAt(inp(0, 2.5), inp(0, 2), 3);
    expect(v.outcome?.kind).toBe("ok");
    if (v.outcome?.kind !== "ok") return;
    expect(v.outcome.winner).toBe("left");
    expect(v.outcome.rest).toBeCloseTo(STICK_MM - dist(2.5) - dist(2));
    expect(winnerOf(v.outcome)).toBe("left");
  });

  it("상대가 멈췄는데 계속 먹으면 깨문다 — 깨문 사람이 진다", () => {
    const v = viewAt(inp(0, 2), inp(0, null), 6);
    expect(v.outcome?.kind).toBe("bite");
    if (v.outcome?.kind !== "bite") return;
    expect(v.outcome.biter).toBe("right");
    expect(v.outcome.left + v.outcome.right).toBeCloseTo(STICK_MM);
    expect(winnerOf(v.outcome)).toBe("left");
  });

  it("둘 다 끝까지 버티면 쿵 — 이긴 사람 없음", () => {
    const v = viewAt(inp(0, null), inp(0.2, null), 8);
    expect(v.outcome?.kind).toBe("bonk");
    expect(winnerOf(v.outcome!)).toBeNull();
  });

  it("상대 입력이 만난 순간까지 안 왔으면 확인 중으로 멈춰 있는다", () => {
    const v = viewAt(inp(0, null, 8), inp(0, null, 1), 8);
    expect(v.pending).toBe(true);
    expect(v.outcome).toBeNull();
    expect(v.left + v.right).toBeCloseTo(STICK_MM);
  });

  it("상대가 만나기 전에 뗀 게 늦게 도착해도 결과는 같다", () => {
    const late = viewAt(inp(0, null, 8), inp(0, 2, 8), 8);
    expect(late.outcome?.kind).toBe("bite");
    if (late.outcome?.kind === "bite") expect(late.outcome.biter).toBe("left");
  });

  it("아무도 안 누르면 시간 지나 0cm 로 끝", () => {
    expect(viewAt(inp(null, null, 1), inp(null, null, 1), 1).outcome).toBeNull();
    const v = viewAt(inp(null, null, PRESS_WINDOW), inp(null, null, PRESS_WINDOW), PRESS_WINDOW);
    expect(v.outcome?.kind).toBe("ok");
    if (v.outcome?.kind === "ok") expect(v.outcome.rest).toBe(STICK_MM);
  });
});

describe("방 번호", () => {
  it("만든 번호는 늘 올바른 꼴", () => {
    for (let i = 0; i < 50; i++) expect(isRoomCode(newRoomCode())).toBe(true);
    expect(isRoomCode("ABC10O")).toBe(false);
  });
});
