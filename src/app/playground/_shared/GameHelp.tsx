"use client";

/**
 * 게임 화면에 붙는 도움말.
 *
 * `<details>`로 만든 이유가 두 가지 있다.
 *
 * 1. 접혀 있어도 내용이 HTML에 그대로 들어간다. useState로 여닫으면 닫힌
 *    동안에는 문서에 아무것도 없어서, 이 페이지들은 눈에 보이는 글자가
 *    300자대인 빈 페이지로 남는다. 반대로 `hidden`으로 숨긴 텍스트를 깔면
 *    숨은 텍스트가 되어 더 나쁘다. 접힘 영역은 둘 다 아닌 정상적인 방법이다.
 * 2. 자바스크립트가 없어도 열리고, 키보드와 스크린리더가 그냥 지원한다.
 *
 * 색은 테마 토큰을 쓰지 않고 직접 박았다. 게임마다 배경이 크림색부터
 * 남색까지 달라서, 어느 배경 위에서도 읽히는 어두운 패널 하나로 고정하는
 * 편이 확실하다.
 */

export interface HelpSection {
  heading: string;
  /** 한 문단씩. 줄바꿈 대신 배열로 두어 문단 사이 간격을 컴포넌트가 잡는다 */
  body: string[];
}

export interface GameHelpContent {
  title: string;
  /** 한 줄 소개. 제목 바로 아래 굵게 들어간다 */
  summary: string;
  sections: HelpSection[];
}

export default function GameHelp({
  help,
  className = "absolute top-3 right-3",
}: {
  help: GameHelpContent;
  /**
   * 붙는 자리를 밖에서 정한다. 위치 클래스를 통째로 받는 이유는, 화면을 꽉
   * 채우는 게임은 모서리에 띄워야 하고 본문 흐름 안에 있는 게임(낙서 댄스,
   * 부장님 째려보기)은 그냥 한 줄 차지하는 게 자연스럽기 때문이다.
   */
  className?: string;
}) {
  return (
    <details
      className={`group z-50 ${className}`}
      // 종이비행기처럼 화면 전체가 조작 영역인 게임이 있다. 막아주지 않으면
      // 도움말을 누른 게 비행기를 당긴 것으로도 같이 먹힌다.
      onPointerDown={(e) => e.stopPropagation()}
    >
      <summary
        className="flex h-9 w-fit cursor-pointer list-none items-center gap-1.5 rounded-full bg-black/55 px-3 text-xs font-semibold text-white backdrop-blur-sm transition-colors hover:bg-black/70 [&::-webkit-details-marker]:hidden"
        aria-label={`${help.title} 도움말`}
      >
        <span aria-hidden className="text-sm leading-none">
          ?
        </span>
        도움말
      </summary>

      {/* 패널은 화면 오른쪽 위에 고정해서 게임 UI 위로 덮는다.
          긴 설명이 들어가므로 최대 높이를 두고 스크롤을 허용한다. */}
      <div className="mt-2 max-h-[70vh] w-[min(20rem,calc(100vw-1.5rem))] overflow-y-auto rounded-2xl bg-[#12172a] p-4 text-left shadow-xl ring-1 ring-white/10">
        <h2 className="text-base font-bold text-white">{help.title}</h2>
        <p className="mt-1 text-[13px] leading-relaxed font-medium break-keep text-[#c7cee8]">
          {help.summary}
        </p>

        {help.sections.map((section) => (
          <section key={section.heading} className="mt-4">
            <h3 className="text-[11px] font-semibold tracking-[0.1em] text-[#8b93b5] uppercase">
              {section.heading}
            </h3>
            {section.body.map((paragraph, i) => (
              <p
                key={i}
                className="mt-1.5 text-[13px] leading-relaxed break-keep text-[#dfe4f5]"
              >
                {paragraph}
              </p>
            ))}
          </section>
        ))}

        <p className="mt-4 text-[11px] text-[#6f779a]">
          다시 누르면 닫힙니다
        </p>
      </div>
    </details>
  );
}
