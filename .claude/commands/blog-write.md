---
name: blog-write
description: 블로그 글 작성 오케스트라. 키워드 기반 또는 Obsidian 작업 노트 기반으로 SEO 최적화된 블로그 글을 작성합니다. /blog-write [키워드] 또는 /blog-write obsidian
user_invocable: true
---

# Blog Writing Orchestra

블로그 글 작성 파이프라인. 5단계 에이전트가 순차적으로 작업합니다.

## 입력 모드

사용자 입력을 분석하여 모드를 결정합니다:

- **키워드 모드**: `/blog-write 이란 휴전과 한국 증시` → 키워드 기반 새 글 작성
- **Obsidian 모드**: `/blog-write obsidian` → Blog Seeds 폴더의 노트를 읽고 글 작성
- **Obsidian 특정 노트**: `/blog-write obsidian JIGUMIA` → 특정 프로젝트 노트 기반 글 작성

## Obsidian 경로

- Blog Seeds: `/Users/kohjoowon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Joowon/Blog Seeds/`
- 전체 볼트: `/Users/kohjoowon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Joowon/`

## 파이프라인

아래 5단계를 순차적으로 실행합니다. 각 단계는 Agent tool로 서브에이전트를 생성합니다.

### Stage 1: Keyword Analyst (키워드 분석가)

**역할**: SEO 키워드 리서치 및 글 방향 설정

**키워드 모드 시**:
- WebSearch로 해당 키워드의 최신 트렌드, 검색량, 경쟁 키워드 조사
- 메인 키워드 1개 + 서브 키워드 3~5개 + 롱테일 키워드 2~3개 선정
- 타겟 독자, 글의 톤, 제목 후보 3개 제안

**Obsidian 모드 시**:
- Blog Seeds 폴더의 노트를 읽고 블로그 글감 후보 선별
- 각 글감에서 추출 가능한 키워드 분석
- 가장 블로그 가치가 높은 주제 추천 (사용자에게 선택 요청)

**출력**: `keyword-brief.md` (키워드 목록, 타겟 독자, 제목 후보, 글 구조 제안)

사용자에게 키워드 브리프를 보여주고 승인을 받은 후 다음 단계로 진행합니다.

### Stage 2: Style Analyst (스타일 분석가)

**역할**: 사용자의 기존 블로그 글을 읽고 문체, 톤, 구조 패턴을 파악

작업 내용:
- `content/blog/` 폴더의 모든 MDX 파일을 스캔
- Stage 1에서 선정한 키워드/주제와 **관련성이 높은 글 3~5개**를 식별 (태그, 제목, 본문 매칭)
- 관련 글의 본문 전체를 읽고 아래를 분석:
  - **문체**: 다체(~한다)/합니다체, 문장 길이, 단락 구성
  - **톤**: 1인칭 경험담 비중, 유머/진지함 비율, 기술 용어 사용 수준
  - **구조 패턴**: 인트로 방식(질문/상황 제시/정의), 소제목 패턴(H2/H3 사용), 마무리 방식
  - **특징적 표현**: 자주 쓰는 전환어, 클리셰, 반복되는 어휘
  - **시각 컴포넌트 사용 패턴**: `<Card />` 류 MDX 컴포넌트가 어디에 배치되는지
- 관련 글 간의 **내부 링크 기회** 식별 (이번 글에서 참조할 이전 글 목록)
- 겹치지 않는 차별화 포인트 도출

**중요**: 이 단계는 "예전 글 요약"이 아니라 "예전 글과 일관된 목소리로 쓰기 위한 스타일 가이드 추출"입니다.

**출력**: `style-guide.md`
```markdown
## 관련 기존 글
- [슬러그] 제목 — 관련성 이유

## 문체 가이드
- 어미: (예: ~한다 체)
- 문장 길이: (예: 짧고 직설적, 평균 30자 이내)
- 1인칭 사용: (예: 자주, "나는"으로 시작)

## 톤 가이드
- 경험담 비중: ...
- 기술 용어 수준: ...
- 금지 표현: (AI 클리셰, 사용자가 안 쓰는 표현)

## 구조 패턴
- 인트로: ...
- 소제목: ...
- 마무리: ...

## 자주 쓰는 표현
- ...

## 시각 컴포넌트
- 어떤 위치에 어떤 종류의 카드 컴포넌트를 쓰는지

## 내부 링크 제안
- [/blog/slug-a](이유)
- [/blog/slug-b](이유)

## 차별화 포인트
- 기존 글과 어떻게 다른 앵글로 써야 하는지
```

### Stage 3: Researcher (자료조사원)

**역할**: 주제에 대한 심층 자료 수집

- WebSearch로 최신 뉴스, 통계, 전문가 의견 수집
- Obsidian 볼트에서 관련 노트 검색 (프로젝트 노트, 개발 로그 등)
- Stage 2의 `style-guide.md`를 읽고 중복 방지할 내용 파악
- 출처(URL)를 반드시 기록

**출력**: `research-notes.md` (수집한 자료, 핵심 팩트, 통계, 출처 목록)

### Stage 4: Fact Checker (팩트체커)

**역할**: 수집된 자료의 정확성 검증

- 핵심 수치/통계가 정확한지 WebSearch로 교차 검증
- 날짜, 이름, 고유명사 오류 확인
- 출처 URL이 실제로 존재하는지 확인
- 오래된 정보나 편향된 출처 표시

**출력**: `fact-check-report.md` (검증 결과, 수정 필요 사항, 신뢰도 등급)

### Stage 5: Writer (작성자)

**역할**: 블로그 글 작성 + 이미지 요청서 생성

**중요**: 글 작성 전 반드시 Stage 2의 `style-guide.md`를 읽고 그 가이드를 따릅니다. 문체, 톤, 구조, 자주 쓰는 표현을 모두 기존 블로그 글과 일치시킵니다.

**글 작성 규칙**:
- 1,000~1,500자 이상 (애드센스 기준 충족)
- **문체/톤은 `style-guide.md`를 따른다** (기존 블로그 글의 문체를 절대 기준으로 삼을 것)
- 키워드를 제목, 소제목, 본문 첫 문단에 자연스럽게 배치
- `word-break: keep-all` 고려한 문장 길이
- AI 클리셰 금지: "혁신적인", "획기적인", "차세대" 등 사용하지 않음 (추가 금지 표현은 `style-guide.md` 참조)
- `style-guide.md`의 "내부 링크 제안"에 있는 글들을 본문에서 자연스럽게 링크
- `research-notes.md`의 팩트와 `style-guide.md`의 차별화 포인트를 결합
- MDX 형식으로 작성 (frontmatter 포함)
- 기존 글에서 쓰는 시각 컴포넌트 패턴(`<XxxCard />`)을 동일하게 활용

**Obsidian 작업 경험 활용 (필수)**:
글 작성 전 반드시 Obsidian 볼트에서 관련 작업 경험을 탐색합니다:
- `Blog Seeds/` — 세션 요약 노트
- `JIGUMIA/` — JIGUMIA 프로젝트 개발 로그, 기획서, 기술 스택
- `Joshua Web/` — Joshua Web 프로젝트 개발 로그, 아키텍처
- 볼트 전체 경로: `/Users/kohjoowon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Joowon/`

작업 경험이 관련된 글이라면:
- 실제 개발 과정에서 겪은 문제와 해결 과정을 구체적으로 서술
- "저는 실제로 ~를 개발하면서..." 같은 1인칭 경험담 포함
- 코드 예시는 실제 프로젝트에서 사용한 코드를 기반으로 작성
- 단순 정보 나열이 아닌, 개인 경험 + 인사이트 중심으로 차별화

**이미지 요청서 생성**:
글에 이미지가 필요한 위치마다 아래 형식의 요청서를 작성합니다:

```markdown
## 이미지 요청서

### 이미지 1: [위치 - 예: 히어로 이미지]
- **설명**: 글의 주제를 시각적으로 표현하는 이미지
- **스타일**: [일러스트/사진/다이어그램/인포그래픽]
- **분위기**: [밝고 깔끔한/전문적인/따뜻한 등]
- **추천 AI 프롬프트**: "A clean minimalist illustration of..."
- **사이즈**: 1200x630 (OG 이미지) / 800x450 (본문)
- **파일명**: [slug]-hero.png

### 이미지 2: [위치]
...
```

**출력**:
- `content/blog/[slug].mdx` (블로그 글)
- `Blog Seeds/image-requests/[slug]-images.md` (이미지 요청서, Obsidian에 저장)

### Stage 6: Editor (편집자)

**역할**: 최종 검수 및 품질 보증

- **가독성**: 문장이 자연스러운지, 문단 길이가 적절한지
- **SEO**: 키워드 밀도, 메타 설명, 제목 태그 구조
- **팩트**: Stage 4 팩트체크 결과가 반영되었는지
- **글자수**: 1,000자 이상인지 확인
- **기술 정확성**: 코드 예시, 기술 용어가 정확한지
- **스타일 일관성**: Stage 2의 `style-guide.md`와 대조하여 문체, 톤, 구조가 일치하는지 확인. 어긋나는 부분은 수정.

**출력**: 수정된 최종 MDX 파일 + 편집 리포트

## 실행 흐름

1. 사용자 입력 분석 → 모드 결정
2. **Stage 1** 실행 → 키워드 브리프 → **사용자 승인 대기**
3. **Stage 2** 실행 → 기존 블로그 글 분석 → 스타일 가이드 추출
4. **Stage 3** 실행 → 자료 수집
5. **Stage 4** 실행 → 팩트 체크
6. **Stage 5** 실행 → 글 작성 (스타일 가이드 준수) + 이미지 요청서
7. **Stage 6** 실행 → 최종 검수
8. 최종 결과물 출력:
   - MDX 파일 경로
   - 이미지 요청서 경로
   - 글자수, SEO 점수 요약

## 중간 산출물 저장 경로

모든 중간 산출물은 Obsidian Blog Seeds에 저장합니다:
`/Users/kohjoowon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Joowon/Blog Seeds/drafts/[slug]/`
- `keyword-brief.md`
- `style-guide.md`
- `research-notes.md`
- `fact-check-report.md`
- `editor-report.md`

이미지 요청서:
`/Users/kohjoowon/Library/Mobile Documents/iCloud~md~obsidian/Documents/Joowon/Blog Seeds/image-requests/[slug]-images.md`

## 주의사항

- 각 Stage 에이전트는 이전 Stage의 출력을 읽고 작업합니다
- Stage 1 후 반드시 사용자 승인을 받습니다 (방향이 틀리면 시간 낭비)
- 이미지는 직접 생성하지 않고, 요청서만 작성합니다
- 기존 블로그 글(`content/blog/`)의 톤과 스타일을 참고합니다
