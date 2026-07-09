// Portfolio content — sourced from career docs (경력기술서 / 이력서 / 경력기록).
// Pure data, safe to import from both server and client components.

export const PROFILE = {
  name: "고주원",
  nameEn: "Joowon Koh",
  role: "Full-Stack Developer",
  badge: "풀스택 개발자 · 낮에도 밤에도 개발 중",
  tagline: "낮엔 130만 명이 쓰는 서비스를, 밤엔 제 이름을 건 서비스를 만듭니다.",
  intro:
    "회사에서는 130만 명이 쓰는 대국민 서비스를 맡고, 퇴근하면 AI 코딩 에이전트와 함께 실사용자 1만 명이 넘는 웹·앱을 직접 만들어 운영합니다. 만드는 걸 멈춘 날이 거의 없어요.",
  email: "joowonkoh0505@gmail.com",
  github: "https://github.com/joowon-dev",
  blog: "https://joowonkoh.com",
};

export interface Metric {
  value: number;
  suffix: string;
  prefix?: string;
  comma?: boolean;
  label: string;
  sub: string;
  bar: number; // 0–100, drives the mini progress bar
}

export const METRICS: Metric[] = [
  { value: 130, suffix: "만+", bar: 100, label: "대국민 서비스 사용자", sub: "기본형공익직불 신청 — 프로젝트 최대 규모" },
  { value: 11000, suffix: "+", comma: true, bar: 82, label: "개인 서비스 누적 사용자", sub: "워십 서비스 3종 합계" },
  { value: 4000, suffix: "", comma: true, bar: 74, label: "피크 동시접속 분산 처리", sub: "무료 인프라만으로 무중단 운영" },
  { value: 3290, suffix: "", comma: true, bar: 92, label: "연간 GitHub 커밋", sub: "@joowon-dev" },
  { value: 98, suffix: "%", bar: 98, label: "쿼리 변환기 정확도", sub: "내부망 공통 유틸 — 투입 인력 전원 사용" },
  { value: 6, suffix: "회", bar: 60, label: "해커톤·경진대회 수상", sub: "대상·최우수상·금상 포함" },
];

export interface JourneyItem {
  period: string;
  org: string;
  role: string;
  summary: string;
  points: string[];
  tags: string[];
}

export const JOURNEY: JourneyItem[] = [
  {
    period: "2024.09 — 진행중",
    org: "유큐브 · 차세대 농업농촌 프로젝트",
    role: "SI 풀스택 개발자 · 원청 LG CNS",
    summary:
      "저연차로 프로젝트 최대 규모인 130만 대국민 신청 서비스를 맡아 분석부터 운영까지 담당했습니다.",
    points: [
      "130만 신청 서비스 인수·통합/관통테스트 주도, 핵심 기능 설계·개발",
      "내부망 쿼리 변환기 등 공통 유틸 4종 — 정확도 98%, 공수 90%+ 절감",
      "PL 공백마다 담당자 대행 — SR 900건 처리, 운영 연속성 100%",
    ],
    tags: ["Java", "Spring Boot", "MyBatis", "OZ Report", "MySQL", "DW"],
  },
  {
    period: "2023.03 — 2024.06",
    org: "선문대 CoRe-Lab · 산학공동과제",
    role: "팀 리더 · AI·데이터 6개 연구 프로젝트",
    summary:
      "AI·머신러닝·센서 데이터 서비스를 기획부터 배포까지, 6개 연구 프로젝트를 리드했습니다.",
    points: [
      "AI 우울감 케어봇 — 센서 데이터 ML 분석, 임상 척도(PHQ-9)와 90% 일치",
      "ChatGPT 영양제 추천·BLE 실시간 채팅 풀스택 개발, 백만 건 데이터 최적화",
    ],
    tags: ["Python", "React", "Spring Boot", "WebRTC", "ML"],
  },
  {
    period: "2019.03 — 2024.08",
    org: "선문대학교 컴퓨터공학부 데이터공학과",
    role: "수석 졸업 · GPA 4.39 / 4.5",
    summary:
      "전 학년 수석으로 졸업. 동아리 회장·멘토단장으로 활동하며 6회 수상했습니다.",
    points: [
      "해커톤·경진대회 6회 수상, 학회 구두 발표 (2024)",
      "정보처리기사 · SQLD · AI-900 취득",
    ],
    tags: ["연구", "리더십", "멘토링"],
  },
];

export interface Work {
  title: string;
  period: string;
  tagline: string;
  description: string;
  metric: string;
  metricLabel: string;
  stack: string[];
  href: string;
  span?: "wide"; // bento sizing hint — spans two columns
}

export const WORKS: Work[] = [
  {
    title: "countdown2026.org",
    period: "2026.04 — 진행중",
    tagline: "워십 컨퍼런스 등록·커머스",
    description:
      "장충체육관 워십 컨퍼런스의 공식 등록·굿즈 커머스 웹. 오픈 피크 시 동시접속 4,000명을 Vercel Edge·Cloudflare·CDN으로 분산 처리해 무료 인프라만으로 무중단 운영했습니다.",
    metric: "7,000",
    metricLabel: "누적 사용자",
    stack: ["Next.js", "Supabase", "Vercel", "Cloudflare", "PG 결제"],
    href: "https://countdown2026.org",
    span: "wide",
  },
  {
    title: "joshuaworship.com",
    period: "2025.10 — 진행중",
    tagline: "공동체 일정·행사·커머스",
    description:
      "JOSHUA 공동체의 일정·행사 등록과 굿즈 판매를 관리하는 커뮤니티 웹. Supabase Auth 인증, 캘린더 일정, PG 결제 커머스를 직접 구현했습니다.",
    metric: "3,000",
    metricLabel: "누적 사용자",
    stack: ["Next.js", "TypeScript", "Supabase", "PG 결제"],
    href: "https://joshuaworship.com",
  },
  {
    title: "hubworship.ing",
    period: "2025.08 — 진행중",
    tagline: "워십 HUB 플랫폼",
    description:
      "여러 앱·리소스·굿즈를 한곳에 모은 모듈형 HUB 플랫폼. 로그인·사용자 관리, 커머스, 피드백 채널까지 1인으로 운영합니다.",
    metric: "1,000",
    metricLabel: "누적 사용자",
    stack: ["Next.js", "TypeScript", "Supabase", "PG 결제"],
    href: "https://hubworship.ing",
  },
  {
    title: "지구미아 · Jigumia",
    period: "App Store 출시",
    tagline: "브랜드 세일 캘린더 앱",
    description:
      "올리브영·무신사·29CM·쿠팡 등 인기 브랜드의 세일 일정을 하나의 캘린더에서 모아 보는 쇼핑 앱. 세일 정보 수집·관리는 AI로 운영합니다.",
    metric: "300+",
    metricLabel: "다운로드 · App Store",
    stack: ["React Native", "AI 운영"],
    href: "https://apps.apple.com/kr/app/id6772139871",
  },
  {
    title: "joowonkoh.com",
    period: "2026.01 — 진행중",
    tagline: "기술 블로그·포트폴리오",
    description:
      "개발/커리어 인사이트를 공유하는 기술 블로그 겸 포트폴리오. MDX 기반 콘텐츠 파이프라인을 직접 구축하고 SEO·성능을 최적화했습니다.",
    metric: "일 200",
    metricLabel: "평균 방문자",
    stack: ["Next.js", "TypeScript", "MDX", "Vercel"],
    href: "https://joowonkoh.com",
    span: "wide",
  },
];

export interface SkillGroup {
  label: string;
  skills: string[];
}

export const SKILLS: SkillGroup[] = [
  { label: "Frontend", skills: ["TypeScript", "React", "React Native", "Next.js", "MDX", "Tailwind"] },
  { label: "Backend", skills: ["Java", "Spring Boot", "Node.js", "Python", "MyBatis", "PG 결제 연동"] },
  { label: "Data · AI", skills: ["MySQL", "Supabase", "DW", "Redis", "MongoDB", "ML / 데이터 분석", "WebRTC"] },
  { label: "Infra · Tool", skills: ["AWS", "Vercel", "Cloudflare", "Firebase", "CDN · 캐싱", "Git / GitHub"] },
  { label: "SI · Enterprise", skills: ["eXBuilder6", "OZ Report"] },
  { label: "자격 · 어학", skills: ["정보처리기사", "SQLD", "AI-900", "UCSI 해외 IT·영어 연수"] },
];

// Flat list for the marquee — deduped, ordered for visual rhythm.
export const SKILL_MARQUEE: string[] = [
  "TypeScript", "React", "Next.js", "React Native", "Java", "Spring Boot",
  "Node.js", "Python", "MyBatis", "Supabase", "MySQL", "Redis",
  "AWS", "Vercel", "Cloudflare", "MDX", "Tailwind", "WebRTC",
  "OZ Report", "ML · 데이터 분석", "PG 결제 연동", "DW",
];

export interface Award {
  year: string;
  title: string;
  detail: string;
}

export const AWARDS: Award[] = [
  { year: "2024", title: "수석 졸업 · 전 학년 수석", detail: "선문대 컴퓨터공학부 · GPA 4.39 / 4.5" },
  { year: "2023", title: "인문사회 경진대회 최우수상", detail: "AI·데이터 기반 연구" },
  { year: "2020", title: "로봇공학플랫폼 해커톤 대상", detail: "최고상 수상" },
  { year: "2020", title: "피버팅 해커톤 우수상", detail: "한국무역협회" },
  { year: "2019", title: "G-Fair 창업경진대회 금상", detail: "창업 아이템 부문" },
  { year: "2024", title: "대한디지털치료학회 발표", detail: "스마트폰 센서 기반 우울감 조기감지 (구두)" },
];

export const PHILOSOPHY =
  "만드는 게 좋아서 멈추질 못합니다. 낮엔 130만 명이 쓰는 서비스를, 퇴근 후엔 제 서비스를 — 분석부터 운영까지 전부 직접 부딪히면서 오늘도 뭔가를 만들고 있습니다.";

// label → Iconify slug. Brand marks use the colorful `logos:` set. A few brand
// logos are dark/monochrome and vanish on the black background (Next.js, Vercel,
// GitHub) — those use white-tinted `simple-icons` instead. Concepts fall back to
// Solar line icons. A missing slug just renders no glyph beside the label.
const TECH_ICONS: Record<string, string> = {
  TypeScript: "logos:typescript-icon",
  React: "logos:react",
  "React Native": "logos:react",
  "Next.js": "simple-icons:nextdotjs", // dark logo → white mono
  Java: "logos:java",
  "Spring Boot": "logos:spring-icon",
  "Node.js": "logos:nodejs-icon",
  Python: "logos:python",
  MyBatis: "solar:database-linear",
  Supabase: "logos:supabase-icon",
  MySQL: "logos:mysql-icon",
  Redis: "logos:redis",
  MongoDB: "logos:mongodb-icon",
  AWS: "logos:aws",
  Vercel: "simple-icons:vercel", // dark logo → white mono
  Cloudflare: "logos:cloudflare-icon",
  Firebase: "logos:firebase",
  MDX: "logos:mdx",
  Tailwind: "logos:tailwindcss-icon",
  WebRTC: "logos:webrtc",
  "Git / GitHub": "simple-icons:github", // dark logo → white mono
  "OZ Report": "solar:document-text-linear",
  eXBuilder6: "solar:code-square-linear",
  "PG 결제": "solar:card-linear",
  "PG 결제 연동": "solar:card-linear",
  DW: "solar:server-square-linear",
  "CDN · 캐싱": "solar:server-linear",
  "AI 운영": "solar:magic-stick-3-linear",
  "ML / 데이터 분석": "solar:chart-square-linear",
  "ML · 데이터 분석": "solar:chart-square-linear",
};

export function techIcon(label: string): string {
  return TECH_ICONS[label] ?? "solar:code-2-linear";
}
