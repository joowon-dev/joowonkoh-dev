# 통합 어드민 대시보드 설계

작성일: 2026-08-03
상태: 승인 대기

## 목적

Instagram, GA4, AdMob에 흩어진 지표를 한 화면에서 본다. 매일 세 서비스에
따로 로그인해 숫자를 확인하는 일을 없애는 것이 목표다.

## 범위

**하는 것** — 읽기 전용 대시보드. 어제 요약과 30일 추이.

**하지 않는 것** — 게시물 발행, 광고 설정 변경, 블로그 글 편집. 어드민에서
외부 서비스로 나가는 쓰기 경로는 만들지 않는다. 쓰기 권한이 없으면 자격증명이
유출돼도 피해가 조회로 한정된다.

## 사전 조건

사이트가 사용하는 Supabase 프로젝트 `joowonkoh-site`(`gshkmannztzwwkyyltvw`)가
현재 `INACTIVE` 상태다. 무료 플랜의 미사용 자동 정지로 보이며, 현재 플레이그라운드
리더보드도 동작하지 않는 상태로 추정된다. 어떤 구현보다 먼저 이 프로젝트를
복구할지, 활성 상태인 `joowon-dev`(`tqclbafyqzipxhtzrbyl`)로 통합할지 정해야 한다.

## 보안 모델

공개 사이트(`/*`)는 지금처럼 anon key로 동작한다. 어드민(`/admin/*`)에만
아래 방어층을 적용한다.

### 1층 — Proxy (낙관적 체크)

Next.js 16에서 `middleware.ts`는 `proxy.ts`로 이름이 바뀌었고, 공식 문서는
Proxy를 완전한 인증 솔루션으로 쓰지 말라고 명시한다. 따라서 Proxy는 세션 쿠키
유무만 보고 없으면 `/admin/login`으로 보내는 역할만 한다. 여기서 권한 판정을
하지 않는다.

Server Function은 별도 라우트가 아니라 자신이 선언된 라우트로의 POST로 처리되므로,
matcher 변경이나 리팩터링으로 Proxy 적용 범위가 조용히 사라질 수 있다. 이것이
2층이 필요한 이유다.

### 2층 — Data Access Layer (실제 권한 판정)

`/admin` 레이아웃과 모든 데이터 조회 함수가 `supabase.auth.getUser()`로 서버에서
사용자를 검증하고, 그 이메일이 `admin_users`에 있는지 확인한다. `getSession()`은
쿠키를 그대로 신뢰하므로 쓰지 않는다.

로그인 성공과 접근 허용은 다르다. Google OAuth는 누구나 로그인에 성공할 수 있으므로,
허용목록 조회가 실질적인 관문이다.

### 3층 — RLS (최종 방어선)

지표 테이블의 `SELECT` 정책을 아래로 잠근다.

```sql
auth.jwt() ->> 'email' in (select email from admin_users)
```

앱 코드에 버그가 있거나 Proxy를 우회해 anon key로 REST 엔드포인트를 직접
호출해도 빈 결과만 돌아온다. 애플리케이션 계층의 실수가 데이터 유출로 이어지지
않게 하는 층이다.

### 4층 — 비밀키 격리

| 비밀키 | 보관 위치 |
| --- | --- |
| GA4 서비스 계정 JSON | Supabase Edge Function secrets |
| AdMob OAuth 리프레시 토큰 | Supabase Edge Function secrets |
| Instagram 장기 액세스 토큰 | Supabase Edge Function secrets |
| Supabase service_role 키 | Supabase Edge Function secrets |

Next 앱, Cloudflare Pages 환경변수, 브라우저 어디에도 두지 않는다. 외부 API를
호출하는 코드가 Edge Function 안에만 존재하므로 자격증명이 앱 배포물에 섞일
경로 자체가 없다.

### 부수 조치

- `/admin` 전체에 `robots: { index: false, follow: false }`, `next-sitemap` 제외
- 로그인 시도와 허용목록 거부를 `admin_audit_log`에 적재

## 데이터 파이프라인

```
pg_cron (매일 02:00 KST, 소스별 1회)
   └─> Edge Function: collect-metrics?source=ga4|admob|instagram
          ├─ secrets에서 자격증명 로드 → 외부 API 호출
          ├─ 응답을 공통 스키마로 정규화
          ├─ upsert into metrics_daily
          └─ upsert into collection_runs (성공/실패, 에러 메시지)
```

어드민 화면은 외부 API를 직접 호출하지 않는다. `metrics_daily`만 읽는다.
이 분리로 세 가지를 얻는다. 자격증명이 앱에 들어오지 않고, 과거 추이가 자동으로
쌓이며, 외부 API 장애나 쿼터 소진 시에도 화면이 마지막 수집분을 그대로 보여준다.

## 데이터 모델

### `metrics_daily`

```
source      text     -- 'ga4' | 'admob' | 'instagram'
metric_date date     -- 지표가 가리키는 날짜 (수집 시각이 아니다)
entity      text     -- GA4 property id, AdMob app id, IG 계정 등
metric_key  text     -- 'active_users' | 'estimated_earnings' | 'followers' ...
value       numeric
PRIMARY KEY (source, metric_date, entity, metric_key)
```

소스가 무엇이든 "날짜 × 대상 × 지표명 × 값" 한 모양으로 눕힌다. 나중에 Threads나
App Store Connect를 붙여도 스키마 변경이 필요 없다. 복합 PK에 upsert하므로 같은
날짜를 재수집해도 중복이 쌓이지 않는다.

`value`가 `numeric` 단일 컬럼이라 통화 단위는 표현되지 않는다. AdMob 수익은
마이크로 단위 정수로 오므로 Edge Function에서 통화 기본 단위로 변환해 저장하고,
통화 코드는 1단계 범위에서 USD 고정으로 둔다.

### `admin_users`

```
email      text primary key
created_at timestamptz default now()
```

### `collection_runs`

```
source       text primary key
last_run_at  timestamptz
last_success timestamptz
status       text        -- 'ok' | 'error'
error        text
```

화면 상단에 "AdMob 데이터는 2일 전 기준입니다" 경고를 띄우기 위한 테이블이다.
낡은 숫자를 아무 표시 없이 보여주는 것이 이 종류 대시보드의 가장 큰 함정이므로
1단계에 포함한다.

## 수집 지표 (1단계)

| 소스 | 지표 | 단위 |
| --- | --- | --- |
| GA4 | 활성 사용자, 세션, 신규 사용자 | 명 / 회 |
| AdMob | 예상 수익, 노출수, eCPM | USD / 회 / USD |
| Instagram | 팔로워 수, 도달, 프로필 조회 | 명 / 회 |

Instagram은 계정 단위 지표만 담는다. 게시물별 성과는 이후 단계로 미룬다.

## 화면

`/admin` 한 페이지.

- 상단: 어제 기준 핵심 숫자 카드 (방문자, 수익, 팔로워) — 각각 전일 대비 증감
- 하단: 소스별 30일 추이 차트
- 최상단: 수집이 밀린 소스가 있으면 경고 배너

차트는 의존성을 추가하지 않고 SVG로 직접 그린다. 지표가 일별 시계열 하나뿐이라
차트 라이브러리를 들일 이유가 없다.

## 구현 단계

각 단계는 독립적으로 배포 가능하고, 한 소스가 막혀도 나머지는 동작한다.

1. **기반** — Supabase 프로젝트 복구, 테이블 3종 + RLS, Google OAuth 설정,
   `proxy.ts`, `/admin/login`, DAL, 빈 대시보드 골격
2. **GA4** — 서비스 계정 발급, `collect-metrics?source=ga4`, cron, 카드/차트 연결
3. **AdMob** — OAuth 리프레시 토큰 발급, 수집 함수, 화면 연결
4. **Instagram** — Facebook 앱 + 장기 토큰 및 갱신 로직, 수집 함수, 화면 연결

## 테스트

- 허용목록 판정 로직 — 등록/미등록 이메일, 대소문자, 세션 없음 (vitest)
- 각 소스 응답 → `metrics_daily` 행 정규화 (고정 샘플 응답 기준, vitest)
- 수집 지연 판정 — `collection_runs` 기준 경고 배너 노출 여부 (vitest)
- RLS — anon key로 `metrics_daily` 조회 시 빈 결과 (수동 검증, 1단계 완료 시)

## 미결 사항

- Supabase 프로젝트를 복구할지 통합할지
- GA4 property id 목록, AdMob app id 목록, Instagram 비즈니스 계정 확정
- AdMob 이외 통화가 생길 경우의 표기 방식
