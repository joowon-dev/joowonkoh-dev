/**
 * 힘주기 ↔ 심호흡 사이클의 상태 머신.
 *
 * React도 DOM도 모른다. 시간을 tick(dt)으로 받기 때문에 5초를 기다리지 않고
 * 전이를 전부 단위 테스트로 확인할 수 있다. 이 앱의 로직은 사실상 여기가 전부다.
 */

export type Phase = "ready" | "waiting" | "pushing" | "extra" | "breathing" | "done";

/** 힘주기 한 번의 길이 */
export const PUSH_MS = 5000;
/** 심호흡 한 번의 길이 */
export const BREATHE_MS = 3000;
/** tick의 최대 진전. 화면이 잠겼다 깼을 때 rAF가 분 단위의 dt를 한 번에 전달해도 단계를 건너뛰지 않는다. 자리 비운 시간은 elapsedMs에 안 센다. */
export const MAX_TICK_MS = 100;
/** 한마디가 떠 있는 시간. 지나면 그 단계의 평소 문구로 돌아간다. */
export const NOTE_MS = 1500;
/** 누르자마자 주는 최소 세기. 0에서 시작하면 첫 터치가 무반응으로 보인다. */
export const STRAIN_FLOOR = 0.18;

/**
 * 잠깐 떴다 사라지는 한마디.
 *
 * 두 개가 동시에 뜰 일이 없어서 슬롯 하나로 둔다 — tempo는 힘주는 중에,
 * regret은 쉬는 중에만 나온다. 타이머를 종류마다 따로 두면 늘어날수록 엉킨다.
 */
export type Note = "none" | "tempo" | "regret";

export interface Session {
  phase: Phase;
  /** 현재 단계의 남은 시간. waiting·ready·done에서는 0 */
  remainingMs: number;
  /** "시작하기" 이후 누적된 총 시간. 벽시계를 읽지 않고 tick만 더한다 */
  elapsedMs: number;
  /** pushing에 진입한 횟수. 5초를 채웠는지는 세지 않는다 */
  pushCount: number;
  /** 방금 힘주기를 온전히 채웠다 */
  praise: boolean;
  /** 지금 떠 있는 한마디 */
  note: Note;
  /** 그 한마디가 남은 시간. 0이면 안 보인다 */
  noteMs: number;
  /** 버티기(extra)에 들어간 뒤 누른 채로 버틴 시간. 다른 단계에서는 0 */
  extraMs: number;
  /** 힘주기 한 번마다 버틴 시간(ms). 끝나고 템포 기록으로 보여준다 */
  pushes: number[];
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
    note: "none",
    noteMs: 0,
    extraMs: 0,
    pushes: [],
  };
}

/** 지금 진행 중인 힘주기가 몇 ms째인지. 누르고 있지 않으면 0 */
export function currentPushMs(s: Session): number {
  if (s.phase === "pushing") return PUSH_MS - s.remainingMs;
  if (s.phase === "extra") return PUSH_MS + s.extraMs;
  return 0;
}

/**
 * 화면에 띄울 숫자.
 *
 * 힘주기·심호흡에서는 남은 초다. 올림이라 5에서 시작하고 0이 스치지 않는다.
 * 버티기에서는 반대로 버틴 초가 1부터 올라간다 — 카운트가 0에 닿는 순간
 * 숫자가 사라지면 "끝났다"로 읽히는데, 아직 누르고 있으니 끝난 게 아니다.
 */
export function secondsLeft(s: Session): number {
  if (s.phase === "extra") return Math.floor(s.extraMs / 1000) + 1;
  return Math.ceil(s.remainingMs / 1000);
}

function withNote(s: Session, note: Note): Session {
  return { ...s, note, noteMs: note === "none" ? 0 : NOTE_MS };
}

function startPush(s: Session, note: Note = "none"): Session {
  return withNote(
    {
      ...s,
      phase: "pushing",
      remainingMs: PUSH_MS,
      praise: false,
      extraMs: 0,
      pushCount: s.pushCount + 1,
    },
    note,
  );
}

/** 방금까지 버틴 힘주기를 기록에 남기고 심호흡으로 넘긴다 */
function startBreathe(s: Session, praise: boolean, note: Note = "none"): Session {
  const pushes = [...s.pushes, currentPushMs(s)];
  return withNote(
    { ...s, phase: "breathing", remainingMs: BREATHE_MS, extraMs: 0, praise, pushes },
    note,
  );
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
  const noteMs = Math.max(0, s.noteMs - dt);

  if (s.phase === "waiting") return { ...s, elapsedMs, noteMs };

  // 버티기는 시간이 거꾸로 쌓인다. 저절로 끝나지 않고, 손을 떼야 끝난다.
  if (s.phase === "extra") {
    return { ...s, elapsedMs, noteMs, extraMs: s.extraMs + dt };
  }

  const remainingMs = s.remainingMs - dt;
  if (remainingMs > 0) return { ...s, elapsedMs, remainingMs, noteMs };

  // 5초를 다 채웠는데 아직 누르고 있다. 여기서 심호흡으로 밀어버리면 손은 배 위에
  // 있는데 화면은 "배를 꾹 눌러보세요"를 띄우는 상태가 된다 — 고장으로 읽힌다.
  // 그래서 버티기로 넘긴다. 계속 누르는 만큼 숫자가 올라간다.
  if (s.phase === "pushing") {
    return { ...s, phase: "extra", elapsedMs, noteMs, remainingMs: 0, extraMs: 0 };
  }
  return { ...s, phase: "waiting", elapsedMs, noteMs, remainingMs: 0, praise: false };
}

export function step(s: Session, e: SessionEvent): Session {
  switch (e.type) {
    case "start":
      return s.phase === "ready" ? { ...s, phase: "waiting" } : s;

    case "press":
      if (s.phase === "waiting") return startPush(s);
      // 심호흡 중에 눌러도 받아준다. 다만 템포가 빨랐다고 알려준다.
      if (s.phase === "breathing") return startPush(s, "tempo");
      return s;

    case "release":
      // 5초를 못 채우고 뗐다. 실패로 치지는 않지만, 다음엔 끝까지 가보자고 한마디 얹는다.
      if (s.phase === "pushing") return startBreathe(s, false, "regret");
      // 버티기까지 갔으면 5초를 채운 것이다. 칭찬은 여기서 붙는다.
      if (s.phase === "extra") return startBreathe(s, true);
      return s;

    case "finish":
      // ready에서는 끝낼 게 없다. 시작도 안 했다.
      // 누른 채로 끝냈다면 그 힘주기도 기록에 남긴다 — 안 그러면 마지막 한 번이 사라진다.
      if (s.phase === "ready") return s;
      return {
        ...s,
        phase: "done",
        remainingMs: 0,
        note: "none",
        noteMs: 0,
        extraMs: 0,
        pushes: currentPushMs(s) > 0 ? [...s.pushes, currentPushMs(s)] : s.pushes,
      };

    case "restart":
      return s.phase === "done" ? createSession() : s;

    case "tick":
      return tick(s, e.dt);
  }
}

/** "다 쌌어요"를 보일지. 시작 전과 끝난 뒤에는 없다. */
export function canFinish(s: Session): boolean {
  return s.phase !== "ready" && s.phase !== "done";
}

/**
 * 힘주기 카운트별 문구. 인덱스가 곧 남은 초다(0번은 안 쓴다).
 *
 * 같은 말을 5초 내내 띄우면 시간이 안 가는 것처럼 느껴진다. 숫자가 줄수록
 * 말이 짧고 급해지게 해서 끝이 다가오는 게 문구만으로도 읽히게 한다.
 */
const PUSH_LABELS = ["", "거의 다 왔다!", "더더", "더", "조금만 힘내주세요", "자, 힘줘볼까요"];

/**
 * 버티기 문구. 인덱스가 버틴 초다(0번은 안 쓴다).
 *
 * 5초를 넘겨서까지 누르고 있는 사람에게 계속 "힘내라"고 하는 건 눈치가 없다.
 * 놀라다가 걱정하는 쪽으로 바뀐다. 마지막 문구는 계속 버티는 동안 유지된다.
 */
const EXTRA_LABELS = ["", "더 힘준다고?", "아직도?!", "대단한데요", "이쯤이면 프로", "무리하진 마세요"];

function pick(labels: readonly string[], n: number): string {
  return labels[Math.min(n, labels.length - 1)] ?? "";
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
      return s.note === "tempo" && s.noteMs > 0
        ? "템포가 빨랐어요"
        : pick(PUSH_LABELS, secondsLeft(s));
    case "extra":
      return pick(EXTRA_LABELS, secondsLeft(s));
    case "breathing":
      if (s.note === "regret" && s.noteMs > 0) return "아쉬워요, 다음엔 끝까지 힘줘 봐요";
      return s.praise ? "잘했어요, 심호흡하세요" : "심호흡하세요";
    default:
      return "";
  }
}

/**
 * 힘주는 세기, 0~1.
 *
 * 고양이 표정과 배 눌림이 이 값 하나로 굴러간다. 누르는 5초 동안 0에서 1까지
 * 이어서 올라가므로 표정이 단계적으로 일그러진다 — 눌렀다/안 눌렀다 둘로만
 * 나누면 5초가 그냥 정지 화면이 된다. 버티기에서는 계속 최대다.
 */
export function strainLevel(s: Session): number {
  if (s.phase === "extra") return 1;
  if (s.phase !== "pushing") return 0;
  const progress = Math.min(1, Math.max(0, 1 - s.remainingMs / PUSH_MS));
  // 바닥값을 준다. 정확히 0에서 시작하면 누른 순간 고양이가 꿈쩍도 안 해서
  // 터치가 안 먹은 것처럼 느껴진다. 누르자마자 배가 들어가고 거기서부터 자란다.
  return STRAIN_FLOOR + (1 - STRAIN_FLOOR) * progress;
}
