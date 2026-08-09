import type { Metadata } from "next";
import Image from "next/image";
import PlatformTabs from "./PlatformTabs";

const TITLE = "WebSwing — 창 사이를 날아다니는 데스크톱 펫 (맥 · 윈도우)";
const DESCRIPTION =
  "실제로 열려 있는 창의 모서리에 거미줄을 걸고 날아다니는 데스크톱 펫. 맥과 윈도우 모두 받을 수 있습니다. 평소엔 알아서 놀고, 타자를 치면 거미줄을 타고 올라가고, 클릭한 자리에 거미줄을 쏘고, 필요 없을 땐 눈만 남기고 사라집니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/webswing" },
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
    url: "https://joowonkoh.com/playground/webswing",
    images: [
      {
        url: "https://joowonkoh.com/webswing/screenshot.jpg",
        width: 1100,
        height: 915,
        alt: "WebSwing 히어로가 창 모서리에 거미줄을 걸고 매달려 있는 화면",
      },
    ],
  },
};

const MODE_SWITCHES: { key: string; action: string }[] = [
  { key: "⌘⇧T", action: "타자 모드 켜기 / 끄기" },
  { key: "⌘⇧S", action: "게임 모드 전환" },
  { key: "⌘⇧H", action: "숨기기 / 다시 부르기 — 눈을 클릭해도 돌아옵니다" },
];

const CONTROLS: { key: string; action: string }[] = [
  { key: "Space / 클릭", action: "커서 방향으로 거미줄 발사 · 떼면 놓기" },
  { key: "A · D", action: "좌우 조종, 스윙에 힘 싣기" },
  { key: "S", action: "줄 감기 — 끝까지 감으면 창턱 위로 올라섬" },
  { key: "W", action: "점프" },
  { key: "Esc", action: "원래 모드로 복귀" },
];

const STEPS: { title: string; body: string }[] = [
  {
    title: "내려받고 압축을 푼다",
    body: "WebSwing.zip을 풀면 WebSwing.app 하나가 나옵니다.",
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
    title: "메뉴 막대에서 거미줄 아이콘을 찾는다",
    body: "Dock에는 아이콘이 없습니다. 모드 전환도, 종료도 이 메뉴에서 합니다.",
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
        href="/downloads/WebSwing.zip"
        download
        className="mt-8 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>
          <span className="block font-display text-sm font-semibold text-text-primary">
            WebSwing.zip 내려받기
          </span>
          <span className="mt-1 block text-xs text-text-secondary">
            299KB · macOS 13 이상 · Apple Silicon &amp; Intel · 애플 공증 완료
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-accent-soft px-4 py-2 text-xs font-medium text-accent">
          다운로드
        </span>
      </a>

      <SectionHeading>어떻게 노는가</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        배경화면 위에 투명한 레이어를 한 장 깔고, 그 위에서 히어로가 움직입니다.
        거미줄이 걸리는 지점은 그림이 아니라{" "}
        <strong className="text-text-primary">
          지금 실제로 열려 있는 창의 윗변
        </strong>
        입니다. 크롬을 옮기면 매달릴 자리도 같이 움직이고, 창을 닫으면 그 발판은
        사라집니다.
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient">
          <h3 className="font-display text-sm font-semibold text-text-primary">
            펫 모드 (기본)
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            알아서 창 사이를 스윙하고, 창 위를 걸어다니고, 가끔 커서 쪽으로
            날아옵니다. 아무 데나 클릭하면 바로 그 자리에 거미줄을 쏘고
            타고 올라갑니다.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient">
          <h3 className="font-display text-sm font-semibold text-text-primary">
            타자 모드 (⌘⇧T)
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            화면 아래에서 기다리다가, 타자를 치면 거미줄을 던지고 올라갑니다.
            멈추면 내려오고, 내려오는 중에 다시 치면 그 자리에서 또 올라갑니다.
          </p>
        </div>
        <div className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient">
          <h3 className="font-display text-sm font-semibold text-text-primary">
            게임 모드 (⌘⇧S)
          </h3>
          <p className="mt-2 text-xs leading-relaxed text-text-secondary">
            직접 조종합니다. 점수도 목표도 없습니다. 아크 바닥에서 놓으면
            떨어지고, 올라가는 중에 놓으면 날아갑니다. 그 타이밍이 전부입니다.
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs leading-relaxed text-text-muted">
        클릭을 가로채지는 않습니다. 누르던 앱은 그 클릭을 그대로 받고, 히어로는
        어디를 눌렀는지만 알아챕니다.
      </p>

      <SectionHeading>타자 모드</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        어느 앱에서 치든 반응합니다. 빠르게 오래 칠수록 높이 올라가고, 한 문장쯤
        치면 화면 꼭대기까지 갑니다. 잠깐 멈추면 가라앉기 시작하고, 내려오는 중에
        다시 치면 바닥까지 기다릴 것 없이 그 자리에서 다시 올라갑니다. 바닥에
        닿으면 거미줄이 사라집니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        메뉴의 <strong className="text-text-primary">돌아다니기</strong> 항목이
        바닥에서 뭘 할지를 정합니다. 어슬렁거리거나, 내린 자리에 그대로 서
        있거나. 이 설정도 모드도 다음 실행 때 기억합니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        높이는 물리 계산의 결과가 아니라{" "}
        <strong className="text-text-primary">
          얼마나 쳤는지를 그대로 읽은 값
        </strong>
        입니다. 스윙이 어디쯤이었는지에 따라 높이가 달라지면 아무것도 알려주지
        못하니까요.
      </p>

      <SectionHeading>클릭한 자리로</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        펫 모드에서 아무 데나 클릭하면{" "}
        <strong className="text-text-primary">바로 그 지점에</strong> 거미줄이
        붙습니다. 창턱이든 아무것도 없는 배경화면이든 상관없습니다. 줄을 감으며
        그 자리까지 올라간 다음, 도착하면 놓고 하던 일로 돌아갑니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        히어로가 혼자 쏘는 거미줄은 여전히 창의 윗변에만 붙습니다. 걔는 설 자리를
        찾아가는 중이라 허공에 줄을 걸어 봐야 소용이 없으니까요. 사람이 겨눈
        클릭만 예외입니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        거미줄은 위로만 당깁니다. 그래서 히어로보다 아래를 클릭하면 줄이 나가지
        않고, 그쪽으로 건너가 떨어지는 걸로 대신합니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        빠르게 여러 번 눌러도 다 받습니다. 같은 자리를 두 번 누르는 더블클릭만
        한 번으로 세고, 다른 자리를 누르면 그건 새 지시입니다.
      </p>

      <SectionHeading>크기와 디스플레이</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        메뉴의 <strong className="text-text-primary">Size</strong>에서 Tiny(0.5×)
        부터 Large(1.5×)까지 다섯 단계로 고릅니다. 누르면 바로 바뀝니다. 그림만
        커지는 게 아니라 물리도 같이 커져서, 어느 크기에서도 창턱에 발이 제대로
        닿습니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        모니터가 여러 대면 <strong className="text-text-primary">Display</strong>
        에서 어느 화면에 살지 정합니다. 이것도 바로 옮겨갑니다. 다만 옮기는 순간
        하던 동작은 끊깁니다 — 세계가 통째로 바뀌는 거라, 스윙 중이었으면
        거미줄을 놓고 새 화면에서 다시 시작합니다.
      </p>
      <p className="mt-3 text-xs leading-relaxed text-text-muted">
        맥에서는 화면 <em>사이를</em> 건너다니지는 못하고, 어느 화면에 있을지만
        고릅니다. 윈도우 버전은 모든 모니터를 하나로 이어 붙여서 건너다닐 수
        있습니다.
      </p>

      <SectionHeading>안 보이게 치우기</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        <kbd className="rounded bg-tag-bg px-1.5 py-0.5 font-mono text-[11px] text-text-primary">
          ⌘⇧H
        </kbd>
        . 화면 맨 아래로 내려가서 눈만 남고 나머지는 투명해집니다. 다시 누르거나{" "}
        <strong className="text-text-primary">눈을 클릭하면</strong> 원래대로
        돌아와, 하던 모드를 그대로 이어서 합니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        숨기기는 네 번째 모드가 아니라 잠깐 멈춤입니다. 타자 모드였든 게임
        모드였든 그 모드는 그대로 있고, 다시 부르면 뭐였는지 기억할 필요 없이
        이어집니다. 회의 화면 공유 직전에 한 번 누르라고 만든 기능입니다.
      </p>

      <figure className="mt-6 overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient">
        <Image
          src="/webswing/hidden-eyes.png"
          alt="화면 아래쪽에 흰 눈 두 개만 남아 있는 모습"
          width={650}
          height={410}
          // 실제 화면에서는 눈 두 개가 이만한 크기다. 원본 배율로 큼직하게
          // 띄우면 실물보다 훨씬 눈에 띄는 것처럼 보인다.
          className="mx-auto mt-5 h-auto w-full max-w-[280px] rounded-xl"
          unoptimized
        />
        <figcaption className="px-5 py-3 text-[11px] leading-relaxed text-text-muted">
          숨긴 상태. 화면 맨 아래에 이만큼만 남습니다 — 클릭해서 다시 부를 수
          있을 만큼은 보이라고 눈에 검은 테를 둘렀습니다.
        </figcaption>
      </figure>

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
        {MODE_SWITCHES.map((control, index) => (
          <div
            key={control.key}
            className={`flex items-center gap-4 px-5 py-3 ${
              index > 0 ? "border-t border-border" : ""
            }`}
          >
            <kbd className="min-w-[104px] shrink-0 rounded-lg bg-tag-bg px-2.5 py-1 text-center font-mono text-[11px] text-text-primary">
              {control.key}
            </kbd>
            <span className="text-xs leading-relaxed text-text-secondary">
              {control.action}
            </span>
          </div>
        ))}
      </div>
      <p className="mt-3 text-xs leading-relaxed text-text-muted">
        아래는 게임 모드에서만 씁니다.
      </p>
      <div className="mt-2 overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient">
        {CONTROLS.map((control, index) => (
          <div
            key={control.key}
            className={`flex items-center gap-4 px-5 py-3 ${
              index > 0 ? "border-t border-border" : ""
            }`}
          >
            <kbd className="min-w-[104px] shrink-0 rounded-lg bg-tag-bg px-2.5 py-1 text-center font-mono text-[11px] text-text-primary">
              {control.key}
            </kbd>
            <span className="text-xs leading-relaxed text-text-secondary">
              {control.action}
            </span>
          </div>
        ))}
      </div>

      <SectionHeading>알려진 한계</SectionHeading>
      <ul className="mt-4 space-y-2 text-sm leading-relaxed text-text-secondary">
        <li>· 메인 디스플레이에서만 동작합니다. 외장 모니터는 아직입니다.</li>
        <li>
          · 전체 화면 앱 위에서는 창 정보를 읽을 수 없어 히어로가 화면 바닥에서
          놉니다.
        </li>
      </ul>

      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        Swift + SpriteKit으로 만들었습니다. 등장하는 캐릭터는 이 프로젝트를 위해
        그린 오리지널 캐릭터입니다.
      </p>
    </div>
  );
}

export default function WebSwingPage() {
  return (
    <div className="animate-fade-in-up">
      <span className="mb-4 inline-block rounded-full bg-accent-soft px-3 py-1 text-[11px] font-medium uppercase tracking-[0.15em] text-accent">
        Desktop App
      </span>
      <h1 className="font-display text-3xl font-bold leading-snug tracking-tight md:text-4xl">
        WebSwing
      </h1>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        {DESCRIPTION}
      </p>

      <figure className="mt-8 overflow-hidden rounded-2xl border border-border bg-card-bg shadow-ambient">
        <Image
          src="/webswing/screenshot.webp"
          alt="밤의 빌딩 숲 배경화면 위에서, 히어로가 창 모서리에 거미줄을 걸고 매달려 있는 실제 실행 화면"
          width={1100}
          height={915}
          className="h-auto w-full"
          unoptimized
          priority
        />
        <figcaption className="px-5 py-3 text-[11px] leading-relaxed text-text-muted">
          실제 실행 화면. 거미줄이 붙은 저 지점은 배경 그림이 아니라 그때 열려
          있던 창의 윗변입니다.
        </figcaption>
      </figure>

      <PlatformTabs mac={<MacPanel />} />
    </div>
  );
}
