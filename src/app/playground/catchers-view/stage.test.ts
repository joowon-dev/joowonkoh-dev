import { describe, expect, it } from "vitest";
import { REPLAY_SPEED, makeTimeline, sampleAt, stageAt } from "./stage";

const FLIGHT = 0.43;
const timeline = makeTimeline(FLIGHT);

describe("makeTimeline", () => {
  it("순서대로 이어 붙는다", () => {
    expect(timeline.windupEnd).toBeLessThan(timeline.liveEnd);
    expect(timeline.liveEnd).toBeLessThan(timeline.mittEnd);
    expect(timeline.mittEnd).toBeLessThan(timeline.replayEnd);
    expect(timeline.replayEnd).toBeLessThan(timeline.total);
  });

  it("실시간 구간이 실제 비행 시간과 같다", () => {
    expect(timeline.liveEnd - timeline.windupEnd).toBeCloseTo(FLIGHT, 9);
  });

  it("리플레이가 실시간보다 훨씬 길다", () => {
    const replay = timeline.replayEnd - timeline.mittEnd;
    expect(replay).toBeCloseTo(FLIGHT / REPLAY_SPEED, 9);
    expect(replay).toBeGreaterThan(FLIGHT * 5);
  });

  it("빠른 공일수록 한 사이클이 짧다", () => {
    expect(makeTimeline(0.40).total).toBeLessThan(makeTimeline(0.55).total);
  });
});

describe("stageAt", () => {
  it("구간마다 이름이 맞다", () => {
    expect(stageAt(0, timeline).phase).toBe("windup");
    expect(stageAt(timeline.windupEnd + 0.01, timeline).phase).toBe("live");
    expect(stageAt(timeline.liveEnd + 0.01, timeline).phase).toBe("mitt");
    expect(stageAt(timeline.mittEnd + 0.01, timeline).phase).toBe("replay");
    expect(stageAt(timeline.replayEnd + 0.01, timeline).phase).toBe("rest");
  });

  it("손을 떠나기 전에는 공이 없다", () => {
    expect(stageAt(0, timeline).flightTime).toBeNull();
    expect(stageAt(timeline.windupEnd - 0.001, timeline).flightTime).toBeNull();
  });

  it("팔이 0에서 1로 올라갔다가 릴리스 뒤 그대로 있는다", () => {
    expect(stageAt(0, timeline).armPhase).toBe(0);
    expect(stageAt(timeline.windupEnd * 0.5, timeline).armPhase).toBeCloseTo(0.5, 6);
    expect(stageAt(timeline.windupEnd + 0.05, timeline).armPhase).toBe(1);
    expect(stageAt(timeline.mittEnd + 0.5, timeline).armPhase).toBe(1);
  });

  it("실시간 구간의 비행 시각이 0에서 비행 시간까지 흐른다", () => {
    expect(stageAt(timeline.windupEnd, timeline).flightTime).toBeCloseTo(0, 9);
    expect(stageAt(timeline.liveEnd - 0.001, timeline).flightTime).toBeCloseTo(FLIGHT - 0.001, 6);
  });

  it("실시간 구간에는 자막을 안 띄운다", () => {
    // 0.4초짜리 공에 글씨를 얹으면 글씨를 읽다 공을 놓친다
    expect(stageAt(timeline.windupEnd + FLIGHT / 2, timeline).replayProgress).toBe(0);
  });

  it("미트에서 공이 도착 지점에 머물다 사라진다", () => {
    expect(stageAt(timeline.liveEnd, timeline).flightTime).toBeCloseTo(FLIGHT, 9);
    expect(stageAt(timeline.liveEnd, timeline).ballFade).toBeCloseTo(1, 6);
    expect(stageAt(timeline.mittEnd - 0.001, timeline).ballFade).toBeLessThan(0.02);
  });

  it("리플레이가 느리게 같은 궤적을 다시 훑는다", () => {
    const quarter = stageAt(timeline.mittEnd + (timeline.replayEnd - timeline.mittEnd) * 0.25, timeline);
    expect(quarter.flightTime).toBeCloseTo(FLIGHT * 0.25, 6);
    expect(quarter.replayProgress).toBeCloseTo(0.25, 6);
  });

  it("리플레이 끝에서 비행 시각이 넘치지 않는다", () => {
    const end = stageAt(timeline.replayEnd - 1e-9, timeline);
    expect(end.flightTime).toBeLessThanOrEqual(FLIGHT);
  });

  it("쉬는 동안에는 공이 없다", () => {
    const rest = stageAt(timeline.total - 0.01, timeline);
    expect(rest.flightTime).toBeNull();
    expect(rest.ballFade).toBe(0);
  });

  it("어느 시각에도 값이 범위를 벗어나지 않는다", () => {
    for (let t = 0; t < timeline.total; t += timeline.total / 400) {
      const state = stageAt(t, timeline);
      expect(state.armPhase).toBeGreaterThanOrEqual(0);
      expect(state.armPhase).toBeLessThanOrEqual(1);
      expect(state.ballFade).toBeGreaterThanOrEqual(0);
      expect(state.ballFade).toBeLessThanOrEqual(1);
      if (state.flightTime !== null) {
        expect(state.flightTime).toBeGreaterThanOrEqual(0);
        expect(state.flightTime).toBeLessThanOrEqual(FLIGHT + 1e-9);
      }
    }
  });
});

describe("sampleAt", () => {
  const samples = [{ t: 0 }, { t: 0.1 }, { t: 0.2 }, { t: 0.3 }];

  it("두 표본 사이를 가리키고 비율을 준다", () => {
    const [lo, hi, f] = sampleAt(samples, 0.15);
    expect(lo.t).toBeCloseTo(0.1, 9);
    expect(hi.t).toBeCloseTo(0.2, 9);
    expect(f).toBeCloseTo(0.5, 6);
  });

  it("처음과 끝을 넘어가도 잘라 준다", () => {
    expect(sampleAt(samples, -1)[2]).toBe(0);
    const [lo, hi, f] = sampleAt(samples, 99);
    expect(lo.t).toBeCloseTo(0.2, 9);
    expect(hi.t).toBeCloseTo(0.3, 9);
    expect(f).toBe(1);
  });

  it("표본이 하나뿐이어도 터지지 않는다", () => {
    const [lo, hi, f] = sampleAt([{ t: 0 }], 5);
    expect(lo).toBe(hi);
    expect(f).toBe(0);
  });
});

describe("팔로스루", () => {
  const timeline = makeTimeline(0.42);

  it("와인드업 동안에는 없다", () => {
    expect(stageAt(0, timeline).followThrough).toBe(0);
    expect(stageAt(timeline.windupEnd * 0.9, timeline).followThrough).toBe(0);
  });

  it("릴리스 직후에 시작해 공보다 먼저 끝난다", () => {
    expect(stageAt(timeline.windupEnd + 0.001, timeline).followThrough).toBeLessThan(0.05);
    expect(stageAt(timeline.windupEnd + 0.30, timeline).followThrough).toBe(1);
  });

  it("미트와 리플레이 내내 유지된다 — 릴리스 자세로 얼어붙지 않는다", () => {
    expect(stageAt(timeline.liveEnd + 0.1, timeline).followThrough).toBe(1);
    expect(stageAt(timeline.mittEnd + 0.5, timeline).followThrough).toBe(1);
  });

  it("쉬는 동안 팔과 함께 셋포지션으로 돌아온다", () => {
    const rest = stageAt(timeline.replayEnd + 0.01, timeline);
    expect(rest.followThrough).toBeCloseTo(rest.armPhase, 9);
    expect(stageAt(timeline.total - 0.001, timeline).followThrough).toBeLessThan(0.02);
  });

  it("언제나 0과 1 사이다", () => {
    for (let t = 0; t < timeline.total; t += 0.01) {
      const v = stageAt(t, timeline).followThrough;
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
