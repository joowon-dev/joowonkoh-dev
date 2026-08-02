import type { Metadata } from "next";
import Image from "next/image";
import PlatformTabs from "./PlatformTabs";

const TITLE = "WebSwing — 창 사이를 날아다니는 맥 데스크톱 펫";
const DESCRIPTION =
  "실제로 열려 있는 창의 모서리에 거미줄을 걸고 날아다니는 맥 데스크톱 펫. 평소엔 알아서 놀고, 타자를 치면 거미줄을 타고 올라가고, 단축키를 누르면 직접 조종할 수 있습니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "https://joowonkoh.com/playground/webswing" },
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
            208KB · macOS 13 이상 · Apple Silicon &amp; Intel · 애플 공증 완료
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
            날아옵니다. 클릭은 그대로 통과하기 때문에 작업을 방해하지 않습니다.
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

      <SectionHeading>서명과 공증</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        Developer ID로 서명하고 애플 공증(notarization)까지 받았습니다. 공증
        티켓이 앱 안에 붙어 있어서 인터넷이 끊긴 상태에서도 경고 없이 열립니다.
        받은 파일이 중간에 변조되지 않았다는 것도 macOS가 확인해 줍니다.
      </p>

      <SectionHeading>권한은 필요 없습니다</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        화면 기록도, 손쉬운 사용도 요청하지 않습니다. 창의{" "}
        <strong className="text-text-primary">위치와 크기</strong>만 읽는데, 이건
        권한 없이 읽을 수 있는 값입니다. 창의 <em>제목</em>은 권한이 필요하지만
        WebSwing은 제목을 아예 쓰지 않습니다. 전역 단축키도 권한이 필요 없는
        방식으로 등록합니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        타자 모드도 키보드를 엿보지 않습니다. 무슨 키를 눌렀는지 알려주는 API는
        전부 권한을 요구하는데, WebSwing이 읽는 건{" "}
        <strong className="text-text-primary">
          마지막 키 입력이 몇 초 전이었나
        </strong>{" "}
        하나뿐입니다. 어떤 키였는지는 묻지도 않고 알 수도 없습니다. 이 값이 0으로
        되돌아간 횟수를 세면 타자 수가 됩니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        네트워크도 쓰지 않습니다. 저장하는 건 마지막 모드와 돌아다니기 설정
        둘뿐이고, 지우고 싶으면 앱만 휴지통에 넣으면 끝입니다.
      </p>

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
