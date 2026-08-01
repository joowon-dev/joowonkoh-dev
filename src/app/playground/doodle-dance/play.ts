import { CHOREO, CHOREO_SECONDS } from "./choreo";
import type { Pose, Pt } from "./figure";
import type { Drive } from "./input";

/**
 * 안무 재생. 커서를 움직이면 원본 영상의 춤이 진행되고, 손을 멈추면 거의 멈춘다.
 *
 * 자세를 보간하지 않고 키프레임을 그대로 딱딱 넘긴다. 원본이 초당 7~8장으로 넘어가는
 * 손그림이라 중간을 부드럽게 메우면 오히려 원본과 달라진다.
 */

/** 커서를 놓았을 때의 재생 속도. 완전히 멈추면 그림이 죽어 보인다. */
const IDLE_RATE = 0.12;
/** 커서를 가장 빠르게 움직였을 때의 재생 속도(배) */
const MAX_RATE = 1.9;
/** 커서 좌우 위치가 얹는 여분 기울기(rad). 안무를 덮지 않을 만큼만. */
const TILT = 0.13;
/** 커서 상하 위치가 손을 들어 올리는 양(몸 단위) */
const LIFT = 5;

const MAX_SUBSTEP = 1 / 60;
const MAX_STEP = 0.25;

export interface Player {
  /** 안무 위치(초) */
  t: number;
  rate: number;
  rateVel: number;
  tilt: number;
  tiltVel: number;
  lift: number;
  liftVel: number;
}

export function createPlayer(): Player {
  return { t: 0, rate: IDLE_RATE, rateVel: 0, tilt: 0, tiltVel: 0, lift: 0, liftVel: 0 };
}

function clamp(v: number, lo: number, hi: number): number {
  return v < lo ? lo : v > hi ? hi : v;
}

/** 굳기 k, 감쇠 d의 스프링을 한 스텝 당긴다. [값, 속도] */
function pull(value: number, vel: number, target: number, k: number, d: number, dt: number): [number, number] {
  const nextVel = vel + ((target - value) * k - vel * d) * dt;
  return [value + nextVel * dt, nextVel];
}

export function stepPlayer(player: Player, drive: Drive, dt: number): void {
  if (!Number.isFinite(dt) || dt <= 0) return;
  let left = Math.min(dt, MAX_STEP);
  while (left > 0) {
    const h = Math.min(MAX_SUBSTEP, left);
    const speed = clamp(drive.speed, 0, 1);
    const target = IDLE_RATE + (drive.active ? speed * (MAX_RATE - IDLE_RATE) : 0);
    // 굳기는 세게, 감쇠는 약하게. 손을 멈춰도 춤이 한 박자 더 흐르고 잦아든다.
    [player.rate, player.rateVel] = pull(player.rate, player.rateVel, target, 40, 9, h);
    const grip = drive.active ? 1 : 0;
    [player.tilt, player.tiltVel] = pull(player.tilt, player.tiltVel, clamp(drive.x, -1, 1) * TILT * grip, 50, 11, h);
    [player.lift, player.liftVel] = pull(player.lift, player.liftVel, clamp(drive.y, -1, 1) * LIFT * grip, 50, 11, h);
    player.t = (player.t + Math.max(0, player.rate) * h) % CHOREO_SECONDS;
    left -= h;
  }
}

/** t초 지점에서 보여줄 그림의 번호 */
export function frameIndexAt(t: number): number {
  let left = ((t % CHOREO_SECONDS) + CHOREO_SECONDS) % CHOREO_SECONDS;
  for (let i = 0; i < CHOREO.length; i++) {
    left -= CHOREO[i].d;
    if (left < 0) return i;
  }
  return CHOREO.length - 1;
}

function place(p: readonly [number, number], cos: number, sin: number, lift: number): Pt {
  const y = p[1] + lift;
  return { x: p[0] * cos - y * sin, y: p[0] * sin + y * cos };
}

export function poseAt(player: Player): Pose {
  const key = CHOREO[frameIndexAt(player.t)];
  // 커서가 얹는 기울기는 골반을 축으로 몸 전체를 돌린다. y가 위인 좌표계라
  // 오른쪽으로 기울이려면 회전 방향을 뒤집어야 한다.
  const cos = Math.cos(player.tilt);
  const sin = -Math.sin(player.tilt);
  const zero = (p: readonly [number, number]) => place(p, cos, sin, 0);
  return {
    head: zero(key.head),
    roll: key.roll + player.tilt,
    // 커서를 올리면 손만 조금 더 올라간다. 안무를 덮지 않는 정도의 반응.
    handL: place(key.hl, cos, sin, player.lift),
    handR: place(key.hr, cos, sin, player.lift),
    footL: zero(key.fl),
    footR: zero(key.fr),
  };
}
