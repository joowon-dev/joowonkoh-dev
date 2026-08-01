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
/** tick의 최대 진전. 화면이 잠겼다 깼을 때 rAF가 분 단위의 dt를 한 번에 전달해도 단계를 건너뛰지 않는다. 자리 비운 시간은 elapsedMs에 안 센다. */
export const MAX_TICK_MS = 100;
/**
 * "템포가 빨랐어요"가 떠 있는 시간.
 *
 * 심호흡 중에 누른 것을 무시하지 않는 이유: 배가 눌렸는데 화면이 반응을 안 하면
 * 고장으로 읽힌다. 힘이 들어오는 타이밍은 사용자 몸이 정하는 것이지 화면이 정할
 * 일이 아니다. 그래서 받아주고, 템포만 알려준다.
 */
export const TEMPO_NOTE_MS = 1500;

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

function startPush(s: Session, tempoNoteMs = 0): Session {
  return {
    ...s,
    phase: "pushing",
    remainingMs: PUSH_MS,
    praise: false,
    tempoNoteMs,
    pushCount: s.pushCount + 1,
  };
}

function startBreathe(s: Session, praise: boolean): Session {
  return { ...s, phase: "breathing", remainingMs: BREATHE_MS, praise };
}

/**
 * 시간이 흐른다.
 *
 * 한 번의 tick은 MAX_TICK_MS를 넘지 않으므로, 한 호출이 최대 한 단계 경계를 넘는다.
 * 남은 시간 내에서 overshoot하면 버린다(이월하지 않는다).
 */
function tick(s: Session, dt: number): Session {
  // 화면 잠금이나 앱 백그라운드에서 돌아올 때 rAF가 분 단위 dt를 전달할 수 있다.
  // 클램핑으로 단계를 건너뛰지 않는다. 자리 비운 시간은 elapsedMs에 안 센다.
  dt = Math.min(dt, MAX_TICK_MS);

  // ready·done에서는 시간이 흐르지 않는다. 시작 전이고, 이미 끝났다.
  if (s.phase === "ready" || s.phase === "done") return s;

  const elapsedMs = s.elapsedMs + dt;
  const tempoNoteMs = Math.max(0, s.tempoNoteMs - dt);

  if (s.phase === "waiting") return { ...s, elapsedMs, tempoNoteMs };

  const remainingMs = s.remainingMs - dt;
  if (remainingMs > 0) return { ...s, elapsedMs, remainingMs, tempoNoteMs };

  if (s.phase === "pushing") return startBreathe({ ...s, elapsedMs, tempoNoteMs }, true);
  return { ...s, phase: "waiting", elapsedMs, tempoNoteMs, remainingMs: 0, praise: false };
}

export function step(s: Session, e: SessionEvent): Session {
  switch (e.type) {
    case "start":
      return s.phase === "ready" ? { ...s, phase: "waiting" } : s;

    case "press":
      if (s.phase === "waiting") return startPush(s);
      // 심호흡 중에 눌러도 받아준다. 다만 템포가 빨랐다고 알려준다.
      if (s.phase === "breathing") return startPush(s, TEMPO_NOTE_MS);
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

/**
 * 화면에 띄울 지시 문구.
 *
 * 문구를 컴포넌트에 흩지 않고 여기 모은다 — 어떤 상태에서 무슨 말이 나오는지가
 * 이 앱의 핵심 동작이라 테스트로 고정해 둘 값이다.
 */
export function label(s: Session): string {
  switch (s.phase) {
    case "waiting":
      return "배를 꾹 눌러보세요";
    case "pushing":
      return s.tempoNoteMs > 0 ? "템포가 빨랐어요" : "조금만 더 힘내보세요";
    case "breathing":
      return s.praise ? "잘했어요, 심호흡하세요" : "심호흡하세요";
    default:
      return "";
  }
}
