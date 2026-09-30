# 어드민 v2 진행 기록

설계: [2026-10-01-admin-v2-design.md](./2026-10-01-admin-v2-design.md)
브랜치: `feat/admin-v2`

**이어받는 세션에게** — 아래 체크리스트에서 첫 번째 미완료 항목부터 한다. 운영 DB·Edge Function 은
Supabase MCP(프로젝트 `gshkmannztzwwkyyltvw`)로 직접 적용한다. 비밀값은 Vault 에만 있다
(`collect_metrics_secret()` 허용 이름 목록 참고). 머지·배포는 주원이 "반영까지" 를 허락했다(2026-10-01).

## 체크리스트

- [x] 1a. `metrics_breakdown` 테이블 + RLS + `admin_breakdown` RPC 마이그레이션, 운영 적용
- [x] 1b. GA4 세부 수집(정규화 + 테스트) + 합계 지표 3개 추가
- [x] 1c. AdMob 세부 수집(정규화 + 테스트)
- [x] 1d. Edge Function 배포, 30일 소급, 행 수 확인
- [ ] 3a. 어드민 셸 분리(Header/Footer 숨김, 전체 화면 레이아웃, 탭바/사이드바)
- [ ] 3b. 홈 · 웹 · 앱 · 인스타 · 데이터 화면
- [ ] 3c. 테스트·tsc·lint·`pages:build`, PR, 머지, 운영에서 모바일/PC 확인
- [ ] 2. Instagram — 아래 "사람 손" 참고

## 사람 손이 필요한 것 (Instagram)

(작업하면서 채운다)

## 기록

- 2026-10-01 새벽: 1a~1d 완료. Edge Function v5. 30일 소급 — GA4 합계 180행 + 세부 7,495행
  (페이지 100 · 소스/매체 42 · 국가 32 · 채널 6 · 기기 3), AdMob 합계 120행 + 세부 3,155행
  (앱 4 · 광고단위 9 · 포맷 4 · 국가 64). cron 은 그대로(같은 함수가 세부까지 받는다).
- Edge Function 타입 검사: 로컬에 deno 가 없어 `tsc` + Deno 심(shim)으로 한다 —
  `declare const Deno`, `paths: {"npm:@supabase/supabase-js@2": ["node_modules/@supabase/supabase-js"]}`,
  `allowImportingTsExtensions`. 배포는 Supabase MCP `deploy_edge_function` 에 파일 5개
  (index, ga4, admob, google, breakdown)를 통째로 넘긴다.
