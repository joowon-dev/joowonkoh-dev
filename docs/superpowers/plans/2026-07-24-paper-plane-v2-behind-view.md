# 종이비행기 게임 v2 (뒤에서 보는 시점) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 기존 종이비행기 게임을 "비행기 뒤에서 보는" 의사 3D 터널 뷰로 리디자인한다. 모바일 우선 몰입 모드 + 전체화면, 마이크 바람 4종 연출, 더 귀여운 치비 캐릭터. 물리·마이크·리더보드·DB는 무변경.

**Architecture:** 기존 `physics.ts` 상태(x,y,vx,vy; y-UP)를 그대로 두고, 신규 순수함수 `project(x,y,viewport)`가 depth·height를 화면 좌표+scale로 투영한다. 애니메이션은 CSS Module 키프레임으로. `PaperPlaneGame`이 `fixed inset-0` 몰입 컨테이너에서 투영 렌더·연출·상태머신을 조합한다.

**Tech Stack:** Next.js 16.2.2, React 19.2.4, TypeScript, Tailwind v4, CSS Modules, Web Audio API, Fullscreen API, Vitest.

## Global Constraints

- Next.js `16.2.2` App Router. 브라우저 API/상호작용 파일 최상단 `"use client";`.
- 외부 이미지/3D 라이브러리 금지 — 캐릭터·배경·연출 모두 인라인 SVG + CSS.
- 캐릭터: 치이카와(나가노 IP)를 재현하지 말 것. 그 소프트 치비 스타일 참고한 **오리지널** 캐릭터. 고양이 계열, 동글동글 큰 머리·작은 몸·점 눈·발그레 볼·파스텔.
- 물리(`physics.ts`)·`usePlanePhysics.ts`·`mic.ts`·`useWindMic.ts`·`Leaderboard.tsx`·`lib/leaderboard.ts`·`lib/supabaseClient.ts`·DB/RLS 는 **변경 금지**.
- 디자인 토큰 재사용: `bg-accent`, `text-accent`, `bg-accent-soft`, `spring-transition`, `shadow-ambient`, `rounded-2xl`, `animate-fade-in-up` (`src/app/globals.css`).
- 모바일 우선: `dvh`/`dvw` 단위, `env(safe-area-inset-*)` 대응, `touch-action: none`, 세로(portrait) 기준.
- 거리 단위·점수: 기존 `distanceMeters(state)` 그대로.
- 검증 기준(프로젝트 `npm run lint`는 사전 존재 master 파일들 때문에 이미 실패 — 우리가 만지지 않는 `next-sitemap.config.js`, `src/components/TableOfContents.tsx`, `src/app/layout.tsx`. 이건 우리 결함 아님): 이 브랜치가 만드는/수정하는 파일은 **scoped eslint 클린**이어야 하고, `npx tsc --noEmit`·`npm run build` 는 통과해야 한다. 사전 존재 lint 부채는 건드리지 말 것.
- 투영 상수: `DEPTH_REF = 800`, `VANISH_Y_RATIO = 0.32`, `GROUND_Y_RATIO = 0.82`.

## File Structure

**신규**
- `src/app/playground/paper-plane/projection.ts` — depth·height → 화면좌표·scale 순수 함수
- `src/app/playground/paper-plane/projection.test.ts` — 투영 단위 테스트
- `src/app/playground/paper-plane/effects.module.css` — 연출 키프레임/클래스(CSS Module)
- `src/app/playground/paper-plane/useFullscreen.ts` — Fullscreen API 토글 훅
- `src/app/playground/paper-plane/WindEffects.tsx` — 속도선·입김 파티클·세기 게이지

**개편(전체 교체)**
- `src/app/playground/paper-plane/PlaneCharacter.tsx` — front/back 뷰 + 치비 캐릭터
- `src/app/playground/paper-plane/Scenery.tsx` — 터널 원근 배경 + 다가오는 구름
- `src/app/playground/paper-plane/PaperPlaneGame.tsx` — 몰입/전체화면/투영/연출 통합
- `src/app/playground/paper-plane/page.tsx` — 몰입 게임 렌더로 단순화 + metadata 문구

**무변경**: physics.ts, usePlanePhysics.ts, mic.ts, useWindMic.ts, Leaderboard.tsx, HelpOverlay.tsx, MicPermissionGate.tsx, lib/*, projects.ts, DB.

---

## Task 1: 투영 순수 함수 (projection.ts)

**Files:**
- Create: `src/app/playground/paper-plane/projection.ts`
- Test: `src/app/playground/paper-plane/projection.test.ts`

**Interfaces:**
- Produces:
  - `type Viewport = { w: number; h: number }`
  - `type Projected = { screenX: number; screenY: number; scale: number }`
  - `const DEPTH_REF = 800`, `const VANISH_Y_RATIO = 0.32`, `const GROUND_Y_RATIO = 0.82`
  - `function project(x: number, y: number, vp: Viewport): Projected`

- [ ] **Step 1: 실패 테스트 작성**

`projection.test.ts`:
```ts
import { describe, it, expect } from "vitest";
import { project, DEPTH_REF } from "./projection";

const VP = { w: 400, h: 800 };

describe("project", () => {
  it("x=0이면 scale 1, 화면 하단 기준선", () => {
    const p = project(0, 0, VP);
    expect(p.scale).toBeCloseTo(1);
    expect(p.screenX).toBe(200);
    expect(p.screenY).toBeCloseTo(800 * 0.82);
  });

  it("높이 y가 크면 화면상 더 위로", () => {
    const low = project(0, 0, VP);
    const high = project(0, 100, VP);
    expect(high.screenY).toBeLessThan(low.screenY);
  });

  it("depth가 커질수록 scale이 감소하고 소실점(위)으로 수렴", () => {
    const near = project(0, 0, VP);
    const mid = project(DEPTH_REF, 0, VP);
    const far = project(DEPTH_REF * 20, 0, VP);
    expect(mid.scale).toBeCloseTo(0.5);
    expect(far.scale).toBeLessThan(mid.scale);
    expect(far.screenY).toBeLessThan(mid.screenY);
    expect(far.screenY).toBeGreaterThan(800 * 0.32 - 1);
  });

  it("scale은 항상 (0,1] 범위", () => {
    for (const x of [0, 50, 500, 5000, 50000]) {
      const s = project(x, 0, VP).scale;
      expect(s).toBeGreaterThan(0);
      expect(s).toBeLessThanOrEqual(1);
    }
  });
});
```

- [ ] **Step 2: 실패 확인**

Run: `npm run test -- projection`
Expected: FAIL (모듈 없음).

- [ ] **Step 3: 구현**

`projection.ts`:
```ts
export type Viewport = { w: number; h: number };
export type Projected = { screenX: number; screenY: number; scale: number };

export const DEPTH_REF = 800;
export const VANISH_Y_RATIO = 0.32;
export const GROUND_Y_RATIO = 0.82;

// x: 전진 거리(px, depth), y: 물리 높이(px, y-UP). vp: 화면 크기.
export function project(x: number, y: number, vp: Viewport): Projected {
  const depth = Math.max(0, x);
  const scale = DEPTH_REF / (DEPTH_REF + depth);
  const vanishY = vp.h * VANISH_Y_RATIO;
  const groundBaseY = vp.h * GROUND_Y_RATIO;
  const screenX = vp.w / 2;
  const screenY =
    groundBaseY + (vanishY - groundBaseY) * (1 - scale) - y * scale;
  return { screenX, screenY, scale };
}
```

- [ ] **Step 4: 통과 확인**

Run: `npm run test -- projection`
Expected: PASS. 이어서 전체 `npm run test` 로 회귀 없음 확인(기존 14 + 신규 4 = 18).

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/paper-plane/projection.ts src/app/playground/paper-plane/projection.test.ts
git commit -m "feat: 뒤에서 보는 시점 투영 순수 함수(projection)"
```

---

## Task 2: 연출 CSS Module + useFullscreen 훅

**Files:**
- Create: `src/app/playground/paper-plane/effects.module.css`
- Create: `src/app/playground/paper-plane/useFullscreen.ts`

**Interfaces:**
- Produces (effects.module.css classes): `approach`, `streak`, `breath`, `sway` — 모두 `animation-duration`을 인라인 style로 주입받아 사용.
- Produces (useFullscreen): `function useFullscreen(ref: React.RefObject<HTMLElement | null>): { isFullscreen: boolean; isSupported: boolean; enter: () => void; exit: () => void; toggle: () => void }`

- [ ] **Step 1: effects.module.css 작성**

`effects.module.css`:
```css
/* 소실점에서 카메라로 다가오는 요소 (구름/링) */
@keyframes pp-approach {
  0% { transform: translate(-50%, -50%) scale(0.12); opacity: 0; }
  20% { opacity: 0.9; }
  100% { transform: translate(-50%, -50%) scale(2.6); opacity: 0; }
}
.approach {
  animation-name: pp-approach;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* 바람 속도선: 아래(카메라)에서 위(소실점)로 흐름 */
@keyframes pp-streak {
  0% { transform: translateY(10%) scaleY(0.5); opacity: 0; }
  30% { opacity: 0.7; }
  100% { transform: translateY(-70vh) scaleY(1.6); opacity: 0; }
}
.streak {
  animation-name: pp-streak;
  animation-timing-function: linear;
  animation-iteration-count: infinite;
}

/* 입김 파티클: 하단에서 퍼지며 위로 */
@keyframes pp-breath {
  0% { transform: translateY(0) scale(0.5); opacity: 0.6; }
  100% { transform: translateY(-38vh) scale(1.7); opacity: 0; }
}
.breath {
  animation-name: pp-breath;
  animation-timing-function: ease-out;
  animation-iteration-count: infinite;
}

/* 비행기 미세 흔들림 (바람 반응) */
@keyframes pp-sway {
  0%, 100% { transform: translateX(-3px) rotate(-1.5deg); }
  50% { transform: translateX(3px) rotate(1.5deg); }
}
.sway {
  animation: pp-sway 0.5s ease-in-out infinite;
}

@media (prefers-reduced-motion: reduce) {
  .approach, .streak, .breath, .sway { animation: none; }
}
```

- [ ] **Step 2: useFullscreen 작성**

`useFullscreen.ts`:
```ts
"use client";

import { useCallback, useEffect, useState, type RefObject } from "react";

export function useFullscreen(ref: RefObject<HTMLElement | null>) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isSupported, setIsSupported] = useState(false);

  useEffect(() => {
    setIsSupported(
      typeof document !== "undefined" && !!document.fullscreenEnabled,
    );
    const onChange = () =>
      setIsFullscreen(
        typeof document !== "undefined" && !!document.fullscreenElement,
      );
    document.addEventListener("fullscreenchange", onChange);
    return () => document.removeEventListener("fullscreenchange", onChange);
  }, []);

  const enter = useCallback(async () => {
    const el = ref.current;
    if (el?.requestFullscreen) {
      try {
        await el.requestFullscreen();
      } catch {
        /* 사용자 거부/미지원 — 조용히 몰입 모드로 폴백 */
      }
    }
  }, [ref]);

  const exit = useCallback(async () => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      try {
        await document.exitFullscreen();
      } catch {
        /* ignore */
      }
    }
  }, []);

  const toggle = useCallback(() => {
    if (typeof document !== "undefined" && document.fullscreenElement) {
      exit();
    } else {
      enter();
    }
  }, [enter, exit]);

  return { isFullscreen, isSupported, enter, exit, toggle };
}
```

- [ ] **Step 3: 타입 확인 + 커밋**

Run: `npx tsc --noEmit`
Expected: 에러 없음.
```bash
git add src/app/playground/paper-plane/effects.module.css src/app/playground/paper-plane/useFullscreen.ts
git commit -m "feat: 연출 CSS Module 키프레임·useFullscreen 훅"
```

---

## Task 3: 치비 캐릭터 (PlaneCharacter front/back 개편)

**Files:**
- Rewrite: `src/app/playground/paper-plane/PlaneCharacter.tsx` (전체 교체)

**Interfaces:**
- Produces: `function PlaneCharacter(props: { view: "front" | "back"; blowing?: boolean }): JSX.Element`
  - `view="front"`: 앞모습 귀여운 얼굴(인트로/조준용). `view="back"`: 뒤통수+귀 + 종이비행기 뒤태(비행/착지용).
  - `blowing`: back에서 살짝 표정/움직임 강조(선택).

**참고:** 기존 `rotation` prop은 제거된다. 소비처(Task 6)는 `view`로 호출한다. 치이카와 자체를 베끼지 말고 오리지널 치비.

- [ ] **Step 1: 전체 교체 작성 (아래 코드를 그대로 사용)**

`PlaneCharacter.tsx` — front는 귀여운 앞얼굴, back은 뒤통수+비행기 뒤태(`blowing`을 뒤통수 잔털 opacity에 사용해 미사용 경고 방지). 래퍼 없이 `<svg>` 직접 반환:
```tsx
"use client";

const CREAM = "#fde7cf";
const CREAM_SHADE = "#f2d3ab";
const BLUSH = "#ffc2ce";
const INK = "#4a4038";
const PLANE = "#ffffff";
const PLANE_SHADE = "#dfe6ff";
const PLANE_LINE = "#b9c4f0";

export function PlaneCharacter({
  view,
  blowing = false,
}: {
  view: "front" | "back";
  blowing?: boolean;
}) {
  if (view === "front") {
    // 앞모습: 큰 동그란 머리 + 점 눈 + 발그레 볼 + 작은 입, 종이비행기에 앉음
    return (
      <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
        <path d="M18 84 L102 84 L60 104 Z" fill={PLANE} stroke={PLANE_LINE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M60 104 L60 84 L36 92 Z" fill={PLANE_SHADE} stroke={PLANE_LINE} strokeWidth="2" strokeLinejoin="round" />
        <ellipse cx="60" cy="74" rx="16" ry="12" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" />
        <path d="M40 40 L34 20 L52 34 Z" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M80 40 L86 20 L68 34 Z" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" strokeLinejoin="round" />
        <path d="M41 34 L38 25 L47 32 Z" fill={BLUSH} />
        <path d="M79 34 L82 25 L73 32 Z" fill={BLUSH} />
        <circle cx="60" cy="52" r="26" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" />
        <circle cx="46" cy="58" r="5" fill={BLUSH} opacity="0.8" />
        <circle cx="74" cy="58" r="5" fill={BLUSH} opacity="0.8" />
        <circle cx="51" cy="50" r="3" fill={INK} />
        <circle cx="69" cy="50" r="3" fill={INK} />
        <circle cx="52" cy="49" r="1" fill="#ffffff" />
        <circle cx="70" cy="49" r="1" fill="#ffffff" />
        <path d="M56 58 Q60 62 64 58" stroke={INK} strokeWidth="1.6" fill="none" strokeLinecap="round" />
      </svg>
    );
  }

  // 뒤모습: 종이비행기 뒤태(V자, 위로 멀어짐) + 고양이 뒤통수/귀. blowing은 잔털 opacity에 사용.
  return (
    <svg width="120" height="120" viewBox="0 0 120 120" fill="none" aria-hidden>
      <path d="M60 30 L20 96 L60 80 Z" fill={PLANE} stroke={PLANE_LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 30 L100 96 L60 80 Z" fill={PLANE_SHADE} stroke={PLANE_LINE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M60 30 L60 80" stroke={PLANE_LINE} strokeWidth="2" />
      <circle cx="60" cy="52" r="20" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" />
      <path d="M45 40 L40 24 L56 36 Z" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M75 40 L80 24 L64 36 Z" fill={CREAM} stroke={CREAM_SHADE} strokeWidth="2" strokeLinejoin="round" />
      <path d="M56 40 Q60 34 64 40" stroke={CREAM_SHADE} strokeWidth="1.5" fill="none" strokeLinecap="round" opacity={blowing ? 1 : 0.6} />
    </svg>
  );
}
```

- [ ] **Step 2: 타입/lint 확인 + 커밋**

Run: `npx tsc --noEmit` 그리고 `npx eslint src/app/playground/paper-plane/PlaneCharacter.tsx`
Expected: 둘 다 에러/출력 없음.
```bash
git add src/app/playground/paper-plane/PlaneCharacter.tsx
git commit -m "feat: 치비 캐릭터 front/back 뷰 개편"
```

---

## Task 4: 터널 배경 (Scenery 개편)

**Files:**
- Rewrite: `src/app/playground/paper-plane/Scenery.tsx` (전체 교체)

**Interfaces:**
- Consumes: `effects.module.css` (`approach` 클래스)
- Produces: `function Scenery(props: { speed: number }): JSX.Element` — `speed`(0~1)가 다가오는 구름 애니메이션 속도를 조절.

- [ ] **Step 1: 전체 교체 작성**

`Scenery.tsx`:
```tsx
import styles from "./effects.module.css";

const CLOUDS = [
  { leftPct: 30, delay: 0 },
  { leftPct: 62, delay: 1.1 },
  { leftPct: 44, delay: 2.0 },
  { leftPct: 72, delay: 2.8 },
  { leftPct: 22, delay: 3.4 },
];
const VANISH_TOP = "32%";

export function Scenery({ speed }: { speed: number }) {
  // speed 클수록 짧은 주기(빠르게 다가옴). 4.2s(정지)~1.6s(최대).
  const dur = 4.2 - Math.max(0, Math.min(1, speed)) * 2.6;
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* 하늘 */}
      <div className="absolute inset-0 bg-gradient-to-b from-sky-300 via-sky-100 to-sky-50" />
      {/* 지면 */}
      <div
        className="absolute inset-x-0 bottom-0 bg-gradient-to-b from-emerald-100 to-emerald-200"
        style={{ top: VANISH_TOP }}
      />
      {/* 소실점으로 수렴하는 원근선 */}
      <svg className="absolute inset-0 h-full w-full" preserveAspectRatio="none" viewBox="0 0 100 100">
        <line x1="50" y1="32" x2="-10" y2="100" stroke="#ffffff" strokeWidth="0.4" opacity="0.5" />
        <line x1="50" y1="32" x2="30" y2="100" stroke="#ffffff" strokeWidth="0.4" opacity="0.5" />
        <line x1="50" y1="32" x2="70" y2="100" stroke="#ffffff" strokeWidth="0.4" opacity="0.5" />
        <line x1="50" y1="32" x2="110" y2="100" stroke="#ffffff" strokeWidth="0.4" opacity="0.5" />
      </svg>
      {/* 다가오는 구름 (소실점 근처에서 생성 → 커지며 카메라로) */}
      {CLOUDS.map((c, i) => (
        <div
          key={`cloud-${i}`}
          className={`absolute ${styles.approach}`}
          style={{
            left: `${c.leftPct}%`,
            top: VANISH_TOP,
            animationDuration: `${dur}s`,
            animationDelay: `${c.delay}s`,
          }}
        >
          <svg width="70" height="34" viewBox="0 0 70 34">
            <ellipse cx="26" cy="22" rx="22" ry="11" fill="#ffffff" opacity="0.92" />
            <ellipse cx="44" cy="18" rx="17" ry="11" fill="#ffffff" opacity="0.92" />
          </svg>
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: 타입/lint 확인 + 커밋**

Run: `npx tsc --noEmit` 그리고 `npx eslint src/app/playground/paper-plane/Scenery.tsx`
Expected: 에러/출력 없음.
```bash
git add src/app/playground/paper-plane/Scenery.tsx
git commit -m "feat: 터널 원근 배경 + 다가오는 구름 개편"
```

---

## Task 5: 바람 연출 (WindEffects)

**Files:**
- Create: `src/app/playground/paper-plane/WindEffects.tsx`

**Interfaces:**
- Consumes: `effects.module.css` (`streak`, `breath`)
- Produces: `function WindEffects(props: { wind: number; active: boolean }): JSX.Element | null`
  - `active=false`면 `null`. `active=true`면 속도선 + 입김 파티클 + 세기 게이지 렌더. 밀도/속도 ∝ `wind`.

- [ ] **Step 1: 작성**

`WindEffects.tsx`:
```tsx
"use client";

import styles from "./effects.module.css";

const STREAKS = [12, 26, 40, 54, 68, 82, 20, 60, 34, 76];
const PARTICLES = [42, 50, 58, 46, 54];

export function WindEffects({ wind, active }: { wind: number; active: boolean }) {
  if (!active) return null;
  const w = Math.max(0, Math.min(1, wind));
  const streakDur = 0.9 - w * 0.5; // 셀수록 빠르게
  const streakCount = Math.round(2 + w * (STREAKS.length - 2));
  const breathDur = 1.4 - w * 0.6;
  const breathCount = w > 0.05 ? Math.round(1 + w * (PARTICLES.length - 1)) : 0;

  return (
    <div className="pointer-events-none absolute inset-0 z-20 overflow-hidden">
      {/* 속도선 */}
      {STREAKS.slice(0, streakCount).map((leftPct, i) => (
        <span
          key={`s-${i}`}
          className={`absolute ${styles.streak}`}
          style={{
            left: `${leftPct}%`,
            bottom: "-8%",
            width: "2px",
            height: "18%",
            background:
              "linear-gradient(to top, rgba(255,255,255,0), rgba(255,255,255,0.85))",
            borderRadius: "2px",
            animationDuration: `${streakDur}s`,
            animationDelay: `${(i % 5) * 0.12}s`,
            opacity: 0.3 + w * 0.6,
          }}
        />
      ))}
      {/* 입김 파티클 (하단 중앙 = 내 입 쪽) */}
      {PARTICLES.slice(0, breathCount).map((leftPct, i) => (
        <span
          key={`b-${i}`}
          className={`absolute ${styles.breath}`}
          style={{
            left: `${leftPct}%`,
            bottom: "2%",
            width: "22px",
            height: "22px",
            background:
              "radial-gradient(circle, rgba(255,255,255,0.85), rgba(255,255,255,0))",
            borderRadius: "9999px",
            animationDuration: `${breathDur}s`,
            animationDelay: `${i * 0.15}s`,
          }}
        />
      ))}
      {/* 마이크 세기 게이지 (하단) */}
      <div className="absolute inset-x-0 bottom-3 flex flex-col items-center gap-1">
        <div className="h-2 w-40 overflow-hidden rounded-full bg-white/40">
          <div
            className="h-full rounded-full bg-accent transition-[width] duration-75"
            style={{ width: `${Math.round(w * 100)}%` }}
          />
        </div>
        <span className="text-[10px] font-semibold text-white drop-shadow">
          {w > 0.05 ? "🌬️ 부는 중!" : "마이크에 훅~ 불어보세요"}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: 타입/lint 확인 + 커밋**

Run: `npx tsc --noEmit` 그리고 `npx eslint src/app/playground/paper-plane/WindEffects.tsx`
Expected: 에러/출력 없음.
```bash
git add src/app/playground/paper-plane/WindEffects.tsx
git commit -m "feat: 바람 연출(속도선·입김 파티클·세기 게이지)"
```

---

## Task 6: 게임 통합 (PaperPlaneGame 개편)

**Files:**
- Rewrite: `src/app/playground/paper-plane/PaperPlaneGame.tsx` (전체 교체)

**Interfaces:**
- Consumes: `useWindMic`, `usePlanePhysics`, `useFullscreen`, `project`/`Viewport` (projection), `PlaneCharacter`(view prop), `Scenery`(speed prop), `WindEffects`, `HelpOverlay`, `MicPermissionGate`, `Leaderboard`, `effects.module.css`(`sway`).
- Produces: `export default function PaperPlaneGame(): JSX.Element`.
- 상태머신 `phase`: `"intro" | "aim" | "flying" | "landed"`. 몰입 컨테이너는 `fixed inset-0 z-50`.

**핵심 설계 노트(구현자 필독):**
- 컨테이너 `containerRef`를 `useFullscreen`에 전달.
- 뷰포트 크기 `vp`는 window 기준 state로 관리(초기 `{w:390,h:780}`), resize/fullscreenchange 시 갱신.
- 매 프레임 `mic.wind()`는 render에서 1회만, `phase==="flying"`일 때만 호출: `const wind = phase === "flying" ? mic.wind() : 0;`.
- 비행기 위치: `const proj = project(x, y, vp)`; style `left: proj.screenX, top: proj.screenY, transform: translate(-50%,-50%) scale(proj.scale)`. aim에서는 `x=0, y=40` 기본값으로 하단 중앙 표시.
- Scenery `speed`: 비행 중 속도 정규화 `Math.min(1, hypot(vx,vy)/700)`, 아니면 0. 바람 시 가산은 생략(속도에 이미 반영됨).
- 드래그/발사(slingshot)·`normalizeUp`·착지 감지 effect·마이크 언마운트 정리는 기존 로직 유지.
- Leaderboard는 landed 시 하단 시트 오버레이로 표시(몰입 레이아웃). intro/help/gate 오버레이는 전체화면 스타일.
- 나가기(✕): `next/link`로 `/playground` 이동(풀스크린이면 브라우저가 이동 시 자동 해제).

- [ ] **Step 1: 전체 교체 작성**

`PaperPlaneGame.tsx`:
```tsx
"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { useWindMic } from "./useWindMic";
import { usePlanePhysics } from "./usePlanePhysics";
import { useFullscreen } from "./useFullscreen";
import { project, type Viewport } from "./projection";
import { PlaneCharacter } from "./PlaneCharacter";
import { Scenery } from "./Scenery";
import { WindEffects } from "./WindEffects";
import { HelpOverlay } from "./HelpOverlay";
import { MicPermissionGate } from "./MicPermissionGate";
import { Leaderboard } from "./Leaderboard";
import styles from "./effects.module.css";

type Phase = "intro" | "aim" | "flying" | "landed";
const TUTORIAL_KEY = "pp_seen_tutorial";

export default function PaperPlaneGame() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const mic = useWindMic();
  const physics = usePlanePhysics(mic.wind);
  const fs = useFullscreen(containerRef);

  const [phase, setPhase] = useState<Phase>("intro");
  const [showHelp, setShowHelp] = useState(false);
  const [drag, setDrag] = useState<{ dx: number; dy: number } | null>(null);
  const [pendingDistance, setPendingDistance] = useState<number | null>(null);
  const [highlightId, setHighlightId] = useState<string | null>(null);
  const [vp, setVp] = useState<Viewport>({ w: 390, h: 780 });
  const dragStart = useRef<{ x: number; y: number } | null>(null);

  const wind = phase === "flying" ? mic.wind() : 0;
  const blowing = wind > 0;

  // 뷰포트 크기 추적
  useEffect(() => {
    const measure = () =>
      setVp({ w: window.innerWidth, h: window.innerHeight });
    measure();
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, []);

  // 언마운트 시 마이크 정리
  useEffect(() => {
    return () => {
      mic.stop();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- unmount cleanup only; mic.stop identity stable
  }, []);

  // 착지 감지
  useEffect(() => {
    if (phase === "flying" && physics.state && !physics.running) {
      setPhase("landed");
      setPendingDistance(physics.distance);
    }
  }, [phase, physics.running, physics.state, physics.distance]);

  const begin = useCallback(async () => {
    const seen =
      typeof window !== "undefined" && localStorage.getItem(TUTORIAL_KEY);
    if (!seen) setShowHelp(true);
    if (fs.isSupported) fs.enter();
    await mic.start();
    setPhase("aim");
  }, [mic, fs]);

  const closeHelp = useCallback(() => {
    if (typeof window !== "undefined") localStorage.setItem(TUTORIAL_KEY, "1");
    setShowHelp(false);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent) => {
      if (phase !== "aim") return;
      dragStart.current = { x: e.clientX, y: e.clientY };
      setDrag({ dx: 0, dy: 0 });
    },
    [phase],
  );

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    if (!dragStart.current) return;
    setDrag({
      dx: e.clientX - dragStart.current.x,
      dy: e.clientY - dragStart.current.y,
    });
  }, []);

  const onPointerUp = useCallback(() => {
    if (!dragStart.current || !drag) return;
    const pull = Math.hypot(drag.dx, drag.dy);
    dragStart.current = null;
    setDrag(null);
    if (pull < 12) return;
    const power = Math.min(1, pull / 240);
    const angle = Math.atan2(-drag.dy, -drag.dx);
    setPhase("flying");
    physics.launchPlane({ angle: normalizeUp(angle), power });
  }, [drag, physics]);

  const reset = useCallback(() => {
    physics.reset();
    setPendingDistance(null);
    setHighlightId(null);
    setPhase("aim");
  }, [physics]);

  const handleSubmitted = useCallback((id: string) => {
    setHighlightId(id);
    setPendingDistance(null);
  }, []);

  const retryMic = useCallback(() => {
    mic.start();
  }, [mic]);

  const gateStatus =
    mic.status === "denied" || mic.status === "unsupported"
      ? mic.status
      : null;

  // 비행기 투영
  const px = physics.state?.x ?? 0;
  const py = physics.state?.y ?? (phase === "aim" ? 40 : 0);
  const proj = project(px, py, vp);
  const speed = physics.running && physics.state
    ? Math.min(1, Math.hypot(physics.state.vx, physics.state.vy) / 700)
    : 0;
  const planeView = phase === "flying" || phase === "landed" ? "back" : "front";

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-50 select-none overflow-hidden bg-sky-100"
      style={{ touchAction: "none" }}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerLeave={onPointerUp}
    >
      <Scenery speed={speed} />
      <WindEffects wind={wind} active={phase === "flying"} />

      {/* 비행기 */}
      {phase !== "intro" && (
        <div
          className={`absolute z-10 ${blowing ? styles.sway : ""}`}
          style={{
            left: proj.screenX,
            top: proj.screenY,
            transform: `translate(-50%, -50%) scale(${proj.scale})${
              drag ? ` translate(${drag.dx}px, ${drag.dy}px)` : ""
            }`,
            transformOrigin: "center",
          }}
        >
          <PlaneCharacter view={planeView} blowing={blowing} />
        </div>
      )}

      {/* 상단 HUD */}
      <div
        className="absolute inset-x-0 top-0 z-30 flex items-center justify-between p-3"
        style={{ paddingTop: "calc(env(safe-area-inset-top, 0px) + 12px)" }}
      >
        <div className="rounded-full bg-white/85 px-3 py-1 text-sm font-bold text-accent">
          {phase === "flying" || phase === "landed" ? `${physics.distance}m` : "🐱🛩️"}
        </div>
        <div className="flex items-center gap-2">
          {phase !== "intro" && (
            <button
              onClick={() => setShowHelp(true)}
              className="h-9 w-9 rounded-full bg-white/85 text-sm font-bold text-accent"
              aria-label="도움말"
            >
              ?
            </button>
          )}
          {fs.isSupported && (
            <button
              onClick={fs.toggle}
              className="h-9 w-9 rounded-full bg-white/85 text-sm text-accent"
              aria-label="전체화면"
            >
              ⛶
            </button>
          )}
          <Link
            href="/playground"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/85 text-sm font-bold text-accent"
            aria-label="나가기"
          >
            ✕
          </Link>
        </div>
      </div>

      {/* 조준 안내 */}
      {phase === "aim" && !drag && (
        <div className="absolute inset-x-0 bottom-10 z-30 text-center text-sm font-medium text-white drop-shadow">
          비행기를 뒤로 당겼다 놓아 발사하세요
        </div>
      )}

      {/* 인트로 */}
      {phase === "intro" && (
        <div className="absolute inset-0 z-40 flex flex-col items-center justify-center gap-4 bg-sky-100/60 px-6 text-center backdrop-blur-sm">
          <PlaneCharacter view="front" />
          <h2 className="font-display text-2xl font-bold">종이비행기 날리기</h2>
          <p className="text-sm text-text-secondary">
            뒤로 당겨 발사하고, 마이크에 훅~ 불어 더 멀리!
          </p>
          <button
            onClick={begin}
            className="mt-1 rounded-full bg-accent px-7 py-3 text-base font-semibold text-white spring-transition hover:scale-[1.03]"
          >
            시작하기 🎤
          </button>
          <Link href="/playground" className="text-xs text-text-muted underline">
            나가기
          </Link>
        </div>
      )}

      {/* 착지: 리더보드 하단 시트 */}
      {phase === "landed" && (
        <div className="absolute inset-x-0 bottom-0 z-40 max-h-[70%] overflow-y-auto rounded-t-2xl bg-card-bg p-4 shadow-ambient animate-fade-in-up">
          <div className="mb-3 text-center">
            <button
              onClick={reset}
              className="rounded-full bg-accent px-6 py-2.5 text-sm font-semibold text-white spring-transition hover:scale-[1.03]"
            >
              다시 날리기 ({physics.distance}m)
            </button>
          </div>
          <Leaderboard
            pendingDistance={pendingDistance}
            onSubmitted={handleSubmitted}
            highlightId={highlightId}
          />
        </div>
      )}

      {showHelp && <HelpOverlay onClose={closeHelp} />}
      {gateStatus && <MicPermissionGate status={gateStatus} onRetry={retryMic} />}
    </div>
  );
}

function normalizeUp(angle: number): number {
  let a = angle;
  if (Math.sin(a) < 0) a = -a;
  const min = (15 * Math.PI) / 180;
  const max = (80 * Math.PI) / 180;
  return Math.max(min, Math.min(max, a));
}
```

- [ ] **Step 2: 타입/lint 확인**

Run:
```bash
npx tsc --noEmit
npx eslint src/app/playground/paper-plane/PaperPlaneGame.tsx
```
Expected: 에러/출력 없음. (미사용 변수 없도록 — `fs.enter`/`fs.toggle`/`fs.isSupported` 모두 사용됨)

- [ ] **Step 3: 커밋**

```bash
git add src/app/playground/paper-plane/PaperPlaneGame.tsx
git commit -m "feat: 뒤에서 보는 시점·몰입/전체화면·연출 통합"
```

---

## Task 7: 페이지 문구 정리 + 전체 검증

**Files:**
- Modify: `src/app/playground/paper-plane/page.tsx`

**Interfaces:**
- Consumes: `PaperPlaneGame` (default). 게임이 `fixed inset-0`로 몰입되므로 페이지의 마케팅 헤딩은 게임 뒤에 가려짐 → 페이지를 단순화(헤딩 유지하되 게임이 위에 오버레이).

- [ ] **Step 1: page.tsx 정리**

게임이 전체화면 오버레이라 페이지 본문은 로딩 시 잠깐만 보인다. 최소 폴백만 남긴다:
```tsx
import type { Metadata } from "next";
import PaperPlaneGame from "./PaperPlaneGame";

export const metadata: Metadata = {
  title: "종이비행기 날리기",
  description:
    "비행기 뒤에서 보는 시점으로, 드래그 발사 + 마이크 입김으로 더 멀리 날리는 미니게임.",
};

export default function PaperPlanePage() {
  return (
    <main className="flex min-h-[50vh] items-center justify-center text-sm text-text-muted">
      게임을 불러오는 중…
      <PaperPlaneGame />
    </main>
  );
}
```

- [ ] **Step 2: 전체 검증**

Run:
```bash
npm run test
npx tsc --noEmit
npx eslint src/app/playground/paper-plane/ src/lib/leaderboard.ts
npm run build
```
Expected: test 18/18(기존14+투영4) 통과, tsc 클린, scoped eslint 무출력, build exit 0(`/playground/paper-plane` 정적).

- [ ] **Step 3: 커밋**

```bash
git add src/app/playground/paper-plane/page.tsx
git commit -m "feat: 종이비행기 게임 페이지 몰입 렌더로 정리"
```

---

## Task 8: 수동 통합 QA

**Files:** 없음 (검증)

- [ ] **Step 1: dev 서버 브라우저 스모크(데스크톱)**

`npm run dev` → `/playground/paper-plane`:
- [ ] 인트로에 치비 앞모습 캐릭터 + "시작하기" 노출, 콘솔 에러 없음
- [ ] 시작 시 마이크 권한 요청, (지원 브라우저면) 전체화면 전환
- [ ] 드래그 발사 시 비행기가 뒤태로 바뀌고 소실점으로 작아지며 날아감(터널 뷰)
- [ ] 다가오는 구름/원근선으로 전진 속도감
- [ ] 마이크에 불면: 속도선·입김 파티클·세기 게이지·비행기 흔들림 동작, 더 멀리 감
- [ ] 착지 시 하단 시트 리더보드 + "다시 날리기", 등록/강조 동작
- [ ] ✕ 나가기 → /playground 이동, 전체화면 해제
- [ ] 마이크 거부 시 게이트 안내

- [ ] **Step 2: 모바일 뷰포트 확인(개발자도구 디바이스 모드)**

- [ ] 세로 화면 100dvh 꽉 참, safe-area로 상단 버튼 안 잘림
- [ ] 터치 드래그 발사, 게이지/버튼 터치 동작
- [ ] 레이아웃 가로 스크롤 없음

- [ ] **Step 3: 이상 발견 시 수정 후 재확인. 실물 마이크 플레이는 사용자에게 안내.**

---

## Self-Review (작성자 점검)

- **Spec coverage:** 뒤에서 보는 투영(1,6), 몰입/전체화면(2,6,7), 치비 캐릭터(3), 터널 배경(4), 바람 4종 연출(5=속도선·파티클·게이지, 6=비행기 sway 반응), 물리/DB/리더보드 무변경(재사용), QA(8) — 스펙 전 항목 대응.
- **Placeholder scan:** 실제 코드/명령 포함. Task 3에 서술형 정정 노트가 있으나 Step 2에 최종 코드 명시.
- **Type consistency:** `project(x,y,vp)`→`{screenX,screenY,scale}`(Task1)·`PlaneCharacter{view,blowing}`(Task3)·`Scenery{speed}`(Task4)·`WindEffects{wind,active}`(Task5)·`useFullscreen(ref)`(Task2) 반환형이 소비처(Task6)와 일치.
- **주의(실행 시):**
  1) `fixed inset-0 z-50` 게임이 사이트 헤더를 덮음 — 의도된 몰입. ✕로 복귀.
  2) `mic.wind()`를 render에서 호출(기존 v1과 동일, `phase==="flying"` 가드) — 리뷰에서 재확인.
  3) Task 3의 back 뷰 `blowing` 미사용 lint 회피를 위해 Step 2 코드(=opacity에 사용)를 반드시 채택.
  4) CSS Module 클래스명은 `styles.approach` 등으로 접근 — 문자열 하드코딩 금지.
