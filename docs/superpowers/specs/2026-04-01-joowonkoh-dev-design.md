# joowonkoh.dev — 개인 사이트 디자인 스펙

## 개요

개발자 고주원의 개인 사이트. 포트폴리오 중심 구조에 블로그와 사이드 프로젝트 플레이그라운드를 갖춘 미니멀 다크모드 사이트. Google AdSense를 통한 광고 수익화 포함.

- **도메인**: joowonkoh.dev
- **배포**: Cloudflare Pages + Workers (하이브리드 SSG/SSR)
- **목표**: 개발자 브랜딩 + 블로그 부수입

## 기술 스택

| 카테고리 | 기술 |
|----------|------|
| Framework | Next.js 15 (App Router), React 19, TypeScript |
| Styling | Tailwind CSS v4, Pretendard 폰트, 다크모드 기본 |
| Content | MDX (next-mdx-remote), 코드 하이라이팅 |
| Deploy | Cloudflare Pages (SSG) + Workers (SSR) |
| Monetization | Google AdSense |
| SEO | next-sitemap, Google Analytics |

## 사이트 구조

```
/              → 메인 (히어로 + Featured Projects + Recent Posts)
/blog          → 블로그 목록 (태그 필터)
/blog/[slug]   → 블로그 글 상세 (MDX 렌더링 + AdSense)
/playground    → 사이드 프로젝트 카드 그리드
/about         → 소개 페이지
```

## 페이지별 디자인

### 메인 페이지 ( / )

- **네비게이션**: 좌측 로고 "JK", 우측 Blog / Playground / About 링크
- **히어로 섹션**: 이름 "고주원", 한 줄 소개 "Developer & Creator"
- **Featured Projects**: 2열 그리드, 카드에 프로젝트명 + 설명 + 기술 태그
- **Recent Posts**: 최신 블로그 글 2-3개 리스트 (제목 + 날짜)
- **렌더링**: SSG (정적 생성)

### 블로그 페이지 ( /blog )

- **헤더**: "Blog" 제목 + 부제
- **태그 필터**: All / Dev / Life / Tech 등 pill 버튼
- **포스트 리스트**: 제목 + 날짜 + 요약 + 태그, 리스트 형태
- **렌더링**: SSG (정적 생성)

### 블로그 상세 ( /blog/[slug] )

- **MDX 렌더링**: 마크다운 + React 컴포넌트 지원
- **코드 하이라이팅**: rehype-pretty-code 또는 shiki
- **AdSense 배치**: 글 하단에 광고 영역
- **렌더링**: SSG (정적 생성)

### 플레이그라운드 ( /playground )

- **헤더**: "Playground" 제목 + "사이드 프로젝트 모음"
- **프로젝트 카드**: 2열 그리드, 썸네일 + 제목 + 설명 + 기술 태그
- **카드 클릭 시**: 외부 링크(GitHub/배포 URL)로 이동 또는 상세 페이지
- **렌더링**: SSG 기본, 인터랙티브 데모가 있으면 SSR

### About ( /about )

- **자기소개**: 간단한 프로필
- **기술 스택**: 사용 가능한 기술 나열
- **연락처**: GitHub, 이메일 등 링크
- **렌더링**: SSG (정적 생성)

## 디자인 시스템

### 컬러

| 용도 | 값 |
|------|-----|
| 배경 | #0a0a0a |
| 카드 배경 | #111111 |
| 보더 | #222222 |
| 텍스트 (primary) | #ededed |
| 텍스트 (secondary) | #888888 |
| 텍스트 (muted) | #666666 |
| 태그 배경 | #1a1a1a |

### 타이포그래피

- **폰트**: Pretendard (CDN: cdn.jsdelivr.net)
- **제목**: 700 weight
- **본문**: 400-500 weight
- **라벨**: 600 weight, 11px, uppercase

### 컴포넌트

- **카드**: bg #111, border 1px #222, border-radius 8px, padding 20px
- **태그 pill**: bg #1a1a1a, color #888, font-size 10px, border-radius 4px
- **네비게이션**: 상단 고정, 좌측 로고, 우측 링크

## 프로젝트 구조

```
joowonkoh-dev/
├── app/
│   ├── layout.tsx          # 루트 레이아웃 (Pretendard, 다크모드)
│   ├── page.tsx            # 메인 페이지
│   ├── blog/
│   │   ├── page.tsx        # 블로그 목록
│   │   └── [slug]/
│   │       └── page.tsx    # 블로그 상세
│   ├── playground/
│   │   └── page.tsx        # 플레이그라운드
│   └── about/
│       └── page.tsx        # 소개
├── content/
│   └── blog/               # MDX 블로그 글
│       └── hello-world.mdx
├── components/
│   ├── Header.tsx          # 네비게이션
│   ├── ProjectCard.tsx     # 프로젝트 카드
│   ├── PostList.tsx        # 포스트 리스트
│   ├── TagFilter.tsx       # 태그 필터
│   ├── AdSense.tsx         # 광고 컴포넌트
│   └── MDXComponents.tsx   # MDX 커스텀 컴포넌트
├── lib/
│   ├── mdx.ts              # MDX 파싱 유틸
│   └── projects.ts         # 프로젝트 데이터
├── public/
│   └── images/
├── tailwind.config.ts
├── next.config.ts
└── package.json
```

## 렌더링 전략

- **SSG (기본)**: 메인, 블로그, About — 빌드 시 정적 생성
- **SSR (필요 시)**: 플레이그라운드 내 인터랙티브 데모 — Cloudflare Workers
- **ISR 불가**: Cloudflare Pages는 ISR 미지원, 대신 빌드 후 자동 배포로 대체

## 수익화 전략

1. **초기**: 콘텐츠 작성에 집중, AdSense 승인 요건 충족 (양질의 글 10-20개)
2. **AdSense 승인 후**: 블로그 글 하단에 광고 배치
3. **장기**: 쿠팡 파트너스 등 제휴 마케팅 추가 가능

## SEO

- next-sitemap으로 sitemap.xml 자동 생성
- 각 페이지 메타데이터 (title, description, og:image)
- Google Search Console 등록
- Google Analytics로 트래픽 분석
