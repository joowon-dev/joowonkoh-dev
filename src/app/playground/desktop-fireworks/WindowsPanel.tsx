"use client";

import { LATEST } from "./releases";

/**
 * 윈도우 버전 안내. WebSwing·몰래 야구의 같은 파일과 같은 뼈대다.
 *
 * 여기도 런타임을 담지 않는 빌드라 순서가 중요하다 — 런타임 없이 실행하면
 * 아무 반응이 없어서 파일이 깨진 줄로 오해한다. 그래서 받는 링크를
 * 단계 안에 넣어 두고, 목록 페이지가 아니라 설치 파일로 바로 보낸다.
 *
 * 이 앱만의 사정이 하나 있다. 창을 투명하게 만드는 방식이 시리즈의 다른 앱과 다르고,
 * **아직 실제 윈도우에서 확인되지 않았다.** 숨기지 않고 마지막 단계에 적어 둔다 —
 * 안 되는 걸 모르고 받는 것보다 알고 받는 편이 낫다.
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
    body: "이 빌드는 런타임을 포함하지 않습니다(600KB인 이유). 없으면 실행해도 아무 일도 안 일어난 것처럼 보입니다. 아래를 누르면 x64 설치 파일이 바로 받아집니다 — 목록에서 SDK 와 ASP.NET 중에 고를 일이 없습니다.",
    link: {
      // 목록이 아니라 설치 파일로 바로 보낸다.
      // aka.ms 별칭은 마이크로소프트가 최신 패치로 리디렉션해 준다.
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
      // 주소는 릴리스가 바뀌어도 이대로 둔다. 파일 이름에 버전을 달면
      // 새 빌드마다 크롬과 SmartScreen 입장에서 세상에 처음 나온 파일이 되고,
      // 조금씩 쌓이던 다운로드 평판이 매번 0으로 돌아간다.
      href: LATEST.windows.href,
      label: "바탕화면 불꽃놀이 (Windows) 내려받기",
      note: `${LATEST.version} · ${LATEST.windows.size} · Windows 10 1809 이상 · 64비트 · 서명 없음`,
    },
  },
  {
    title: "압축을 풀고 폴더째 둔다",
    body: "DesktopFireworks.exe 혼자로는 안 됩니다. 옆의 DLL과 web 폴더가 같이 있어야 합니다. web 폴더 안에 쇼가 통째로 들어 있습니다.",
  },
  {
    title: "DesktopFireworks.exe 를 실행한다",
    body: "서명이 없어서 SmartScreen이 막습니다. 추가 정보 → 실행을 한 번 눌러주면 그다음부터는 안 묻습니다. 실행하면 바로 쇼가 시작됩니다.",
  },
  {
    title: "알림 영역에서 불꽃 아이콘을 찾는다",
    body: "윈도우 11은 새 아이콘을 기본으로 숨깁니다. 시계 옆 ^ 를 눌러 꺼내서 작업 표시줄에 고정하세요. 소리 크기도, 모니터 선택도, 종료도 이 메뉴에서 합니다.",
  },
  {
    title: "투명하게 안 뜨면 알려주세요",
    body: "솔직히 적습니다 — 이 앱의 윈도우 버전은 아직 실제 윈도우에서 실행해 본 적이 없습니다. 맥에서 컴파일과 CI 빌드까지만 확인했습니다. 불꽃은 반투명한 픽셀이 대부분이라 시리즈의 다른 앱과는 다른 방식(DWM 픽셀 단위 알파)으로 창을 뚫었는데, 그게 실물에서 어떻게 나올지는 봐야 압니다. 창이 까맣게 덮이거나 아무것도 안 보이면 그 문제입니다.",
  },
];

const CONTROLS: { key: string; action: string }[] = [
  { key: "Alt+Shift+F", action: "쇼를 처음부터 다시" },
  { key: "Alt+Shift+H", action: "숨기기 / 다시 부르기" },
  { key: "알림 영역 아이콘", action: "소리 크기 · 모니터 선택 · 종료" },
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
        쇼는 알아서 돕니다. 아래 키는 다시 보거나 잠깐 치울 때만 씁니다 — 맥에서
        <kbd className="mx-1 rounded bg-tag-bg px-1.5 py-0.5 font-mono text-[11px] text-text-primary">
          ⌥⇧
        </kbd>
        가 하던 자리를 윈도우에서는
        <kbd className="mx-1 rounded bg-tag-bg px-1.5 py-0.5 font-mono text-[11px] text-text-primary">
          Alt+Shift
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
        C# + WebView2로 만들었습니다. 쇼 자체는 맥 버전과 완전히 같은 HTML·Canvas
        파일이고, 창을 만드는 껍데기만 플랫폼별로 다릅니다.
      </p>
    </div>
  );
}
