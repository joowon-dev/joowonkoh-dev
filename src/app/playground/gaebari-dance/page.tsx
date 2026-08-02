import type { Metadata } from "next";
import DancePreview from "./DancePreview";

const TITLE = "개바리 댄스 — 타이핑하면 빨라지는 맥 데스크톱 펫";
const DESCRIPTION =
  "바탕화면 위에서 개바리가 춤을 춥니다. 어느 창에서든 키보드를 치면 더 빠르게 춤을 춥니다. 권한은 하나도 요구하지 않습니다.";
const URL = "https://joowonkoh.com/playground/gaebari-dance";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: [
    "맥 데스크톱 펫",
    "개바리",
    "타이핑 반응",
    "macOS 앱",
    "SpriteKit",
  ],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
  twitter: { card: "summary", title: TITLE, description: DESCRIPTION },
};

const STEPS: { title: string; body: string }[] = [
  {
    title: "내려받고 압축을 푼다",
    body: "GaebariDance.zip을 풀면 GaebariDance.app 하나가 나옵니다.",
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
    title: "메뉴 막대에서 🐶 를 찾는다",
    body: "Dock에는 아이콘이 없습니다. 크기 조절과 종료도 이 메뉴에서 합니다.",
  },
];

const CONTROLS: { key: string; action: string }[] = [
  { key: "아무 데나 타이핑", action: "빠르게 칠수록 빠르게 춤춘다" },
  { key: "개바리를 끌기", action: "옮기기 — 어디에 뒀는지 기억한다" },
  { key: "🐶 → 크기", action: "작게 · 보통 · 크게 · 아주 크게" },
  { key: "🐶 → 제자리로", action: "주 디스플레이 아래 가운데로 되돌리기" },
  { key: "🐶 → 종료", action: "끝내기" },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 font-display text-xl font-bold tracking-tight md:text-2xl">
      {children}
    </h2>
  );
}

export default function GaebariDancePage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        macOS App
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        개바리 댄스
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        {DESCRIPTION}
      </p>

      <div className="mt-8">
        <DancePreview />
      </div>

      <a
        href="/downloads/GaebariDance.zip"
        download
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>
          <span className="block font-display text-sm font-semibold text-text-primary">
            GaebariDance.zip 내려받기
          </span>
          <span className="mt-1 block text-xs text-text-secondary">
            11MB · macOS 13 이상 · Apple Silicon &amp; Intel · 애플 공증 완료
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-accent-soft px-4 py-2 text-xs font-medium text-accent">
          다운로드
        </span>
      </a>

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

      <SectionHeading>조작</SectionHeading>
      <div className="mt-4 overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient">
        {CONTROLS.map((control, index) => (
          <div
            key={control.key}
            className={`flex items-center gap-4 px-5 py-3 ${
              index > 0 ? "border-t border-border" : ""
            }`}
          >
            <kbd className="min-w-[124px] shrink-0 rounded-lg bg-tag-bg px-2.5 py-1 text-center font-mono text-[11px] text-text-primary">
              {control.key}
            </kbd>
            <span className="text-xs leading-relaxed text-text-secondary">
              {control.action}
            </span>
          </div>
        ))}
      </div>

      <SectionHeading>어디에 세울지</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        끌어서 옮길 수 있고, 어디에 뒀는지 기억합니다. 창이 연결된 모든
        디스플레이를 덮기 때문에 다른 모니터로 넘겨도 됩니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        여기엔 정면으로 충돌하는 요구가 둘 있습니다. 창이 클릭을 통과시켜야
        방해가 안 되는데,{" "}
        <strong className="text-text-primary">
          클릭을 통과시키는 창은 잡을 수도 없습니다.
        </strong>{" "}
        그래서 커서가 개바리 위에 있을 때만 창이 마우스를 받도록 전환합니다. 그
        밖의 자리에서는 여전히 클릭이 그대로 통과합니다.
      </p>

      <SectionHeading>서명과 공증</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        Developer ID로 서명하고 애플 공증(notarization)까지 받았습니다. 공증
        티켓이 앱 안에 붙어 있어서 인터넷이 끊긴 상태에서도 경고 없이 열립니다.
        받은 파일이 중간에 변조되지 않았다는 것도 macOS가 확인해 줍니다.
      </p>

      <SectionHeading>알려진 한계</SectionHeading>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-text-secondary">
        <li>· 스스로 돌아다니지는 않습니다. 옮기는 건 끌어야 합니다.</li>
        <li>
          · 커서가 그의 사각형 위에 있는 동안에는 그 아래 창이 클릭을 받지
          못합니다.
        </li>
        <li>
          · 빨라질 때 동작 폭이 커지지는 않습니다. 대신 몸집이 살짝 부풉니다.
        </li>
        <li>· 춤 프레임을 그대로 담고 있어서 앱이 11MB입니다.</li>
      </ul>

      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        Swift + SpriteKit으로 만들었습니다. 개바리는 이 채널의 오리지널
        캐릭터입니다.
      </p>
    </div>
  );
}
