import type { Metadata } from "next";
import Image from "next/image";
import PlatformTabs from "./PlatformTabs";
import VersionHistory from "./VersionHistory";
import { LATEST } from "./releases";

const TITLE =
  "바탕화면 불꽃놀이 — 일하는 화면 위로 불꽃이 터지는 데스크톱 앱 (맥 · 윈도우)";
const DESCRIPTION =
  "켜 두면 화면 아래 발사대에서 불꽃이 올라가 터집니다. 한 줄로 쏘아 올리는 일제 발사로 시작해서 I · LOVE · YOU, 하트, 사랑해로 흐르고 다시 대피날레로 끝납니다. 마우스는 전부 통과하니 밑에서 하던 일은 그대로 합니다. 맥과 윈도우 모두 받을 수 있습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://joowonkoh.com/playground/desktop-fireworks",
  },
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
    url: "https://joowonkoh.com/playground/desktop-fireworks",
    images: [
      {
        url: "https://joowonkoh.com/desktop-fireworks/screenshot.jpg",
        width: 1500,
        height: 812,
        alt: "작업 중인 문서 위로 「사랑해」 글자 불꽃과 양옆의 하트 불꽃이 떠 있는 모습",
      },
    ],
  },
};

const CONTROLS: { key: string; action: string }[] = [
  { key: "⌥⇧F", action: "쇼를 처음부터 다시" },
  { key: "⌥⇧H", action: "숨기기 / 다시 부르기" },
  { key: "메뉴 막대 🎆", action: "소리 크기 · 모니터 선택 · 종료" },
];

const SHOW: { title: string; body: string }[] = [
  {
    title: "한 줄로 쏘아 올립니다",
    body: "화면 맨 아래 발사대 아홉 대가 같은 순간에 쏩니다. 넉 줄이 잇달아 올라가면서 화면 폭을 가득 채웁니다. 발사대마다 높이를 조금씩 어긋나게 둬서, 자로 그은 줄이 아니라 진짜 불꽃놀이처럼 보입니다.",
  },
  {
    title: "I · LOVE · YOU 를 한 낱말씩",
    body: "불꽃 입자가 글자 모양으로 날아가 그 자리에 섭니다. 셋 다 같은 자리에 같은 높이로 서서 한 마디처럼 읽힙니다. 로마자는 세리프로 뽑습니다 — 산세리프의 대문자 I 는 세로획 하나뿐이라 불꽃으로 세우면 글자가 아니라 막대기로 보이거든요.",
  },
  {
    title: "하트, 그리고 사랑해",
    body: "하트가 한 번 크게 터진 뒤, 「사랑해」가 뜨면서 양옆에 하트 둘이 같이 터집니다. 글자는 한글도 이모지도 됩니다 — 폰트가 그릴 수 있으면 그대로 불꽃이 됩니다.",
  },
  {
    title: "다시 엄청 많이",
    body: "빠른 연발 26발로 몰아치다가, 마지막은 다시 일제 발사 다섯 줄로 끝납니다. 약 58초에 한 바퀴를 돌고 저절로 처음부터 다시 시작합니다.",
  },
];

const MADE: { title: string; body: string }[] = [
  {
    title: "배경을 칠하지 않습니다",
    body: "보통 불꽃놀이 캔버스는 매 프레임 검은 반투명을 덮어 잔상을 만듭니다. 이 앱은 그럴 수 없습니다 — 배경을 칠하는 순간 바탕화면이 가려지니까요. 그래서 매 프레임 캔버스를 통째로 지우고, 잔상은 불씨마다 들고 다니는 지난 위치를 선으로 이어 그려서 만듭니다.",
  },
  {
    title: "글자는 계산으로 세웁니다",
    body: "공기 저항을 지수 감쇠로 두면, 초기 속도 v0 인 입자가 멈출 때까지 가는 거리가 정확히 v0/drag 입니다. 이 식을 거꾸로 써서 목표 지점까지의 거리에 저항 계수를 곱한 속도를 주면, 입자가 반복도 보정도 없이 그 자리에 가서 섭니다.",
  },
  {
    title: "소리에 음원 파일이 없습니다",
    body: "발사음은 잡음을 좁은 대역으로 훑어 올리고, 터짐은 저역 잡음에 사인파 한 번을 겹칩니다. 터지는 높이에 따라 소리가 조금 늦게 오는데, 물리적으로 정확해서가 아니라 그래야 「멀리서 터졌다」로 들리기 때문입니다.",
  },
  {
    title: "크로미움을 담지 않았습니다",
    body: "앱이 600KB 남짓인 이유입니다. 맥은 Swift + WKWebView, 윈도우는 .NET + WebView2 — OS 에 이미 있는 웹뷰를 씁니다. 쇼 코드는 두 플랫폼이 완전히 같은 파일을 씁니다.",
  },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "내려받고 압축을 푼다",
    body: "DesktopFireworks-mac.zip 을 풀면 Fireworks.app 하나가 나옵니다.",
  },
  {
    title: "응용 프로그램 폴더로 옮긴다",
    body: "꼭 옮겨야 하는 건 아니지만, 다운로드 폴더에 두면 나중에 실수로 지우기 쉽습니다.",
  },
  {
    title: "더블클릭으로 연다",
    body: "애플 공증을 받은 앱이라 경고 없이 그냥 열립니다. 열면 바로 쇼가 시작됩니다.",
  },
  {
    title: "메뉴 막대에서 불꽃을 찾는다",
    body: "Dock 에는 아이콘이 없습니다. 소리 크기도, 종료도 이 메뉴에서 합니다. 손쉬운 사용 같은 권한은 하나도 요구하지 않습니다. 모니터가 여러 대면 어느 화면에 띄울지도 고릅니다.",
  },
  {
    title: "어두운 배경에서 제일 잘 보입니다",
    body: "불꽃은 빛을 더하는 방식으로 그려집니다. 그래서 흰 문서나 밝은 바탕화면 위에서는 흐리게 보입니다. 어두운 배경화면이나 다크 모드 편집기 위에서 보면 사진처럼 나옵니다.",
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
            DesktopFireworks-mac.zip 내려받기
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
              <span className="block text-sm font-semibold text-text-primary">
                {step.title}
              </span>
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

export default function DesktopFireworksPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
        Playground
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
        바탕화면 불꽃놀이
      </h1>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">
        켜 두면 화면 맨 아래 발사대에서 불꽃이 올라가 터집니다. 한 줄로 쏘아 올리는 일제
        발사로 시작해서 I · LOVE · YOU, 하트, 사랑해로 흐르고, 다시 대피날레로 끝납니다.
        마우스는 언제나 전부 통과하니 불꽃이 떠 있는 채로 평소처럼 일하면 됩니다.
      </p>

      <div className="mt-10 overflow-hidden rounded-2xl border border-border shadow-ambient">
        <Image
          src="/desktop-fireworks/screenshot.jpg"
          alt="작업 중인 문서 위로 「사랑해」 글자 불꽃과 양옆의 하트 불꽃이 떠 있는 모습"
          width={1500}
          height={812}
          className="w-full"
          priority
        />
      </div>

      <SectionHeading>쇼</SectionHeading>
      <div className="mt-6 space-y-5">
        {SHOW.map((part) => (
          <div key={part.title}>
            <h3 className="text-sm font-semibold text-text-primary">{part.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {part.body}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 overflow-hidden rounded-2xl border border-border shadow-ambient">
        <Image
          src="/desktop-fireworks/finale.jpg"
          alt="화면 폭 전체에 걸쳐 여러 색의 불꽃이 한꺼번에 터지는 대피날레"
          width={1500}
          height={812}
          className="w-full"
        />
      </div>

      <SectionHeading>조작</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        쇼는 알아서 돕니다. 아래 키는 다시 보거나 잠깐 치울 때만 씁니다.
      </p>
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

      <SectionHeading>문구 바꾸기</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        받은 앱의 문구는 고정입니다. 다른 말을 띄우고 싶으면 소스를 받아서{" "}
        <code className="rounded bg-tag-bg px-1.5 py-0.5 font-mono text-xs text-text-primary">
          src/show/script.js
        </code>{" "}
        맨 위의 네 줄만 고치고 다시 빌드하면 됩니다. 이름을 넣어도 되고 이모지도 됩니다.
        글자 수가 늘면 같은 줄의 입자 수도 같이 올리면 또렷해집니다.
      </p>

      <SectionHeading>어떻게 만들었나</SectionHeading>
      <div className="mt-6 space-y-5">
        {MADE.map((item) => (
          <div key={item.title}>
            <h3 className="text-sm font-semibold text-text-primary">{item.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <SectionHeading>받기</SectionHeading>
      <PlatformTabs mac={<MacPanel />} />
      <VersionHistory />

      <p className="mt-14 text-xs leading-relaxed text-text-secondary">
        소스는{" "}
        <a
          href="https://github.com/joowon-dev/desktop-fireworks"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          github.com/joowon-dev/desktop-fireworks
        </a>{" "}
        에 있습니다. 쇼는 HTML·Canvas로 쓰고 껍데기만 플랫폼별 네이티브라, 앱이 600KB
        남짓입니다.
      </p>
    </main>
  );
}
