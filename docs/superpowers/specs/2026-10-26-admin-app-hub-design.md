# 어드민 「앱」 — 앱 등록부 + 실시간 (1단계)

주원 요청(2026-10-26): 내 앱들을 어드민에서 한 번에 보고 싶다. 순위·별점도 쌓고, GA4 「최근 30분
사용자」를 전부 합쳐서, AdMob 수익도 실시간에 가깝게. 지금은 **보기만** 한다(리뷰 답글·스토어 수정 없음).

세 프로젝트로 나눴고 이 문서는 1단계다.

1. **앱 등록부 + 실시간** ← 이 문서
2. 스토어 공개 정보(순위·별점·리뷰) 1시간마다 수집
3. 다운로드·매출(App Store Connect / Play Console 키 필요 — 둘 다 하루 이상 늦게 나온다)

## 앱 (2026-10-26, 각 앱 저장소에서 읽음)

| 앱 | iOS 번들 / Android 패키지 | App Store id | Play | Firebase | AdMob 앱 |
|---|---|---|---|---|---|
| 이게내연봉 | dev.joowon.moneytick | 6795989020 | 있음 | moneytick-e7343 | ~9813704971, ~2022401327 |
| 네밥내밥 | com.joowonkoh.yourmealmymeal | 6812959704 | 있음 | yourmealmymeal-ab448 | ~3040565990, ~4885054143 |
| 지구미아 | com.jigumia.app | 6772139871 | 있음 | jigumia-697f0 | ~3274994627, ~7470525971 |
| 치비아쿠 | com.chibiaku.app | 6815060726 | 있음 | chibiaku | ~6480841886, ~1968997211 |
| 와파냥 | dev.joowon.wapanyang | 6820956430 | 없음(404) | wapanyang | ~2681498993, ~3648853897 |

웹(joowonkoh.com, GA4 434494008)도 같은 등록부에 `kind = 'web'` 으로 넣어 실시간 합계에 포함한다.

## 「실시간」이 어디까지 되나

- **GA4 최근 30분 활성 사용자**: Data API `runRealtimeReport`. 진짜 실시간. **1분마다** 수집.
  속성마다 합계(차원 없음) + 분별(minutesAgo) + 화면(unifiedScreenName) + 국가(country).
  합계는 차원 없는 요청으로 받는다 — 차원별 합을 더하면 한 사람이 두 번 세어진다.
  여러 속성 합계는 단순 합이다(두 앱을 동시에 쓰는 사람은 두 번 — 화면에 적는다).
- **AdMob 오늘 추정 수익**: 실시간 API 없음. Network Report 를 오늘(KST) 범위로 **10분마다**.
  AdMob 이 몇 시간 늦게 채우므로 화면에 "AdMob 은 몇 시간 늦다"고 적는다.

## 저장

- `apps` — 등록부. `ga4_property_id` 는 비워 두고 **자동으로 찾는다**: `ga4_discover` 가
  Admin API `accountSummaries` → 속성마다 `dataStreams` 를 훑어 패키지/번들이 같은 스트림의 속성을 적는다.
  서비스 계정에 그 속성 보기 권한이 있어야 보인다(아래 "사람 손").
- `live_metrics` — (at 분 단위, source, entity, metric_key, value). 합계만, 30일 보관(매일 지운다).
  오늘 분별 추이 그래프가 이걸 본다.
- `live_detail` — 엔티티별 **최신 한 장**(jsonb): 30분 분별 곡선, 상위 화면, 상위 국가, 마지막 오류.
- `collection_runs.source` 에 `ga4_live`, `admob_today`, `ga4_discover` 를 더한다.

수집은 기존 `collect-metrics` Edge Function 에 소스 셋을 더한다(같은 Vault·비밀·기록 방식).
한 속성이 권한 오류여도 나머지는 적고, 실패한 속성은 `live_detail.error` 와 run 오류에 남긴다.

## 화면

새 탭을 만들지 않는다(모바일 탭바가 이미 6칸). 기존 **「앱」(/admin/apps)** 맨 위에 붙인다.

1. 지금 — 「지금 N명」(모든 속성 30분 합) · 「오늘 수익 $x」 · 마지막 수집 몇 초 전. 60초마다 자동 새로고침.
2. 오늘 분별 추이(00:00 KST부터, 합계 선).
3. 앱 카드 — 앱마다 30분 사용자, 오늘 수익·노출, App Store / Play 링크, GA4 연결 여부.
4. 지금 보는 화면 / 국가 상위(모든 속성 합).
5. 그 아래는 지금의 AdMob 기간 분석 그대로.

실시간 수집이 5분(GA4)·30분(AdMob) 넘게 멈추면 배너를 띄운다.

## 사람 손 (주원)

- 서비스 계정(Vault `ga4_service_account_json` 의 `client_email`)을 **앱 GA4 속성 5개**에 「뷰어」로 추가.
  Firebase 콘솔 › 프로젝트 설정 › 통합 › Google Analytics › 속성 열기 › 관리 › 속성 액세스 관리.
  지금은 웹 속성에만 있다. 추가한 뒤 `ga4_discover` 를 한 번 부르면 앱 카드가 채워진다.
- 운영 적용(마이그레이션·함수 배포)과 머지는 주원이 말할 때.

## 하지 않는 것

스토어 순위·리뷰(2단계), 다운로드·매출(3단계), 어드민에서 무언가를 바꾸는 기능.
