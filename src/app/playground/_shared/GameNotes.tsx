import type { GameHelpContent } from "./GameHelp";

/**
 * GameHelp와 같은 내용을, 접지 않고 본문으로 펼쳐 놓는 것.
 *
 * GameHelp는 게임이 화면을 덮고 있을 때 쓰는 물건이라 «?» 알약 하나로
 * 접혀 있다. 접힘 영역이라 HTML에는 글이 들어 있지만, 화면만 보면 이
 * 페이지들은 캔버스 한 장에 버튼 몇 개가 전부다. 사람이 봐도 크롤러가
 * 렌더해서 봐도 «읽을 것이 없는 페이지»로 남는다.
 *
 * 그래서 게임이 아직 시작 전인 화면 — 사이트 레이아웃 안에 얌전히 들어가
 * 있는 그 상태 — 에서는 접지 않고 그냥 펼쳐 둔다. 놀러 온 사람은 위의
 * 버튼을 누르면 되고, 규칙이 궁금하거나 어떻게 만들었는지 궁금한 사람은
 * 내려서 읽으면 된다. 어느 쪽도 뭘 눌러서 열 필요가 없다.
 *
 * 색을 variant로 가르는 이유: 대부분은 사이트 테마 위에 놓이지만
 * 똥 말랑만 크림색 배경을 직접 칠하고 있어서, 테마 토큰을 그대로 쓰면
 * 다크 모드에서 크림 배경에 흰 글씨가 얹힌다.
 */
export default function GameNotes({
  help,
  variant = "site",
  className = "",
}: {
  help: GameHelpContent;
  variant?: "site" | "warm";
  className?: string;
}) {
  const warm = variant === "warm";

  const tone = {
    card: warm
      ? "border-[#e7d3c4] bg-[#fffaf5]"
      : "border-border bg-card-bg shadow-ambient",
    heading: warm ? "text-[#4a352c]" : "text-text-primary",
    label: warm ? "text-[#b08d7a]" : "text-text-muted",
    body: warm ? "text-[#8a6b5c]" : "text-text-secondary",
  };

  return (
    <section className={`mx-auto w-full max-w-lg text-left ${className}`}>
      {/* 제목은 페이지 위쪽 h1이 이미 말했다. 여기서 반복하지 않는다. */}
      <h2 className={`font-display text-lg font-bold tracking-tight ${tone.heading}`}>
        이건 뭔가요
      </h2>
      <p className={`mt-2 text-sm leading-[1.8] break-keep ${tone.body}`}>
        {help.summary}
      </p>

      <div className="mt-6 space-y-4">
        {help.sections.map((section) => (
          <article
            key={section.heading}
            className={`rounded-2xl border p-5 ${tone.card}`}
          >
            <h3
              className={`text-[11px] font-semibold tracking-[0.12em] uppercase ${tone.label}`}
            >
              {section.heading}
            </h3>
            {section.body.map((paragraph, i) => (
              <p
                key={i}
                className={`mt-2 text-sm leading-[1.8] break-keep ${tone.body}`}
              >
                {paragraph}
              </p>
            ))}
          </article>
        ))}
      </div>
    </section>
  );
}
