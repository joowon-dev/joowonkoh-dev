import type { Metadata } from "next";
import Image from "next/image";
import PlatformTabs from "./PlatformTabs";
import VersionHistory from "./VersionHistory";
import { LATEST } from "./releases";

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
        height: 648,
        alt: "친 공이 코드 편집기 화면 위로 포물선을 그리며 날아가는 모습",
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
    title: "잘 맞혔다고 다 안타가 아닙니다",
    body: "담장 앞에 외야수가 서 있습니다. 뜬공이 뜨면 낙구 지점으로 달려가고, 체공 시간 안에 닿으면 아웃입니다. 그래서 잘 맞힐수록 홈런 아니면 아웃이고, 오히려 힘없이 맞은 공이 안타로 남습니다. 바운드된 공은 잡지 않습니다.",
  },
  {
    title: "기록은 연속이 아니라 비거리입니다",
    body: "가장 멀리 친 거리가 남습니다. 담장에 막혀 끊긴 타구도 담장이 없었다면 떨어졌을 지점까지 세어 줍니다.",
  },
  {
    title: "치면 포인트가 쌓이고, 그걸로 배트를 삽니다",
    body: "홈런은 비거리 m 그대로, 안타는 그 0.4배가 포인트로 들어옵니다. 아웃은 잃는 것도 얻는 것도 없습니다. 모은 포인트로 배트를 사면 같은 타이밍이라도 공이 더 멀리 갑니다 — 맨손으로는 13ms 안쪽으로 맞혀야 넘어가던 담장이, 카본 배트를 들면 33ms까지 넓어집니다. 맨몸 기록과 배트 기록은 따로 남습니다.",
  },
  {
    title: "입은 유니폼의 구단에 응원이 쌓입니다",
    body: "친 만큼 그 구단의 응원 점수가 올라가고, 받은 사람들 전체와 함께 집계됩니다. 구단별과 개인별로 일간·주간·연간·전체를 봅니다. 배트를 사도 응원은 한 점도 줄지 않습니다 — 안 쓰고 모은 사람이 이기는 순위가 되면 안 되니까요. 로그인도 회원가입도 없고, 기기가 만든 무작위 번호 하나가 전부입니다.",
  },
  {
    title: "결과는 공이 알려줍니다",
    body: "치자마자 답이 나오지 않습니다. 홈런은 담장을 넘는 순간 담장 위에, 안타는 공이 다 굴러 멈춘 자리에 뜹니다. 그 글씨가 사라져야 다음 공이 옵니다.",
  },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "받은 dmg 를 연다",
    body: "더블클릭하면 창이 하나 뜹니다. 애플 공증을 받은 파일이라 경고가 없습니다.",
  },
  {
    title: "응용 프로그램 폴더로 끌어 넣는다",
    body: "창 안에 응용 프로그램 폴더가 나란히 있습니다. 야구공 아이콘을 그 위로 끌어다 놓으면 설치가 끝납니다. 다 되면 창은 닫고 dmg 는 버려도 됩니다.",
  },
  {
    title: "더블클릭으로 연다",
    body: "공증 도장이 파일 안에 박혀 있어서 인터넷이 끊겨 있어도 그냥 열립니다.",
  },
  {
    title: "메뉴 막대에서 야구공을 찾는다",
    body: "Dock에는 아이콘이 없습니다. 최고 비거리도, 종료도 이 메뉴에서 합니다. 손쉬운 사용 같은 권한은 하나도 요구하지 않습니다. 유니폼도 여기서 고릅니다 — 처음엔 롯데를 입고 나오고, KBO 10개 구단의 홈·원정을 타자와 투수에게 따로 입힐 수 있습니다. 모니터가 여러 대면 어느 화면에 띄울지도 고릅니다. 투수 거리도 여기서 고릅니다 — 투수를 당기면 공이 일찍 와서 어려워집니다.",
  },
  {
    title: "스윙이 안 되면 조작키를 바꾼다",
    body: "쓰는 입력기나 다른 앱이 ⌥Space를 먼저 가져가면 공은 오는데 스윙만 안 됩니다. 메뉴의 조작키에서 ⌥⇧ 같은 다른 조합으로 바꾸면 됩니다.",
  },
  {
    title: "다음부터는 앱이 알려준다",
    body: "새 버전이 나오면 메뉴에 「새 버전 설치」가 생깁니다. 눌러야만 갈아 끼우고, 안 누르면 메뉴에 아무 흔적도 남지 않습니다. 이 페이지를 다시 찾아올 일은 없습니다.",
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
        href={LATEST.mac.href}
        download
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>
          <span className="block font-display text-sm font-semibold text-text-primary">
            SneakyBaseball-mac.dmg 내려받기
          </span>
          <span className="mt-1 block text-xs text-text-secondary">
            {LATEST.version} · {LATEST.mac.size} · macOS 13 이상 · Apple Silicon &amp;
            Intel · 애플 공증
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
          alt="친 공이 코드 편집기 화면 위로 포물선을 그리며 날아가는 모습"
          width={1600}
          height={648}
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
      <VersionHistory />

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
