import type { Metadata } from "next";
import PlatformTabs from "./PlatformTabs";
import VersionHistory from "./VersionHistory";
import { LATEST } from "./releases";

const TITLE =
  "바탕화면 상어 — 일하는 동안 저절로 크는 데스크톱 상어 키우기 (맥 · 윈도우)";
const DESCRIPTION =
  "바탕화면에 상어가 삽니다. 클릭하면 그 자리에 밥이 떨어지고 상어가 달려와 뭅니다. 타자를 치면 작은 밥이 떨어집니다. 창이 클릭을 삼키지 않아서 하던 일은 그대로 하면 되고, 먹은 만큼 자라 여섯 종의 도감을 채웁니다. 맥과 윈도우 모두 받을 수 있습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: {
    canonical: "https://joowonkoh.com/playground/desktop-shark",
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
    url: "https://joowonkoh.com/playground/desktop-shark",
  },
};

const CONTROLS: { key: string; action: string }[] = [
  {
    key: "아무 데나 클릭",
    action:
      "그 자리에 큰 밥이 떨어집니다. 누르던 버튼은 그대로 눌립니다 — 창이 클릭을 가져가지 않습니다",
  },
  {
    key: "타자 치기",
    action:
      "아무 데나 작은 밥이 떨어집니다. 치던 글자는 그대로 찍히고, 어떤 키였는지는 앱도 모릅니다",
  },
  { key: "⌥⇧S", action: "밥 주기 멈추기 / 다시" },
  { key: "⌥⇧R", action: "랭킹 · 도감 · 계정 창" },
  { key: "⌥⇧H", action: "숨기기 / 다시 부르기" },
  {
    key: "메뉴 막대 🦈",
    action: "지금 단계 · 밥 주기 · 랭킹 · 모니터 선택 · 상어 놓아주기 · 종료",
  },
];

/** 처음 켠 사람이 「이게 뭐 하는 건지」를 아는 데 필요한 것만. */
const HOW: { title: string; body: string }[] = [
  {
    title: "켜 두면 그냥 삽니다",
    body: "창을 띄우는 앱이 아닙니다. 바탕화면 위에 얇게 얹혀서, 흐릿한 그림자가 화면을 가로질러 지나갑니다. 배가 부르면 가장자리를 천천히 돌고, 오래 굶으면 가운데로 나와 맴돕니다. 처음에는 눈에 잘 안 띄는 것이 정상입니다 — 작고 흐린 실루엣이라 밝은 바탕화면에서 더 잘 보입니다.",
  },
  {
    title: "밥은 일하면 줍니다",
    body: "따로 게임을 켜는 순간이 없습니다. 아무 데나 클릭하면 그 자리에 큰 밥이 떨어지고 상어가 달려와 뭅니다. 타자를 치면 아무 데나 작은 밥이 떨어집니다. 큰 밥이 10점, 작은 밥이 1점입니다.",
  },
  {
    title: "일을 막지 않습니다",
    body: "창은 마우스를 절대 받지 않습니다. 클릭과 타자를 «세기만» 합니다 — 누르던 버튼은 그대로 눌리고 치던 글자는 그대로 찍힙니다. 맥에서는 손쉬운 사용 권한도 필요 없습니다. 어떤 키를 쳤는지는 알 수가 없고, 몇 번 쳤는지만 셉니다.",
  },
  {
    title: "먹은 만큼 자랍니다",
    body: "1단계에서 6단계까지, 누적 18,000점이면 다 큽니다. 몸 길이가 일곱 배가 되니 단계가 바뀌면 바로 알아봅니다. 보통 일하는 리듬에서 시간당 5,000점쯤 쌓입니다.",
  },
  {
    title: "남이 오면 끕니다",
    body: "⌥⇧S 를 누르면 밥이 안 떨어집니다. 상어는 그대로 헤엄치고, 메뉴 막대의 지느러미가 흐려집니다. 다시 누르면 돌아옵니다.",
  },
];

/** 도감 — 이 앱의 «오래 하는 이유»라 순서와 조건을 정확히 적는다. */
const SPECIES: { name: string; hint: string }[] = [
  { name: "백상아리", hint: "처음부터 데리고 시작합니다" },
  { name: "뱀상어", hint: "백상아리를 6단계까지 키우고 누적 20,000점" },
  { name: "귀상어", hint: "뱀상어를 6단계까지 키우고 누적 42,000점" },
  { name: "환도상어", hint: "귀상어를 6단계까지 키우고 누적 66,000점" },
  { name: "톱상어", hint: "환도상어를 6단계까지 키우고 누적 92,000점" },
  { name: "고래상어", hint: "톱상어를 6단계까지 키우고 누적 120,000점" },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "dmg 를 열고 끌어 넣는다",
    body: "창이 하나 뜨고 Applications 폴더가 옆에 서 있습니다. Desktop Shark 를 그 위로 끌어 놓으면 설치가 끝납니다.",
  },
  {
    title: "더블클릭으로 연다",
    body: "애플 공증을 받은 앱이라 경고 없이 그냥 열립니다. 열면 바로 상어가 돌기 시작하고, 밥 주기도 켜진 채로 시작합니다.",
  },
  {
    title: "메뉴 막대에서 지느러미를 찾는다",
    body: "Dock 에는 아이콘이 없습니다. 지금 몇 단계인지, 밥 주기를 멈추는 것도, 랭킹 창도, 종료도 전부 이 메뉴에서 합니다. 모니터가 여러 대면 어느 화면에 띄울지도 고릅니다.",
  },
  {
    title: "아무 데나 클릭해 본다",
    body: "그 자리에 점 하나가 떨어지고, 어디선가 그림자가 그쪽으로 옵니다. 이것이 이 앱의 전부입니다 — 나머지는 일하는 동안 저절로 일어납니다.",
  },
  {
    title: "권한은 하나도 안 물어봅니다",
    body: "손쉬운 사용도, 화면 기록도, 입력 모니터링도 필요 없습니다. 클릭과 타자는 macOS 가 이미 세고 있는 통계 숫자를 물어보는 방식이라, 무엇을 눌렀는지는 앱이 알 수가 없습니다.",
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
            DesktopShark-mac.dmg 내려받기
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

export default function DesktopSharkPage() {
  return (
    <main className="mx-auto max-w-2xl px-6 py-16 md:py-24">
      <p className="text-xs font-semibold uppercase tracking-widest text-text-secondary">
        Playground
      </p>
      <h1 className="mt-3 font-display text-3xl font-bold tracking-tight md:text-4xl">
        바탕화면 상어
      </h1>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">
        <strong className="font-semibold text-text-primary">
          바탕화면에 상어가 삽니다.
        </strong>{" "}
        평소에는 흐릿한 그림자로 지나가다가, 아무 데나 클릭하면 그 자리에 밥이 떨어지고
        달려와 뭅니다. 타자를 치면 작은 밥이 떨어집니다. 먹은 만큼 자라서, 다 크면 다음
        상어가 열립니다.
      </p>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">
        밥을 주려고 따로 무언가를 켤 필요가 없습니다.{" "}
        <strong className="font-semibold text-text-primary">
          창이 마우스를 절대 받지 않아서
        </strong>{" "}
        누르던 버튼은 그대로 눌리고 치던 글자는 그대로 찍힙니다. 켜 두고 평소처럼 일하면
        상어가 알아서 큽니다.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold tracking-tight md:text-2xl">
        받기
      </h2>
      <PlatformTabs mac={<MacPanel />} />
      <VersionHistory />

      <SectionHeading>어떻게 하는 건가</SectionHeading>
      <div className="mt-6 space-y-5">
        {HOW.map((part) => (
          <div key={part.title}>
            <h3 className="text-sm font-semibold text-text-primary">{part.title}</h3>
            <p className="mt-1 text-sm leading-relaxed text-text-secondary">
              {part.body}
            </p>
          </div>
        ))}
      </div>

      <SectionHeading>도감</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        여섯 종이고 순서대로 열립니다.{" "}
        <strong className="font-semibold text-text-primary">
          점수만 쌓아서는 안 열립니다
        </strong>{" "}
        — 앞의 상어를 6단계까지 다 키워야 다음이 나옵니다. 보통 일하는 리듬이면 여섯 종을
        다 여는 데 한 주 남짓 걸립니다.
      </p>
      <ol className="mt-6 overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient">
        {SPECIES.map((s, i) => (
          <li
            key={s.name}
            className={`flex items-center gap-4 px-5 py-3 ${
              i > 0 ? "border-t border-border" : ""
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {i + 1}
            </span>
            <span className="min-w-[72px] shrink-0 text-sm font-semibold text-text-primary">
              {s.name}
            </span>
            <span className="text-xs leading-relaxed text-text-secondary">{s.hint}</span>
          </li>
        ))}
      </ol>
      <p className="mt-6 text-sm leading-relaxed text-text-secondary">
        다 키운 상어는{" "}
        <strong className="font-semibold text-text-primary">고정할 수 있습니다</strong> —
        더 자라지 않게 멈춰 두어도 누적 점수는 계속 쌓여서 다음 종이 열립니다. 지나온
        단계와 이미 연 종으로는 언제든 돌아갈 수 있습니다. 마음에 드는 모습으로 두고 살면
        됩니다.
      </p>

      <SectionHeading>랭킹</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        처음 밥을 준 순간 별명이 저절로 만들어집니다(상어0000 같은 것). 랭킹에는 별명과
        실루엣, 계급, 점수가 나옵니다.{" "}
        <strong className="font-semibold text-text-primary">
          계정은 몰래 야구와 같은 것을 씁니다
        </strong>{" "}
        — 야구에서 쓰던 복구 코드를 그대로 넣으면 같은 사람으로 이어집니다. 올리기 싫으면
        메뉴에서 「랭킹에 올리기」를 끄면 되고, 그래도 상어는 그대로 큽니다.
      </p>

      <SectionHeading>조작</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        위의 둘은 «조작»이라기보다 그냥 일하는 것입니다. 아래 세 키만 알아 두면 됩니다.
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
      <p className="mt-6 text-sm leading-relaxed text-text-secondary">
        윈도우에서는 ⌥ 자리를 Alt 가 합니다.
      </p>

      <p className="mt-14 text-xs leading-relaxed text-text-secondary">
        소스는{" "}
        <a
          href="https://github.com/joowon-dev/desktop-shark"
          target="_blank"
          rel="noreferrer"
          className="underline underline-offset-4"
        >
          github.com/joowon-dev/desktop-shark
        </a>{" "}
        에 있습니다. 상어와 물살은 HTML·Canvas로 그리고 껍데기만 플랫폼별 네이티브라, 맥
        앱이 0.7MB 입니다.
      </p>
    </main>
  );
}
