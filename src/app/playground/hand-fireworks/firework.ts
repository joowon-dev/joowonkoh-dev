/**
 * 불꽃탄과 불꽃 입자의 물리.
 *
 * 캔버스도 시간도 모른다. 세계 하나와 흐른 시간(초)을 받아 다음 세계를 낸다.
 * 엔진이나 물리 라이브러리를 얹지 않고 적분을 직접 돌린다 —
 * 중력·항력·수명이 전부라 라이브러리를 얹으면 왜 되는지가 안 남는다.
 *
 * ## 좌표
 * **화면 높이를 1로 둔 좌표**를 쓴다. y는 아래로 자라고 0이 화면 위쪽,
 * x는 0부터 화면 가로세로비(aspect)까지다. x와 y에 같은 자를 써야 폭발이
 * 원으로 퍼진다 — 둘 다 0~1로 두면 가로로 늘어난 타원이 된다.
 * 속도는 초당 화면 높이, 가속도는 초당 제곱이다.
 */

export type Rng = () => number;

/** 중력. 1.5초쯤 올라갔다 터지도록 맞췄다 */
export const GRAVITY = 0.55;
/** 불꽃탄이 받는 공기 저항. 올라가는 동안 조금씩 느려진다 */
export const SHELL_DRAG = 0.18;
/**
 * 입자가 받는 공기 저항. 이게 커야 «퍼졌다 멈추고 흘러내리는» 모양이 나온다.
 * 다만 너무 크면 알갱이가 제자리에서 꺼져서 콩알탄이 된다 — 반경은
 * 대략 (초기 속도 / 이 값)이므로 폭발 크기를 정하는 것이 사실상 이 숫자다.
 */
export const PARTICLE_DRAG = 1.0;
/** 불꽃탄이 끌고 가는 꼬리를 초당 몇 개 뿌리나 */
const TRAIL_PER_SEC = 130;
/**
 * 입자 총량 상한. 노트북에서 양손으로 마구 쏴도 프레임이 안 무너지는 선.
 * 넘으면 오래된 것부터 지운다 — 새로 터진 불꽃이 먼저 사라지면 이상하다.
 */
export const MAX_PARTICLES = 7000;
/** 화면 아래로 이만큼 내려가면 지운다. 0이면 화면 끝에서 갑자기 사라진다 */
const FLOOR = 1.25;
/**
 * 여기까지 올라오면 정점을 못 기다리고 터뜨린다.
 *
 * 폭발 지름이 화면 높이에 육박하므로 여유가 필요하다 — 꼭대기에서 터지면
 * 위쪽이 잘려서 «큰 불꽃»이 아니라 «반쪽 불꽃»이 된다. 사람은 보통 어깨나
 * 머리 높이에서 손을 펴는데 그게 프레임 위쪽 절반이라, 이 규칙에 자주 걸린다.
 * 화면 아래에서 쏘면 정점이 0.44쯤이라 여기까지 오지도 않는다 —
 * 즉 «손을 높이 들수록 높이»는 그대로 살아 있다.
 */
export const CEILING = 0.3;

/**
 * 폭발 초기 속도. 반경은 대략 이것을 PARTICLE_DRAG로 나눈 값이라,
 * 이 둘이 «불꽃이 얼마나 크게 보이는가»를 통째로 정한다.
 */
export const BURST_SPEED = 0.52;
/** 손을 높이 들었을 때 얹히는 몫 */
export const BURST_SPEED_PER_POWER = 0.38;

/** 폭발 모양 */
export type BurstKind = "peony" | "ring" | "willow" | "double";

const KINDS: BurstKind[] = ["peony", "peony", "ring", "willow", "double"];

/** 실제 불꽃놀이에서 쓰는 금속염 색들 — 스트론튬 빨강, 나트륨 노랑, 구리 파랑 */
const HUES = [8, 32, 48, 140, 190, 210, 280, 320];

export interface Shell {
  x: number;
  y: number;
  /** 직전 위치. 렌더가 두 점을 이어 그어서 잔상을 만든다 */
  px: number;
  py: number;
  vx: number;
  vy: number;
  hue: number;
  power: number;
  kind: BurstKind;
  /** 다음 꼬리 입자까지 남은 시간(초) */
  trailDue: number;
}

export interface Particle {
  x: number;
  y: number;
  px: number;
  py: number;
  vx: number;
  vy: number;
  /** 남은 수명(초) */
  life: number;
  maxLife: number;
  hue: number;
  size: number;
  /** 중력 배수. 버들가지는 무겁게 떨어져야 «흘러내린다» */
  gravity: number;
  drag: number;
  /** 켜져 있으면 렌더가 밝기를 떨게 한다 — 반짝이 화약 */
  twinkle: boolean;
}

/**
 * 터지는 순간의 섬광.
 *
 * 알갱이만으로는 «펑»이 안 산다. 실제 불꽃놀이에서 크게 느껴지는 것은 반경보다
 * 터질 때 하늘이 한 번 밝아지는 쪽이라, 폭발 지점에 짧게 빛을 하나 깐다.
 */
export interface Flash {
  x: number;
  y: number;
  hue: number;
  /** 남은 수명(초) */
  life: number;
  maxLife: number;
  /** 세계 좌표 반지름 */
  radius: number;
}

/** 섬광이 사는 시간(초). 길면 «펑»이 아니라 «조명»이 된다 */
export const FLASH_LIFE = 0.25;

export interface World {
  shells: Shell[];
  particles: Particle[];
  flashes: Flash[];
  /** 터진 횟수 누계. 화면에 «몇 발 쐈나»로 띄운다 */
  bursts: number;
}

export function createWorld(): World {
  return { shells: [], particles: [], flashes: [], bursts: 0 };
}

const pick = <T,>(arr: T[], rng: Rng): T => arr[Math.min(arr.length - 1, Math.floor(rng() * arr.length))];

/**
 * 불꽃탄 하나를 쏜다.
 *
 * @param at 발사점. **세계 좌표**다 — 영상 프레임 좌표를 넘기면 안 된다.
 *           변환은 viewport.ts의 toWorld가 한다.
 * @param power 0~1. 손을 높이 들수록 크고, 그만큼 높이 올라간다.
 */
export function launchShell(at: { x: number; y: number }, power: number, rng: Rng): Shell {
  return {
    x: at.x,
    y: at.y,
    px: at.x,
    py: at.y,
    vx: (rng() - 0.5) * 0.1,
    vy: -(0.55 + 0.38 * power),
    hue: pick(HUES, rng),
    power,
    kind: pick(KINDS, rng),
    trailDue: 0,
  };
}

function spark(shell: Shell, rng: Rng): Particle {
  const x = shell.x + (rng() - 0.5) * 0.01;
  const y = shell.y + (rng() - 0.5) * 0.01;
  return {
    x,
    y,
    px: x,
    py: y,
    vx: (rng() - 0.5) * 0.07,
    vy: (rng() - 0.5) * 0.07 + 0.05,
    life: 0.4 + rng() * 0.35,
    maxLife: 0.75,
    hue: 40,
    size: 2.4,
    gravity: 0.3,
    drag: 2.2,
    twinkle: true,
  };
}

interface BurstShape {
  count: number;
  life: number;
  gravity: number;
  drag: number;
  size: number;
  twinkle: boolean;
}

const SHAPES: Record<BurstKind, BurstShape> = {
  peony: { count: 240, life: 2.2, gravity: 1, drag: PARTICLE_DRAG, size: 3.6, twinkle: false },
  ring: { count: 190, life: 2.1, gravity: 1, drag: PARTICLE_DRAG, size: 3.8, twinkle: true },
  // 버들가지: 느리게 퍼지고 오래 남아 중력에 흘러내린다
  willow: { count: 170, life: 3.4, gravity: 1.7, drag: 0.75, size: 3.8, twinkle: true },
  double: { count: 280, life: 2.3, gravity: 1, drag: PARTICLE_DRAG, size: 3.3, twinkle: false },
};

/**
 * 폭발 입자들. 방향은 고르게 뿌리고 **속도만** 모양마다 다르게 준다 —
 * 국화든 고리든 실제 차이가 거기에 있다. 고리는 전부 같은 속도로 나가서
 * 껍질처럼 퍼지고, 국화는 속도가 제각각이라 속이 찬 공처럼 보인다.
 */
export function burst(shell: Shell, rng: Rng): Particle[] {
  const shape = SHAPES[shell.kind];
  const base = BURST_SPEED + BURST_SPEED_PER_POWER * shell.power;
  const out: Particle[] = [];

  for (let i = 0; i < shape.count; i += 1) {
    const angle = rng() * Math.PI * 2;
    let speed: number;
    let hue = shell.hue;

    if (shell.kind === "ring") {
      speed = base * (0.94 + rng() * 0.06);
    } else if (shell.kind === "willow") {
      speed = base * 0.7 * (0.4 + 0.6 * rng());
    } else if (shell.kind === "double" && i % 2 === 1) {
      // 안쪽 심지. 색을 돌려서 두 겹으로 보이게 한다
      speed = base * 0.45 * (0.3 + 0.7 * rng());
      hue = (shell.hue + 150) % 360;
    } else {
      // 제곱근을 씌워야 원판에 고르게 깔린다. 그냥 rng()면 가운데만 빽빽해진다.
      // 아래 하한(0.45)이 낮으면 가운데만 뭉치고 바깥 테두리가 성겨 보인다.
      speed = base * (0.45 + 0.55 * Math.sqrt(rng()));
    }

    out.push({
      x: shell.x,
      y: shell.y,
      px: shell.x,
      py: shell.y,
      vx: Math.cos(angle) * speed + shell.vx * 0.3,
      vy: Math.sin(angle) * speed + shell.vy * 0.3,
      life: shape.life * (0.7 + rng() * 0.5),
      maxLife: shape.life * 1.2,
      hue,
      size: shape.size * (0.7 + rng() * 0.6),
      gravity: shape.gravity,
      drag: shape.drag,
      twinkle: shape.twinkle && rng() < 0.5,
    });
  }
  return out;
}

/** 폭발과 짝이 되는 섬광. 세게 쏜 불꽃일수록 크게 번쩍인다. */
export function flashFor(shell: Shell): Flash {
  return {
    x: shell.x,
    y: shell.y,
    hue: shell.hue,
    life: FLASH_LIFE,
    maxLife: FLASH_LIFE,
    radius: 0.34 + 0.26 * shell.power,
  };
}

/** 항력을 곱셈으로 먹인다. dt가 커도 속도가 음수로 뒤집히지 않게 0에서 자른다. */
const damp = (drag: number, dt: number): number => Math.max(0, 1 - drag * dt);

/**
 * 세계를 dt초만큼 진행시킨다. 들어온 세계는 건드리지 않고 새 세계를 만든다.
 *
 * 불꽃탄은 **정점에서** 터진다(vy가 0을 넘어가는 순간). 타이머로 터뜨리면
 * 세게 쏜 것과 약하게 쏜 것이 같은 높이에서 안 터져서, 손을 높이 든 보람이 없다.
 */
export function stepWorld(world: World, dt: number, rng: Rng): World {
  const shells: Shell[] = [];
  /** 살아남은 기존 입자. 새로 생긴 것은 뒤에 붙는다 — 상한을 넘겼을 때 오래된 쪽부터 버리려고 */
  const alive: Particle[] = [];
  const spawned: Particle[] = [];
  const flashes: Flash[] = [];
  let bursts = world.bursts;

  for (const f of world.flashes) {
    const life = f.life - dt;
    if (life > 0) flashes.push({ ...f, life });
  }

  for (const s of world.shells) {
    const vy = (s.vy + GRAVITY * dt) * damp(SHELL_DRAG, dt);
    const vx = s.vx * damp(SHELL_DRAG, dt);
    const next: Shell = {
      ...s,
      px: s.x,
      py: s.y,
      x: s.x + vx * dt,
      y: s.y + vy * dt,
      vx,
      vy,
      trailDue: s.trailDue - dt,
    };

    // 정점을 지났거나 천장에 닿으면 터진다
    if (vy >= 0 || next.y <= CEILING) {
      spawned.push(...burst(next, rng));
      flashes.push(flashFor(next));
      bursts += 1;
      continue;
    }

    let due = next.trailDue;
    while (due <= 0) {
      spawned.push(spark(next, rng));
      due += 1 / TRAIL_PER_SEC;
    }
    next.trailDue = due;
    shells.push(next);
  }

  for (const p of world.particles) {
    const life = p.life - dt;
    if (life <= 0) continue;
    const d = damp(p.drag, dt);
    const vy = (p.vy + GRAVITY * p.gravity * dt) * d;
    const vx = p.vx * d;
    const y = p.y + vy * dt;
    if (y > FLOOR) continue;
    alive.push({ ...p, px: p.x, py: p.y, x: p.x + vx * dt, y, vx, vy, life });
  }

  const particles = [...alive, ...spawned];
  return {
    shells,
    flashes,
    // 넘치면 오래된 것부터 버린다. 방금 터진 불꽃이 먼저 사라지면 눈에 띈다.
    particles:
      particles.length > MAX_PARTICLES ? particles.slice(particles.length - MAX_PARTICLES) : particles,
    bursts,
  };
}
