import type { Metadata } from "next";
import Image from "next/image";

const TITLE = "DeskTroy — 자리를 비우면 트로이 목마에서 병사가 쏟아지는 데스크톱 앱 (맥)";
const DESCRIPTION =
  "화면 아래를 굴러다니던 트로이 목마가, 당신이 자리를 비우면 해치를 열고 병사를 쏟아냅니다. 선봉장이 사다리를 메고 달려가 창 밑에 세우고, 나머지가 그 사다리로 올라가 창 위를 어깨 닿게 채웁니다. 키보드나 마우스를 건드리는 순간 전원 후퇴합니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/desktroy" },
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
    url: "https://joowonkoh.com/playground/desktroy",
    images: [
      {
        url: "https://joowonkoh.com/desktroy/screenshot.png",
        width: 1600,
        height: 650,
        alt: "크롬 창 세 개의 윗변마다 병사들이 빽빽하게 늘어서 있고, 각 창 왼쪽 끝에 사다리와 깃발이 걸린 실제 실행 화면",
      },
    ],
  },
};

const STEPS: { title: string; body: string }[] = [
  {
    title: "내려받고 압축을 푼다",
    body: "DeskTroy.zip을 풀면 DeskTroy.app 하나가 나옵니다.",
  },
  {
    title: "응용 프로그램 폴더로 옮긴다",
    body: "꼭 옮겨야 하는 건 아니지만, 다운로드 폴더에 두면 나중에 실수로 지우기 쉽습니다.",
  },
  {
    title: "더블클릭해서 실행한다",
    body: "애플 공증을 받은 앱이라 경고 없이 그냥 열립니다.",
  },
  {
    title: "메뉴 막대에서 🐴 아이콘을 찾는다",
    body: "Dock에는 아이콘이 없습니다. 설정도 종료도 이 메뉴에서 합니다.",
  },
  {
    title: "20초 동안 손을 뗀다",
    body: "그게 전부입니다. 조작할 것이 없습니다.",
  },
];

const MENU: { item: string; action: string }[] = [
  { item: "잠시 끄기", action: "오버레이를 통째로 숨깁니다. 다시 켜면 그대로 돌아옵니다." },
  { item: "출격 대기", action: "10초 · 20초 · 30초 · 1분 · 3분 중에서 고릅니다. 바로 적용되고 다음 실행 때도 기억합니다." },
  { item: "최장 점령", action: "가장 오래 점령했던 시간. 알림도 배지도 없고 여기서만 보입니다." },
  { item: "종료", action: "⌘Q." },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 font-display text-xl font-bold tracking-tight md:text-2xl">
      {children}
    </h2>
  );
}

export default function DeskTroyPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Desktop App
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        DeskTroy
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        {DESCRIPTION}
      </p>

      <figure className="mt-8 overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient">
        <Image
          src="/desktroy/screenshot.png"
          alt="크롬 창 세 개의 윗변마다 병사들이 어깨를 맞대고 빽빽하게 늘어서 있고, 각 창 왼쪽 끝에는 바닥까지 걸쳐진 사다리와 깃발이 있으며, 아래쪽에는 트로이 목마와 또 한 줄의 병사들이 있는 실제 실행 화면"
          width={1600}
          height={650}
          className="h-auto w-full"
          unoptimized
          priority
        />
        <figcaption className="px-5 py-3 text-[11px] leading-relaxed text-text-muted">
          실제 실행 화면. 창 세 개가 각각 점령당했습니다 — 병사들이 늘어선 저
          가로줄은 그림이 아니라{" "}
          <strong className="text-text-secondary">그 크롬 창의 윗변</strong>이고,
          창을 옮기면 그 위에 선 병사들도 같이 따라갑니다.
        </figcaption>
      </figure>

      <a
        href="/downloads/DeskTroy.zip"
        download
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>
          <span className="block font-display text-sm font-semibold text-text-primary">
            DeskTroy.zip 내려받기
          </span>
          <span className="mt-1 block text-xs text-text-secondary">
            1.4MB · macOS 13 이상 · Apple Silicon &amp; Intel · 애플 공증 완료
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-accent-soft px-4 py-2 text-xs font-medium text-accent">
          다운로드
        </span>
      </a>

      <SectionHeading>무슨 일이 일어나는가</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        20초 동안 키보드도 마우스도 건드리지 않으면 해치가 열립니다. 사다리가
        내려오고, 병사들이 그 사다리를 타고 쏟아져 나옵니다.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient">
          <h3 className="font-display text-sm font-semibold text-text-primary">
            1. 선봉장이 사다리를 세운다
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            한 명이 사다리를 어깨에 메고 창 밑까지 달려가 세우고, 먼저 올라가
            왼쪽 끝에 깃발을 꽂습니다. 그전에는 아무도 올라가지 않습니다.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient">
          <h3 className="font-display text-sm font-semibold text-text-primary">
            2. 나머지가 그 사다리로 오른다
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            줄줄이 같은 사다리를 타고 올라가, 그 창의 윗변을 어깨가 닿을 만큼
            빽빽하게 채웁니다. 넓은 창 하나에 스무 명 넘게 들어갑니다.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient">
          <h3 className="font-display text-sm font-semibold text-text-primary">
            3. 다 차면 다음 창으로
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            또 다른 선봉장이 사다리를 메고 나갑니다. 갈 창이 없는 병사들은 화면
            맨 아래에 한 줄로 늘어섭니다.
          </p>
        </div>
      </div>

      <SectionHeading>설치하기</SectionHeading>
      <ol className="mt-4 space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {index + 1}
            </span>
            <span>
              <span className="block font-display text-sm font-semibold text-text-primary">
                {step.title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-text-secondary">
                {step.body}
              </span>
            </span>
          </li>
        ))}
      </ol>

      <SectionHeading>메뉴 막대</SectionHeading>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient">
        {MENU.map((entry, index) => (
          <div
            key={entry.item}
            className={`flex flex-col gap-1 px-5 py-3 sm:flex-row sm:items-baseline sm:gap-4 ${
              index > 0 ? "border-t border-border" : ""
            }`}
          >
            <span className="min-w-[92px] shrink-0 font-display text-xs font-semibold text-text-primary">
              {entry.item}
            </span>
            <span className="text-xs leading-relaxed text-text-secondary">
              {entry.action}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-text-muted">
        설정 창은 없습니다. 고를 것이 출격 대기 하나뿐인데 창을 띄우면, 그 창을
        닫는 일이 설정을 바꾸는 일보다 번거로워집니다.
      </p>

      <SectionHeading>알려진 한계</SectionHeading>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-text-secondary">
        <li>
          · 앱을 켠 화면 한 대에서만 동작합니다. 모니터가 여러 대여도 병사들이
          화면 사이를 건너다니지는 않습니다.
        </li>
        <li>
          · 전체 화면 앱 위에서는 창 정보를 읽을 수 없어, 병사들이 화면 맨
          아래에만 늘어섭니다.
        </li>
        <li>
          · 화면 바닥에 너무 가까운 창은 후보에서 뺍니다. 하단 대열과 겹칩니다.
        </li>
      </ul>

      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        Swift + SpriteKit으로 만들었습니다. 목마와 병사 그림은 이 프로젝트를 위해
        만든 오리지널입니다.
      </p>
    </div>
  );
}
