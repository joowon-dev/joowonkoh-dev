"use client";

/**
 * 윈도우 버전 안내. PlatformTabs 가 잠금을 푼 뒤에만 dynamic import 로 불러온다.
 * 잠겨 있는 동안에는 이 파일의 내용도, 아래 다운로드 주소도 페이지에 없다.
 */

type Step = {
  title: string;
  body: React.ReactNode;
  /** 이 단계에서 직접 눌러 받을 것이 있으면 */
  link?: { href: string; label: string; note: string; external?: boolean };
};

const STEPS: Step[] = [
  {
    title: ".NET 9 데스크톱 런타임을 먼저 깐다",
    body: "이 빌드는 런타임을 포함하지 않습니다(108KB인 이유). 없으면 실행할 때 아무 일도 안 일어난 것처럼 보입니다. 받는 곳에서 Desktop Runtime 의 x64 를 고르세요 — SDK 나 ASP.NET 쪽이 아닙니다.",
    link: {
      href: "https://dotnet.microsoft.com/download/dotnet/9.0",
      label: ".NET 9 데스크톱 런타임 받는 곳",
      note: "dotnet.microsoft.com · 마이크로소프트 공식 · 무료",
      external: true,
    },
  },
  {
    title: "이 파일을 다운받는다",
    body: "위의 런타임을 깔고 나서 받는 편이 낫습니다. 런타임이 없으면 실행해도 아무 반응이 없어서 파일이 깨진 줄로 오해하기 쉽습니다.",
    link: {
      href: "/downloads/WebSwing-win-x64-preview-8f3a2c.zip",
      label: "WebSwing (Windows) 내려받기",
      note: "108KB · Windows 10 1809 이상 · 64비트 · 서명 없음",
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

const CONTROLS: { key: string; action: string }[] = [
  { key: "Ctrl+Shift+T", action: "타자 모드 켜기 / 끄기" },
  { key: "Ctrl+Shift+S", action: "게임 모드 전환" },
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
        {link.external ? "받으러 가기" : "다운로드"}
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

      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        C# + WPF로 만들었습니다. 로직은 윈도우를 모르는 별도 프로젝트에 있어서
        맥에서도 테스트가 돌아갑니다.
      </p>
    </div>
  );
}
