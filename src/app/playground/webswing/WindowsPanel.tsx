"use client";

/**
 * 윈도우 버전 안내.
 *
 * 한동안 타이핑으로 여는 가림막 뒤에 있었다. 실제 윈도우 PC에서 확인이 끝나
 * 공개로 돌렸고, 그때 PlatformTabs 의 잠금과 dynamic import 를 함께 걷어냈다.
 */

type Step = {
  title: string;
  body: React.ReactNode;
  /** 이 단계에서 직접 눌러 받을 것이 있으면 */
  link?: {
    href: string;
    label: string;
    note: string;
    /** 다른 사이트로 나가는 링크. 새 탭으로 연다. */
    external?: boolean;
    /** 버튼 글자. 외부 링크라도 파일이 바로 받아지면 "다운로드"가 맞다. */
    cta?: string;
  };
};

const STEPS: Step[] = [
  {
    title: ".NET 9 데스크톱 런타임을 먼저 깐다",
    body: "이 빌드는 런타임을 포함하지 않습니다(116KB인 이유). 없으면 실행해도 아무 일도 안 일어난 것처럼 보입니다. 아래를 누르면 x64 설치 파일이 바로 받아집니다 — 목록에서 SDK 와 ASP.NET 중에 고를 일이 없습니다.",
    link: {
      // 목록 페이지가 아니라 설치 파일로 바로 간다. 그 페이지에는 SDK ·
      // ASP.NET · Desktop 이 아키텍처별로 늘어서 있어서, 필요한 하나를 고르는
      // 것 자체가 이 단계에서 사람이 가장 많이 틀리는 지점이다.
      //
      // aka.ms 별칭은 최신 패치로 마이크로소프트가 리디렉션해 준다. 버전을
      // 박아 두면 몇 달 뒤 낡은 빌드를 받게 되므로 별칭 쪽이 맞다.
      href: "https://aka.ms/dotnet/9.0/windowsdesktop-runtime-win-x64.exe",
      label: ".NET 9 데스크톱 런타임 (x64) 바로 받기",
      note: "약 60MB · 마이크로소프트 공식 · 무료 · 누르면 바로 다운로드",
      external: true,
      cta: "다운로드",
    },
  },
  {
    title: "이 파일을 다운받는다",
    body: "위의 런타임을 깔고 나서 받는 편이 낫습니다. 런타임이 없으면 실행해도 아무 반응이 없어서 파일이 깨진 줄로 오해하기 쉽습니다.",
    link: {
      // 주소는 릴리스가 바뀌어도 이대로 둔다. 파일 이름에 빌드 해시를 달면
      // 새 빌드마다 크롬과 SmartScreen 입장에서 세상에 처음 나온 파일이 되고,
      // 조금씩 쌓이던 다운로드 평판이 매번 0으로 돌아간다. 경고를 줄이는
      // 쪽이 캐시를 깨는 쪽보다 중요하다.
      href: "/downloads/WebSwing-win-x64.zip",
      label: "WebSwing (Windows) 내려받기",
      note: "116KB · Windows 10 1809 이상 · 64비트 · 서명 없음",
    },
  },
  {
    title: "압축을 풀고 폴더째 둔다",
    body: "WebSwing.exe 혼자로는 안 됩니다. 옆의 DLL과 Resources 폴더가 같이 있어야 합니다.",
  },
  {
    title: "WebSwing.exe 를 실행한다",
    body: "서명이 없어서 SmartScreen이 막습니다. 추가 정보 → 실행을 한 번 눌러주면 그다음부터는 안 묻습니다.",
  },
  {
    title: "알림 영역에서 거미줄 아이콘을 찾는다",
    body: "윈도우 11은 새 아이콘을 기본으로 숨깁니다. 시계 옆 ^ 를 눌러 꺼내서 작업 표시줄에 고정하세요.",
  },
];

const TRAY_OPTIONS: { title: string; body: string }[] = [
  {
    title: "Monitor — 어느 화면에서 살지",
    body: "기본은 모든 모니터를 하나의 화면처럼 쓰는 것입니다. 왼쪽 모니터에서 출발해 오른쪽으로 건너갈 수 있습니다. 특정 모니터 하나를 고르면 그 화면이 전부가 되고 나머지는 건드리지 않습니다 — 발표하거나 작업 중인 화면에 끼어들지 않게요. 누르면 바로 옮겨갑니다.",
  },
  {
    title: "Size — 얼마나 클지",
    body: "Tiny(0.5×)부터 Large(1.5×)까지 다섯 단계. 바로 적용됩니다. 그림만 커지는 게 아니라 물리도 같이 커져서, 어느 크기에서도 창턱에 발이 제대로 닿습니다.",
  },
  {
    title: "Wander Along the Bottom — 바닥에서 뭘 할지",
    body: "타자 모드에서 바닥에 있을 때 어슬렁거릴지, 내린 자리에 서 있을지를 정합니다.",
  },
];

const CONTROLS: { key: string; action: string }[] = [
  { key: "Ctrl+Shift+T", action: "타자 모드 켜기 / 끄기" },
  { key: "Ctrl+Shift+S", action: "게임 모드 전환" },
  {
    key: "Ctrl+Shift+H",
    action: "숨기기 / 다시 부르기 — 눈을 클릭해도 돌아옵니다",
  },
  { key: "Space / 클릭", action: "커서 방향으로 거미줄 발사 · 떼면 놓기" },
  { key: "A · D", action: "좌우 조종, 스윙에 힘 싣기" },
  { key: "S", action: "줄 감기 — 끝까지 감으면 창턱 위로 올라섬" },
  { key: "W", action: "점프" },
  { key: "Esc", action: "원래 모드로 복귀" },
];

function SectionHeading({
  children,
  className = "mt-14",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <h2
      className={`${className} font-display text-xl font-bold tracking-tight md:text-2xl`}
    >
      {children}
    </h2>
  );
}

/** 단계 안에 들어가는 받기 버튼. 내부 파일이면 download, 외부면 새 탭. */
function StepLink({ link }: { link: NonNullable<Step["link"]> }) {
  return (
    <a
      href={link.href}
      {...(link.external
        ? { target: "_blank", rel: "noreferrer noopener" }
        : { download: true })}
      className="mt-3 flex items-center justify-between gap-3 rounded-xl border border-border bg-tag-bg p-3 spring-transition hover:border-accent/40 hover:shadow-ambient active:scale-[0.99]"
    >
      <span>
        <span className="block text-xs font-semibold text-text-primary">
          {link.label}
        </span>
        <span className="mt-0.5 block text-[11px] text-text-muted">
          {link.note}
        </span>
      </span>
      <span className="shrink-0 rounded-full bg-accent-soft px-3 py-1.5 text-[11px] font-medium text-accent">
        {link.cta ?? (link.external ? "받으러 가기" : "다운로드")}
      </span>
    </a>
  );
}

export default function WindowsPanel() {
  return (
    <div>
      <SectionHeading className="mt-8">설치하기</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        순서가 중요합니다. 런타임을 먼저 깔아야 두 번째 파일이 실행됩니다.
      </p>
      <ol className="mt-4 space-y-3">
        {STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient"
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent">
              {index + 1}
            </span>
            <div className="min-w-0 flex-1">
              <span className="block font-display text-sm font-semibold text-text-primary">
                {step.title}
              </span>
              <span className="mt-1 block text-xs leading-relaxed text-text-secondary">
                {step.body}
              </span>
              {step.link && <StepLink link={step.link} />}
            </div>
          </li>
        ))}
      </ol>

      <SectionHeading>조작</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        모드가 하는 일은 맥과 같습니다 — macOS 탭의 설명을 보세요. 단축키만
        <kbd className="mx-1 rounded bg-tag-bg px-1.5 py-0.5 font-mono text-[11px] text-text-primary">
          Ctrl+Shift
        </kbd>
        조합으로 다릅니다. 펫 모드에서 아무 데나 클릭하면 바로 그 자리에 거미줄을
        쏘고 타고 올라갑니다.
      </p>
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

      <SectionHeading>트레이 메뉴에서 정할 수 있는 것</SectionHeading>
      <div className="mt-4 space-y-3">
        {TRAY_OPTIONS.map((option) => (
          <div
            key={option.title}
            className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient"
          >
            <h3 className="font-display text-sm font-semibold text-text-primary">
              {option.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {option.body}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        C# + WPF로 만들었습니다. 로직은 윈도우를 모르는 별도 프로젝트에 있어서
        맥에서도 테스트가 돌아갑니다.
      </p>
    </div>
  );
}
