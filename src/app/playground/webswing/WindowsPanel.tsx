"use client";

/**
 * 윈도우 버전 안내. PlatformTabs 가 잠금을 푼 뒤에만 dynamic import 로 불러온다.
 * 잠겨 있는 동안에는 이 파일의 내용도, 아래 다운로드 주소도 페이지에 없다.
 */

const STEPS: { title: string; body: string }[] = [
  {
    title: ".NET 9 데스크톱 런타임을 먼저 깐다",
    body: "이 빌드는 런타임을 포함하지 않습니다(108KB인 이유). 없으면 실행할 때 아무 일도 안 일어난 것처럼 보입니다.",
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

const DIFFERENCES: { title: string; body: React.ReactNode }[] = [
  {
    title: "타자 감지가 측정이 아니라 추론입니다",
    body: (
      <>
        맥은 시스템에 &ldquo;마지막 <em>키보드</em> 입력이 언제였나&rdquo;를 직접
        물어볼 수 있습니다. 윈도우엔 그런 API가 없습니다 —{" "}
        <code className="rounded bg-tag-bg px-1 py-0.5 font-mono text-[11px]">
          GetLastInputInfo
        </code>{" "}
        는 마우스까지 뭉뚱그립니다. 제대로 가르는 방법은 전부 키보드를 읽는
        것들이라 쓰지 않았습니다. 대신{" "}
        <strong className="text-text-primary">마우스를 배제하는</strong> 쪽으로
        갑니다. 입력은 있었는데 커서가 안 움직였고 버튼도 안 바뀌었으면 마우스가
        아니다. 조회하는 키는 마우스 버튼 5개뿐이라, 이 앱은 무엇을 쳤는지 알 수
        없습니다. 대신 <strong className="text-text-primary">스크롤이 타자로
        잡히고</strong>, 마우스를 움직이면서 치면 놓칩니다.
      </>
    ),
  },
  {
    title: "트레이 아이콘이 아예 숨겨질 수 있습니다",
    body: (
      <>
        맥은 아이콘을 template로 표시하면 시스템이 알아서 메뉴 막대 색으로
        칠해줍니다. 윈도우엔 그게 없어서 테마를 직접 읽고 다시 그립니다. 더 큰
        문제는 대비가 아니라{" "}
        <strong className="text-text-primary">
          윈도우 11이 새 알림 아이콘을 기본으로 숨긴다
        </strong>
        는 점입니다. 첫 실행이 아무 일도 안 일어난 것처럼 보입니다.
      </>
    ),
  },
  {
    title: "바닥이 작업 표시줄입니다",
    body: (
      <>
        모니터 전체가 아니라 작업 영역을 덮습니다. 작업 표시줄은 늘 거기 있고,
        그 뒤로 걸어 들어가면 고장난 것처럼 보이니까요. 맥은 화면 전체를 덮고
        Dock 뒤를 지나가는데, Dock은 자동으로 숨겨지지만 작업 표시줄은 아닙니다.
      </>
    ),
  },
];

function SectionHeading({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mt-14 font-display text-xl font-bold tracking-tight md:text-2xl">
      {children}
    </h2>
  );
}

export default function WindowsPanel() {
  return (
    <div>
      <div className="mt-8 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient">
        <p className="font-display text-sm font-semibold text-text-primary">
          같은 앱, 같은 숫자
        </p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          맥 버전을 C#으로 옮긴 것입니다. 중력·스윙·타자 모드의 튜닝 상수를
          그대로 가져왔기 때문에 떨어지고 매달리고 올라가는 감각이 맥과
          같습니다. 스프라이트도 같은 생성기가 만든 같은 PNG입니다.
        </p>
      </div>

      <a
        href="/downloads/WebSwing-win-x64-preview-8f3a2c.zip"
        download
        className="mt-4 flex items-center justify-between gap-4 rounded-2xl border border-border bg-card-bg p-5 shadow-ambient spring-transition hover:shadow-ambient-hover hover:scale-[1.01] active:scale-[0.99]"
      >
        <span>
          <span className="block font-display text-sm font-semibold text-text-primary">
            WebSwing (Windows) 내려받기
          </span>
          <span className="mt-1 block text-xs text-text-secondary">
            108KB · Windows 10 1809 이상 · 64비트 ·{" "}
            <strong className="text-text-primary">
              .NET 9 데스크톱 런타임 필요
            </strong>{" "}
            · 서명 없음
          </span>
        </span>
        <span className="shrink-0 rounded-full bg-accent-soft px-4 py-2 text-xs font-medium text-accent">
          다운로드
        </span>
      </a>

      <SectionHeading>먼저 알아야 할 것</SectionHeading>
      <div className="mt-4 rounded-2xl border border-amber-500/30 bg-amber-500/5 p-5">
        <p className="font-display text-sm font-semibold text-text-primary">
          이 빌드는 한 번도 실행된 적이 없습니다
        </p>
        <p className="mt-2 text-xs leading-relaxed text-text-secondary">
          맥에서 만들었고 맥에는 윈도우가 없습니다. 정확히 무엇이 검증됐는지만
          말하면:
        </p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-text-secondary">
          <li>
            ·{" "}
            <strong className="text-text-primary">
              시뮬레이션·로프·두 브레인·타자 모드
            </strong>{" "}
            — 윈도우를 전혀 모르는 별도 프로젝트로 분리해서 단위 테스트 34개로
            검증했습니다. 틀리면 티가 잘 안 나는 부분이라 여기에 힘을 줬습니다.
          </li>
          <li>
            · <strong className="text-text-primary">창 추적·오버레이·트레이·렌더러</strong>{" "}
            — 컴파일과 링크는 통과했지만 실행은 못 해봤습니다. 클릭 통과 설정,
            DPI 계산, Win32 호출 규약은 맞을 거라고 생각할 뿐 증명되지
            않았습니다.
          </li>
        </ul>
        <p className="mt-3 text-xs leading-relaxed text-text-secondary">
          그래서 진단 모드를 넣었습니다. 명령 프롬프트에서{" "}
          <code className="rounded bg-tag-bg px-1 py-0.5 font-mono text-[11px]">
            WebSwing.exe --diagnose
          </code>{" "}
          를 실행하면 스프라이트를 찾았는지, DPI 배율이 얼마인지, 입력 시계가
          살아 있는지, 창을 몇 개나 보고 있는지 찍어줍니다. 이 중 하나만 조용히
          실패해도 증상은 전부 &ldquo;물리가 이상하다&rdquo;로 보입니다.
        </p>
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

      <SectionHeading>맥과 다른 점</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        세 가지가 그대로 옮겨지지 않았습니다. 셋 다 쓰는 사람 눈에 보입니다.
      </p>
      <div className="mt-4 space-y-3">
        {DIFFERENCES.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-border bg-card-bg p-5 shadow-ambient"
          >
            <h3 className="font-display text-sm font-semibold text-text-primary">
              {item.title}
            </h3>
            <p className="mt-2 text-xs leading-relaxed text-text-secondary">
              {item.body}
            </p>
          </div>
        ))}
      </div>

      <SectionHeading>서명이 없습니다</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        SmartScreen이 &ldquo;Windows의 PC 보호&rdquo;를 띄웁니다.{" "}
        <strong className="text-text-primary">추가 정보 → 실행</strong>을 한 번
        누르면 됩니다. 제대로 고치는 건 맥보다 비쌉니다 — 2023년 6월부터
        Authenticode 인증서에 하드웨어 토큰이나 클라우드 HSM이 필요해서 연
        200~400달러쯤 들고, 서명해도 평판이 쌓일 때까지는 경고가 계속 뜹니다.
        애플의 99달러가 훨씬 나은 거래입니다.
      </p>

      <SectionHeading>권한은 여기서도 필요 없습니다</SectionHeading>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        창의 위치와 크기만 읽고 제목이나 내용은 읽지 않습니다. 전역 단축키도
        권한이 필요 없는 방식입니다. 타자 감지는 시스템 입력 시계와 마우스 버튼
        다섯 개만 보고, 키보드 키는 하나도 읽지 않습니다.
      </p>
      <p className="mt-3 text-sm leading-relaxed text-text-secondary">
        윈도우에서는 이게 <em>선택</em>이라는 점이 맥과 다릅니다. 맥은 키보드를
        엿보려면 시스템이 권한을 묻지만, 윈도우는 아무것도 묻지 않습니다. 막아
        주는 게 없으니 안 하기로 정하는 수밖에 없습니다.
      </p>

      <p className="mt-12 text-xs leading-relaxed text-text-muted">
        C# + WPF로 만들었습니다. 로직은 윈도우를 모르는 별도 프로젝트에 있어서
        맥에서도 테스트가 돌아갑니다.
      </p>
    </div>
  );
}
