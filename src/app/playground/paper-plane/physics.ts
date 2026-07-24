export type PlaneState = { x: number; y: number; vx: number; vy: number };
export type LaunchParams = { angle: number; power: number };

export const GROUND_Y = 0;
export const PX_PER_METER = 20;

const MAX_LAUNCH_SPEED = 900; // px/s
const START_HEIGHT = 120; // px, 발사 시작 높이
const GRAVITY = 800; // px/s^2
const DRAG = 0.6; // 속도 비례 감쇠 계수(1/s)
const LIFT = 90; // 수평속도 있을 때 약한 상향 가속 계수
const WIND_ACCEL = 700; // wind=1일 때 x가속(px/s^2)
const STOP_SPEED = 25; // 이 이하 속도 + 지면 근처면 정지

export function launch({ angle, power }: LaunchParams): PlaneState {
  const speed = MAX_LAUNCH_SPEED * Math.max(0, Math.min(1, power));
  return {
    x: 0,
    y: START_HEIGHT,
    vx: Math.cos(angle) * speed,
    vy: Math.sin(angle) * speed,
  };
}

export function step(state: PlaneState, wind: number, dt: number): PlaneState {
  const w = Math.max(0, Math.min(1, wind));
  const liftAccel = state.vx > 0 ? LIFT : 0;
  const vx = state.vx + (WIND_ACCEL * w - DRAG * state.vx) * dt;
  const vy = state.vy + (-GRAVITY + liftAccel - DRAG * state.vy) * dt;
  const x = state.x + vx * dt;
  const y = state.y + vy * dt;
  return { x, y, vx, vy };
}

export function isLanded(state: PlaneState): boolean {
  if (state.y <= GROUND_Y) return true;
  const speed = Math.hypot(state.vx, state.vy);
  return state.y <= GROUND_Y + 2 && speed < STOP_SPEED;
}

export function distanceMeters(state: PlaneState): number {
  return Math.max(0, Math.round(state.x / PX_PER_METER));
}
