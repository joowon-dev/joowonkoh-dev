# 똥 말랑 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 배를 보이고 누운 고양이를 꾹 누르면 힘주기 5초, 떼면 심호흡 3초를 반복하며 배변 리듬을 잡아주는 모바일 전체화면 페이지를 만든다.

**Architecture:** 로직 전부를 React·DOM을 모르는 순수 모듈 `session.ts`에 넣는다. 받는 이벤트는 `press`/`release`/`tick(dt)`와 화면 버튼 3개뿐이고, 시간을 인자로 받으므로 5초를 기다리지 않고 단위 테스트로 덮인다. `DdongMallang.tsx`가 유일하게 브라우저를 아는 층으로 포인터 이벤트와 `requestAnimationFrame`을 상태 머신에 연결하고, `Cat.tsx`는 `squish`·`mood`만 받는 표현 전용 SVG다.

**Tech Stack:** Next.js 16.2.2 (App Router), React 19.2.4, TypeScript, Tailwind v4, `motion` 12 (이미 설치됨), vitest 3

## Global Constraints

- **새 의존성을 추가하지 않는다.** `motion`이 이미 `package.json`에 있고 에셋도 쓰지 않는다 (SVG 직접 작성).
- **AGENTS.md 준수:** 이 저장소의 Next.js는 학습 데이터와 다르다. 코드를 쓰기 전에 `node_modules/next/dist/docs/`의 관련 문서를 읽는다.
- 테스트 파일은 `src/**/*.test.ts`에만 둔다 (`vitest.config.ts`의 `include`). 환경은 `node`이므로 **DOM을 쓰는 테스트는 작성하지 않는다.**
- 경로는 `/playground/ddong-mallang`, 디렉터리는 `src/app/playground/ddong-mallang/`.
- 문구는 아래 값을 **글자 그대로** 쓴다:
  - `waiting` → `배를 꾹 눌러보세요`
  - `pushing` 기본 → `조금만 더 힘내보세요`
  - `pushing` 중 템포 알림 → `템포가 빨랐어요`
  - `breathing` 기본 → `심호흡하세요`
  - `breathing` 중 칭찬 → `잘했어요, 심호흡하세요`
  - 종료 버튼 → `다 쌌어요`, 시작 버튼 → `시작하기`, 재시작 버튼 → `다시 하기`
- 타이밍 상수: 힘주기 `5000`ms, 심호흡 `3000`ms, 템포 알림 `1500`ms.
- **소리를 넣지 않는다.** 피드백은 화면과 `navigator.vibrate`뿐이고, 진동 미지원 기기(iOS 사파리)에서는 경고 없이 no-op이어야 한다.
- 기록을 저장하지 않는다. `localStorage`·서버 전송 모두 없다.
- 주석과 커밋 메시지는 한국어로, 기존 `gaebari-glare` 모듈의 밀도에 맞춘다 — 왜 그렇게 했는지를 적는다.

---

## File Structure

| 파일 | 책임 |
|---|---|
| `src/app/playground/ddong-mallang/session.ts` | 순수 상태 머신. 단계·남은 시간·집계·문구 결정. React/DOM 의존 0 |
| `src/app/playground/ddong-mallang/session.test.ts` | 위 모듈 단위 테스트 |
| `src/app/playground/ddong-mallang/haptics.ts` | `navigator.vibrate` 래퍼. 미지원 감지해 no-op |
| `src/app/playground/ddong-mallang/haptics.test.ts` | 진동 호출·미지원 no-op 테스트 |
| `src/app/playground/ddong-mallang/Cat.tsx` | 배 보이고 누운 고양이 SVG. `squish`·`mood`만 받는 표현 전용 |
| `src/app/playground/ddong-mallang/DdongMallang.tsx` | 클라이언트 컴포넌트. 포인터 → 상태 머신 → 렌더, 전체화면, 햅틱 배선 |
| `src/app/playground/ddong-mallang/page.tsx` | metadata + main |
| `src/lib/projects.ts` | 플레이그라운드 목록에 항목 추가 (수정) |

재사용: `src/app/playground/_shared/useFullscreen.ts` — 이미 공용으로 떼어져 있다. 새로 만들지 않는다.

---

## Task 1: 상태 머신 — 단계 전이와 카운트다운

**Files:**
- Create: `src/app/playground/ddong-mallang/session.ts`
- Test: `src/app/playground/ddong-mallang/session.test.ts`

**Interfaces:**
- Consumes: 없음 (첫 태스크)
- Produces:
  - `type Phase = "ready" | "waiting" | "pushing" | "breathing" | "done"`
  - `const PUSH_MS = 5000`, `const BREATHE_MS = 3000`
  - `interface Session { phase: Phase; remainingMs: number; elapsedMs: number; pushCount: number; praise: boolean; tempoNoteMs: number }`
  - `type SessionEvent = { type: "start" } | { type: "press" } | { type: "release" } | { type: "finish" } | { type: "restart" } | { type: "tick"; dt: number }`
  - `function createSession(): Session`
  - `function step(s: Session, e: SessionEvent): Session`
  - `function secondsLeft(s: Session): number`

`praise`와 `tempoNoteMs`는 이 태스크에서 필드로만 존재하고 항상 초기값을 유지한다. 실제 동작은 Task 2에서 붙인다.

- [ ] **Step 1: Write the failing test**

`src/app/playground/ddong-mallang/session.test.ts`:

```ts
import { describe, it, expect } from "vitest";
import {
  BREATHE_MS,
  PUSH_MS,
  createSession,
  secondsLeft,
  step,
  type Session,
  type SessionEvent,
} from "./session";

/** 이벤트를 순서대로 먹인다 */
function feed(s: Session, ...events: SessionEvent[]): Session {
  return events.reduce(step, s);
}

/** 시작해서 힘주는 중까지 가 있는 상태 */
function pushing(): Session {
  const s = feed(createSession(), { type: "start" }, { type: "press" });
  expect(s.phase).toBe("pushing");
  return s;
}

describe("시작", () => {
  it("처음에는 ready다", () => {
    expect(createSession().phase).toBe("ready");
  });

  it("ready에서 누르면 아무 일도 없다 — 시작 버튼을 거쳐야 한다", () => {
    expect(step(createSession(), { type: "press" }).phase).toBe("ready");
  });

  it("start를 받으면 힘주기를 기다린다", () => {
    expect(step(createSession(), { type: "start" }).phase).toBe("waiting");
  });

  it("ready에서 시간은 흐르지 않는다", () => {
    const s = step(createSession(), { type: "tick", dt: 1000 });
    expect(s.elapsedMs).toBe(0);
  });
});

describe("힘주기", () => {
  it("누르면 pushing으로 가고 5초가 걸린다", () => {
    expect(pushing().remainingMs).toBe(PUSH_MS);
  });

  it("누른 횟수를 센다", () => {
    expect(pushing().pushCount).toBe(1);
  });

  it("pushing 중에 또 눌러도 카운트가 리셋되지 않는다", () => {
    const s = feed(pushing(), { type: "tick", dt: 2000 }, { type: "press" });
    expect(s.remainingMs).toBe(PUSH_MS - 2000);
    expect(s.pushCount).toBe(1);
  });

  it("5초를 다 쓰면 심호흡으로 넘어간다", () => {
    const s = step(pushing(), { type: "tick", dt: PUSH_MS });
    expect(s.phase).toBe("breathing");
    expect(s.remainingMs).toBe(BREATHE_MS);
  });

  it("tick이 쪼개져 들어와도 누적이 맞는다", () => {
    const split = feed(
      pushing(),
      { type: "tick", dt: 2000 },
      { type: "tick", dt: 2000 },
      { type: "tick", dt: 2000 },
    );
    const once = step(pushing(), { type: "tick", dt: 6000 });
    expect(split.phase).toBe(once.phase);
    expect(split.remainingMs).toBe(once.remainingMs);
    expect(split.elapsedMs).toBe(once.elapsedMs);
  });
});

describe("심호흡", () => {
  it("힘주는 중에 손을 떼면 바로 심호흡이다 — 실패가 없다", () => {
    const s = feed(pushing(), { type: "tick", dt: 1000 }, { type: "release" });
    expect(s.phase).toBe("breathing");
    expect(s.remainingMs).toBe(BREATHE_MS);
  });

  it("3초가 지나면 다시 힘주기를 기다린다", () => {
    const s = feed(pushing(), { type: "release" }, { type: "tick", dt: BREATHE_MS });
    expect(s.phase).toBe("waiting");
  });

  it("waiting에서는 카운트다운이 없다", () => {
    const s = feed(
      pushing(),
      { type: "release" },
      { type: "tick", dt: BREATHE_MS },
      { type: "tick", dt: 9000 },
    );
    expect(s.phase).toBe("waiting");
    expect(s.remainingMs).toBe(0);
  });

  it("waiting에서도 총 시간은 흐른다", () => {
    const s = feed(createSession(), { type: "start" }, { type: "tick", dt: 4000 });
    expect(s.elapsedMs).toBe(4000);
  });
});

describe("secondsLeft", () => {
  it("5초 남았으면 5다", () => {
    expect(secondsLeft(pushing())).toBe(5);
  });

  it("조금 지났어도 아직 5다 — 올림이라 0이 화면에 안 뜬다", () => {
    expect(secondsLeft(step(pushing(), { type: "tick", dt: 1 }))).toBe(5);
  });

  it("4.0초 남으면 4다", () => {
    expect(secondsLeft(step(pushing(), { type: "tick", dt: 1000 }))).toBe(4);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/playground/ddong-mallang/session.test.ts`
Expected: FAIL — `Failed to resolve import "./session"`

- [ ] **Step 3: Write minimal implementation**

`src/app/playground/ddong-mallang/session.ts`:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/playground/ddong-mallang/session.test.ts`
Expected: PASS — 15 tests

- [ ] **Step 5: Commit**

```bash
git add src/app/playground/ddong-mallang/session.ts src/app/playground/ddong-mallang/session.test.ts
git commit -m "feat: 똥 말랑 — 힘주기·심호흡 사이클 상태 머신"
```

---

## Task 2: 문구 결정 — 칭찬과 템포 알림

**Files:**
- Modify: `src/app/playground/ddong-mallang/session.ts`
- Test: `src/app/playground/ddong-mallang/session.test.ts` (append)

**Interfaces:**
- Consumes: Task 1의 `Session`, `step`, `createSession`, `PUSH_MS`, `BREATHE_MS`
- Produces:
  - `const TEMPO_NOTE_MS = 1500`
  - `function label(s: Session): string` — 지시 문구. `ready`·`done`은 빈 문자열
  - `press`가 `breathing`에서도 받아들여진다 (→ `pushing`, `tempoNoteMs = TEMPO_NOTE_MS`)
  - `praise`가 5초를 채운 경우에만 선다

- [ ] **Step 1: Write the failing test**

`session.test.ts` 끝에 추가:

```ts
describe("칭찬", () => {
  it("5초를 채우면 칭찬이 붙는다", () => {
    const s = step(pushing(), { type: "tick", dt: PUSH_MS });
    expect(s.praise).toBe(true);
    expect(label(s)).toBe("잘했어요, 심호흡하세요");
  });

  it("일찍 떼면 칭찬도 지적도 없다", () => {
    const s = feed(pushing(), { type: "tick", dt: 1000 }, { type: "release" });
    expect(s.praise).toBe(false);
    expect(label(s)).toBe("심호흡하세요");
  });

  it("칭찬은 다음 힘주기로 넘어가지 않는다", () => {
    const s = feed(
      pushing(),
      { type: "tick", dt: PUSH_MS },
      { type: "tick", dt: BREATHE_MS },
      { type: "press" },
    );
    expect(s.praise).toBe(false);
  });
});

describe("템포 알림", () => {
  it("심호흡 중에 누르면 받아준다 — 무시하지 않는다", () => {
    const s = feed(pushing(), { type: "release" }, { type: "press" });
    expect(s.phase).toBe("pushing");
    expect(s.remainingMs).toBe(PUSH_MS);
    expect(s.pushCount).toBe(2);
  });

  it("템포가 빨랐다고 알려준다", () => {
    const s = feed(pushing(), { type: "release" }, { type: "press" });
    expect(label(s)).toBe("템포가 빨랐어요");
  });

  it("1.5초 뒤에는 평소 문구로 돌아온다", () => {
    const s = feed(
      pushing(),
      { type: "release" },
      { type: "press" },
      { type: "tick", dt: TEMPO_NOTE_MS },
    );
    expect(s.phase).toBe("pushing");
    expect(label(s)).toBe("조금만 더 힘내보세요");
  });

  it("1.5초가 되기 전에는 아직 보인다", () => {
    const s = feed(
      pushing(),
      { type: "release" },
      { type: "press" },
      { type: "tick", dt: TEMPO_NOTE_MS - 100 },
    );
    expect(label(s)).toBe("템포가 빨랐어요");
  });

  it("제 타이밍에 누르면 알림이 없다", () => {
    const s = feed(pushing(), { type: "release" }, { type: "tick", dt: BREATHE_MS }, { type: "press" });
    expect(label(s)).toBe("조금만 더 힘내보세요");
  });
});

describe("문구", () => {
  it("시작 전과 끝난 뒤에는 지시가 없다", () => {
    expect(label(createSession())).toBe("");
  });

  it("힘주기를 기다린다", () => {
    expect(label(step(createSession(), { type: "start" }))).toBe("배를 꾹 눌러보세요");
  });
});
```

import 문에 `label`과 `TEMPO_NOTE_MS`를 추가한다:

```ts
import {
  BREATHE_MS,
  PUSH_MS,
  TEMPO_NOTE_MS,
  createSession,
  label,
  secondsLeft,
  step,
  type Session,
  type SessionEvent,
} from "./session";
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/playground/ddong-mallang/session.test.ts`
Expected: FAIL — `label is not a function` / `TEMPO_NOTE_MS` undefined

- [ ] **Step 3: Write minimal implementation**

`session.ts`의 `BREATHE_MS` 아래에 상수를 추가:

```ts
/**
 * "템포가 빨랐어요"가 떠 있는 시간.
 *
 * 심호흡 중에 누른 것을 무시하지 않는 이유: 배가 눌렸는데 화면이 반응을 안 하면
 * 고장으로 읽힌다. 힘이 들어오는 타이밍은 사용자 몸이 정하는 것이지 화면이 정할
 * 일이 아니다. 그래서 받아주고, 템포만 알려준다.
 */
export const TEMPO_NOTE_MS = 1500;
```

`startPush`를 템포 알림을 받도록 고친다:

```ts
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
```

`tick`에서 알림이 줄어들게 한다 — `elapsedMs` 계산 바로 뒤에 넣고, 아래 `return` 세 곳이 모두 이 값을 쓰도록 한다:

```ts
  const elapsedMs = s.elapsedMs + dt;
  const tempoNoteMs = Math.max(0, s.tempoNoteMs - dt);

  if (s.phase === "waiting") return { ...s, elapsedMs, tempoNoteMs };

  const remainingMs = s.remainingMs - dt;
  if (remainingMs > 0) return { ...s, elapsedMs, remainingMs, tempoNoteMs };

  if (s.phase === "pushing") return startBreathe({ ...s, elapsedMs, tempoNoteMs }, true);
  return { ...s, phase: "waiting", elapsedMs, tempoNoteMs, remainingMs: 0, praise: false };
```

`step`의 `press` 분기를 고친다:

```ts
    case "press":
      if (s.phase === "waiting") return startPush(s);
      // 심호흡 중에 눌러도 받아준다. 다만 템포가 빨랐다고 알려준다.
      if (s.phase === "breathing") return startPush(s, TEMPO_NOTE_MS);
      return s;
```

파일 끝에 `label`을 추가한다:

```ts
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
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/playground/ddong-mallang/session.test.ts`
Expected: PASS — 25 tests (Task 1의 15개 + 이번 10개)

- [ ] **Step 5: Commit**

```bash
git add src/app/playground/ddong-mallang/session.ts src/app/playground/ddong-mallang/session.test.ts
git commit -m "feat: 똥 말랑 — 칭찬과 템포 알림 문구"
```

---

## Task 3: 마무리 — 총 시간과 힘준 횟수 집계

**Files:**
- Modify: `src/app/playground/ddong-mallang/session.ts`
- Test: `src/app/playground/ddong-mallang/session.test.ts` (append)

**Interfaces:**
- Consumes: Task 1–2의 `Session`, `step`, `createSession`, `PUSH_MS`, `BREATHE_MS`
- Produces:
  - `finish` 이벤트가 `waiting`/`pushing`/`breathing`에서 `done`으로 보낸다 (`ready`에서는 무시)
  - `restart` 이벤트가 `done`에서 새 세션으로 되돌린다
  - `function canFinish(s: Session): boolean` — "다 쌌어요" 버튼을 보일지

- [ ] **Step 1: Write the failing test**

`session.test.ts` 끝에 추가:

```ts
describe("마무리", () => {
  it("힘주는 중에도 끝낼 수 있다", () => {
    expect(step(pushing(), { type: "finish" }).phase).toBe("done");
  });

  it("심호흡 중에도 끝낼 수 있다", () => {
    const s = feed(pushing(), { type: "release" }, { type: "finish" });
    expect(s.phase).toBe("done");
  });

  it("시작도 안 했으면 끝낼 수 없다", () => {
    expect(step(createSession(), { type: "finish" }).phase).toBe("ready");
    expect(canFinish(createSession())).toBe(false);
  });

  it("시작한 뒤에는 끝낼 수 있다", () => {
    expect(canFinish(step(createSession(), { type: "start" }))).toBe(true);
  });

  it("끝난 화면에서는 종료 버튼이 없다", () => {
    expect(canFinish(step(pushing(), { type: "finish" }))).toBe(false);
  });

  it("총 걸린 시간을 집계한다", () => {
    const s = feed(
      createSession(),
      { type: "start" },
      { type: "tick", dt: 2000 },
      { type: "press" },
      { type: "tick", dt: PUSH_MS },
      { type: "finish" },
    );
    expect(s.elapsedMs).toBe(2000 + PUSH_MS);
  });

  it("힘준 횟수를 집계한다 — 채운 것과 일찍 뗀 것을 함께 센다", () => {
    const s = feed(
      createSession(),
      { type: "start" },
      { type: "press" },
      { type: "tick", dt: PUSH_MS },
      { type: "tick", dt: BREATHE_MS },
      { type: "press" },
      { type: "release" },
      { type: "tick", dt: BREATHE_MS },
      { type: "press" },
      { type: "finish" },
    );
    expect(s.pushCount).toBe(3);
  });

  it("끝난 뒤에는 눌러도 시간이 안 흐른다", () => {
    const done = step(pushing(), { type: "finish" });
    const after = feed(done, { type: "press" }, { type: "tick", dt: 5000 });
    expect(after.phase).toBe("done");
    expect(after.elapsedMs).toBe(done.elapsedMs);
  });

  it("다시 하면 처음으로 돌아간다", () => {
    const s = feed(pushing(), { type: "finish" }, { type: "restart" });
    expect(s).toEqual(createSession());
  });
});
```

import 문에 `canFinish`를 추가한다.

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/playground/ddong-mallang/session.test.ts`
Expected: FAIL — `canFinish is not a function`

- [ ] **Step 3: Write minimal implementation**

`session.ts`의 `step`에서 두 분기를 채운다:

```ts
    case "finish":
      // ready에서는 끝낼 게 없다. 시작도 안 했다.
      return s.phase === "ready" ? s : { ...s, phase: "done", remainingMs: 0, tempoNoteMs: 0 };

    case "restart":
      return s.phase === "done" ? createSession() : s;
```

`label` 위에 추가:

```ts
/** "다 쌌어요"를 보일지. 시작 전과 끝난 뒤에는 없다. */
export function canFinish(s: Session): boolean {
  return s.phase !== "ready" && s.phase !== "done";
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/playground/ddong-mallang/session.test.ts`
Expected: PASS — 34 tests (Task 1–2의 25개 + 이번 9개)

- [ ] **Step 5: Commit**

```bash
git add src/app/playground/ddong-mallang/session.ts src/app/playground/ddong-mallang/session.test.ts
git commit -m "feat: 똥 말랑 — 총 시간·힘준 횟수 집계와 마무리"
```

---

## Task 4: 햅틱 — 미지원 기기에서 조용히 죽기

**Files:**
- Create: `src/app/playground/ddong-mallang/haptics.ts`
- Test: `src/app/playground/ddong-mallang/haptics.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces:
  - `const BUZZ_TICK = 12`, `const BUZZ_PRAISE: number[] = [30, 60, 30]`, `const BUZZ_DONE: number[] = [40, 80, 40, 80, 120]`
  - `function buzz(pattern: number | number[]): boolean` — 진동을 울렸으면 `true`, 미지원이면 `false`

- [ ] **Step 1: Write the failing test**

`src/app/playground/ddong-mallang/haptics.test.ts`:

```ts
import { describe, it, expect, afterEach, vi } from "vitest";
import { BUZZ_DONE, BUZZ_PRAISE, BUZZ_TICK, buzz } from "./haptics";

const original = globalThis.navigator;

/** navigator를 갈아끼운다. vibrate가 undefined면 미지원 기기를 흉내낸다. */
function stubNavigator(vibrate?: unknown) {
  Object.defineProperty(globalThis, "navigator", {
    value: vibrate === undefined ? {} : { vibrate },
    configurable: true,
    writable: true,
  });
}

afterEach(() => {
  Object.defineProperty(globalThis, "navigator", {
    value: original,
    configurable: true,
    writable: true,
  });
});

describe("buzz", () => {
  it("지원하면 그 패턴으로 진동시킨다", () => {
    const vibrate = vi.fn(() => true);
    stubNavigator(vibrate);
    expect(buzz(BUZZ_TICK)).toBe(true);
    expect(vibrate).toHaveBeenCalledWith(BUZZ_TICK);
  });

  it("배열 패턴도 그대로 넘긴다", () => {
    const vibrate = vi.fn(() => true);
    stubNavigator(vibrate);
    buzz(BUZZ_PRAISE);
    expect(vibrate).toHaveBeenCalledWith(BUZZ_PRAISE);
  });

  it("미지원 기기에서는 아무 일도 없다 — iOS 사파리", () => {
    stubNavigator(undefined);
    expect(() => buzz(BUZZ_DONE)).not.toThrow();
    expect(buzz(BUZZ_DONE)).toBe(false);
  });

  it("vibrate가 던져도 삼킨다", () => {
    stubNavigator(() => {
      throw new Error("차단됨");
    });
    expect(buzz(BUZZ_TICK)).toBe(false);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npx vitest run src/app/playground/ddong-mallang/haptics.test.ts`
Expected: FAIL — `Failed to resolve import "./haptics"`

- [ ] **Step 3: Write minimal implementation**

`src/app/playground/ddong-mallang/haptics.ts`:

```ts
/**
 * 진동 래퍼.
 *
 * iOS 사파리는 Vibration API를 지원하지 않고, 되게 만들 방법이 없다. 그래서
 * 감지해서 조용히 no-op이 된다 — 경고도 안내도 띄우지 않는다. 화면과 문구만으로
 * 앱이 온전히 동작해야 한다는 뜻이고, 진동은 어디까지나 덤이다.
 */

/** 카운트가 한 칸 줄 때 */
export const BUZZ_TICK = 12;
/** 힘주기를 온전히 채웠을 때 */
export const BUZZ_PRAISE: number[] = [30, 60, 30];
/** 다 쌌을 때 */
export const BUZZ_DONE: number[] = [40, 80, 40, 80, 120];

type Vibrator = { vibrate?: (pattern: number | number[]) => boolean };

export function buzz(pattern: number | number[]): boolean {
  if (typeof navigator === "undefined") return false;
  const vibrate = (navigator as Vibrator).vibrate;
  if (typeof vibrate !== "function") return false;
  try {
    vibrate.call(navigator, pattern);
    return true;
  } catch {
    // 사용자 설정이나 브라우저 정책으로 막힌 경우. 앱은 그대로 돌아간다.
    return false;
  }
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npx vitest run src/app/playground/ddong-mallang/haptics.test.ts`
Expected: PASS — 4 tests

- [ ] **Step 5: Commit**

```bash
git add src/app/playground/ddong-mallang/haptics.ts src/app/playground/ddong-mallang/haptics.test.ts
git commit -m "feat: 똥 말랑 — 진동 래퍼, 미지원 기기에서는 조용히 무시"
```

---

## Task 5: 고양이 SVG

**Files:**
- Create: `src/app/playground/ddong-mallang/Cat.tsx`

**Interfaces:**
- Consumes: 없음 (`motion`은 이미 설치된 패키지)
- Produces:
  - `type Mood = "calm" | "strain" | "breathe" | "happy"`
  - `function Cat(props: { mood: Mood; squish: number }): JSX.Element` — `squish`는 0(안 눌림)~1(꽉 눌림)
  - 배를 누르는 영역은 `data-belly` 속성을 가진 `<ellipse>`다. Task 6이 이 요소가 아니라 **바깥 컨테이너**에서 포인터를 받으므로, 여기서는 이벤트를 달지 않는다.

단위 테스트를 만들지 않는다 — SVG 좌표뿐이라 테스트가 구현을 베끼는 것 말고 할 일이 없다. 검증은 Task 6의 빌드와 실제 화면으로 한다.

- [ ] **Step 1: Write the component**

`src/app/playground/ddong-mallang/Cat.tsx`:

```tsx
"use client";

import { motion } from "motion/react";

/** 표정. 단계 이름이 아니라 표정 이름이다 — 이 컴포넌트는 세션을 모른다. */
export type Mood = "calm" | "strain" | "breathe" | "happy";

const SPRING = { type: "spring", stiffness: 260, damping: 18 } as const;

/** 눈: 표정마다 다르게 그린다. 감은 눈은 선, 뜬 눈은 원. */
function Eyes({ mood }: { mood: Mood }) {
  if (mood === "strain") {
    // 꽉 감은 눈 — 힘주는 중
    return (
      <g stroke="#3b2b26" strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M74 96 q10 -9 20 0" />
        <path d="M126 96 q10 -9 20 0" />
      </g>
    );
  }
  if (mood === "breathe") {
    // 편히 감은 눈 — 쉬는 중
    return (
      <g stroke="#3b2b26" strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M74 98 q10 7 20 0" />
        <path d="M126 98 q10 7 20 0" />
      </g>
    );
  }
  // calm·happy — 뜬 눈. happy는 하이라이트가 더 크다.
  const highlight = mood === "happy" ? 4 : 2.5;
  return (
    <g fill="#3b2b26">
      <ellipse cx={84} cy={96} rx={7} ry={mood === "happy" ? 9 : 7} />
      <ellipse cx={136} cy={96} rx={7} ry={mood === "happy" ? 9 : 7} />
      <circle cx={86.5} cy={93} r={highlight} fill="#fff" />
      <circle cx={138.5} cy={93} r={highlight} fill="#fff" />
    </g>
  );
}

export function Cat({ mood, squish }: { mood: Mood; squish: number }) {
  // 배가 눌리면 세로로 납작해지고 옆으로 퍼진다. 부피가 보존되는 것처럼 보인다.
  const bellyScaleY = 1 - squish * 0.22;
  const bellyScaleX = 1 + squish * 0.08;

  return (
    <svg
      viewBox="0 0 220 380"
      className="h-full w-full"
      role="img"
      aria-label="배를 보이고 누운 고양이"
    >
      {/* 꼬리 — 힘줄 때 살짝 말린다 */}
      <motion.path
        d="M186 300 q34 14 22 46"
        stroke="#f4d9c0"
        strokeWidth={16}
        strokeLinecap="round"
        fill="none"
        animate={{ rotate: mood === "strain" ? -14 : 0 }}
        transition={SPRING}
        style={{ originX: "186px", originY: "300px" }}
      />

      {/* 뒷발 */}
      <ellipse cx={78} cy={322} rx={22} ry={16} fill="#f4d9c0" />
      <ellipse cx={142} cy={322} rx={22} ry={16} fill="#f4d9c0" />

      {/* 몸통 */}
      <ellipse cx={110} cy={228} rx={78} ry={100} fill="#f4d9c0" />

      {/* 배 — 누르는 곳. 실제 포인터는 바깥 컨테이너가 받는다. */}
      <motion.ellipse
        data-belly
        cx={110}
        cy={232}
        rx={56}
        ry={74}
        fill="#fff3e6"
        animate={{ scaleY: bellyScaleY, scaleX: bellyScaleX }}
        transition={SPRING}
        style={{ originX: "110px", originY: "232px" }}
      />

      {/* 앞발 — 힘줄 때 오므린다 */}
      <motion.g animate={{ y: mood === "strain" ? -8 : 0 }} transition={SPRING}>
        <ellipse cx={44} cy={186} rx={18} ry={26} fill="#f4d9c0" />
        <ellipse cx={176} cy={186} rx={18} ry={26} fill="#f4d9c0" />
      </motion.g>

      {/* 머리 — 힘줄 때 턱을 당긴다 */}
      <motion.g animate={{ y: mood === "strain" ? 6 : 0 }} transition={SPRING}>
        {/* 귀 */}
        <path d="M62 74 l-10 -34 32 14 z" fill="#f4d9c0" />
        <path d="M158 74 l10 -34 -32 14 z" fill="#f4d9c0" />
        {/* 얼굴 */}
        <ellipse cx={110} cy={96} rx={58} ry={52} fill="#f9e4d0" />
        <Eyes mood={mood} />
        {/* 볼 — 힘줄 때만 붉어진다 */}
        <motion.g
          animate={{ opacity: mood === "strain" ? 1 : 0 }}
          transition={{ duration: 0.2 }}
          fill="#f6a6a0"
        >
          <ellipse cx={68} cy={112} rx={12} ry={7} />
          <ellipse cx={152} cy={112} rx={12} ry={7} />
        </motion.g>
        {/* 코 */}
        <path d="M105 108 h10 l-5 6 z" fill="#e08f86" />
        {/* 입 — 심호흡할 때는 동그랗게, 아니면 w자 */}
        {mood === "breathe" ? (
          <ellipse cx={110} cy={124} rx={7} ry={9} fill="#3b2b26" />
        ) : (
          <path
            d="M110 116 q-8 10 -16 2 M110 116 q8 10 16 2"
            stroke="#3b2b26"
            strokeWidth={4}
            strokeLinecap="round"
            fill="none"
          />
        )}
        {/* 수염 */}
        <g stroke="#e0c4ad" strokeWidth={3} strokeLinecap="round">
          <path d="M52 104 h-22" />
          <path d="M52 114 h-20" />
          <path d="M168 104 h22" />
          <path d="M168 114 h20" />
        </g>
      </motion.g>
    </svg>
  );
}
```

- [ ] **Step 2: Verify it compiles and lints**

Run: `npx tsc --noEmit && npx eslint src/app/playground/ddong-mallang/Cat.tsx`
Expected: 타입 에러 없음. eslint에서 이 파일에 대한 경고·에러 없음 (`layout.tsx`, `TableOfContents.tsx`의 기존 에러 6건은 master에도 있는 것이니 무시한다)

- [ ] **Step 3: Commit**

```bash
git add src/app/playground/ddong-mallang/Cat.tsx
git commit -m "feat: 똥 말랑 — 배 보이고 누운 고양이 SVG"
```

---

## Task 6: 배선 — 포인터·프레임 루프·화면

**Files:**
- Create: `src/app/playground/ddong-mallang/DdongMallang.tsx`
- Create: `src/app/playground/ddong-mallang/page.tsx`
- Modify: `src/lib/projects.ts`

**Interfaces:**
- Consumes:
  - `./session` — `createSession`, `step`, `label`, `secondsLeft`, `canFinish`, `PUSH_MS`, `type Session`
  - `./haptics` — `buzz`, `BUZZ_TICK`, `BUZZ_PRAISE`, `BUZZ_DONE`
  - `./Cat` — `Cat`, `type Mood`
  - `../_shared/useFullscreen` — `useFullscreen(ref)` → `{ isFullscreen, isSupported, enter, exit, toggle }`
- Produces: 라우트 `/playground/ddong-mallang`

- [ ] **Step 1: Read the Next.js docs for this version**

Run: `ls node_modules/next/dist/docs/ && grep -rl "metadata" node_modules/next/dist/docs/ | head`

이 저장소의 Next.js는 학습 데이터와 다르다 (AGENTS.md). `metadata` export와 `"use client"` 관례가 현재 버전에서 어떻게 쓰이는지 확인하고, `src/app/playground/gaebari-glare/page.tsx`가 쓰는 형태와 일치하는지 대조한다.

- [ ] **Step 2: Write the client component**

`src/app/playground/ddong-mallang/DdongMallang.tsx`:

```tsx
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useFullscreen } from "../_shared/useFullscreen";
import { Cat, type Mood } from "./Cat";
import { BUZZ_DONE, BUZZ_PRAISE, BUZZ_TICK, buzz } from "./haptics";
import {
  canFinish,
  createSession,
  label,
  secondsLeft,
  step,
  type Session,
} from "./session";

const MOOD: Record<Session["phase"], Mood> = {
  ready: "calm",
  waiting: "calm",
  pushing: "strain",
  breathing: "breathe",
  done: "happy",
};

/** 분:초 */
function formatDuration(ms: number): string {
  const total = Math.round(ms / 1000);
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}분 ${s}초`;
}

export default function DdongMallang() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { isSupported, isFullscreen, enter, exit } = useFullscreen(rootRef);
  const [session, setSession] = useState<Session>(createSession);

  // 진동은 렌더가 아니라 전이에서 울려야 한다. 이전 값을 ref로 들고 비교한다.
  const prevSecond = useRef(0);
  const prevPhase = useRef<Session["phase"]>("ready");

  useEffect(() => {
    const second = secondsLeft(session);
    if (second !== prevSecond.current && second > 0) buzz(BUZZ_TICK);
    prevSecond.current = second;

    if (session.phase !== prevPhase.current) {
      if (session.phase === "breathing" && session.praise) buzz(BUZZ_PRAISE);
      if (session.phase === "done") buzz(BUZZ_DONE);
      prevPhase.current = session.phase;
    }
  }, [session]);

  // 프레임 루프. ready·done에서는 돌릴 이유가 없다.
  const running = session.phase !== "ready" && session.phase !== "done";
  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const loop = (now: number) => {
      const dt = now - last;
      last = now;
      setSession((s) => step(s, { type: "tick", dt }));
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [running]);

  const press = useCallback(() => setSession((s) => step(s, { type: "press" })), []);
  const release = useCallback(() => setSession((s) => step(s, { type: "release" })), []);

  const start = useCallback(() => {
    setSession((s) => step(s, { type: "start" }));
    if (isSupported) enter();
  }, [enter, isSupported]);

  const finish = useCallback(() => {
    setSession((s) => step(s, { type: "finish" }));
    if (isFullscreen) exit();
  }, [exit, isFullscreen]);

  const restart = useCallback(() => setSession((s) => step(s, { type: "restart" })), []);

  const squish = session.phase === "pushing" ? 1 : 0;
  const second = secondsLeft(session);

  return (
    <div
      ref={rootRef}
      className="flex min-h-[100dvh] w-full flex-col items-center justify-between overflow-hidden bg-[#fdf6ef] select-none"
      style={{ touchAction: "none" }}
      onContextMenu={(e) => e.preventDefault()}
    >
      {session.phase === "ready" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 text-center">
          <h1 className="text-4xl font-bold text-[#4a352c]">똥 말랑</h1>
          <p className="max-w-xs text-base leading-relaxed text-[#8a6b5c]">
            고양이 배를 꾹 누르면 힘주기, 손을 떼면 심호흡입니다. 화면이 리듬을 잡아드립니다.
          </p>
          <div className="w-48">
            <Cat mood="calm" squish={0} />
          </div>
          <button
            type="button"
            onClick={start}
            className="rounded-full bg-[#e08f86] px-10 py-4 text-lg font-semibold text-white active:scale-95"
          >
            시작하기
          </button>
        </div>
      ) : session.phase === "done" ? (
        <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 text-center">
          <div className="w-48">
            <Cat mood="happy" squish={0} />
          </div>
          <h2 className="text-3xl font-bold text-[#4a352c]">수고하셨어요</h2>
          <p className="text-lg text-[#8a6b5c]">
            {formatDuration(session.elapsedMs)} 동안 {session.pushCount}번 힘주셨어요
          </p>
          <button
            type="button"
            onClick={restart}
            className="rounded-full bg-[#e08f86] px-10 py-4 text-lg font-semibold text-white active:scale-95"
          >
            다시 하기
          </button>
        </div>
      ) : (
        <>
          {/* 상단 — 큰 숫자와 지시 문구 */}
          <div className="flex w-full flex-col items-center pt-10">
            <div className="h-24 text-8xl font-bold tabular-nums text-[#4a352c]">
              {second > 0 ? second : ""}
            </div>
            <p className="mt-2 text-xl font-medium text-[#8a6b5c]">{label(session)}</p>
          </div>

          {/* 고양이 — 화면 전체가 누르는 영역이다. 배만 받으면 손가락이 조금
              벗어날 때마다 힘주기가 끊긴다. */}
          <div
            className="flex w-full max-w-sm flex-1 items-center justify-center px-6"
            onPointerDown={press}
            onPointerUp={release}
            onPointerCancel={release}
            onPointerLeave={release}
          >
            <Cat mood={MOOD[session.phase]} squish={squish} />
          </div>

          <div className="pb-8">
            {canFinish(session) && (
              <button
                type="button"
                onClick={finish}
                className="rounded-full border border-[#d8c3b4] px-6 py-3 text-base text-[#8a6b5c] active:scale-95"
              >
                다 쌌어요
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Write the page**

`src/app/playground/ddong-mallang/page.tsx` — `gaebari-glare/page.tsx`와 같은 형태:

```tsx
import type { Metadata } from "next";
import DdongMallang from "./DdongMallang";

const TITLE = "똥 말랑";
const DESCRIPTION =
  "고양이 배를 꾹 누르면 힘주기, 손을 떼면 심호흡. 배변 리듬을 화면이 잡아줍니다. 기록을 저장하지 않고 브라우저 안에서만 돌아갑니다.";
const URL = "https://joowonkoh.com/playground/ddong-mallang";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
};

export default function DdongMallangPage() {
  return (
    <main>
      <DdongMallang />
    </main>
  );
}
```

- [ ] **Step 4: Register in the playground list**

`src/lib/projects.ts`의 `projects` 배열 **맨 앞**에 추가한다 (최신이 앞에 오는 순서다):

```ts
  {
    title: "똥 말랑",
    description: "고양이 배를 꾹 누르면 힘주기, 떼면 심호흡 🐱",
    tags: ["Interactive", "SVG", "Mobile"],
    href: "/playground/ddong-mallang",
  },
```

- [ ] **Step 5: Verify the whole thing builds and all tests pass**

```bash
npm test
npx tsc --noEmit
npm run build
```

Expected:
- `npm test` — 기존 340개 + 이번 38개(`session` 34 + `haptics` 4)가 모두 PASS
- `tsc` — 에러 없음
- `npm run build` — `✓ Compiled successfully`, 라우트 목록에 `/playground/ddong-mallang`이 보인다

빌드가 `next-env.d.ts`와 `public/sitemap-0.xml`을 다시 쓴다. 둘 다 커밋하지 않는다 — 전자는 dev/build 경로가 왕복하는 값이고 후자는 `lastmod` 타임스탬프만 바뀌며 배포 시 `postbuild`가 재생성한다. `git checkout -- next-env.d.ts public/sitemap-0.xml`로 되돌린다.

- [ ] **Step 6: Check it on a phone-sized viewport**

Run: `npm run dev`

`http://localhost:3000/playground/ddong-mallang`을 375×812 정도로 좁혀서 확인한다:
- "시작하기"를 누르면 전체화면으로 들어가고 "배를 꾹 눌러보세요"가 뜬다
- 고양이를 누른 채로 있으면 배가 납작해지고 볼이 붉어지며 5→1이 세진다
- 누른 채로 손가락을 화면 밖으로 끌면 힘주기가 끊기고 심호흡으로 넘어간다
- 5초를 채우면 "잘했어요, 심호흡하세요"가, 일찍 떼면 "심호흡하세요"만 나온다
- 심호흡 3·2·1 중에 누르면 "템포가 빨랐어요"가 1.5초 뜨고 사라진다
- 길게 눌러도 컨텍스트 메뉴나 텍스트 선택이 생기지 않는다
- "다 쌌어요"를 누르면 전체화면이 풀리고 시간·횟수가 나온다

- [ ] **Step 7: Commit**

```bash
git add src/app/playground/ddong-mallang/DdongMallang.tsx src/app/playground/ddong-mallang/page.tsx src/lib/projects.ts
git commit -m "feat: 똥 말랑 — 포인터·프레임 루프 배선과 라우트 등록"
```

---

## Self-Review

**스펙 커버리지**

| 스펙 항목 | 태스크 |
|---|---|
| 5단계 상태 머신, `press`/`release`/`tick` | Task 1 |
| 실패 없음 (조기 릴리즈도 정상 진행) | Task 1 (전이), Task 2 (`praise` 미부여) |
| 5초 채운 경우에만 "잘했어요" | Task 2 |
| 심호흡 중 press를 받아주고 "템포가 빨랐어요" 1.5초 | Task 2 |
| `done` 집계 (총 시간 = `start` 이후 tick 누적, 횟수 = `pushing` 진입 수) | Task 3 |
| `ready`에는 "다 쌌어요" 없음 | Task 3 (`canFinish`) |
| 상단 큰 숫자 + 지시 문구 + 고양이 전신 | Task 6 |
| 표정 4종, 배 `scaleY` 눌림, 볼 붉어짐 | Task 5 |
| 전체화면 (`_shared/useFullscreen` 재사용) | Task 6 |
| 포인터 4종, `touch-action`, `user-select`, 컨텍스트 메뉴 차단, `100dvh` | Task 6 |
| 햅틱 3종, iOS 미지원 시 조용히 no-op | Task 4 (모듈), Task 6 (전이에서 호출) |
| 소리 없음 | 전 태스크에 오디오 코드 없음 |
| 기록 저장 없음 | `localStorage`·fetch 코드 없음 |
| `Cat`·`DdongMallang` 단위 테스트 안 함 | Task 5·6에 명시 |

빠진 항목 없음.

**플레이스홀더**: 없음. 모든 코드 스텝에 실제 코드가 들어 있고, 검증 스텝마다 실행 명령과 기대 결과가 있다.

**타입 일관성 확인**

- `Session` 필드 6개가 Task 1에서 정의되고 Task 2·3에서 그대로 쓰인다.
- `startPush(s, tempoNoteMs = 0)` — Task 1은 1인자, Task 2에서 기본값 인자를 추가하며 Task 1의 호출부가 그대로 유효하다.
- Task 6이 부르는 export 전부가 앞 태스크에 정의돼 있다: `createSession`·`step`·`label`·`secondsLeft`·`canFinish`(1–3), `buzz`·`BUZZ_TICK`·`BUZZ_PRAISE`·`BUZZ_DONE`(4), `Cat`·`Mood`(5).
- `MOOD` 레코드의 키가 `Phase`의 5개 값과 정확히 일치한다.
- `useFullscreen`이 돌려주는 `{ isFullscreen, isSupported, enter, exit }`는 실제 파일에서 확인한 시그니처다.
