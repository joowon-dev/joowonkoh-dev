import type { Metadata } from "next";
import Image from "next/image";
import PlatformTabs from "./PlatformTabs";

const TITLE = "몰래 야구 — 일하는 화면 위로 공이 날아가는 바탕화면 야구 (맥 · 윈도우)";
const DESCRIPTION =
  "화면 왼쪽 아래 구석에서 투수가 공을 던집니다. 타이밍 맞춰 치면 작업 중인 창 위로 포물선을 그리며 날아가고, 오른쪽 끝 담장을 넘기면 홈런입니다. 맥과 윈도우 모두 받을 수 있습니다. 클릭은 전부 통과하니 밑에서 하던 일은 그대로 합니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/sneaky-baseball" },
  // 내비에서 감춘 항목이다. 목록에 없는 페이지가 검색 결과로만 노출되면
  // 들어온 사람은 사이트에서 다시 찾아갈 길이 없다. 사이트맵 제외는
  // next-sitemap.config.js에 같이 걸어 뒀다.
  robots: { index: false, follow: false },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: "https://joowonkoh.com/playground/sneaky-baseball",
    images: [
      {
        url: "https://joowonkoh.com/sneaky-baseball/screenshot.jpg",
        width: 1600,
        height: 629,
        alt: "친 공이 대시보드 화면 위로 포물선을 그리며 날아가는 모습",
      },
    ],
  },
};

const CONTROLS: { key: string; action: string }[] = [
  { key: "⌥ 누르고 있기", action: "누르고 있는 동안만 투수가 던집니다. 떼면 바로 멈춥니다" },
  { key: "⌥ + Space", action: "스윙" },
  { key: "⌘⇧B", action: "숨기기 / 다시 부르기" },
];

const RULES: { title: string; body: string }[] = [
  {
    title: "담장을 넘겨야 홈런입니다",
    body: "타이밍이 좋았다고 홈런이 아니라, 친 공이 화면 오른쪽 끝 담장을 실제로 넘어가야 홈런입니다. 못 넘기면 담장을 맞고 튕겨 나옵니다. 화면에 보이는 그 선이 그대로 판정 기준입니다.",
  },
  {
    title: "공의 높낮이도 결과를 바꿉니다",
    body: "같은 타이밍이라도 낮게 들어온 공은 발사각이 깎여 덜 날아갑니다. 20ms 안쪽으로 맞혀도 낮은 공이면 담장 앞에 떨어집니다.",
  },
  {
    title: "기록은 연속이 아니라 비거리입니다",
    body: "가장 멀리 친 거리가 남습니다. 담장에 막혀 끊긴 타구도 담장이 없었다면 떨어졌을 지점까지 세어 줍니다.",
  },
  {
    title: "결과는 공이 알려줍니다",
    body: "치자마자 답이 나오지 않습니다. 홈런은 담장을 넘는 순간 담장 위에, 안타는 공이 다 굴러 멈춘 자리에 뜹니다. 그 글씨가 사라져야 다음 공이 옵니다.",
  },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "내려받고 압축을 푼다",
    body: "SneakyBaseball-mac.zip을 풀면 Sneaky Baseball.app 하나가 나옵니다.",
  },
  {
    title: "응용 프로그램 폴더로 옮긴다",
    body: "꼭 옮겨야 하는 건 아니지만, 다운로드 폴더에 두면 나중에 실수로 지우기 쉽습니다.",
  },
  {
    title: "우클릭 → 열기 로 실행한다",
    body: "애플 공증을 받지 않은 앱이라 그냥 더블클릭하면 막힙니다. 처음 한 번만 우클릭 후 열기를 누르면 그다음부터는 더블클릭으로 열립니다.",
  },
  {
    title: "메뉴 막대에서 야구공을 찾는다",
    body: "Dock에는 아이콘이 없습니다. 최고 비거리도, 종료도 이 메뉴에서 합니다. 손쉬운 사용 같은 권한은 하나도 요구하지 않습니다.",
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 font-display text-xl font-bold tracking-tight md:text-2xl">
      {children}
    </h2>
  );
}

function MacPanel() {
  return (
    <div>
      <a
        href="/downloads/SneakyBaseball-mac.zip"
        download
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>
          <span className="block font-display text-sm font-semibold text-text-primary">
            SneakyBaseball-mac.zip 내려받기
          </span>
          <span className="mt-1 block text-xs text-text-secondary">
            290KB · macOS 13 이상 · Apple Silicon &amp; Intel · 서명 없음
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-text-primary px-4 py-2 text-xs font-semibold text-card-bg">
          다운로드
        </span>
      </a>

      <ol className="mt-8 space-y-5">
        {STEPS.map((step, i) => (
          <li key={step.title} className="flex gap-4">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-text-primary text-xs font-bold text-card-bg">
              {i + 1}
            </span>
            <span>
              <span className="block text-sm font-semibold text-text-primary">{step.title}</span>
              <span className="mt-1 block text-sm leading-relaxed text-text-secondary">
                {step.body}
              </span>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}

export default function SneakyBaseballPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
        Playground
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
        몰래 야구
      </h1>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">
        화면 왼쪽 아래 구석에 조그만 야구장이 생깁니다. 타이밍 맞춰 치면 공이 작업 중인 창
        위로 날아가고, 오른쪽 끝 담장을 넘기면 홈런입니다. 클릭은 전부 통과하니 밑에서
        하던 일은 그대로 하면 됩니다.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border shadow-ambient">
        <Image
          src="/sneaky-baseball/screenshot.png"
          alt="친 공이 대시보드 화면 위로 포물선을 그리며 날아가는 모습"
          width={1600}
          height={629}
          className="w-full"
          priority
        />
      </div>

      <SectionHeading>조작</SectionHeading>
      <dl className="mt-6 space-y-3">
        {CONTROLS.map(({ key, action }) => (
          <div key={key} className="flex items-baseline gap-4">
            <dt className="w-36 shrink-0">
              <kbd className="rounded-lg border border-border bg-card-bg px-2 py-1 font-mono text-xs text-text-primary">
                {key}
              </kbd>
            </dt>
            <dd className="text-sm leading-relaxed text-text-secondary">{action}</dd>
          </div>
        ))}
      </dl>

      <SectionHeading>규칙</SectionHeading>
      <div className="mt-6 space-y-5">
        {RULES.map((rule) => (
          <div key={rule.title}>
            <h3 className="text-sm font-semibold text-text-primary">{rule.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">{rule.body}</p>
          </div>
        ))}
      </div>

      <SectionHeading>받기</SectionHeading>
      <PlatformTabs mac={<MacPanel />} />

      <p className="mt-14 text-xs leading-relaxed text-text-secondary">
        소스는{" "}
        <a
          href="https://github.com/joowon-dev/sneaky-baseball"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          github.com/joowon-dev/sneaky-baseball
        </a>{" "}
        에 있습니다. 게임은 HTML·Canvas로 쓰고 껍데기만 플랫폼별 네이티브라, 앱이 0.5MB
        남짓입니다.
      </p>
    </main>
  );
}
