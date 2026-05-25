# Google Search Console URL 검사 자동화

`gsc-inspect.mjs` 는 Google Search Console **URL Inspection API** 로 sitemap 의 모든 URL 색인 상태를 한 번에 조회합니다.

## 최초 셋업 (10 분)

### 1. Google Cloud 프로젝트 + API 활성화

1. https://console.cloud.google.com/ 접속 → 프로젝트 생성 (또는 기존 프로젝트 선택)
2. **APIs & Services → Library** 에서 **Google Search Console API** 검색 → 활성화

### 2. 서비스 계정 + JSON 키

1. **APIs & Services → Credentials → Create Credentials → Service account**
2. 이름 아무거나 (예: `gsc-inspector`) → 역할 없이 생성
3. 만들어진 서비스 계정 클릭 → **Keys → Add key → Create new key → JSON** → 다운로드
4. 다운받은 파일을 아래 경로로 이동 (파일명 고정):
   ```
   joowonkoh-dev/scripts/.gsc-key.json
   ```

### 3. Search Console 에서 서비스 계정을 소유자로 추가

1. https://search.google.com/search-console 접속 → `joowonkoh.com` 속성 선택
2. **설정 → 사용자 및 권한 → 사용자 추가**
3. `.gsc-key.json` 안의 `client_email` 값 (예: `gsc-inspector@xxx.iam.gserviceaccount.com`) 을 **소유자** 권한으로 추가
   - ⚠️ URL Inspection API 는 **소유자(Owner)** 권한이 필수. 전체/제한 사용자로는 403 뜸.

### 4. .gitignore 확인

```
scripts/.gsc-key.json
scripts/.gsc-results/
```

## 사용

```bash
# 전체 sitemap URL 검사 (약 40초, URL 26개 기준)
node scripts/gsc-inspect.mjs

# 색인 안 된 URL 만 따로 출력
node scripts/gsc-inspect.mjs --unindexed-only

# 특정 URL 하나만
node scripts/gsc-inspect.mjs --url https://joowonkoh.com/blog/life/2026041204
```

결과는 `scripts/.gsc-results/inspect-<timestamp>.json` 에 저장됩니다.

## 제한

- **하루 2,000 / 분당 600** 쿼리 — 개인 블로그 규모에선 넉넉함
- 이 API 는 **조회 전용**. "색인 요청(Request Indexing)" 버튼은 호출할 수 없습니다.
  - 색인 요청까지 자동화하려면 별도로 **Indexing API** 쓰거나 Puppeteer 로 UI 자동화 (회색지대)
