/**
 * 힘주기 ↔ 심호흡 사이클의 상태 머신.
 *
 * React도 DOM도 모른다. 시간을 tick(dt)으로 받기 때문에 5초를 기다리지 않고
 * 전이를 전부 단위 테스트로 확인할 수 있다. 이 앱의 로직은 사실상 여기가 전부다.
 */

export type Phase = "ready" | "waiting" | "pushing" | "breathing" | "done";

/** 힘주기 한 번의 길이 */
export const PUSH_MS = 5000;
/** 심호흡 한 번의 길이 */
export const BREATHE_MS = 3000;

export interface Session {
  phase: Phase;
  /** 현재 단계의 남은 시간. waiting·ready·done에서는 0 */
  remainingMs: number;
  /** "시작하기" 이후 누적된 총 시간. 벽시계를 읽지 않고 tick만 더한다 */
  elapsedMs: number;
  /** pushing에 진입한 횟수. 5초를 채웠는지는 세지 않는다 */
  pushCount: number;
  /** 방금 힘주기를 온전히 채웠다 (Task 2에서 사용) */
  praise: boolean;
  /** "템포가 빨랐어요"가 남은 시간 (Task 2에서 사용) */
  tempoNoteMs: number;
}

export type SessionEvent =
  | { type: "start" }
  | { type: "press" }
  | { type: "release" }
  | { type: "finish" }
  | { type: "restart" }
  | { type: "tick"; dt: number };

export function createSession(): Session {
  return {
    phase: "ready",
    remainingMs: 0,
    elapsedMs: 0,
    pushCount: 0,
    praise: false,
    tempoNoteMs: 0,
  };
}

/** 화면에 띄울 남은 초. 올림이라 카운트가 5에서 시작하고 0이 스치지 않는다. */
export function secondsLeft(s: Session): number {
  return Math.ceil(s.remainingMs / 1000);
}

function startPush(s: Session): Session {
  return { ...s, phase: "pushing", remainingMs: PUSH_MS, praise: false, pushCount: s.pushCount + 1 };
}

function startBreathe(s: Session, praise: boolean): Session {
  return { ...s, phase: "breathing", remainingMs: BREATHE_MS, praise };
}

/**
 * 시간이 흐른다.
 *
 * 남은 시간을 넘겨 받은 dt는 버린다(이월하지 않는다). rAF의 dt는 16ms 수준이라
 * 실제로는 오차가 눈에 안 보이고, 이월을 안 하는 덕분에 dt를 어떻게 쪼개 넣어도
 * 결과가 같아진다 — 테스트가 훨씬 단순해진다.
 */
function tick(s: Session, dt: number): Session {
  // ready·done에서는 시간이 흐르지 않는다. 시작 전이고, 이미 끝났다.
  if (s.phase === "ready" || s.phase === "done") return s;

  const elapsedMs = s.elapsedMs + dt;

  if (s.phase === "waiting") return { ...s, elapsedMs };

  const remainingMs = s.remainingMs - dt;
  if (remainingMs > 0) return { ...s, elapsedMs, remainingMs };

  if (s.phase === "pushing") return startBreathe({ ...s, elapsedMs }, true);
  return { ...s, phase: "waiting", elapsedMs, remainingMs: 0, praise: false };
}

export function step(s: Session, e: SessionEvent): Session {
  switch (e.type) {
    case "start":
      return s.phase === "ready" ? { ...s, phase: "waiting" } : s;

    case "press":
      if (s.phase === "waiting") return startPush(s);
      return s;

    case "release":
      return s.phase === "pushing" ? startBreathe(s, false) : s;

    case "finish":
      return s;

    case "restart":
      return s;

    case "tick":
      return tick(s, e.dt);
  }
}
