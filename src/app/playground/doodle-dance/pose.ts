/**
 * 낙서 인형의 자세 계산. 순수 계산만 있고 캔버스는 모른다.
 *
 * 흐느적거리는 느낌의 정체는 "몸이 커서를 늦게 따라오는 것"이다. 그래서 커서 값을
 * 자세에 바로 꽂지 않고, 부위별로 굳기가 다른 스프링을 하나씩 물려 둔다. 머리와
 * 치마·양갈래는 몸통보다 무르게 만들어 한 박자 뒤에 따라오게 한다.
 */

export const TAU = Math.PI * 2;

export interface Drive {
  /** 커서 좌우 위치. -1(왼쪽 끝) ~ 1(오른쪽 끝) */
  x: number;
  /** 커서 상하 위치. -1(아래) ~ 1(위) */
  y: number;
  /** 커서 이동 속도를 0~1로 정규화한 값 */
  speed: number;
  /** 커서나 손가락이 판 위에 있는가. 없으면 혼자 흐느적댄다. */
  active: boolean;
}

export const NEUTRAL_DRIVE: Drive = { x: 0, y: 0, speed: 0, active: false };

interface Spring {
  value: number;
  vel: number;
}

export interface Body {
  /** 커서를 잡고 있는 정도 0~1. 이 값으로 아이들 리듬과 커서 입력을 섞는다. */
  grip: Spring;
  lean: Spring;
  head: Spring;
  armL: Spring;
  armR: Spring;
  hip: Spring;
  skirt: Spring;
  tailL: Spring;
  tailR: Spring;
  energy: Spring;
  swayPhase: number;
  bouncePhase: number;
}

/** 몸통이 좌우로 기울 수 있는 최대 각(rad) */
const MAX_LEAN = 0.4;
/** 커서를 놓았을 때 혼자 좌우로 흔들리는 주기 */
const IDLE_SWAY_HZ = 0.5;
/**
 * 한 번에 적분할 수 있는 최대 시간. 탭에서 돌아왔을 때처럼 dt가 크게 들어오면
 * 스프링이 발산하므로 여기서 잘라 여러 번 적분한다.
 */
const MAX_SUBSTEP = 1 / 60;
/** dt가 이보다 길면 나머지는 버린다. 없던 시간을 몸이 따라잡을 필요는 없다. */
const MAX_STEP = 0.25;

function spring(value = 0): Spring {
  return { value, vel: 0 };
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

function clamp01(v: number): number {
  return clamp(v, 0, 1);
}

function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** 굳기 k, 감쇠 d의 스프링을 target으로 한 스텝 당긴다. */
function pull(s: Spring, target: number, k: number, d: number, dt: number): void {
  s.vel += ((target - s.value) * k - s.vel * d) * dt;
  s.value += s.vel * dt;
}

export function createBody(): Body {
  return {
    grip: spring(),
    lean: spring(),
    head: spring(),
    armL: spring(0.3),
    armR: spring(0.3),
    hip: spring(),
    skirt: spring(),
    tailL: spring(),
    tailR: spring(),
    energy: spring(),
    swayPhase: 0,
    bouncePhase: 0,
  };
}

function substep(body: Body, drive: Drive, dt: number): void {
  pull(body.grip, drive.active ? 1 : 0, 60, 14, dt);
  // 굳기는 세게, 감쇠는 약하게. 손을 멈춰도 격렬함이 잠깐 남아 여운이 생긴다.
  pull(body.energy, clamp01(drive.speed), 40, 9, dt);

  const energy = clamp01(body.energy.value);
  body.swayPhase += TAU * (IDLE_SWAY_HZ + energy * 0.45) * dt;
  body.bouncePhase += TAU * (0.9 + energy * 1.8) * dt;

  const sway = Math.sin(body.swayPhase);
  const grip = clamp01(body.grip.value);
  // 아이들일 때는 자기 리듬, 커서를 잡으면 커서 쪽으로. 그 사이는 grip이 섞는다.
  const x = lerp(sway * 0.62, clamp(drive.x, -1, 1), grip);
  const idleArm = 0.24 + 0.14 * Math.sin(body.swayPhase * 2 + 0.8);
  const armBase = lerp(idleArm, (clamp(drive.y, -1, 1) + 1) / 2, grip);

  pull(body.lean, x * MAX_LEAN, 90, 14, dt);
  // 머리는 몸통과 반대로, 그리고 더 무르게 — 몸이 기운 뒤에 갸웃한다.
  pull(body.head, -body.lean.value * 0.55 + sway * 0.05, 45, 9, dt);
  pull(body.hip, -x * 0.3, 70, 12, dt);
  pull(body.skirt, body.lean.value, 30, 6, dt);
  pull(body.tailL, body.head.value * 1.2 + 0.09 * Math.sin(body.swayPhase * 3), 35, 5.5, dt);
  pull(body.tailR, body.head.value * 1.2 - 0.09 * Math.sin(body.swayPhase * 3 + 1.4), 35, 5.5, dt);

  // 커서가 향한 쪽 팔이 더 뻗는다. 원본에서 손가락으로 가리키는 그 동작.
  // 여기에 좌우 반대 위상을 얹어야 두 팔이 같은 높이에서 만나 T자로 굳는 일이 없다.
  // 항이 많으므로 각 몫을 작게 잡는다. 합이 1을 넘으면 잘려서 양팔이 같은 높이에
  // 붙박이고, 그 모습이 정확히 T자 포즈다.
  const alternate = 0.22 * Math.sin(body.swayPhase);
  const raise = (near: number) => clamp01(0.05 + armBase * 0.66 + near * 0.28 + energy * 0.1);
  pull(body.armR, raise(Math.max(0, x)) + alternate, 55, 10, dt);
  pull(body.armL, raise(Math.max(0, -x)) - alternate, 55, 10, dt);
}

export function stepBody(body: Body, drive: Drive, dt: number): void {
  if (!Number.isFinite(dt) || dt <= 0) return;
  let left = Math.min(dt, MAX_STEP);
  while (left > 0) {
    const h = Math.min(MAX_SUBSTEP, left);
    substep(body, drive, h);
    left -= h;
  }
}

export interface Pose {
  /** 골반 좌우 이동(정규 단위) */
  hipX: number;
  /** 골반 상하 들썩임(정규 단위, +가 위) */
  hipY: number;
  /** 몸통 기울기(rad, +가 오른쪽) */
  lean: number;
  headTilt: number;
  /** 어깨에서 팔이 벌어진 각(rad). 0이면 몸에 붙어 아래로, 커지면 옆으로 올라간다. */
  armL: number;
  armR: number;
  /** 팔꿈치 굽힘(rad) */
  elbowL: number;
  elbowR: number;
  /** 들린 다리. -1이면 왼다리, +1이면 오른다리. */
  legLift: number;
  /** 치마가 몸통보다 늦게 따라오며 생기는 상대 회전(rad) */
  skirtSwing: number;
  tailL: number;
  tailR: number;
  energy: number;
}

/**
 * 팔을 가장 내렸을 때의 벌어진 각. 이보다 좁히면 팔이 원피스 실루엣 안으로 들어가
 * 선이 뭉치기만 하고 팔로 보이지 않는다.
 */
const ARM_MIN = 0.62;
/**
 * 팔을 다 올렸을 때 위팔이 벌어진 각. 수평까지 올리지 않는다. 수평이 되면 위팔이
 * 어깨선과 한 직선이 되어 몸을 관통하는 막대처럼 보인다. 올라간 느낌은 팔꿈치가 낸다.
 */
const ARM_MAX = 1.35;

export function toPose(body: Body): Pose {
  const energy = clamp01(body.energy.value);
  const bounce = Math.sin(body.bouncePhase);
  const raiseL = clamp01(body.armL.value);
  const raiseR = clamp01(body.armR.value);

  return {
    hipX: body.hip.value * 9,
    hipY: bounce * (1.2 + energy * 2.6),
    lean: body.lean.value,
    headTilt: body.head.value,
    armL: lerp(ARM_MIN, ARM_MAX, raiseL),
    armR: lerp(ARM_MIN, ARM_MAX, raiseR),
    // 항상 바깥으로 굽힌다. 팔뚝이 원피스 옆선과 나란히 내려가면 팔이 아니라
    // 옷 주름으로 보이기 때문이다. 들어올릴수록 더 젖혀 가리키는 손이 된다.
    elbowL: 0.25 + raiseL * 0.45 + energy * 0.22 * Math.sin(body.bouncePhase * 2),
    elbowR: 0.25 + raiseR * 0.45 + energy * 0.22 * Math.sin(body.bouncePhase * 2 + Math.PI),
    legLift: bounce * clamp01(0.25 + energy),
    skirtSwing: clamp((body.skirt.value - body.lean.value) * 1.6, -0.6, 0.6),
    tailL: body.tailL.value,
    tailR: body.tailR.value,
    energy,
  };
}
