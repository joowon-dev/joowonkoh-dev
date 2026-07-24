# 종이비행기 날리기 게임 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 고양이가 탄 종이비행기를 드래그로 발사하고 마이크 입김으로 더 멀리 날리는 최대거리 게임을 `/playground/paper-plane`에 구현하고, Supabase 전역 리더보드와 연동한다.

**Architecture:** Next.js App Router의 클라이언트 컴포넌트 하나(`PaperPlaneGame`)가 상태 머신(intro→aim→flying→landed)을 총괄한다. 물리·마이크 볼륨 계산 등 순수 로직은 훅 밖 순수 함수로 분리해 Vitest로 단위 테스트한다. 리더보드는 `@supabase/supabase-js` 클라이언트로 조회/등록하며 RLS로 보호한다.

**Tech Stack:** Next.js 16.2.2, React 19.2.4, TypeScript, Tailwind CSS v4, Web Audio API, `@supabase/supabase-js`, Vitest.

## Global Constraints

- Next.js 버전: `16.2.2` (App Router). 코드 작성 전 `node_modules/next/dist/docs/`의 관련 가이드를 따를 것.
- 클라이언트 상호작용/브라우저 API(마이크·rAF·드래그) 사용 파일은 최상단에 `"use client";`.
- 외부 이미지/에셋 금지 — 캐릭터·구름·배경 모두 인라인 SVG/CSS로.
- 마이크 입력 전용. 키보드/탭 폴백 없음. 권한 거부·미지원 시 안내 게이트만.
- 캐릭터는 **고양이**로 고정.
- 디자인 토큰 재사용: `bg-accent-soft`, `text-accent`, `spring-transition`, `shadow-ambient`, `shadow-ambient-hover`, `rounded-2xl`, `animate-fade-in-up` (정의: `src/app/globals.css`).
- Supabase 프로젝트: `joowonkoh-site`, ref `gshkmannztzwwkyyltvw`, URL `https://gshkmannztzwwkyyltvw.supabase.co`, region ap-northeast-2.
- 시크릿(publishable key)은 `.env.local`(gitignore됨)에만 두고 **플랜/커밋에 하드코딩 금지**. 브라우저 노출 변수는 `NEXT_PUBLIC_` 접두사.
- 거리 단위: 물리 x좌표를 미터(m)로 환산해 정수로 저장.
- 리더보드 distance 범위: 0 ~ 100000 (DB check 제약).
- 닉네임: 1~12자 (DB check 제약 + 클라이언트 검증).

## File Structure

**신규 파일**
- `src/app/playground/paper-plane/page.tsx` — 라우트(서버) + metadata, `PaperPlaneGame` 렌더
- `src/app/playground/paper-plane/PaperPlaneGame.tsx` — `"use client"` 상태 머신 총괄
- `src/app/playground/paper-plane/physics.ts` — 순수 물리 함수/상수/타입
- `src/app/playground/paper-plane/physics.test.ts` — 물리 단위 테스트
- `src/app/playground/paper-plane/mic.ts` — RMS 계산 등 순수 오디오 함수
- `src/app/playground/paper-plane/mic.test.ts` — RMS 단위 테스트
- `src/app/playground/paper-plane/useWindMic.ts` — `"use client"` 마이크 훅
- `src/app/playground/paper-plane/usePlanePhysics.ts` — `"use client"` rAF 물리 훅
- `src/app/playground/paper-plane/PlaneCharacter.tsx` — 종이비행기+고양이 SVG
- `src/app/playground/paper-plane/Scenery.tsx` — 하늘 배경/구름 SVG
- `src/app/playground/paper-plane/Leaderboard.tsx` — 리더보드 조회/등록 UI
- `src/app/playground/paper-plane/HelpOverlay.tsx` — 온보딩/도움말
- `src/app/playground/paper-plane/MicPermissionGate.tsx` — 마이크 안내 게이트
- `src/lib/supabaseClient.ts` — Supabase 브라우저 클라이언트 싱글턴
- `src/lib/leaderboard.ts` — `fetchTopScores` / `submitScore` 데이터 래퍼
- `src/lib/leaderboard.test.ts` — 데이터 래퍼 테스트(클라 모킹)
- `vitest.config.ts` — Vitest 설정
- `.env.local` — Supabase 환경변수(gitignore됨)

**수정 파일**
- `src/lib/projects.ts` — 게임 카드 엔트리 추가(내부 링크)
- `src/app/playground/page.tsx` — 내부/외부 링크 모두 처리
- `package.json` — deps/scripts(자동)

---

## Task 1: 개발 인프라 (Vitest + Supabase deps + DB 마이그레이션)

**Files:**
- Create: `vitest.config.ts`, `.env.local`
- Create: `src/app/playground/paper-plane/smoke.test.ts` (임시, 마지막 스텝에서 삭제)
- Modify: `package.json` (자동)

**Interfaces:**
- Produces: `npm run test` 명령, `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` 환경변수, DB 테이블 `public.leaderboard`.

- [ ] **Step 1: 의존성 설치**

Run:
```bash
npm install @supabase/supabase-js
npm install -D vitest
```
Expected: 설치 성공, `node_modules/@supabase`, `node_modules/.bin/vitest` 존재.

- [ ] **Step 2: `vitest.config.ts` 작성**

```ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
});
```

- [ ] **Step 3: `package.json`에 test 스크립트 추가**

`scripts`에 추가:
```json
"test": "vitest run",
"test:watch": "vitest"
```

- [ ] **Step 4: 스모크 테스트로 러너 동작 확인**

Create `src/app/playground/paper-plane/smoke.test.ts`:
```ts
import { describe, it, expect } from "vitest";

describe("smoke", () => {
  it("runs", () => {
    expect(1 + 1).toBe(2);
  });
});
```
Run: `npm run test`
Expected: PASS (1 passed).

- [ ] **Step 5: `.gitignore`에 `.env*` 포함 확인**

Run: `grep -nE '\.env' .gitignore || echo "MISSING"`
Expected: `.env*` 관련 라인 존재. 없으면 `.gitignore`에 `.env*.local` 추가.

- [ ] **Step 6: `.env.local` 작성 (Supabase publishable key 주입)**

publishable key는 Supabase MCP `get_publishable_keys`(project_id `gshkmannztzwwkyyltvw`)로 조회한 `disabled:false` 키 사용.
```
NEXT_PUBLIC_SUPABASE_URL=https://gshkmannztzwwkyyltvw.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<조회한 publishable key>
```
확인: `git status --porcelain .env.local` → 출력 없음(무시됨).

- [ ] **Step 7: DB 마이그레이션 적용 (테이블 + RLS)**

Supabase MCP `apply_migration`(project_id `gshkmannztzwwkyyltvw`, name `create_leaderboard`)로 아래 SQL 적용:
```sql
create table if not exists public.leaderboard (
  id uuid primary key default gen_random_uuid(),
  nickname text not null check (char_length(nickname) between 1 and 12),
  distance int not null check (distance >= 0 and distance <= 100000),
  created_at timestamptz not null default now()
);

alter table public.leaderboard enable row level security;

create policy "leaderboard_select_all"
  on public.leaderboard for select
  to anon, authenticated
  using (true);

create policy "leaderboard_insert_all"
  on public.leaderboard for insert
  to anon, authenticated
  with check (true);

create index if not exists leaderboard_distance_idx
  on public.leaderboard (distance desc);
```

- [ ] **Step 8: 마이그레이션 검증**

Supabase MCP `execute_sql`(project_id `gshkmannztzwwkyyltvw`)로:
```sql
select count(*) from public.leaderboard;
```
Expected: 에러 없이 `0` 반환. (RLS로 SELECT 허용됨 확인)

- [ ] **Step 9: 스모크 테스트 삭제 후 커밋**

```bash
rm src/app/playground/paper-plane/smoke.test.ts
git add vitest.config.ts package.json package-lock.json .gitignore
git commit -m "chore: Vitest·Supabase 셋업 및 leaderboard 테이블 마이그레이션"
```
(`.env.local`은 커밋되지 않음)

---

## Task 2: 물리 엔진 (순수 함수)

**Files:**
- Create: `src/app/playground/paper-plane/physics.ts`
- Test: `src/app/playground/paper-plane/physics.test.ts`

**Interfaces:**
- Produces:
  - `type PlaneState = { x: number; y: number; vx: number; vy: number }`
  - `type LaunchParams = { angle: number; power: number }` (angle: 라디안, power: 0~1)
  - `const GROUND_Y = 0`
  - `const PX_PER_METER = 20`
  - `function launch(params: LaunchParams): PlaneState` — 초기 상태 생성
  - `function step(state: PlaneState, wind: number, dt: number): PlaneState` — 한 프레임 진행. wind: 0~1 전진 추진, dt: 초
  - `function isLanded(state: PlaneState): boolean` — 지면 접촉 또는 저속 정지
  - `function distanceMeters(state: PlaneState): number` — x → m 정수 환산

- [ ] **Step 1: 실패 테스트 작성**

`src/app/playground/paper-plane/physics.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { launch, step, isLanded, distanceMeters, GROUND_Y } from "./physics";

describe("launch", () => {
  it("power와 angle로 초기 속도를 만든다", () => {
    const s = launch({ angle: Math.PI / 4, power: 1 });
    expect(s.x).toBe(0);
    expect(s.y).toBeGreaterThanOrEqual(GROUND_Y);
    expect(s.vx).toBeGreaterThan(0);
    expect(s.vy).toBeGreaterThan(0);
  });
});

describe("step", () => {
  it("중력으로 vy가 감소한다", () => {
    const s0 = launch({ angle: Math.PI / 4, power: 1 });
    const s1 = step(s0, 0, 0.016);
    expect(s1.vy).toBeLessThan(s0.vy);
    expect(s1.x).toBeGreaterThan(s0.x);
  });

  it("바람은 vx를 증가시킨다", () => {
    const s0 = launch({ angle: Math.PI / 4, power: 1 });
    const noWind = step(s0, 0, 0.016);
    const withWind = step(s0, 1, 0.016);
    expect(withWind.vx).toBeGreaterThan(noWind.vx);
  });
});

describe("isLanded / distanceMeters", () => {
  it("지면 아래로 내려가면 착지", () => {
    expect(isLanded({ x: 100, y: -1, vx: 5, vy: -5 })).toBe(true);
  });
  it("공중이면 착지 아님", () => {
    expect(isLanded({ x: 100, y: 50, vx: 5, vy: 1 })).toBe(false);
  });
  it("distanceMeters는 정수 m", () => {
    expect(distanceMeters({ x: 200, y: 0, vx: 0, vy: 0 })).toBe(10);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- physics`
Expected: FAIL (모듈/함수 없음).

- [ ] **Step 3: 최소 구현**

`src/app/playground/paper-plane/physics.ts`:
```ts
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
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- physics`
Expected: PASS.

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/paper-plane/physics.ts src/app/playground/paper-plane/physics.test.ts
git commit -m "feat: 종이비행기 물리 순수 함수 구현"
```

---

## Task 3: 마이크 볼륨 계산 + 훅

**Files:**
- Create: `src/app/playground/paper-plane/mic.ts`
- Test: `src/app/playground/paper-plane/mic.test.ts`
- Create: `src/app/playground/paper-plane/useWindMic.ts`

**Interfaces:**
- Produces:
  - `function computeRms(samples: Float32Array): number` — 0~1 RMS
  - `function rmsToWind(rms: number): number` — 임계값 적용 후 0~1 바람 세기
  - `const WIND_THRESHOLD = 0.08`
  - `type MicStatus = "idle" | "requesting" | "ready" | "denied" | "unsupported"`
  - `function useWindMic(): { status: MicStatus; wind: () => number; start: () => Promise<void>; stop: () => void }` — `wind()`는 최신 프레임 바람 세기(0~1) 반환

- [ ] **Step 1: 실패 테스트 작성 (순수 함수만)**

`src/app/playground/paper-plane/mic.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { computeRms, rmsToWind, WIND_THRESHOLD } from "./mic";

describe("computeRms", () => {
  it("무음은 0에 가깝다", () => {
    expect(computeRms(new Float32Array([0, 0, 0, 0]))).toBeCloseTo(0);
  });
  it("진폭이 클수록 값이 크다", () => {
    const quiet = computeRms(new Float32Array([0.1, -0.1, 0.1, -0.1]));
    const loud = computeRms(new Float32Array([0.8, -0.8, 0.8, -0.8]));
    expect(loud).toBeGreaterThan(quiet);
  });
});

describe("rmsToWind", () => {
  it("임계값 이하면 0", () => {
    expect(rmsToWind(WIND_THRESHOLD - 0.01)).toBe(0);
  });
  it("임계값 초과면 0~1 사이 양수", () => {
    const w = rmsToWind(0.5);
    expect(w).toBeGreaterThan(0);
    expect(w).toBeLessThanOrEqual(1);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- mic`
Expected: FAIL.

- [ ] **Step 3: 순수 함수 구현**

`src/app/playground/paper-plane/mic.ts`:
```ts
export const WIND_THRESHOLD = 0.08;
const WIND_CEIL = 0.6; // 이 RMS에서 바람 최대치

export function computeRms(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

export function rmsToWind(rms: number): number {
  if (rms <= WIND_THRESHOLD) return 0;
  const norm = (rms - WIND_THRESHOLD) / (WIND_CEIL - WIND_THRESHOLD);
  return Math.max(0, Math.min(1, norm));
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- mic`
Expected: PASS.

- [ ] **Step 5: 마이크 훅 구현 (테스트 없음 — 브라우저 API)**

`src/app/playground/paper-plane/useWindMic.ts`:
```ts
"use client";

import { useCallback, useRef, useState } from "react";
import { computeRms, rmsToWind } from "./mic";

export type MicStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unsupported";

export function useWindMic() {
  const [status, setStatus] = useState<MicStatus>("idle");
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bufRef = useRef<Float32Array | null>(null);

  const start = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      streamRef.current = stream;
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      bufRef.current = new Float32Array(analyser.fftSize);
      setStatus("ready");
    } catch {
      setStatus("denied");
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
    analyserRef.current = null;
    bufRef.current = null;
    setStatus("idle");
  }, []);

  const wind = useCallback(() => {
    const analyser = analyserRef.current;
    const buf = bufRef.current;
    if (!analyser || !buf) return 0;
    analyser.getFloatTimeDomainData(buf);
    return rmsToWind(computeRms(buf));
  }, []);

  return { status, wind, start, stop };
}
```

- [ ] **Step 6: 커밋**

```bash
git add src/app/playground/paper-plane/mic.ts src/app/playground/paper-plane/mic.test.ts src/app/playground/paper-plane/useWindMic.ts
git commit -m "feat: 마이크 입김 감지(RMS→바람) 로직·훅 구현"
```

---

## Task 4: Supabase 클라이언트 + 리더보드 데이터 래퍼

**Files:**
- Create: `src/lib/supabaseClient.ts`
- Create: `src/lib/leaderboard.ts`
- Test: `src/lib/leaderboard.test.ts`

**Interfaces:**
- Consumes: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` (Task 1).
- Produces:
  - `type ScoreRow = { id: string; nickname: string; distance: number; created_at: string }`
  - `function fetchTopScores(limit?: number): Promise<ScoreRow[]>` — distance 내림차순
  - `function submitScore(nickname: string, distance: number): Promise<ScoreRow>` — 검증 후 insert, 생성 행 반환
  - `function sanitizeNickname(raw: string): string` — trim + 1~12자 보장(순수, 테스트 대상)

- [ ] **Step 1: 실패 테스트 작성 (순수 검증 + 래퍼 모킹)**

`src/lib/leaderboard.test.ts`:
```ts
import { describe, it, expect, vi, beforeEach } from "vitest";

const from = vi.fn();
vi.mock("./supabaseClient", () => ({
  supabase: { from: (...a: unknown[]) => from(...a) },
}));

import { fetchTopScores, submitScore, sanitizeNickname } from "./leaderboard";

beforeEach(() => from.mockReset());

describe("sanitizeNickname", () => {
  it("공백을 트림하고 12자로 자른다", () => {
    expect(sanitizeNickname("  hello  ")).toBe("hello");
    expect(sanitizeNickname("a".repeat(20))).toBe("a".repeat(12));
  });
  it("빈 값은 익명 처리", () => {
    expect(sanitizeNickname("   ")).toBe("익명");
  });
});

describe("fetchTopScores", () => {
  it("distance 내림차순 상위 N을 조회한다", async () => {
    const order = vi.fn().mockReturnValue({
      limit: vi.fn().mockResolvedValue({
        data: [{ id: "1", nickname: "a", distance: 10, created_at: "t" }],
        error: null,
      }),
    });
    from.mockReturnValue({ select: vi.fn().mockReturnValue({ order }) });
    const rows = await fetchTopScores(5);
    expect(rows).toHaveLength(1);
    expect(order).toHaveBeenCalledWith("distance", { ascending: false });
  });
});

describe("submitScore", () => {
  it("insert 후 생성 행을 반환한다", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "1", nickname: "cat", distance: 42, created_at: "t" },
      error: null,
    });
    const select = vi.fn().mockReturnValue({ single });
    const insert = vi.fn().mockReturnValue({ select });
    from.mockReturnValue({ insert });
    const row = await submitScore("cat", 42);
    expect(insert).toHaveBeenCalledWith({ nickname: "cat", distance: 42 });
    expect(row.distance).toBe(42);
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- leaderboard`
Expected: FAIL.

- [ ] **Step 3: Supabase 클라이언트 작성**

`src/lib/supabaseClient.ts`:
```ts
import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(url, key);
```

- [ ] **Step 4: 데이터 래퍼 작성**

`src/lib/leaderboard.ts`:
```ts
import { supabase } from "./supabaseClient";

export type ScoreRow = {
  id: string;
  nickname: string;
  distance: number;
  created_at: string;
};

export function sanitizeNickname(raw: string): string {
  const trimmed = raw.trim().slice(0, 12);
  return trimmed.length > 0 ? trimmed : "익명";
}

export async function fetchTopScores(limit = 10): Promise<ScoreRow[]> {
  const { data, error } = await supabase
    .from("leaderboard")
    .select("*")
    .order("distance", { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data ?? []) as ScoreRow[];
}

export async function submitScore(
  nickname: string,
  distance: number,
): Promise<ScoreRow> {
  const clean = sanitizeNickname(nickname);
  const dist = Math.max(0, Math.min(100000, Math.round(distance)));
  const { data, error } = await supabase
    .from("leaderboard")
    .insert({ nickname: clean, distance: dist })
    .select()
    .single();
  if (error) throw error;
  return data as ScoreRow;
}
```

- [ ] **Step 5: 통과 확인**

Run: `npm run test -- leaderboard`
Expected: PASS.

- [ ] **Step 6: 실제 연동 스모크 (수동)**

Run: `npm run dev` 후 브라우저 콘솔이 아닌, 임시로 아무 페이지에서 확인하는 대신 다음 SQL로 왕복 확인 — Supabase MCP `execute_sql`:
```sql
insert into public.leaderboard (nickname, distance) values ('seed', 1) returning *;
select * from public.leaderboard order by distance desc limit 3;
```
Expected: insert/select 정상. 확인 후 정리: `delete from public.leaderboard where nickname = 'seed';`

- [ ] **Step 7: 커밋**

```bash
git add src/lib/supabaseClient.ts src/lib/leaderboard.ts src/lib/leaderboard.test.ts
git commit -m "feat: Supabase 클라이언트·리더보드 데이터 래퍼 구현"
```

---

## Task 5: 캐릭터·배경 SVG 컴포넌트

**Files:**
- Create: `src/app/playground/paper-plane/PlaneCharacter.tsx`
- Create: `src/app/playground/paper-plane/Scenery.tsx`

**Interfaces:**
- Produces:
  - `function PlaneCharacter(props: { rotation: number; blowing: boolean }): JSX.Element` — 종이비행기+고양이. rotation(도) 회전, blowing이면 표정/입김 반응
  - `function Scenery(props: { offsetX: number }): JSX.Element` — 하늘 그라데이션 + 구름(패럴랙스 offsetX)

- [ ] **Step 1: `PlaneCharacter` 작성**

`src/app/playground/paper-plane/PlaneCharacter.tsx`:
```tsx
"use client";

export function PlaneCharacter({
  rotation,
  blowing,
}: {
  rotation: number;
  blowing: boolean;
}) {
  return (
    <div
      style={{ transform: `rotate(${rotation}deg)` }}
      className="spring-transition"
      aria-hidden
    >
      <svg width="88" height="72" viewBox="0 0 88 72" fill="none">
        {/* 종이비행기 */}
        <path d="M2 36 L86 6 L50 40 Z" fill="#ffffff" stroke="#c7d2fe" strokeWidth="2" strokeLinejoin="round" />
        <path d="M50 40 L86 6 L58 66 Z" fill="#eef2ff" stroke="#c7d2fe" strokeWidth="2" strokeLinejoin="round" />
        <path d="M2 36 L50 40 L34 52 Z" fill="#e0e7ff" stroke="#c7d2fe" strokeWidth="2" strokeLinejoin="round" />
        {/* 고양이 */}
        <g transform="translate(40 20)">
          <path d="M-8 -6 L-4 -14 L0 -6 Z" fill="#f8b3c5" /> {/* 왼귀 */}
          <path d="M8 -6 L4 -14 L0 -6 Z" fill="#f8b3c5" /> {/* 오른귀 */}
          <circle cx="0" cy="0" r="10" fill="#fcd9b8" />
          <circle cx="-4" cy="-1" r="1.6" fill="#3b3b3b" />
          <circle cx="4" cy="-1" r="1.6" fill="#3b3b3b" />
          <circle cx="-6" cy="3" r="2" fill="#f8b3c5" opacity="0.7" />
          <circle cx="6" cy="3" r="2" fill="#f8b3c5" opacity="0.7" />
          <path
            d={blowing ? "M-3 4 Q0 8 3 4" : "M-3 5 Q0 6 3 5"}
            stroke="#a86a4a"
            strokeWidth="1.4"
            fill="none"
            strokeLinecap="round"
          />
        </g>
      </svg>
      {blowing && (
        <div className="pointer-events-none absolute -left-6 top-8 animate-fade-in-up text-lg select-none">
          🌬️
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 2: `Scenery` 작성**

`src/app/playground/paper-plane/Scenery.tsx`:
```tsx
export function Scenery({ offsetX }: { offsetX: number }) {
  const clouds = [
    { x: 120, y: 40, s: 1 },
    { x: 420, y: 90, s: 0.7 },
    { x: 720, y: 30, s: 1.2 },
    { x: 980, y: 110, s: 0.8 },
  ];
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-sky-200 to-sky-50" />
      {clouds.map((c, i) => (
        <div
          key={i}
          className="absolute"
          style={{
            left: c.x - offsetX * 0.4,
            top: c.y,
            transform: `scale(${c.s})`,
          }}
        >
          <svg width="80" height="40" viewBox="0 0 80 40">
            <ellipse cx="30" cy="26" rx="26" ry="14" fill="#ffffff" opacity="0.9" />
            <ellipse cx="50" cy="22" rx="20" ry="14" fill="#ffffff" opacity="0.9" />
          </svg>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 3: 빌드/타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음 (JSX/타입 통과).

- [ ] **Step 4: 커밋**

```bash
git add src/app/playground/paper-plane/PlaneCharacter.tsx src/app/playground/paper-plane/Scenery.tsx
git commit -m "feat: 종이비행기+고양이 캐릭터·하늘 배경 SVG 컴포넌트"
```

---

## Task 6: rAF 물리 훅

**Files:**
- Create: `src/app/playground/paper-plane/usePlanePhysics.ts`

**Interfaces:**
- Consumes: `physics.ts`의 `launch/step/isLanded/distanceMeters/PlaneState/LaunchParams`.
- Produces:
  - `function usePlanePhysics(getWind: () => number): { state: PlaneState | null; distance: number; running: boolean; launchPlane: (p: LaunchParams) => void; reset: () => void }`
  - 비행 중 매 프레임 `step` 호출, `isLanded` 시 정지하고 최종 distance 확정.

- [ ] **Step 1: 훅 구현 (rAF 루프)**

`src/app/playground/paper-plane/usePlanePhysics.ts`:
```ts
"use client";

import { useCallback, useRef, useState } from "react";
import {
  launch,
  step,
  isLanded,
  distanceMeters,
  type PlaneState,
  type LaunchParams,
} from "./physics";

export function usePlanePhysics(getWind: () => number) {
  const [state, setState] = useState<PlaneState | null>(null);
  const [distance, setDistance] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const stateRef = useRef<PlaneState | null>(null);

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const loop = useCallback(
    (t: number) => {
      const prev = stateRef.current;
      if (!prev) return;
      const dt = Math.min(0.032, (t - lastRef.current) / 1000 || 0.016);
      lastRef.current = t;
      const next = step(prev, getWind(), dt);
      stateRef.current = next;
      setState(next);
      setDistance(distanceMeters(next));
      if (isLanded(next)) {
        setRunning(false);
        stop();
        return;
      }
      rafRef.current = requestAnimationFrame(loop);
    },
    [getWind, stop],
  );

  const launchPlane = useCallback(
    (p: LaunchParams) => {
      const s0 = launch(p);
      stateRef.current = s0;
      setState(s0);
      setDistance(0);
      setRunning(true);
      lastRef.current = 0;
      stop();
      rafRef.current = requestAnimationFrame((t) => {
        lastRef.current = t;
        rafRef.current = requestAnimationFrame(loop);
      });
    },
    [loop, stop],
  );

  const reset = useCallback(() => {
    stop();
    stateRef.current = null;
    setState(null);
    setDistance(0);
    setRunning(false);
  }, [stop]);

  return { state, distance, running, launchPlane, reset };
}
```

- [ ] **Step 2: 타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/app/playground/paper-plane/usePlanePhysics.ts
git commit -m "feat: requestAnimationFrame 기반 물리 진행 훅"
```

---

## Task 7: 도움말/온보딩 + 마이크 게이트

**Files:**
- Create: `src/app/playground/paper-plane/HelpOverlay.tsx`
- Create: `src/app/playground/paper-plane/MicPermissionGate.tsx`

**Interfaces:**
- Produces:
  - `function HelpOverlay(props: { onClose: () => void }): JSX.Element`
  - `function MicPermissionGate(props: { status: "denied" | "unsupported"; onRetry: () => void }): JSX.Element`

- [ ] **Step 1: `HelpOverlay` 작성**

`src/app/playground/paper-plane/HelpOverlay.tsx`:
```tsx
"use client";

export function HelpOverlay({ onClose }: { onClose: () => void }) {
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-6">
      <div className="max-w-xs rounded-2xl bg-card-bg p-6 text-center shadow-ambient animate-fade-in-up">
        <div className="text-3xl">🐱🛩️</div>
        <h3 className="mt-3 font-display text-lg font-bold">놀이 방법</h3>
        <ol className="mt-3 space-y-2 text-left text-sm text-text-secondary">
          <li>1. 비행기를 <b>뒤로 당겼다 놓아</b> 발사하세요.</li>
          <li>2. 비행 중 <b>마이크에 훅~ 불어</b> 더 멀리 보내세요!</li>
          <li>3. 최고 기록을 리더보드에 남겨보세요.</li>
        </ol>
        <button
          onClick={onClose}
          className="mt-5 w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white spring-transition hover:scale-[1.02] active:scale-[0.98]"
        >
          시작하기
        </button>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: `MicPermissionGate` 작성**

`src/app/playground/paper-plane/MicPermissionGate.tsx`:
```tsx
"use client";

export function MicPermissionGate({
  status,
  onRetry,
}: {
  status: "denied" | "unsupported";
  onRetry: () => void;
}) {
  const denied = status === "denied";
  return (
    <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/30 p-6">
      <div className="max-w-xs rounded-2xl bg-card-bg p-6 text-center shadow-ambient animate-fade-in-up">
        <div className="text-3xl">🎤</div>
        <h3 className="mt-3 font-display text-lg font-bold">
          {denied ? "마이크가 필요해요" : "마이크를 쓸 수 없어요"}
        </h3>
        <p className="mt-2 text-sm text-text-secondary">
          {denied
            ? "이 게임은 입김으로 바람을 불어 즐겨요. 브라우저 설정에서 마이크를 허용한 뒤 다시 시도해 주세요."
            : "이 브라우저는 마이크 입력을 지원하지 않아요. 다른 브라우저에서 열어 주세요."}
        </p>
        {denied && (
          <button
            onClick={onRetry}
            className="mt-5 w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white spring-transition hover:scale-[1.02] active:scale-[0.98]"
          >
            다시 시도
          </button>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: 타입 확인 + 커밋**

Run: `npx tsc --noEmit`
Expected: 에러 없음.
```bash
git add src/app/playground/paper-plane/HelpOverlay.tsx src/app/playground/paper-plane/MicPermissionGate.tsx
git commit -m "feat: 온보딩 도움말·마이크 권한 게이트 UI"
```

---

## Task 8: 리더보드 UI

**Files:**
- Create: `src/app/playground/paper-plane/Leaderboard.tsx`

**Interfaces:**
- Consumes: `fetchTopScores`, `submitScore`, `ScoreRow` (Task 4).
- Produces:
  - `function Leaderboard(props: { pendingDistance: number | null; onSubmitted: () => void; highlightId: string | null }): JSX.Element`
  - `pendingDistance`가 있으면 닉네임 입력 폼 표시 → 등록 시 `submitScore` 호출 후 목록 갱신 및 `onSubmitted`.

- [ ] **Step 1: `Leaderboard` 작성**

`src/app/playground/paper-plane/Leaderboard.tsx`:
```tsx
"use client";

import { useEffect, useState } from "react";
import {
  fetchTopScores,
  submitScore,
  type ScoreRow,
} from "@/lib/leaderboard";

export function Leaderboard({
  pendingDistance,
  onSubmitted,
  highlightId,
}: {
  pendingDistance: number | null;
  onSubmitted: (id: string) => void;
  highlightId: string | null;
}) {
  const [rows, setRows] = useState<ScoreRow[]>([]);
  const [nickname, setNickname] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      setRows(await fetchTopScores(10));
    } catch {
      setError("기록을 불러오지 못했어요.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmit = async () => {
    if (pendingDistance == null) return;
    setSubmitting(true);
    setError(null);
    try {
      const row = await submitScore(nickname, pendingDistance);
      setNickname("");
      await load();
      onSubmitted(row.id);
    } catch {
      setError("등록에 실패했어요. 다시 시도해 주세요.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="rounded-2xl border border-border bg-card-bg p-4 shadow-ambient">
      <h3 className="font-display text-sm font-bold">🏆 리더보드</h3>

      {pendingDistance != null && (
        <div className="mt-3 rounded-xl bg-accent-soft p-3">
          <p className="text-xs text-accent">
            이번 기록 <b>{pendingDistance}m</b> — 이름을 남겨보세요!
          </p>
          <div className="mt-2 flex gap-2">
            <input
              value={nickname}
              onChange={(e) => setNickname(e.target.value)}
              maxLength={12}
              placeholder="닉네임 (최대 12자)"
              className="flex-1 rounded-full border border-border px-3 py-1.5 text-xs"
            />
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="rounded-full bg-accent px-3 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
            >
              등록
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-3 text-xs text-red-500">{error}</p>}
      {loading ? (
        <p className="mt-3 text-xs text-text-muted">불러오는 중…</p>
      ) : (
        <ol className="mt-3 space-y-1">
          {rows.map((r, i) => (
            <li
              key={r.id}
              className={`flex items-center justify-between rounded-lg px-2 py-1 text-xs ${
                r.id === highlightId ? "bg-accent-soft font-bold text-accent" : ""
              }`}
            >
              <span className="text-text-secondary">
                {i + 1}. {r.nickname}
              </span>
              <span className="font-medium">{r.distance}m</span>
            </li>
          ))}
          {rows.length === 0 && (
            <li className="text-xs text-text-muted">아직 기록이 없어요.</li>
          )}
        </ol>
      )}
    </div>
  );
}
```

- [ ] **Step 2: 타입 확인 + 커밋**

Run: `npx tsc --noEmit`
Expected: 에러 없음.
```bash
git add src/app/playground/paper-plane/Leaderboard.tsx
git commit -m "feat: 리더보드 조회·닉네임 등록 UI"
```

---

## Task 9: 게임 총괄 컴포넌트 (상태 머신 + 드래그 + 렌더)

**Files:**
- Create: `src/app/playground/paper-plane/PaperPlaneGame.tsx`

**Interfaces:**
- Consumes: `useWindMic`, `usePlanePhysics`, `PlaneCharacter`, `Scenery`, `HelpOverlay`, `MicPermissionGate`, `Leaderboard`, `physics.ts`(`PX_PER_METER`, `LaunchParams`).
- Produces: `export default function PaperPlaneGame(): JSX.Element`.
- 상태 머신 `phase`: `"intro" | "aim" | "flying" | "landed"`.

- [ ] **Step 1: 컴포넌트 작성**

`src/app/playground/paper-plane/PaperPlaneGame.tsx`:
```tsx
"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import { useWindMic } from "./useWindMic";
import { usePlanePhysics } from "./usePlanePhysics";
import { PlaneCharacter } from "./PlaneCharacter";
import { Scenery } from "./Scenery";
import { HelpOverlay } from "./HelpOverlay";
import { MicPermissionGate } from "./MicPermissionGate";
import { Leaderboard } from "./Leaderboard";
import { PX_PER_METER } from "./physics";

type Phase = "intro" | "aim" | "flying" | "landed";
const VIEW_H = 420;
const TUTORIAL_KEY = "pp_seen_tutorial";

export default function PaperPlaneGame() {
  const mic = useWindMic();
  const physics = usePlanePhysics(mic.wind);
  const [phase, setPhase] = useState<Phase>("intro");
  const [showHelp, setShowHelp] = useState(false);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [pendingDistance, setPendingDistance] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const dragStart = useRef<{ x: number; y: number } | null>(null);
  const blowing = mic.wind() > 0;

  const begin = useCallback(async () => {
    const seen =
      typeof window !== "undefined" && localStorage.getItem(TUTORIAL_KEY);
    if (!seen) setShowHelp(true);
    await mic.start();
    setPhase("aim");
  }, [mic]);

  const closeHelp = useCallback(() => {
    if (typeof window !== "undefined")
      localStorage.setItem(TUTORIAL_KEY, "1");
    setShowHelp(false);
  }, []);

  // 드래그(새총) — 뒤로 당길수록 파워↑, 당긴 반대 방향으로 발사
  const onPointerDown = (e: React.PointerEvent) => {
    if (phase !== "aim") return;
    dragStart.current = { x: e.clientX, y: e.clientY };
    setDrag({ dx: 0, dy: 0 });
  };
  const onPointerMove = (e: React.PointerEvent) => {
    if (!dragStart.current) return;
    setDrag({
      dx: e.clientX - dragStart.current.x,
      dy: e.clientY - dragStart.current.y,
    });
  };
  const onPointerUp = () => {
    if (!dragStart.current || !drag) return;
    const pull = Math.hypot(drag.dx, drag.dy);
    dragStart.current = null;
    setDrag(null);
    if (pull < 12) return; // 미세 클릭 무시
    const power = Math.min(1, pull / 220);
    const angle = Math.atan2(-drag.dy * -1, -drag.dx); // 당긴 반대 방향
    setPhase("flying");
    physics.launchPlane({ angle: normalizeUp(angle), power });
  };

  // 착지 감지
  if (phase === "flying" && physics.state && !physics.running) {
    setPhase("landed");
    setPendingDistance(physics.distance);
  }

  const planeScreenX = useMemo(() => {
    const x = physics.state?.x ?? 0;
    return Math.min(x, 120); // 화면상 비행기는 좌측 고정 후 배경 스크롤
  }, [physics.state]);
  const offsetX = Math.max(0, (physics.state?.x ?? 0) - 120);
  const planeY =
    VIEW_H - 80 - (physics.state?.y ?? (phase === "aim" ? 40 : 0));

  const rotation = physics.state
    ? -Math.atan2(physics.state.vy, physics.state.vx) * (180 / Math.PI)
    : -20;

  const reset = () => {
    physics.reset();
    setPendingDistance(null);
    setHighlightId(null);
    setPhase("aim");
  };

  const gateStatus =
    mic.status === "denied" || mic.status === "unsupported"
      ? mic.status
      : null;

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <div
        className="relative overflow-hidden rounded-2xl border border-border shadow-ambient select-none"
        style={{ height: VIEW_H, touchAction: "none" }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        <Scenery offsetX={offsetX} />

        {/* 거리 카운터 */}
        {(phase === "flying" || phase === "landed") && (
          <div className="absolute left-3 top-3 z-10 rounded-full bg-white/80 px-3 py-1 text-sm font-bold text-accent">
            {physics.distance}m
          </div>
        )}

        {/* 도움말 버튼 */}
        {phase !== "intro" && (
          <button
            onClick={() => setShowHelp(true)}
            className="absolute right-3 top-3 z-10 h-8 w-8 rounded-full bg-white/80 text-sm font-bold text-accent"
            aria-label="도움말"
          >
            ?
          </button>
        )}

        {/* 비행기 */}
        {phase !== "intro" && (
          <div
            className="absolute z-10"
            style={{
              left: planeScreenX + 40,
              top: planeY,
              transform: drag ? `translate(${drag.dx}px, ${drag.dy}px)` : undefined,
            }}
          >
            <PlaneCharacter rotation={rotation} blowing={phase === "flying" && blowing} />
          </div>
        )}

        {/* 조준 안내 */}
        {phase === "aim" && !drag && (
          <div className="absolute inset-x-0 bottom-4 z-10 text-center text-xs text-text-secondary">
            비행기를 뒤로 당겼다 놓아 발사하세요
          </div>
        )}
        {phase === "flying" && (
          <div className="absolute inset-x-0 bottom-4 z-10 animate-fade-in-up text-center text-xs font-semibold text-accent">
            🌬️ 마이크에 훅~ 불어 더 멀리 보내세요!
          </div>
        )}
        {phase === "landed" && (
          <div className="absolute inset-x-0 bottom-4 z-10 text-center">
            <button
              onClick={reset}
              className="rounded-full bg-accent px-5 py-2 text-sm font-semibold text-white spring-transition hover:scale-[1.02]"
            >
              다시 날리기 ({physics.distance}m)
            </button>
          </div>
        )}

        {/* 인트로 */}
        {phase === "intro" && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 bg-white/40 backdrop-blur-sm">
            <div className="text-4xl">🐱🛩️</div>
            <h2 className="font-display text-xl font-bold">종이비행기 날리기</h2>
            <p className="text-xs text-text-secondary">드래그로 발사하고 입김으로 멀리!</p>
            <button
              onClick={begin}
              className="mt-2 rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white spring-transition hover:scale-[1.02]"
            >
              시작하기 🎤
            </button>
          </div>
        )}

        {showHelp && <HelpOverlay onClose={closeHelp} />}
        {gateStatus && (
          <MicPermissionGate status={gateStatus} onRetry={() => mic.start()} />
        )}
      </div>

      <Leaderboard
        pendingDistance={pendingDistance}
        onSubmitted={(id) => {
          setHighlightId(id);
          setPendingDistance(null);
        }}
        highlightId={highlightId}
      />
    </div>
  );
}

function normalizeUp(angle: number): number {
  // 항상 위쪽(양의 y=up)으로 발사되도록 보정: 결과 각도의 sin을 양수로
  let a = angle;
  if (Math.sin(a) < 0) a = -a;
  // 너무 수직/수평 방지: 15°~80°로 클램프
  const min = (15 * Math.PI) / 180;
  const max = (80 * Math.PI) / 180;
  return Math.max(min, Math.min(max, a));
}
```

- [ ] **Step 2: 타입 확인**

Run: `npx tsc --noEmit`
Expected: 에러 없음.

- [ ] **Step 3: 커밋**

```bash
git add src/app/playground/paper-plane/PaperPlaneGame.tsx
git commit -m "feat: 게임 상태 머신·드래그 발사·렌더 총괄 컴포넌트"
```

---

## Task 10: 라우트 페이지 + 플레이그라운드 연동

**Files:**
- Create: `src/app/playground/paper-plane/page.tsx`
- Modify: `src/lib/projects.ts`
- Modify: `src/app/playground/page.tsx`

**Interfaces:**
- Consumes: `PaperPlaneGame` (default export), `projects` 배열.

- [ ] **Step 1: 라우트 페이지 작성**

`src/app/playground/paper-plane/page.tsx`:
```tsx
import type { Metadata } from "next";
import PaperPlaneGame from "./PaperPlaneGame";

export const metadata: Metadata = {
  title: "종이비행기 날리기",
  description: "고양이가 탄 종이비행기를 드래그로 발사하고 입김으로 더 멀리 날려보세요.",
};

export default function PaperPlanePage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Mini Game
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        종이비행기 날리기
      </h1>
      <p className="mt-2 text-sm leading-relaxed text-text-secondary">
        🐱 고양이가 탄 종이비행기를 드래그로 발사하고, 마이크에 훅~ 불어 더 멀리 보내보세요.
      </p>
      <div className="mt-8">
        <PaperPlaneGame />
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 프로젝트 카드 추가**

`src/lib/projects.ts`의 `projects` 배열 맨 앞에 추가:
```ts
  {
    title: "종이비행기 날리기",
    description: "입김으로 부는 종이비행기 게임 🐱🛩️",
    tags: ["Game", "Web Audio", "Supabase"],
    href: "/playground/paper-plane",
  },
```

- [ ] **Step 3: 플레이그라운드 목록에서 내부 링크 처리**

`src/app/playground/page.tsx`의 `<a>` 태그를 내부/외부 구분 처리. `map` 콜백 상단과 `<a>` 속성을 다음과 같이 수정:
```tsx
        {projects.map((project) => {
          const isExternal = project.href.startsWith("http");
          return (
          <a
            key={project.title}
            href={project.href}
            target={isExternal ? "_blank" : undefined}
            rel={isExternal ? "noopener noreferrer" : undefined}
            className="group overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.02] active:scale-[0.98]"
          >
```
그리고 기존 `))}`(map 닫힘)을 `);})}`로 닫아 콜백 블록을 마무리한다. (닫는 `</a>` ~ `</div>` 구조는 그대로 유지)

- [ ] **Step 4: 타입 확인 + 린트 + 빌드**

Run:
```bash
npx tsc --noEmit
npm run lint
npm run build
```
Expected: 세 명령 모두 에러 없이 통과. (`build`는 `.env.local`의 Supabase 변수 필요)

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/paper-plane/page.tsx src/lib/projects.ts src/app/playground/page.tsx
git commit -m "feat: 종이비행기 게임 라우트·플레이그라운드 카드 연동"
```

---

## Task 11: 수동 통합 QA

**Files:** 없음 (검증 전용)

- [ ] **Step 1: 전체 테스트/빌드 재확인**

Run: `npm run test && npx tsc --noEmit && npm run build`
Expected: 모두 통과.

- [ ] **Step 2: dev 서버 수동 플레이 체크리스트**

Run: `npm run dev` → `http://localhost:3000/playground/paper-plane`
확인 항목:
- [ ] 인트로 → "시작하기" 클릭 시 마이크 권한 요청 뜸
- [ ] 첫 방문 시 튜토리얼 오버레이 노출, "시작하기" 후 재방문 시 미노출
- [ ] 드래그로 뒤로 당겼다 놓으면 비행기 발사, 궤적/회전 자연스러움
- [ ] 비행 중 마이크에 불면 거리 증가 폭이 커짐(입김 파티클/표정 반응)
- [ ] 착지 시 거리 확정, "다시 날리기" 동작
- [ ] 새 베스트가 아니어도 등록 폼에서 닉네임 등록 가능, 리더보드 갱신·본인 행 강조
- [ ] 마이크 거부 시 게이트 안내 + 다시 시도 동작
- [ ] 플레이그라운드 목록에서 카드 클릭 시 내부 이동(새 탭 아님)
- [ ] 모바일 뷰포트(개발자도구)에서 레이아웃/터치 드래그 정상

- [ ] **Step 3: 문제 발견 시 수정 후 재확인, 이상 없으면 완료 보고**

(수정이 있으면 관련 파일만 추가 커밋)

---

## Self-Review (작성자 점검 결과)

- **Spec coverage:** intro/aim/flying/landed(Task 9), 물리(2,6), 마이크(3), 리더보드 DB·UI(1,4,8), 캐릭터/배경(5), 온보딩·게이트(7), 라우트·플레이그라운드(10), QA(11) — 스펙 전 섹션 대응됨.
- **Placeholder scan:** "적절히 처리" 류 없음. 모든 코드 스텝에 실제 코드 포함.
- **Type consistency:** `PlaneState/LaunchParams`(physics)·`wind()`(useWindMic)·`ScoreRow/fetchTopScores/submitScore`(leaderboard)·`usePlanePhysics` 반환 형태가 소비처(Task 6/9/8)와 일치.
- **주의(실행 시 확인):** Task 9의 착지 감지를 렌더 중 `setState`로 처리 → 무한 루프 방지를 위해 `phase==="flying" && !running` 가드가 1회만 트리거되는지 실행 중 확인. 문제가 되면 `usePlanePhysics`에 `onLanded` 콜백을 추가하는 방식으로 전환(실행자 재량).
