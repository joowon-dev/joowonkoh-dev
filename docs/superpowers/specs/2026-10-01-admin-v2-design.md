# 어드민 v2 설계 — 세부 분석과 전용 UI

이전 설계: [2026-08-03-admin-dashboard-design.md](./2026-08-03-admin-dashboard-design.md)
진행 기록: [2026-10-01-admin-v2-progress.md](./2026-10-01-admin-v2-progress.md) ← **이어받는 세션은 여기부터**

## 목적

1단계~3단계로 `/admin` 이 GA4 방문자·AdMob 수익 합계를 보여 주게 됐다. 주원의 요청(2026-10-01):

> 관리자 페이지 UI/UX 개선, 데이터를 세부적으로 하나하나 다 볼 수 있게, 모바일과 웹 둘 다,
> 기존 사이트 UI 는 따라가지 않는다. 분석할 수 있는 건 다.

쓰는 방식: **폰으로 매일 훑기 + 가끔 PC 로 파기.** 모바일 홈은 "어제 어땠나" 한눈에, PC 는 기간·차원별로 깊게.

## 범위와 순서

세 덩어리. 화면이 보여 줄 데이터가 먼저 있어야 하므로 1 → 3, Instagram(2)은 사람 손이 필요해 병행.

1. **데이터 확장** — GA4·AdMob 세부 차원 수집, `metrics_breakdown` 테이블
2. **Instagram** — 계정 추이 + 게시물별 성과. Meta 앱·비즈니스 계정·동의는 주원이 해야 한다
3. **UI 전면 개편** — 사이트 크롬에서 분리한 어드민 전용 셸, 소스별 상세, 기간 선택, 원본 표

## 1. 데이터

### 저장 — `metrics_breakdown` (새 테이블)

```
source      text   'ga4' | 'admob' | 'instagram'
metric_date date   지표가 가리키는 날(KST)
dimension   text   'page' | 'channel' | 'source_medium' | 'country' | 'device' | 'app' | 'ad_unit' | 'format' | 'post' ...
dim_value   text   '/blog/x', 'Organic Search', 'KR', 'ca-app-pub-...' ...
dim_label   text   사람이 읽을 이름(페이지 제목, 광고단위 이름, 앱 이름). 없으면 null
metric_key  text
value       numeric
PK (source, metric_date, dimension, dim_value, metric_key)
```

`metrics_daily` 는 그대로 "소스 합계" 로 둔다(카드·배너·전체 추이). 세부는 전부 `metrics_breakdown`.
검토한 대안: `metrics_daily.entity` 에 `page:/x` 를 섞기(합계 계산이 꼬인다), 원본 JSON 저장(조회가 느리고 화면이 복잡). 기각.

RLS·GRANT 는 `metrics_daily` 와 같다(관리자만 SELECT, anon 없음, 쓰기는 service_role).

**합산 가능한 지표만 저장한다.** 비율(이탈률, eCPM, CTR, 참여율)은 날짜·차원을 합치면 틀리므로
분자·분모를 저장하고 화면에서 계산한다.

### 조회 — 집계 RPC

PostgREST 는 기본 1000행에서 자른다. 페이지 차원 30일이면 넘는다. 그래서 집계는 DB 에서 한다.

- `admin_breakdown(p_source, p_dimension, p_start, p_end)` → `dim_value, dim_label, metric_key, total`
- `security invoker` — 호출자 권한(RLS)으로 돈다. 관리자가 아니면 빈 결과.

### GA4 (속성 434494008)

합계(`metrics_daily`)에 추가: `screen_page_views`, `engaged_sessions`, `user_engagement_duration`(초).

세부(`metrics_breakdown`), 차원별 한 보고서씩:

| dimension | GA4 차원 | label |
| --- | --- | --- |
| page | pagePath | pageTitle |
| channel | sessionDefaultChannelGroup | — |
| source_medium | sessionSourceMedium | — |
| country | countryId | country |
| device | deviceCategory | — |

지표: `screenPageViews, activeUsers, sessions, engagedSessions, userEngagementDuration`.
파생(화면): 참여율 = engaged/sessions, 평균 참여 시간 = duration/activeUsers.
activeUsers 는 날짜를 합치면 중복이 생긴다(같은 사람이 이틀 오면 2) — 화면에 "일별 합" 이라고 적는다.

### AdMob (pub-7807290470382730)

세부 차원: `app(APP)`, `ad_unit(AD_UNIT)`, `format(FORMAT)`, `country(COUNTRY)`.
지표: `ESTIMATED_EARNINGS(USD), IMPRESSIONS, CLICKS, AD_REQUESTS, MATCHED_REQUESTS`.
파생: eCPM = earnings/impressions×1000, CTR = clicks/impressions, 매치율 = matched/requests.

### Instagram (@baribari.dev) — 사람 손 필요

- 합계: `followers`(그날 스냅숏), `reach`, `profile_views`, `views`
- 세부: dimension `post`, dim_value = media id, dim_label = 캡션 앞부분, metric_date = **수집한 날**
  (게시물 지표는 누적값이라 그날의 스냅숏으로 쌓는다. 화면은 최신 스냅숏을 쓴다)
- 선행 조건과 막힌 지점은 진행 기록에.

## 3. UI

### 셸 — 사이트에서 분리

- 루트 레이아웃의 Header/Footer 는 `/admin` 에서 렌더하지 않는다.
- 어드민 레이아웃은 `fixed inset-0` 전체 화면(플레이그라운드 풀스크린 앱과 같은 방식)으로 사이트 `main` 의 폭 제한을 벗어난다.
- 자체 색 토큰(짙은 남회색 바탕, 소스별 색: 웹=하늘, 앱=초록, 인스타=분홍), 숫자는 tabular-nums.
- **모바일**: 하단 탭바(홈 · 웹 · 앱 · 인스타 · 데이터), 상단 고정 기간 선택.
- **PC(≥1024px)**: 왼쪽 사이드바 + 넓은 본문, 카드 4열, 차트 크게, 표 여러 열.

### 화면

| 경로 | 내용 |
| --- | --- |
| `/admin` | 어제 요약 — 방문자·페이지뷰·수익·팔로워 카드(전일/7일 평균 대비), 3개 소스 미니 추이, 수집 상태, 어제 인기 페이지 5·앱 수익 순위 |
| `/admin/web` | 기간 추이(방문자/세션/페이지뷰 토글) + 참여율·평균 참여 시간 + 표: 페이지 · 채널 · 소스/매체 · 국가 · 기기 (탭) |
| `/admin/apps` | 수익·노출·eCPM·CTR 추이 + 표: 앱 · 광고단위 · 포맷 · 국가 |
| `/admin/instagram` | 팔로워·도달 추이 + 게시물 표. 수집 전이면 연결 안내 |
| `/admin/data` | 원본 표 — 소스·날짜별 모든 합계 지표, CSV 내려받기 |

기간: `?range=7|30|90` 또는 `?from=YYYY-MM-DD&to=YYYY-MM-DD`. 기본 30. 끝 날짜는 어제(KST).

### 차트

의존성 없이 SVG. 기존 Sparkline 을 축·격자·호버(탭) 툴팁이 있는 `TrendChart`(클라이언트)로 바꾼다.
구멍(null)은 선을 끊는다(1단계 원칙 유지).

## 에러와 신선도

- 수집 지연 배너는 모든 화면 상단에 그대로(`collection_runs`).
- 세부 수집 실패도 같은 `collection_runs` 행에 남는다(합계와 세부를 한 번에 수집하므로).

## 테스트

- 정규화 함수(GA4 세부, AdMob 세부, IG) — 실제 응답 모양 샘플로 vitest
- 기간 파싱, 파생 지표 계산, 표 정렬 — 순수 함수 vitest
- 배포 전 `npm run pages:build`, 배포 후 운영 `/admin` 을 브라우저로 모바일·PC 폭 둘 다 확인
