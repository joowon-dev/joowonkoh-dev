import type { Metadata } from "next";
import Image from "next/image";
import PlatformTabs from "./PlatformTabs";
import VersionHistory from "./VersionHistory";
import { LATEST } from "./releases";

const TITLE =
  "바탕화면 불꽃놀이 — 사진을 올리면 그 사진으로 불꽃이 터지는 데스크톱 앱 (맥 · 윈도우)";
const DESCRIPTION =
  "사진을 올리면 그 사진 모양 그대로, 원본 색 그대로 불꽃이 되어 하늘에 섭니다. 카운트다운을 세고 터뜨릴 수 있고, 여러 장을 보관함에 모아 차례로 쏠 수 있습니다. 켜 두기만 해도 도는 불꽃놀이 쇼가 따로 있고, 마우스는 전부 통과하니 밑에서 하던 일은 그대로 합니다. 맥과 윈도우 모두 받을 수 있습니다.";

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
  { key: "⌥⇧I", action: "마지막에 쏜 사진을 한 발 더" },
  {
    key: "메뉴 막대 🎆",
    action: "보관함 · 이미지로 불꽃 · 카운트다운 · 쇼 고르기 · 소리 크기 · 모니터 선택 · 종료",
  },
];

/** 사진으로 불꽃 만들기 — 처음 쓰는 사람이 순서대로 따라 하는 곳. */
const PHOTO_STEPS: { title: string; body: string }[] = [
  {
    title: "메뉴 막대 🎆 → 「보관함 열기…」",
    body: "창이 하나 뜹니다. 불꽃 화면은 클릭이 전부 밑으로 통과하기 때문에, 고르고 누르는 일은 전부 이 창에서 합니다.",
  },
  {
    title: "「이미지 추가…」 로 사진을 고른다",
    body: "여러 장을 올려 둘 수 있습니다. 밑의 칸에 문구를 적고 Enter 를 치면 글자 불꽃도 목록에 들어갑니다 — 이름이든 축하 문구든 소스를 고칠 필요가 없습니다.",
  },
  {
    title: "쏠 것만 체크하고 순서를 맞춘다",
    body: "체크를 풀면 그 항목은 건너뜁니다. 왼쪽 손잡이를 끌면 순서가 바뀌고, ✕ 를 누르면 지워집니다. 올려 둔 것은 앱을 껐다 켜도 남아 있습니다.",
  },
  {
    title: "「고른 것 차례로 쏘기」",
    body: "밑에서 정한 간격(기본 5초)으로 하나씩 올라갑니다. 목록의 이름을 누르면 그것만 한 발 나갑니다.",
  },
  {
    title: "카운트다운을 켜면 세고 나서 터집니다",
    body: "메뉴 막대 🎆 → 「카운트다운 ▸」 에서 3 · 5 · 10초 중에 고릅니다. 숫자가 하나씩 불꽃으로 떠오르고, 「1」 다음 박자에 첫 사진이 터집니다.",
  },
  {
    title: "자동 쇼가 방해되면 「쇼 ▸ 이미지만」",
    body: "I LOVE YOU 나 생일 축하가 계속 도는 것이 싫을 때 씁니다. 올린 것만 뜨고, 쏘고 나면 조용해집니다.",
  },
];

/** 어떤 사진이 잘 나오는지. 이걸 모르면 첫 시도에서 실망한다. */
const PHOTO_TIPS: { good: boolean; text: string }[] = [
  {
    good: true,
    text: "선이 굵고 또렷한 그림 · 캐릭터 · 로고 · 아이콘. 검은 윤곽선은 「빛이 없는 자리」로 나타나서 눈·코·테두리가 그대로 읽힙니다.",
  },
  {
    good: true,
    text: "배경이 단순하고 주인공이 큼직하게 찍힌 것. 화면에서는 점 사이가 벌어지므로, 원본에서 작게 찍힌 것은 알아볼 수 없게 됩니다.",
  },
  {
    good: false,
    text: "배경이 복잡한 사진 · 풍경 · 여러 사람이 작게 찍힌 단체 사진. 점묘화로 옮기면 형체가 뭉개집니다.",
  },
  {
    good: false,
    text: "아주 어두운 사진. 불꽃은 빛을 더하는 방식이라 어두운 부분은 아예 안 보입니다. 그늘은 자동으로 조금 들어 올리지만 한계가 있습니다.",
  },
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
    body: "Dock 에는 아이콘이 없습니다. 사진 올리기도, 보관함도, 소리 크기도, 종료도 전부 이 메뉴에서 합니다. 손쉬운 사용 같은 권한은 하나도 요구하지 않습니다. 모니터가 여러 대면 어느 화면에 띄울지도 고릅니다.",
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
        <strong className="font-semibold text-text-primary">사진을 올리면 그 사진이
        불꽃이 됩니다.</strong> 점 18000개가 날아가 그림 자리에 서고, 색은 원본 픽셀 색을
        그대로 씁니다. 배경을 지우거나 파일을 손볼 필요가 없습니다. 카운트다운을 세고
        터뜨릴 수도, 여러 장을 보관함에 모아 차례로 쏠 수도 있습니다.
      </p>
      <p className="mt-4 text-base leading-relaxed text-text-secondary">
        아무것도 안 올려도 켜 두기만 하면 도는 쇼가 따로 있습니다. 한 줄로 쏘아 올리는
        일제 발사로 시작해서 I · LOVE · YOU, 하트, 사랑해로 흐르고, 다시 대피날레로
        끝납니다. 마우스는 언제나 전부 통과하니 불꽃이 떠 있는 채로 평소처럼 일하면
        됩니다.
      </p>

      <h2 className="mt-10 font-display text-xl font-bold tracking-tight md:text-2xl">
        받기
      </h2>
      <PlatformTabs mac={<MacPanel />} />
      <VersionHistory />

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

      <SectionHeading>사진으로 불꽃 만들기</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        여섯 단계입니다. 두 번째까지만 해도 한 장은 바로 쏠 수 있습니다.
      </p>
      <ol className="mt-6 space-y-5">
        {PHOTO_STEPS.map((step, i) => (
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
      <p className="mt-6 text-sm leading-relaxed text-text-secondary">
        사진 한 장만 바로 쏘고 싶으면 보관함을 거치지 않고 메뉴 막대 🎆 →{" "}
        <strong className="font-semibold text-text-primary">「이미지로 불꽃…」</strong>{" "}
        을 써도 됩니다. 같은 사진을 한 번 더 올리려면{" "}
        <kbd className="rounded-lg border border-border bg-card-bg px-2 py-1 font-mono text-xs text-text-primary">
          ⌥⇧I
        </kbd>
        .
      </p>

      <SectionHeading>어떤 사진이 잘 나오나</SectionHeading>
      <ul className="mt-6 space-y-4">
        {PHOTO_TIPS.map((tip) => (
          <li key={tip.text} className="flex gap-3">
            <span
              className="mt-0.5 shrink-0 text-sm"
              aria-label={tip.good ? "잘 나옵니다" : "잘 안 나옵니다"}
            >
              {tip.good ? "◎" : "△"}
            </span>
            <span className="text-sm leading-relaxed text-text-secondary">
              {tip.text}
            </span>
          </li>
        ))}
      </ul>

      <SectionHeading>켜 두면 도는 쇼</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        사진을 안 올려도 쇼 하나가 저절로 돕니다. 메뉴 막대 🎆 → 「쇼 ▸」 에서 I LOVE YOU
        와 생일 축하 중에 고르고, 「이미지만」 을 고르면 이 쇼가 멈춥니다. 아래는 I LOVE
        YOU 의 차례입니다.
      </p>
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
        1.1.0 부터는 앱 안에서 됩니다. 보관함의 입력칸에 적고 Enter 를 치면 그 말이
        목록에 들어가고, 사진과 똑같이 쏘아 올릴 수 있습니다. 한글도 이모지도 폰트가
        그릴 수 있으면 그대로 불꽃이 됩니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        저절로 도는 쇼의 문구(I LOVE YOU · 사랑해 같은 것)까지 바꾸려면 그건 여전히
        소스를 받아서{" "}
        <code className="rounded bg-tag-bg px-1.5 py-0.5 font-mono text-xs text-text-primary">
          src/show/script.js
        </code>{" "}
        를 고치고 다시 빌드해야 합니다.
      </p>

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
        에 있습니다. 쇼는 HTML·Canvas로 쓰고 껍데기만 플랫폼별 네이티브라, 앱이 1MB
        남짓입니다.
      </p>
    </main>
  );
}
