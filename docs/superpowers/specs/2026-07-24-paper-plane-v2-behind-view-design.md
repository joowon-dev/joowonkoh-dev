# 종이비행기 게임 v2 — 뒤에서 보는 시점 리디자인 설계

**작성일**: 2026-07-24
**대상**: 기존 `/playground/paper-plane` 게임의 뷰/연출 개편 (v1은 이미 master 병합됨)

## 개요

기존 2D 옆면 뷰 게임을 **의사 3D "비행기 뒤에서 보는" 터널 시점**으로 리디자인한다. 플레이어가 비행기 뒤에서 입김을 부는 몰입감을 준다. 모바일 우선(가장 많이 쓰일 환경), 전체화면 지원, 마이크 바람 감지 시 4종 애니메이션. 캐릭터는 더 귀여운 치비 감성으로 교체. 물리 엔진·Supabase 리더보드·마이크 감지 로직은 그대로 재활용한다.

## 목표 및 성공 기준

- 비행기가 카메라에서 멀어지며(작아지며) 소실점으로 날아가는 뒤태 시점
- 모바일 브라우저에서 전체 뷰포트 몰입 + 터치 드래그 + 마이크 입김 정상 동작
- 마이크로 불면 4종 연출(속도선·가속 반응·입김 파티클·세기 게이지)이 실시간 표시
- 치비 감성의 더 귀여운 오리지널 캐릭터
- 기존 물리/리더보드/DB 무변경으로 안정성 유지

## 범위 밖 (YAGNI)

- 실제 3D 엔진(three.js 등) 도입 — CSS 원근감으로 충분
- 좌우 조종/스티어링 — 수직 평면에서 멀어지는 비행만 (거리 챌린지 유지)
- 물리 상수/공식 재설계 — 기존 값 재사용, 필요 시 미세 튜닝만
- DB 스키마/RLS 변경, 리더보드 로직 변경
- v1 옆면 뷰 유지(토글) — v2로 완전 교체

## 저작권 유의

캐릭터는 치이카와(ちいかわ, 나가노 IP)를 **그대로 재현하지 않는다**. 그 소프트 치비 스타일(동글동글 큰 머리, 작은 몸, 점 눈, 발그레 볼, 파스텔 톤)을 참고한 **오리지널 캐릭터**를 인라인 SVG로 새로 그린다. 외부 이미지/에셋 없음.

## 아키텍처

### 좌표 재해석 (물리 무변경, 투영 레이어만 추가)

기존 `physics.ts`의 상태 `{x, y, vx, vy}`(y-UP)를 그대로 두고, 화면 투영만 새로 만든다:

- 물리 `x`(전진 거리) → **depth**(카메라로부터 멀어짐). depth가 클수록 `scale` 작아지고 화면상 소실점(중앙 상단 근처)으로 수렴.
- 물리 `y`(높이) → 화면 세로 오프셋(위로 뜸).
- 거리(점수) = 기존 `distanceMeters(state)` 그대로.

`projection.ts` (신규, 순수 함수, 단위 테스트 대상):
- `type Viewport = { w: number; h: number }`
- `type Projected = { screenX: number; screenY: number; scale: number }`
- `const VANISH_Y_RATIO = 0.32` (소실점 세로 위치 비율)
- `const DEPTH_REF = 800` (scale 감쇠 기준 depth, px)
- `function project(x: number, y: number, vp: Viewport): Projected`
  - `scale = DEPTH_REF / (DEPTH_REF + x)` (원근: x=0 → 1, 멀수록 0에 수렴)
  - `vanishX = vp.w / 2`, `vanishY = vp.h * VANISH_Y_RATIO`
  - `groundBaseY = vp.h * 0.82` (x=0일 때 비행기 기준 바닥선)
  - `screenX = vanishX` (수직 평면 비행 — 좌우 이동 없음; 미세 sway는 렌더에서 별도 추가)
  - `screenY = lerp(groundBaseY, vanishY, 1 - scale) - y * scale` (멀수록 소실점으로 올라가고, 물리 높이 y를 scale 반영해 뺌)

### 컴포넌트/모듈 경계

| 단위 | 변경 | 책임 |
|---|---|---|
| `physics.ts`, `usePlanePhysics.ts` | 무변경 | 물리 상태·rAF 루프 |
| `useWindMic.ts` | 무변경 | 마이크 → wind 0~1 (게이지에도 재사용) |
| `Leaderboard.tsx`, `lib/leaderboard.ts`, `lib/supabaseClient.ts`, DB | 무변경 | 리더보드 |
| `projection.ts` (신규) | 신규 | depth·height → 화면좌표·scale 순수 함수 |
| `projection.test.ts` (신규) | 신규 | 투영 단위 테스트 |
| `useFullscreen.ts` (신규) | 신규 | Fullscreen API 토글 + 지원 감지 |
| `PlaneCharacter.tsx` | 개편 | `view: "front" | "back"` prop 추가. front=귀여운 앞얼굴(인트로/조준), back=뒤통수+귀+꼬리(비행) |
| `Scenery.tsx` | 개편 | 터널 원근 배경(하늘/지면/수렴선) + 소실점에서 다가오는 구름/링 |
| `WindEffects.tsx` (신규) | 신규 | 4종 바람 연출(속도선·입김 파티클·세기 게이지, + 비행기 가속 반응 신호) |
| `PaperPlaneGame.tsx` | 대개편 | 몰입/전체화면 컨테이너, 투영 렌더, 상태머신, 연출 조합 |

## 모바일 우선 + 전체화면

- **기본 몰입 모드**: 게임 컨테이너가 `100dvw × 100dvh`, `env(safe-area-inset-*)` 패딩 대응. 모바일 주소창/노치 고려(`dvh` 사용). 상단에 작은 "✕" 종료 버튼으로 일반 페이지 레이아웃 복귀.
- **Fullscreen API 보강**: `useFullscreen`이 `document.fullscreenEnabled` 감지. 지원 시 "⛶ 전체화면" 버튼 노출 → `requestFullscreen()`, 미지원(iOS Safari 등)이면 버튼 숨김. `fullscreenchange`/ESC 처리.
- 세로(portrait) 기준 레이아웃. 드래그·마이크 모두 터치/모바일 지원(pointer 이벤트 + `touch-action: none`).
- 몰입 진입은 인트로의 "시작하기"에서 함께 수행(사용자 제스처 필요 — 마이크 권한·풀스크린 모두 제스처 안에서 호출).

## 뒤에서 보는 터널 뷰 렌더링

- **배경(Scenery 개편)**: 상단 하늘 그라데이션 + 하단 지면, 중앙 소실점으로 수렴하는 원근선(옅은 스트로크). CSS `perspective`/`transform` 또는 계산된 scale로 깊이 표현.
- **다가오는 요소**: 구름/링이 소실점 근처에서 생성되어 scale·위치가 커지며 카메라로 다가와 사라짐. 전진 속도(및 바람)에 비례해 생성/이동 속도↑. 개수 상한으로 성능 관리(모바일).
- **비행기(PlaneCharacter back)**: 종이비행기 꼬리쪽 + 고양이 뒤통수/귀가 보이는 각도. `project()`의 scale·screenY 적용, 바람 시 미세 좌우 sway.
- **착지**: scale/위치 고정 후 통통 바운스 + 거리 카운터 확정.

## 바람 연출 (마이크 감지 시 · 4종)

`WindEffects.tsx`가 `wind: number(0~1)`, `active: boolean`(flying)만 받아 렌더:

1. **속도선(streaks)**: 화면 앞→소실점 방향으로 흐르는 흰 선 다발. 밀도·속도 ∝ wind. 개수 상한.
2. **비행기 가속 반응**: `PaperPlaneGame`이 wind>0일 때 비행기에 흔들림 클래스/트랜스폼 부여(물리는 이미 wind로 가속됨 — 시각 강조만).
3. **입김 파티클**: 화면 하단 중앙(내 입 쪽)에서 작은 반투명 입김이 퍼지며 소실점 쪽으로 올라감. 세기 비례 생성.
4. **세기 게이지**: 하단(또는 코너)에 현재 wind(0~1)를 막대/링으로 실시간 표시.

성능: 파티클/속도선은 DOM 노드 상한(예: 각 12~16개) + rAF 재사용, 모바일 프레임 안정 우선.

## 상태 머신 (유지 + 몰입 진입)

intro → aim → flying → landed. intro의 "시작하기"에서 (사용자 제스처 내) 몰입 모드 진입 + 마이크 권한 요청. 온보딩/도움말·마이크 게이트는 v1 컴포넌트 재사용(문구는 뒤태/불기 맥락으로 소폭 조정 가능).

## 에러 처리

- 마이크 거부/미지원 → 기존 `MicPermissionGate` 재사용.
- Fullscreen 요청 거부/실패 → 조용히 몰입 모드로 폴백(에러 표시 안 함).
- 리더보드 실패 → 기존 처리 유지.

## 테스트 전략

- `projection.ts` 순수 함수 단위 테스트(경계: x=0 → scale 1·바닥, x 큼 → scale 작고 소실점 근접, y 반영).
- 기존 물리/마이크/리더보드 테스트 유지(무변경).
- 렌더·연출·전체화면·모바일 몰입은 빌드 + 브라우저 스모크(데스크톱) + 실기기 수동 확인(마이크/터치).

## 반영 파일 요약

- 신규: `projection.ts`, `projection.test.ts`, `useFullscreen.ts`, `WindEffects.tsx`
- 개편: `PaperPlaneGame.tsx`, `PlaneCharacter.tsx`, `Scenery.tsx`
- 무변경: `physics.ts`, `usePlanePhysics.ts`, `mic.ts`, `useWindMic.ts`, `Leaderboard.tsx`, `lib/leaderboard.ts`, `lib/supabaseClient.ts`, `page.tsx`, `projects.ts`, DB
