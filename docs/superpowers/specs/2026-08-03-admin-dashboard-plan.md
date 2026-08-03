# 어드민 대시보드 구현 계획

설계: [2026-08-03-admin-dashboard-design.md](./2026-08-03-admin-dashboard-design.md)
브랜치: `feat/admin-dashboard`

## 진행 상황

### 완료 — 1단계 코드 (커밋 `f47bc1a`)

| 파일 | 역할 |
| --- | --- |
| `src/proxy.ts` | `/admin/*`에만 걸리는 Proxy. 세션 갱신 + 낙관적 리다이렉트 |
| `src/lib/supabase/{env,client,server,proxy}.ts` | SSR 클라이언트 3종 |
| `src/lib/admin/auth.ts` | `checkAdmin()` — 실제 권한 판정 |
| `src/lib/admin/allowlist.ts` | 허용목록 판정 순수 함수 (테스트 8개) |
| `src/lib/admin/freshness.ts` | 수집 지연 판정 (테스트 7개) |
| `src/lib/admin/series.ts` | 시계열 구성·증감 계산 (테스트 14개) |
| `src/lib/admin/queries.ts` | 대시보드 데이터 조회 |
| `src/app/admin/**` | 로그인·거부·대시보드 라우트 |
| `src/components/admin/**` | StatCard, Sparkline, FreshnessBanner |
| `supabase/migrations/20260803000000_admin_dashboard.sql` | 테이블 4종 + RLS (**미적용**) |

검증: `tsc --noEmit` 통과, `vitest` 563개 통과, `next build` 성공,
`/admin` 4개 라우트 모두 동적 렌더, robots.txt `Disallow: /admin` 확인.

### 완료 — DB 적용 (2026-08-03)

**A. 프로젝트 복구** — `joowonkoh-site`(`gshkmannztzwwkyyltvw`)가 `ACTIVE_HEALTHY`.
기존 `leaderboard` 테이블도 그대로 살아 있다. `.env.local` 변경 없음.

**B. 마이그레이션 적용** — 테이블 4종 + RLS 정책 6개 생성, 허용목록에
`joowonkoh0505@gmail.com` 등록.

적용 중 문제를 하나 발견해 마이그레이션을 추가했다
(`20260803010000_admin_dashboard_revoke_anon.sql`).

> Supabase는 `public` 스키마의 **기본 권한**으로 `anon`과 `authenticated`
> 양쪽에 ALL을 부여한다. 그래서 새 테이블은 `anon`이 전권을 쥔 상태로 태어나고,
> 설계에 적었던 `grant select ... to authenticated`는 아무 제한도 하지 못했다.
> RLS 정책이 없어 행이 새지는 않았지만 방어가 RLS 한 겹뿐인 상태였다.
> `revoke all ... from anon`으로 테이블 접근 자체를 닫고, 이후 만들어질
> 테이블에도 붙지 않도록 `alter default privileges`까지 걸었다.

검증 결과 — anon key로 REST 직접 호출 시:

| 테이블 | 응답 |
| --- | --- |
| `metrics_daily` | `42501 permission denied` |
| `admin_users` | `42501 permission denied` |
| `collection_runs` | `42501 permission denied` |
| `admin_audit_log` | `42501 permission denied` |
| `leaderboard` | `[]` (공개 기능이라 그대로 동작) |

Supabase 보안 어드바이저 경고는 1건이며 이번 작업과 무관하다.
`leaderboard`의 `leaderboard_insert_all` 정책이 `WITH CHECK (true)`라 아무나
점수를 넣을 수 있다. 공개 랭킹이라 의도된 것일 수 있어 손대지 않았다.

### 막힌 것 — 사람이 해야 하는 일

**C. Google OAuth 설정** ← 지금 여기서 막혀 있다

`/auth/v1/settings` 확인 결과 `google: false`. 대시보드에서만 켤 수 있다.

Supabase 대시보드 → Authentication → Providers → Google 활성화.
Redirect URL에 아래 둘을 등록한다.

```
https://joowonkoh.com/admin/auth/callback
http://localhost:3000/admin/auth/callback
```

**D. 검증 (A~C 이후 즉시)**

- 등록된 계정으로 로그인 → `/admin` 진입
- 다른 구글 계정으로 로그인 → `/admin/denied`
- 로그아웃 상태로 `/admin` 직접 접근 → `/admin/login`
- anon key로 REST 직접 호출 → 빈 결과 (RLS 최종 방어선 확인)

```bash
curl "$SUPABASE_URL/rest/v1/metrics_daily?select=*" \
  -H "apikey: $ANON_KEY" -H "Authorization: Bearer $ANON_KEY"
```

## 2단계 — GA4

1. GCP에서 서비스 계정 생성, JSON 키 발급
2. GA4 속성 설정 → 속성 액세스 관리에서 그 서비스 계정을 뷰어로 추가
3. `supabase secrets set GA4_SERVICE_ACCOUNT_JSON=...`
4. Edge Function `collect-metrics` 작성
   - GA4 Data API `runReport`, 차원 `date`, 지표 `activeUsers` / `sessions` / `newUsers`
   - 응답 → `MetricRow[]` 정규화 함수는 순수 함수로 분리하고 고정 샘플 응답으로 테스트
   - `metrics_daily` upsert, `collection_runs` 갱신
5. `pg_cron`으로 매일 02:00 KST 스케줄
6. 최초 1회는 지난 30일을 소급 수집해 차트를 채운다

**필요한 정보**: GA4 property id 목록

## 3단계 — AdMob

1. GCP에서 OAuth 클라이언트 생성, AdMob API 활성화
2. 리프레시 토큰 1회 발급 (`https://www.googleapis.com/auth/admob.readonly`)
3. `supabase secrets set ADMOB_CLIENT_ID / ADMOB_CLIENT_SECRET / ADMOB_REFRESH_TOKEN`
4. 수집 함수에 `source=admob` 추가
   - `accounts.networkReport.generate`, 지표 `ESTIMATED_EARNINGS` / `IMPRESSIONS` / `MATCH_RATE`
   - 수익은 마이크로 단위 정수로 온다. 1e6으로 나눠 저장한다
5. cron 등록

**필요한 정보**: AdMob publisher id, app id 목록

## 4단계 — Instagram

1. Meta 개발자 앱 생성, Instagram Graph API 권한
2. 인스타 계정을 비즈니스/크리에이터로 전환하고 페이지에 연결
3. 장기 액세스 토큰 발급 (60일)
4. `supabase secrets set IG_ACCESS_TOKEN / IG_USER_ID`
5. 수집 함수에 `source=instagram` 추가
   - `/{ig-user-id}?fields=followers_count`
   - `/{ig-user-id}/insights?metric=reach,profile_views&period=day`
6. **토큰 갱신을 cron에 함께 넣는다.** 60일 만료를 놓치면 조용히 수집이 멈춘다.
   갱신 실패는 `collection_runs`에 error로 남아 배너에 뜬다

**필요한 정보**: 인스타 비즈니스 계정 전환 여부

## 알려진 리스크

**이메일 가입이 열려 있다.** `/auth/v1/settings`가 `email: true`,
`disable_signup: false`를 반환한다. 즉 지금도 누구나 이메일로 계정을 만들 수 있다.
허용목록이 막아 주므로 `/admin/denied`에서 멈추고 지표는 보이지 않지만, 필요 없는
가입 경로다. Google만 쓸 것이면 대시보드에서 이메일 provider를 끄는 편이 낫다.

**배포 경로 — 확인 결과 문제 없음.** `next.config.ts`가 `output: "standalone"`이므로
Node 서버로 배포된다. Next 16의 Proxy는 Node.js 런타임에서 돌므로 그대로 동작한다.

다만 `wrangler.toml`과 `npm run pages:build`는 예전 Cloudflare Pages 시도의
잔재로 보인다. 실제로 돌려 보면 `@cloudflare/next-on-pages`가 설치되지 않고
peer 의존성 충돌(`@cloudflare/workers-types` 4 vs 5)로 실패한다. 이 어드민 작업과
무관한 기존 상태다. 쓰지 않는 경로라면 `wrangler.toml`과 `pages:*` 스크립트를
지우는 편이 낫다. 남겨 두면 다음 사람이 여기가 배포 경로라고 착각한다.

**통화.** `metrics_daily.value`는 단일 `numeric`이라 통화 단위를 담지 못한다.
1단계는 AdMob USD 고정으로 간다. 통화가 둘 이상 생기면 `entity`에 통화를 섞지
말고 컬럼을 추가한다.

**무료 플랜 정지.** Supabase 무료 플랜은 미사용 시 프로젝트를 정지시킨다.
매일 도는 cron이 있으면 활동으로 잡히지만, 이번처럼 정지가 재발하면 수집이
끊긴다. 배너가 이를 드러내 주긴 하나 근본 대책은 아니다.
