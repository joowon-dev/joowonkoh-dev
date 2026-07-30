import type { Drive } from "./pose";

/**
 * 포인터 추적. 브라우저 이벤트에서 온 정규 좌표(-1~1)를 받아 자세 계산이 쓰는
 * Drive로 바꾼다. DOM을 모르는 순수 모듈이라 테스트로 감각을 확인할 수 있다.
 */
export interface Tracker {
  x: number;
  y: number;
  speed: number;
  active: boolean;
  /** 마지막 move 이벤트 시각(ms). 아직 없으면 null. */
  lastAt: number | null;
}

/** 이 속도(정규 단위/초)로 움직이면 speed가 1이 된다 */
const FULL_SPEED = 3.2;
/** 이 시간(ms) 동안 move가 없으면 손을 멈춘 것으로 본다 */
const IDLE_MS = 90;
/** 멈춘 뒤 speed가 잦아드는 비율(1/초) */
const DECAY_RATE = 4;

function createSmoothed(prev: number, next: number): number {
  // 빨라질 때는 민감하게, 느려질 때는 뭉근하게 — 급정지해도 여운이 남는다
  const t = next > prev ? 0.55 : 0.25;
  return prev + (next - prev) * t;
}

export function createTracker(): Tracker {
  return { x: 0, y: 0, speed: 0, active: false, lastAt: null };
}

export function onMove(t: Tracker, x: number, y: number, now: number): void {
  const prevAt = t.lastAt;
  const dx = x - t.x;
  const dy = y - t.y;
  t.x = x;
  t.y = y;
  t.active = true;
  t.lastAt = now;
  // 첫 이벤트에는 비교할 이전 위치가 없다. 판 위에 커서가 나타난 것만으로
  // 속도를 만들면 마우스를 올려놓기만 해도 몸이 튄다.
  if (prevAt === null) return;
  const dt = (now - prevAt) / 1000;
  if (dt <= 0) return;
  const raw = Math.min(1, Math.hypot(dx, dy) / dt / FULL_SPEED);
  t.speed = createSmoothed(t.speed, raw);
}

export function onLeave(t: Tracker): void {
  t.active = false;
  t.lastAt = null;
}

/** 프레임마다 호출. move 이벤트가 끊긴 동안 speed를 잦아들게 한다. */
export function decaySpeed(t: Tracker, now: number, dt: number): void {
  if (t.lastAt !== null && now - t.lastAt < IDLE_MS) return;
  t.speed *= Math.exp(-DECAY_RATE * dt);
  if (t.speed < 0.001) t.speed = 0;
}

export function driveOf(t: Tracker): Drive {
  return { x: t.x, y: t.y, speed: t.speed, active: t.active };
}
