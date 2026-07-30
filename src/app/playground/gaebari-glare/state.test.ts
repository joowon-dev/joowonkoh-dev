import { describe, it, expect } from "vitest";
import {
  FALL_FRAMES,
  RISE_FRAMES,
  THRESHOLDS,
  createGlareState,
  stepGlare,
  type GlareState,
} from "./state";

/** 같은 비율을 n프레임 먹인다 */
function hold(s: GlareState, ratio: number | null, n: number, sensitivity = 1): GlareState {
  let out = s;
  for (let i = 0; i < n; i += 1) out = stepGlare(out, ratio, sensitivity);
  return out;
}

/** stare까지 올려둔 상태를 만든다 */
function atStare(): GlareState {
  const s = hold(createGlareState(), 0.15, RISE_FRAMES);
  expect(s.level).toBe("stare");
  return s;
}

describe("단계 상승", () => {
  it("아무도 없으면 idle이다", () => {
    expect(hold(createGlareState(), null, 30).level).toBe("idle");
  });

  it("RISE_FRAMES를 채워야 올라간다", () => {
    let s = createGlareState();
    for (let i = 1; i < RISE_FRAMES; i += 1) {
      s = stepGlare(s, 0.15);
      expect(s.level).toBe("idle");
    }
    s = stepGlare(s, 0.15);
    expect(s.level).toBe("stare");
  });

  it("두 단계 이상 점프해도 RISE_FRAMES면 충분하다", () => {
    // 문을 열고 코앞까지 성큼 다가온 경우. 한 단계씩 기어 올라가면 반응이 늦다.
    const s = hold(createGlareState(), 0.3, RISE_FRAMES);
    expect(s.level).toBe("glare");
  });

  it("단발 오검출은 무시한다", () => {
    let s = createGlareState();
    s = stepGlare(s, 0.3); // 한 프레임 튐
    s = hold(s, null, 2);
    expect(s.level).toBe("idle");
  });
});

describe("단계 하강", () => {
  it("FALL_FRAMES를 채워야 내려온다", () => {
    let s = atStare();
    s = hold(s, null, FALL_FRAMES - 1);
    expect(s.level).toBe("stare");

    s = stepGlare(s, null);
    expect(s.level).toBe("idle");
  });

  it("상승보다 하강이 훨씬 느리다", () => {
    // 노려보던 것은 좀 더 노려보는 게 자연스럽다
    expect(FALL_FRAMES).toBeGreaterThan(RISE_FRAMES * 3);
  });

  it("잠깐 고개를 돌린 정도로는 안 내려온다", () => {
    let s = atStare();
    s = hold(s, null, 5); // 0.5초 미검출
    s = hold(s, 0.15, 3); // 다시 잡힘
    expect(s.level).toBe("stare");
  });
});

describe("경계 떨림", () => {
  it("임계값 근처에서 진동해도 단계가 안 오간다", () => {
    // 검출 박스는 매 프레임 몇 픽셀씩 떨린다. 여유구간이 없으면 여기서 발작한다.
    const t = THRESHOLDS.stare;
    let s = hold(createGlareState(), t * 1.2, RISE_FRAMES);
    expect(s.level).toBe("stare");

    const before = s.level;
    for (let i = 0; i < 60; i += 1) {
      s = stepGlare(s, i % 2 === 0 ? t * 0.98 : t * 1.02);
    }
    expect(s.level).toBe(before);
  });

  it("여유구간 밖으로 확실히 나가면 내려온다", () => {
    let s = hold(createGlareState(), THRESHOLDS.stare * 1.2, RISE_FRAMES);
    s = hold(s, THRESHOLDS.glance * 1.2, FALL_FRAMES);
    expect(s.level).toBe("glance");
  });

  it("올라갈 때는 임계값보다 더 가까워져야 한다", () => {
    // 임계값에 딱 걸친 값으로는 안 올라간다 (110% 필요)
    const s = hold(createGlareState(), THRESHOLDS.glance, RISE_FRAMES * 3);
    expect(s.level).toBe("idle");
  });
});

describe("민감도", () => {
  it("민감도를 올리면 같은 거리에서 더 세게 반응한다", () => {
    const ratio = THRESHOLDS.stare;
    const normal = hold(createGlareState(), ratio, RISE_FRAMES * 2, 1);
    const touchy = hold(createGlareState(), ratio, RISE_FRAMES * 2, 1.5);
    expect(normal.level).toBe("glance");
    expect(touchy.level).toBe("stare");
  });

  it("민감도를 낮추면 반응이 늦다", () => {
    const ratio = THRESHOLDS.glance * 1.2;
    expect(hold(createGlareState(), ratio, RISE_FRAMES * 2, 1).level).toBe("glance");
    expect(hold(createGlareState(), ratio, RISE_FRAMES * 2, 0.6).level).toBe("idle");
  });

  it("민감도가 0이어도 터지지 않는다", () => {
    expect(() => hold(createGlareState(), 0.3, 5, 0)).not.toThrow();
  });
});

describe("불변성", () => {
  it("이전 상태를 건드리지 않는다", () => {
    const s = createGlareState();
    const copy = { ...s };
    stepGlare(s, 0.3);
    expect(s).toEqual(copy);
  });
});
