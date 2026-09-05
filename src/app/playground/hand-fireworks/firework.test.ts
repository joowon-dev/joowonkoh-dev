import { describe, it, expect } from "vitest";
import {
  CEILING,
  FLASH_LIFE,
  GRAVITY,
  MAX_PARTICLES,
  burst,
  createWorld,
  flashFor,
  launchShell,
  stepWorld,
  type Rng,
  type Shell,
  type World,
} from "./firework";

/** 씨앗을 고정한 난수. 폭발이 매번 같아야 «세게 쏘면 높이 터진다»를 비교할 수 있다 */
function seeded(seed = 1): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const DT = 1 / 60;

/** 필드가 늘어도 테스트가 안 깨지도록 빈 세계 위에 얹는다 */
const makeWorld = (over: Partial<World> = {}): World => ({ ...createWorld(), ...over });

/** 무대 한가운데 아래쪽에서 쏜다 */
const AT = { x: 0.75, y: 0.8 };

/** 불꽃탄이 터질 때까지 돌리고, 터진 높이와 걸린 프레임 수를 낸다 */
function runUntilBurst(shell: Shell, rng: Rng) {
  let world: World = makeWorld({ shells: [shell], particles: [] });
  let lastY = shell.y;
  for (let i = 0; i < 600; i += 1) {
    if (world.shells.length > 0) lastY = world.shells[0].y;
    world = stepWorld(world, DT, rng);
    if (world.bursts > 0) return { world, y: lastY, frames: i + 1 };
  }
  throw new Error("불꽃탄이 끝내 안 터졌다");
}

describe("launchShell", () => {
  it("위로 나간다", () => {
    expect(launchShell(AT, 0.7, seeded()).vy).toBeLessThan(0);
  });

  it("손을 높이 들수록(power가 클수록) 세게 나간다", () => {
    const weak = launchShell(AT, 0.45, seeded());
    const strong = launchShell(AT, 1, seeded());
    expect(strong.vy).toBeLessThan(weak.vy);
  });

  it("받은 자리에서 그대로 출발한다", () => {
    const s = launchShell(AT, 0.7, seeded());
    expect([s.x, s.y, s.px, s.py]).toEqual([AT.x, AT.y, AT.x, AT.y]);
  });
});

describe("stepWorld — 불꽃탄", () => {
  it("정점에서 터지고, 터진 자리에 입자가 생긴다", () => {
    const shell = launchShell(AT, 0.7, seeded(7));
    const { world, y } = runUntilBurst(shell, seeded(7));
    expect(world.shells).toHaveLength(0);
    expect(world.bursts).toBe(1);
    expect(world.particles.length).toBeGreaterThan(50);
    // 쏜 자리(0.8)보다 훨씬 위에서 터졌다
    expect(y).toBeLessThan(0.5);
  });

  it("세게 쏘면 더 높은 곳에서 터진다", () => {
    const weak = runUntilBurst(launchShell(AT, 0.45, seeded(3)), seeded(3));
    const strong = runUntilBurst(launchShell(AT, 1, seeded(3)), seeded(3));
    expect(strong.y).toBeLessThan(weak.y);
  });

  it("천장에 닿으면 정점을 안 기다리고 터진다", () => {
    // 폭발 지름이 화면 높이에 육박하므로 꼭대기에서 터지면 위쪽 절반이 잘린다.
    // 손을 화면 위쪽에서 펴면 여기에 걸린다.
    const rng = seeded();
    const shell: Shell = { ...launchShell(AT, 1, rng), y: CEILING + 0.02, vy: -1 };
    let world = makeWorld({ shells: [shell], particles: [] });
    let highest = 1;
    for (let i = 0; i < 10 && world.bursts === 0; i += 1) {
      world = stepWorld(world, DT, rng);
      for (const s of world.shells) highest = Math.min(highest, s.y);
    }
    expect(world.bursts).toBe(1);
    // 천장 위로는 한 프레임어치 이상 못 올라간다
    expect(highest).toBeGreaterThan(CEILING - 0.03);
  });

  it("올라가는 동안 꼬리를 흘린다", () => {
    const shell = launchShell(AT, 0.7, seeded());
    const world = stepWorld(makeWorld({ shells: [shell], particles: [] }), DT, seeded());
    expect(world.shells).toHaveLength(1);
    expect(world.particles.length).toBeGreaterThan(0);
  });
});

describe("stepWorld — 입자", () => {
  it("중력이 아래로 끌어당긴다", () => {
    const rng = seeded();
    const p = burst({ ...launchShell(AT, 0.7, rng), vx: 0, vy: 0, kind: "peony" }, rng);
    // 위로 곧게 나간 입자 하나만 남긴다
    const up = { ...p[0], vx: 0, vy: -0.2, drag: 0 };
    let world: World = makeWorld({ shells: [], particles: [up] });
    for (let i = 0; i < 30; i += 1) world = stepWorld(world, DT, rng);
    expect(world.particles[0].vy).toBeCloseTo(-0.2 + GRAVITY * up.gravity * (30 * DT), 2);
  });

  it("수명이 다하면 사라진다", () => {
    const rng = seeded();
    const shell = { ...launchShell(AT, 0.7, rng), vx: 0, vy: 0 };
    let world: World = makeWorld({ shells: [], particles: burst(shell, rng) });
    expect(world.particles.length).toBeGreaterThan(0);
    for (let i = 0; i < 60 * 6; i += 1) world = stepWorld(world, DT, rng);
    expect(world.particles).toHaveLength(0);
  });

  it("화면 아래로 흘러내린 입자는 지운다", () => {
    const rng = seeded();
    const fallen = { ...burst({ ...launchShell(AT, 0.7, rng), vx: 0, vy: 0 }, rng)[0] };
    const world = stepWorld(
      makeWorld({ shells: [], particles: [{ ...fallen, y: 1.24, vy: 1, drag: 0, life: 5 }] }),
      DT,
      rng,
    );
    expect(world.particles).toHaveLength(0);
  });

  it("한꺼번에 터져도 입자 상한을 넘지 않는다", () => {
    const rng = seeded();
    // 전부 정점에 놓아 같은 프레임에 터뜨린다
    const shells = Array.from({ length: 40 }, () => ({
      ...launchShell(AT, 0.7, rng),
      vy: 0,
      kind: "double" as const,
    }));
    const world = stepWorld(makeWorld({ shells }), DT, rng);
    expect(world.particles.length).toBe(MAX_PARTICLES);
    expect(world.bursts).toBe(40);
  });
});

describe("burst — 모양", () => {
  const atRest = (kind: Shell["kind"], rng: Rng): Shell => ({
    ...launchShell(AT, 0.7, rng),
    vx: 0,
    vy: 0,
    kind,
  });
  const speeds = (kind: Shell["kind"]) => {
    const rng = seeded(11);
    return burst(atRest(kind, rng), rng).map((p) => Math.hypot(p.vx, p.vy));
  };
  const spread = (v: number[]) => {
    const mean = v.reduce((a, b) => a + b, 0) / v.length;
    return Math.sqrt(v.reduce((a, b) => a + (b - mean) ** 2, 0) / v.length) / mean;
  };

  it("고리는 속도가 고르고, 국화는 제각각이다", () => {
    // 이 차이가 모양의 전부다 — 고리는 껍질처럼, 국화는 속이 찬 공처럼 퍼진다
    expect(spread(speeds("ring"))).toBeLessThan(0.05);
    expect(spread(speeds("peony"))).toBeGreaterThan(0.12);
  });

  it("버들가지는 오래 남고 무겁게 떨어진다", () => {
    const rng = seeded(11);
    const w = burst(atRest("willow", rng), rng);
    const rng2 = seeded(11);
    const p = burst(atRest("peony", rng2), rng2);
    expect(w[0].gravity).toBeGreaterThan(p[0].gravity);
    expect(Math.max(...w.map((q) => q.maxLife))).toBeGreaterThan(Math.max(...p.map((q) => q.maxLife)));
  });

  it("겹불꽃은 색이 두 가지다", () => {
    const rng = seeded(11);
    const hues = new Set(burst(atRest("double", rng), rng).map((p) => p.hue));
    expect(hues.size).toBe(2);
  });
});

describe("폭발 크기", () => {
  /**
   * 이 페이지가 한 번 실패했던 자리다 — 처음엔 반경이 화면 높이의 0.19밖에 안 돼서
   * «콩알탄» 소리를 들었다. 속도와 항력을 건드릴 때 다시 쪼그라들지 않게 폭을 잰다.
   */
  it("국화 한 발이 화면 높이의 절반 이상을 덮는다", () => {
    const rng = seeded(5);
    const shell = { ...launchShell({ x: 0, y: 0 }, 0.53, rng), vx: 0, vy: 0, kind: "peony" as const };
    let world = makeWorld({ particles: burst(shell, rng) });
    const before = world.particles.length;

    // 가장 짧은 수명(2.0 × 0.7 = 1.4초)보다 앞에서 잰다. 죽어 사라진 알갱이가
    // 섞이면 «퍼진 폭»이 아니라 «살아남은 것들의 폭»을 재게 된다.
    for (let i = 0; i < 72; i += 1) world = stepWorld(world, DT, rng);
    expect(world.particles).toHaveLength(before);

    const xs = world.particles.map((p) => p.x);
    const width = Math.max(...xs) - Math.min(...xs);
    expect(width).toBeGreaterThan(0.85);
    // 반대로 화면을 통째로 덮어버려도 불꽃으로 안 보인다
    expect(width).toBeLessThan(1.6);
  });
});

describe("섬광", () => {
  it("터질 때 폭발 지점에 하나 생긴다", () => {
    const rng = seeded();
    const shell = { ...launchShell(AT, 0.7, rng), vy: 0 };
    const world = stepWorld(makeWorld({ shells: [shell] }), DT, rng);
    expect(world.flashes).toHaveLength(1);
    expect(world.flashes[0].hue).toBe(shell.hue);
    expect(world.flashes[0].x).toBeCloseTo(shell.x, 2);
  });

  it("세게 쏜 불꽃일수록 크게 번쩍인다", () => {
    expect(flashFor(launchShell(AT, 1, seeded())).radius).toBeGreaterThan(
      flashFor(launchShell(AT, 0.45, seeded())).radius,
    );
  });

  it("수명이 지나면 사라진다 — 남으면 «펑»이 아니라 조명이 된다", () => {
    const rng = seeded();
    let world = makeWorld({ shells: [{ ...launchShell(AT, 0.7, rng), vy: 0 }] });
    world = stepWorld(world, DT, rng);
    expect(world.flashes).toHaveLength(1);
    for (let i = 0; i < Math.ceil(FLASH_LIFE / DT) + 1; i += 1) world = stepWorld(world, DT, rng);
    expect(world.flashes).toHaveLength(0);
  });
});

describe("stepWorld — 순수성", () => {
  it("들어온 세계를 건드리지 않는다", () => {
    const rng = seeded();
    const world: World = makeWorld({ shells: [launchShell(AT, 0.7, rng)], particles: [] });
    const snapshot = structuredClone(world);
    stepWorld(world, DT, rng);
    expect(world).toEqual(snapshot);
  });

  it("빈 세계도 그냥 지나간다", () => {
    expect(stepWorld(createWorld(), DT, seeded())).toEqual(createWorld());
  });
});
