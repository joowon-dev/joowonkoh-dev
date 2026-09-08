"use client";

/**
 * 윈도우 버전 안내. WebSwing 의 같은 파일과 같은 뼈대다.
 *
 * 여기도 런타임을 담지 않는 빌드라 순서가 중요하다 — 런타임 없이 실행하면
 * 아무 반응이 없어서 파일이 깨진 줄로 오해한다. 그래서 받는 링크를
 * 단계 안에 넣어 두고, 목록 페이지가 아니라 설치 파일로 바로 보낸다.
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
    body: "이 빌드는 런타임을 포함하지 않습니다(앱이 1MB도 안 되는 이유). 없으면 실행해도 아무 일도 안 일어난 것처럼 보입니다. 아래를 누르면 x64 설치 파일이 바로 받아집니다 — 목록에서 SDK 와 ASP.NET 중에 고를 일이 없습니다.",
    link: {
      // WebSwing 페이지와 같은 이유로 목록이 아니라 설치 파일로 바로 보낸다.
      // aka.ms 별칭은 마이크로소프트가 최신 패치로 리디렉션해 준다.
      href: "https://aka.ms/dotnet/9.0/windowsdesktop-runtime-win-x64.exe",
      label: ".NET 9 데스크톱 런타임 (x64) 바로 받기",
      note: "약 60MB · 마이크로소프트 공식 · 무료 · 누르면 바로 다운로드",
      external: true,
      cta: "다운로드",
    },
  },
  {
    title: "설치 파일을 다운받는다",
    body: "위의 런타임을 깔고 나서 받는 편이 낫습니다. 런타임이 없으면 실행해도 아무 반응이 없어서 파일이 깨진 줄로 오해하기 쉽습니다.",
    link: {
      // 주소는 릴리스가 바뀌어도 이대로 둔다. 파일 이름에 빌드 해시를 달면
      // 새 빌드마다 크롬과 SmartScreen 입장에서 세상에 처음 나온 파일이 되고,
      // 조금씩 쌓이던 다운로드 평판이 매번 0으로 돌아간다.
      href: "/downloads/SneakyBaseball-win-Setup.exe",
      label: "몰래 야구 설치 파일 (Windows) 내려받기",
      note: "1.2.0 · 2.4MB · Windows 10 1809 이상 · 64비트 · 서명 없음",
    },
  },
  {
    title: "설치 파일을 실행한다",
    body: "서명이 없어서 SmartScreen이 한 번 막습니다. 추가 정보 → 실행을 누르면 됩니다. 관리자 권한은 안 물어봅니다 — 내 사용자 폴더에만 깝니다. 다음만 누르면 끝나고, 「윈도우를 켤 때 함께 실행」은 원하면 체크하세요.",
  },
  {
    title: "압축본이 편하면 그걸 받아도 된다",
    body: "설치하지 않고 폴더째 두고 쓰는 쪽이 편하면 이쪽입니다. 대신 SneakyBaseball.exe 혼자로는 안 됩니다 — 옆의 DLL과 web 폴더가 같이 있어야 합니다. 자동 업데이트는 설치본만 받으므로, 압축본을 쓰면 새 버전은 직접 받아야 합니다.",
    link: {
      href: "/downloads/SneakyBaseball-win-x64.zip",
      label: "압축본 (설치 없이 쓰기)",
      note: "1.2.0 · 667KB · 자동 업데이트 안 됨",
    },
  },
  {
    title: "알림 영역에서 야구공을 찾는다",
    body: "윈도우 11은 새 아이콘을 기본으로 숨깁니다. 시계 옆 ^ 를 눌러 꺼내서 작업 표시줄에 고정하세요. 최고 비거리도, 종료도 이 메뉴에서 합니다. 유니폼도 여기서 고릅니다 — 처음엔 롯데를 입고 나오고, KBO 10개 구단의 홈·원정을 타자와 투수에게 따로 입힐 수 있습니다. 모니터가 여러 대면 어느 화면에 띄울지도 고릅니다. 투수 거리도 여기서 고릅니다 — 투수를 당기면 공이 일찍 와서 어려워집니다.",
  },
  {
    title: "스윙이 안 되거나 창 메뉴가 뜨면 조작키를 바꾼다",
    body: "윈도우는 Alt+Space 를 창 메뉴로 먼저 가져갑니다. 스윙이 안 들어가거나 메뉴가 뜨면 알림 영역 메뉴의 조작키에서 Alt+Shift 같은 다른 조합으로 바꾸세요.",
  },
  {
    title: "다음부터는 앱이 알려준다",
    body: "새 버전이 나오면 알림 영역 메뉴에 「새 버전 설치」가 생깁니다. 눌러야만 갈아 끼웁니다. 설치본으로 깐 경우에만 됩니다.",
  },
];

const CONTROLS: { key: string; action: string }[] = [
  { key: "Alt 누르고 있기", action: "누르고 있는 동안만 투수가 던집니다. 떼면 바로 멈춥니다" },
  { key: "Alt + Space", action: "스윙" },
  { key: "Ctrl+Shift+B", action: "숨기기 / 다시 부르기" },
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
        순서가 중요합니다. 런타임을 먼저 깔아야 설치 파일이 실행됩니다.
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
        규칙은 맥과 똑같습니다 — macOS 탭의 설명을 보세요. 맥에서
        <kbd className="mx-1 rounded bg-tag-bg px-1.5 py-0.5 font-mono text-[11px] text-text-primary">
          ⌥
        </kbd>
        가 하던 자리를 윈도우에서는
        <kbd className="mx-1 rounded bg-tag-bg px-1.5 py-0.5 font-mono text-[11px] text-text-primary">
          Alt
        </kbd>
        가 합니다.
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

      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        C# + WebView2로 만들었습니다. 게임 자체는 맥 버전과 완전히 같은 HTML·Canvas
        파일이고, 창을 만드는 껍데기만 플랫폼별로 다릅니다.
      </p>
    </div>
  );
}
