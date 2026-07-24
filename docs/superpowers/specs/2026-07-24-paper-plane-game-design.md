# 종이비행기 날리기 게임 — 설계 문서

**작성일**: 2026-07-24
**위치**: `/playground/paper-plane`

## 개요

작은 고양이가 탄 종이비행기를 드래그(새총 방식)로 조준·발사하고, **마이크에 입김을 불어** 비행 중인 비행기를 더 멀리 보내는 최대거리 챌린지 게임. 전역 리더보드로 다른 사용자와 거리 경쟁. 귀여운 파스텔 톤 UI/UX. 외부 이미지·에셋 없이 모두 SVG/코드로 구현.

## 목표 및 성공 기준

- 드래그로 조준→발사, 비행 중 마이크 입김으로 추진력 추가, 착지 시 거리 확정
- 전역 리더보드 등록/조회 동작
- 데스크톱·모바일 브라우저 모두 플레이 가능
- 사이트 기존 디자인 톤과 일관성 유지
- 처음 방문자도 온보딩 없이 무엇을 해야 하는지 알 수 있음

## 범위 밖 (YAGNI)

- 키보드/탭 폴백 입력 (마이크 전용)
- 서버측 거리 검증(Edge Function) — 개인 놀이터 수준에선 DB 제약으로 충분
- 장애물, 아이템, 스테이지 등 확장 요소
- 로그인/계정 (닉네임만 입력)

## 아키텍처

새 페이지 `src/app/playground/paper-plane/page.tsx`. 게임은 클라이언트 컴포넌트로 구성.

### 컴포넌트/모듈 경계

| 단위 | 책임 | 의존 |
|---|---|---|
| `PaperPlaneGame` | 게임 상태 머신(intro→aim→flying→landed) 총괄, 하위 조합 | 하위 전부 |
| `useWindMic` | 마이크 볼륨(RMS) → 바람 세기. 권한/지원 상태 노출 | Web Audio API |
| `usePlanePhysics` | 2D 물리 시뮬(위치·속도·중력·저항·양력·바람). rAF 루프 | — |
| `PlaneCharacter` | 종이비행기 + 탑승 고양이 SVG, 바람 반응 애니메이션 | — |
| `Leaderboard` | 상위 기록 조회/표시, 닉네임 등록 폼 | `supabaseClient` |
| `HelpOverlay` | 온보딩/도움말 안내 | — |
| `MicPermissionGate` | 마이크 거부/미지원 시 안내·재시도 | `useWindMic` |
| `lib/supabaseClient.ts` | Supabase 클라이언트(싱글턴) | `@supabase/supabase-js` |

각 단위는 props/반환값 인터페이스로만 소통하고 독립적으로 이해·테스트 가능하도록 설계.

## 게임 흐름 (상태 머신)

1. **intro**: 시작 화면. 게임 설명 + "시작" 버튼. 첫 방문 시 튜토리얼 오버레이 표시(로컬스토리지로 재방문 판별). 시작 시 마이크 권한 요청.
2. **aim**: 비행기를 뒤로 드래그 → 당긴 방향/거리로 발사각·초속 결정(새총). 조준 가이드(궤적 힌트) 표시. 놓으면 발사.
3. **flying**: 물리 시뮬 시작. 화면은 비행기를 따라 스크롤, 거리 카운터 증가. **마이크 입김이 전진 추진력 추가**(입김 파티클 + 힌트 "🌬️ 훅~ 불어보세요"). 
4. **landed**: 속도 0/지면 접촉 시 최종 거리 확정. 베스트 기록이면 닉네임 입력 → 리더보드 등록. 리더보드 표시 + "다시하기".

## 물리 & 마이크

### 물리 모델 (2D, delta-time 기반 rAF 루프)

- 상태: 위치(x,y), 속도(vx,vy)
- 힘: 중력(하향), 공기저항(속도 비례 감쇠), 양력(수평속도 있을 때 약한 상향), 바람(마이크 → 전진 x방향 추진)
- 지면(y ≤ 0) 접촉 또는 속도 임계 이하 → landed
- 거리 = 착지 x 좌표(m 단위 환산)

### 마이크 바람

- `navigator.mediaDevices.getUserMedia({audio:true})` → `AudioContext` → `AnalyserNode`
- 프레임마다 시간영역 데이터로 RMS 볼륨 계산. 임계값 초과 시 "부는 중" 판정, 볼륨 비례로 추진력 산출
- 바람은 **flying 상태에서만** 유효
- 치트 완화: 지속 입김 시 힘 점감(폐활량 개념), distance 상한
- 시각화: 입김 파티클, 고양이 표정/귀 흔들림

### 마이크 게이트

- 권한 거부/미지원 → `MicPermissionGate`가 "마이크를 허용해주세요" 안내 + 재시도 버튼. 키보드 폴백 없음.

## 리더보드 DB (Supabase)

프로젝트: `joowonkoh-site` (ref `gshkmannztzwwkyyltvw`, ap-northeast-2)

### 테이블 `leaderboard`

| 컬럼 | 타입 | 제약 |
|---|---|---|
| `id` | uuid | PK, default gen_random_uuid() |
| `nickname` | text | not null, length 1~12 (check) |
| `distance` | int | not null, check 0 ≤ distance ≤ 100000 |
| `created_at` | timestamptz | default now() |

### RLS 정책

- RLS 활성화
- SELECT: anon 전체 허용 (리더보드 공개 조회)
- INSERT: anon 허용 (닉네임 길이·distance 범위는 컬럼 check 제약으로 검증)
- UPDATE / DELETE: 정책 없음 → 차단

### 클라이언트

- `@supabase/supabase-js` + publishable key(공개 안전). URL/key는 `NEXT_PUBLIC_` 환경변수
- 조회: `distance` 내림차순 상위 10개
- 이번 판이 랭크인이면 해당 행 강조

## 비주얼 톤

- 파스텔 하늘 그라데이션 배경 + 흘러가는 구름 SVG
- 종이비행기: 흰 SVG(접힌 선) + 탑승 고양이(둥근 얼굴, 귀, 볼터치). 바람 시 반응 모션
- 기존 디자인 토큰 재사용: `bg-accent-soft`, `spring-transition`, `shadow-ambient`, `rounded-2xl` 등
- 입김 파티클, 거리 카운터 카운트업, 착지 시 통통 튀는 모션

## 온보딩/도움말

- intro 화면 설명 문구 + 첫 방문 튜토리얼 오버레이(로컬스토리지 `pp_seen_tutorial`)
- aim: "비행기를 뒤로 당겼다 놓아 발사하세요"
- flying: "🌬️ 마이크에 훅~ 불어 비행기를 더 멀리 보내보세요!"
- 상단 `?` 버튼으로 도움말 재열람

## 에러 처리

- 마이크 실패 → 게이트 안내
- Supabase 조회 실패 → 리더보드 자리에 "기록을 불러오지 못했습니다" + 재시도
- 등록 실패 → 토스트/인라인 에러, 로컬 베스트는 유지

## 테스트 전략

- 물리(`usePlanePhysics`)·마이크 볼륨 계산 등 순수 로직은 유닛 테스트
- 상태 머신 전이 테스트
- Supabase 조회/등록은 클라이언트 래퍼 모킹
- UI/애니메이션은 수동 확인

## 플레이그라운드 연동

- `src/lib/projects.ts`에 게임 카드 추가 (title, description, tags, href `/playground/paper-plane`)
- 현재 카드가 외부 링크(`target=_blank`) 전제 → 내부 링크도 처리되도록 목록 렌더링 확인/보완
