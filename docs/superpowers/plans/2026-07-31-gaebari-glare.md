# 개바리 째려보기 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 노트북 웹캠에 잡히는 얼굴 개수와 크기만 보고, 나 말고 다른 사람이 다가오면 개바리가 단계적으로 째려보는 `/playground/gaebari-glare`를 만든다.

**Architecture:** 판정 로직 전부를 DOM·카메라를 모르는 순수 함수 두 개(`detect.ts` 트래킹, `state.ts` 상태 머신)로 떼어내 vitest로 검증한다. React 쪽은 카메라 스트림 획득, 10fps 스로틀 루프, 표시만 담당한다. MediaPipe FaceDetector는 시작 버튼을 누른 뒤에 동적 import 해서, 이 페이지를 열기만 한 사람은 wasm을 한 바이트도 받지 않는다.

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, vitest, `@mediapipe/tasks-vision`.

## Global Constraints

- 새 런타임 의존성은 `@mediapipe/tasks-vision` **하나뿐**이다.
- **어떤 프레임도, 프레임에서 나온 어떤 값도 저장·전송하지 않는다.** 네트워크 요청은 페이지·wasm·모델 로드가 전부다. Supabase를 쓰지 않는다.
- 신원 식별을 하지 않는다. 얼굴 임베딩·등록 플로우·생체정보를 만들지 않는다. 다루는 값은 박스 좌표와 개수뿐이다.
- 녹화·캡처 기능을 만들지 않는다.
- wasm/모델은 CDN이 아니라 자기 도메인에서 서빙한다(`/mediapipe/`).
- wasm 바이너리는 **git에 커밋하지 않는다.** `prebuild`에서 `node_modules`에서 복사한다.
- MediaPipe는 시작 버튼 이후 `await import()`로만 로드한다. 정적 import 금지.
- 검출 루프는 10fps로 스로틀한다. 비디오는 640×480.
- 테스트 대상은 `detect.ts`, `state.ts`의 순수 함수뿐. 카메라·컴포넌트는 단위 테스트하지 않는다.
- 테스트 파일은 `src/**/*.test.ts` 패턴이어야 vitest가 수집한다.
- 색상은 하드코딩하지 말고 globals.css 토큰의 Tailwind 클래스(`bg-card-bg`, `text-accent`, `text-text-secondary`, `border-border`, `shadow-ambient` 등)를 쓴다. 사이트는 라이트 모드 전용.
- UI 문구는 한국어. 상시 노출 문구 `얼굴 개수만 셉니다 · 저장·전송·녹화 없음`는 어떤 상태에서도 화면에서 사라지지 않는다.
- 사운드 없음. 모바일 대응 없음.
- `src/lib/projects.ts`에 `hidden: true`로 등록한다.
- 각 태스크는 커밋으로 끝난다. 한국어 본문, `feat:` / `test:` / `chore:` 프리픽스.

## 상수 (스펙에서 그대로 옮김)

| 상수 | 값 | 의미 |
|---|---|---|
| `IOU_MATCH` | 0.3 | 이 값을 넘으면 같은 사람으로 본다 |
| `MAX_MISSES` | 5 | 5프레임 연속 미검출이면 트랙 삭제 |
| `MIN_SELF_AGE` | 30 | 나로 인정받는 최소 연속 검출 프레임 (3초) |
| `RISE_FRAMES` | 3 | 상승 지연 (0.3초) |
| `FALL_FRAMES` | 15 | 하강 지연 (1.5초) |
| `THRESHOLD_MARGIN` | 0.1 | 올라갈 땐 110%, 내려올 땐 90% |
| `GLANCE` / `STARE` / `GLARE` 임계 | 0.06 / 0.12 / 0.22 | 박스 높이 ÷ 프레임 높이 |
| `DETECT_FPS` | 10 | 검출 루프 스로틀 |

## 파일 구조

```
src/app/playground/gaebari-glare/
  page.tsx                   서버 컴포넌트, metadata
  GlareGame.tsx              "use client" — 카메라, 검출 루프, 렌더
  CameraPermissionGate.tsx   MicPermissionGate 미러링
  detect.ts                  박스 → 트랙 매칭, 나/침입자 선정 (순수)
  detect.test.ts
  state.ts                   4단계 상태 머신, 히스테리시스 (순수)
  state.test.ts
  Gaebari.tsx                상태별 개바리 표시 (교체 지점)
  useSettings.ts             온/오프·민감도 localStorage
scripts/copy-mediapipe.mjs   wasm을 public/mediapipe/로 복사
public/mediapipe/blaze_face_short_range.tflite   (커밋함, 224KB)
```

`detect.ts`와 `state.ts`는 박스 배열과 이전 상태만 받아 다음 상태를 낸다. 이 프로젝트에서 버그가 날 곳은 거의 전부 이 두 파일이다.

---

### Task 1: wasm 파이프라인

**Files:**
- Create: `scripts/copy-mediapipe.mjs`
- Modify: `package.json` (`prebuild` 스크립트), `.gitignore`

`node_modules/@mediapipe/tasks-vision/wasm/`의 SIMD·nosimd `.js`/`.wasm` 4개를 `public/mediapipe/`로 복사한다. 파일이 최신이면 건너뛴다. `public/mediapipe/*.wasm`과 `*_internal.js`를 gitignore에 넣는다 — 11MB 바이너리를 저장소에 남기지 않는다.

모델 `blaze_face_short_range.tflite`(224KB)는 node_modules에 없으므로 커밋한다.

- [ ] 복사 스크립트 작성, `npm run prebuild`로 동작 확인
- [ ] `.gitignore`에 wasm 항목 추가, `git status`로 바이너리가 안 잡히는지 확인
- [ ] 커밋

### Task 2: detect.ts — 트래킹과 나/침입자 선정

**Files:** Create `detect.ts`, `detect.test.ts`

```ts
export interface Box { x: number; y: number; w: number; h: number }   // 정규화 0~1
export interface Track { id: number; box: Box; age: number; misses: number }
export interface TrackerState { tracks: Track[]; nextId: number; selfId: number | null }
export function createTracker(): TrackerState
export function iou(a: Box, b: Box): number
/** 이번 프레임 박스들로 트래커를 한 스텝 진행시킨다. 새 상태를 반환(불변) */
export function stepTracker(prev: TrackerState, boxes: Box[]): TrackerState
/** 나로 확정된 트랙. MIN_SELF_AGE를 넘긴 트랙이 없으면 null */
export function selfTrack(s: TrackerState): Track | null
/** 나를 제외한 트랙 중 박스가 가장 큰 것. 없으면 null */
export function intruderTrack(s: TrackerState): Track | null
```

핵심 규칙:
- IoU 그리디 매칭. `IOU_MATCH` 미만이면 새 트랙.
- 매칭된 트랙은 `age++`, `misses = 0`. 미검출 트랙은 `misses++`, `misses > MAX_MISSES`면 삭제. **미검출 중에도 `age`는 유지한다.**
- `selfId`는 `age >= MIN_SELF_AGE`인 트랙 중 `age` 최대인 것으로 한 번 정해지고, 그 트랙이 살아 있는 동안 sticky. 트랙이 삭제되면 `selfId = null`로 풀린다.

**검증 시나리오** (스펙에서):
- [ ] 기대기 — 내 박스가 작아지고 상대가 커져도 self가 안 뒤집힌다
- [ ] 검출 끊김 — 3프레임 연속 미검출을 겪어도 트랙과 `age`가 유지된다
- [ ] 자리 비움 — self 트랙이 사라지면 `selfTrack()`이 null
- [ ] 3초 전에는 아무도 self가 아니다
- [ ] 지나가던 사람이 먼저 잡혀도, 내가 계속 있으면 결국 내가 self
- [ ] `iou` 기본 성질(자기 자신=1, 안 겹침=0)
- [ ] 커밋

### Task 3: state.ts — 4단계 상태 머신

**Files:** Create `state.ts`, `state.test.ts`

```ts
export type GlareLevel = "idle" | "glance" | "stare" | "glare";
export interface GlareState { level: GlareLevel; pending: GlareLevel; frames: number }
export function createGlareState(): GlareState
/**
 * @param ratio 침입자 박스 높이 ÷ 프레임 높이. 침입자가 없거나 self 미확정이면 null
 * @param sensitivity 임계값 배율 (1이 기본, 클수록 예민)
 */
export function stepGlare(prev: GlareState, ratio: number | null, sensitivity: number): GlareState
```

- `ratio`가 null이면 목표는 `idle`.
- 목표 레벨 산출 시, **올라가는 방향이면 임계값 × (1 + MARGIN), 내려가는 방향이면 × (1 - MARGIN)** 을 쓴다.
- 목표가 현재와 다르면 `pending`에 쌓고 `frames++`. 올라갈 땐 `RISE_FRAMES`, 내려갈 땐 `FALL_FRAMES`를 채워야 `level`이 바뀐다.
- 목표가 도중에 바뀌면 카운터 리셋.

**검증 시나리오:**
- [ ] 경계 떨림 — 임계값 근처에서 비율이 진동해도 레벨이 안 오간다
- [ ] 상승·하강 비대칭 — 3프레임에 올라가고 15프레임에 내려온다
- [ ] `ratio = null`이 15프레임 지속되면 idle로 떨어진다
- [ ] 두 단계 점프(0 → 0.3)도 3프레임이면 glare까지 올라간다
- [ ] 민감도를 올리면 같은 ratio에서 더 높은 레벨이 나온다
- [ ] 커밋

### Task 4: Gaebari.tsx — 표시

**Files:** Create `Gaebari.tsx`

정적 PNG 4장을 만들 수 없으므로 **인라인 SVG 캐릭터**로 시작한다. 스펙의 "교체 전제"를 그대로 지킨다 — 이 파일 하나만 갈아끼우면 된다.

- 상태별로 눈동자 위치, 눈꺼풀 각도, 고개 기울기, 입 모양이 바뀐다
- `idle`은 정면·평온, `glance`는 눈만 옆으로, `stare`는 고개까지 돌려 정면 응시, `glare`는 눈꺼풀이 내려오고 눈썹이 꺾인다
- 레벨 전환은 CSS `transition`으로 부드럽게 (상태 머신이 이미 디바운스하므로 짧게)
- [ ] 커밋

### Task 5: 카메라와 루프

**Files:** Create `CameraPermissionGate.tsx`, `useSettings.ts`, `GlareGame.tsx`

- 시작 버튼 → `getUserMedia({ video: { width: 640, height: 480 } })` → 성공 후에야 `await import("@mediapipe/tasks-vision")`
- `FilesetResolver.forVisionTasks("/mediapipe")` + `FaceDetector.createFromOptions({ baseOptions: { modelAssetPath: "/mediapipe/blaze_face_short_range.tflite" }, runningMode: "VIDEO" })`
- `requestAnimationFrame` 안에서 마지막 처리 시각을 보고 100ms 미만이면 건너뛴다
- 검출 박스를 정규화 좌표로 변환 → `stepTracker` → `intruderTrack`의 높이 비율 → `stepGlare`
- 언마운트·끄기 시 트랙 stop, detector close, rAF 취소
- 권한 거부/미지원이면 `CameraPermissionGate`
- 설정: 온/오프, 민감도(0.6~1.6). `localStorage`. **영상에서 나온 값은 저장하지 않는다.**
- 안내 문구: 별도 브라우저 창으로 띄워 보조 모니터에 둘 것 (백그라운드 탭이면 프레임 처리가 죽는다)
- 상시 문구 `얼굴 개수만 셉니다 · 저장·전송·녹화 없음`
- [ ] 커밋

### Task 6: 라우트 등록과 마감

**Files:** Create `page.tsx`; Modify `src/lib/projects.ts`

- metadata는 marble-drop 형식을 따르되 OG 이미지는 없으므로 생략
- `projects.ts`에 `hidden: true`로 추가
- [ ] `npm test` 전체 통과
- [ ] `npx tsc --noEmit`
- [ ] `npm run build` (끝나고 `public/sitemap-0.xml`, `next-env.d.ts` 되돌리기)
- [ ] 커밋

## 범위 밖

사운드, 녹화·캡처, 신원 식별, 모바일 대응. 개바리 애니메이션 webm 교체는 정적 SVG가 검증된 뒤 별건.
