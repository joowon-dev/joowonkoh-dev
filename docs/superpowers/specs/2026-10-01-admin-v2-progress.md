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
- [x] 3a. 어드민 셸 분리(Header/Footer 숨김, 전체 화면 레이아웃, 탭바/사이드바)
- [x] 3b. 홈 · 웹 · 앱 · 인스타 · 데이터 화면
- [x] 3c. 테스트·tsc·lint·`pages:build`, PR, 머지, 운영에서 모바일/PC 확인
- [ ] 2. Instagram — 아래 "사람 손" 참고

## 사람 손이 필요한 것 (Instagram) — 여기서 멈춰 있다

2026-10-01 확인한 상태:
- Meta 개발자 계정 있음. 앱은 `관리자 앱`(ID 1334063802206803, Threads API 전용, 개발 모드) 하나.
  이 앱에는 "이용 사례 추가" 가 열리지 않는다(Threads 전용 앱으로 보임) → **새 앱을 만들어야 한다.**
- @baribari.dev 의 계정 유형(프로페셔널 여부)은 확인 못 했다.

주원이 할 일 (순서대로):
1. 인스타 앱 › 설정 › 계정 유형 및 도구 › **프로페셔널 계정으로 전환**(크리에이터). 이미 프로페셔널이면 건너뜀.
2. developers.facebook.com › 앱 만들기 › 이용 사례 **"Instagram API로 메시지 및 콘텐츠 관리"**
   (= Instagram 로그인 방식, 페이스북 페이지 불필요). 앱 이름 예: `joowonkoh admin metrics`.
3. 앱 › Instagram › API 설정 › **"액세스 토큰 생성" › 계정 추가** 로 @baribari.dev 로그인·동의.
   권한: `instagram_business_basic`, `instagram_business_manage_insights`.

그다음 세션이 할 일:
- 받은 장기 토큰(60일)과 IG user id 를 Vault 에 `instagram_access_token`, `instagram_user_id` 로 넣고
  `collect_metrics_secret()` 허용 이름에 추가(마이그레이션).
- `supabase/functions/collect-metrics/instagram.ts` — `GET graph.instagram.com/v23.0/{id}?fields=followers_count,media_count`,
  `/{id}/insights?metric=reach,views,profile_views&period=day`, `/{id}/media` → 각 미디어 `/insights?metric=views,reach,likes,comments,saved,shares`.
  metrics_daily: followers(스냅숏)·reach·views·profile_views. metrics_breakdown: dimension `post`, dim_label = 캡션 앞 40자,
  metric_date = **수집한 날**(누적 스냅숏). 화면(`/admin/instagram`)은 이미 이 모양을 기다리고 있다.
- **토큰 갱신**: `GET graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token` 을 수집 때마다(또는 주 1회) 불러
  Vault 값을 `vault.update_secret` 으로 바꾼다. 안 하면 60일 뒤 조용히 멈춘다(배너가 잡긴 한다).
- cron `collect-metrics-instagram` 02:10 KST.

## 기록

- 2026-10-01 새벽: 1a~1d 완료. Edge Function v5. 30일 소급 — GA4 합계 180행 + 세부 7,495행
  (페이지 100 · 소스/매체 42 · 국가 32 · 채널 6 · 기기 3), AdMob 합계 120행 + 세부 3,155행
  (앱 4 · 광고단위 9 · 포맷 4 · 국가 64). cron 은 그대로(같은 함수가 세부까지 받는다).
- Edge Function 타입 검사: 로컬에 deno 가 없어 `tsc` + Deno 심(shim)으로 한다 —
  `declare const Deno`, `paths: {"npm:@supabase/supabase-js@2": ["node_modules/@supabase/supabase-js"]}`,
  `allowImportingTsExtensions`. 배포는 Supabase MCP `deploy_edge_function` 에 파일 5개
  (index, ga4, admob, google, breakdown)를 통째로 넘긴다.
- 3a·3b 완료. 로컬에서는 구글 로그인을 대신할 수 없어서, DB 에서 뽑은 실제 데이터로 임시 미리보기
  라우트를 만들어 PC·모바일(390px iframe)을 확인하고 지웠다. 표의 sticky 첫 열은
  `border-collapse` 에서 테두리가 사라져 `border-separate border-spacing-0` + 칸마다 border 로 바꿨다.
- 루트 레이아웃의 Header/Footer 는 `HideOnAdmin` 으로 감싸 /admin 에서 뺐다. GA·AdSense 스크립트는
  루트에 남아 있어 어드민 방문도 GA 에 잡힌다(내 방문 몇 건 — 필요하면 GA 에서 내부 트래픽 필터).
- 3c 완료: PR #73 머지, 운영에서 오늘·웹·앱 화면 확인. 사이트(블로그) 헤더·푸터 정상.
- 비교가 되게 GA4·AdMob 을 90일(7/3~9/30) 소급. 페이지 조회수 세부 합 = 일별 합계(90일 전부 일치) → 잘림 없음.
  채널별 세션 합은 23일에서 합계와 최대 62 차이 — GA4 가 차원별로 세션을 세는 방식 때문이고 GA 화면도 같다.
