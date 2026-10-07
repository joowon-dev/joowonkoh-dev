import type { ReactNode } from "react";
import EatScene from "./EatScene";
import InfoScene from "./InfoScene";
import MenuScene from "./MenuScene";
import { SERIF_HREF } from "./palette";
import { BowlScene, CoverScene, RouteScene, VerdictScene, WaitingScene, type Score } from "./scenes";

/**
 * 고기리막국수 글의 장면 하나. MDX 에서 이렇게 쓴다.
 *
 *   <GogiriScene kind="route">
 *     판교에서 고기리 계곡 쪽으로…
 *   </GogiriScene>
 *
 * 안쪽 문단은 장면 위에 글로 얹힌다. 글은 MDX 에 남으니 검색에도 읽힌다.
 * 화면 전체를 쓰므로 frontmatter 에 `immersive: true` 가 있는 글에서만 쓴다.
 */
type Props =
  | { kind: "cover"; title: string; date?: string; children?: ReactNode }
  | { kind: "route" | "bowl" | "menu" | "eat" | "info"; children?: ReactNode }
  | { kind: "waiting"; from?: number; children?: ReactNode }
  | { kind: "verdict"; scores: Score[]; children?: ReactNode };

export default function GogiriScene(props: Props) {
  return (
    <>
      {/* React 가 head 로 올리고 같은 href 는 한 번만 넣는다 */}
      <link rel="stylesheet" href={SERIF_HREF} precedence="default" />
      <Scene {...props} />
    </>
  );
}

function Scene(props: Props) {
  switch (props.kind) {
    case "cover":
      return <CoverScene title={props.title} date={props.date}>{props.children}</CoverScene>;
    case "route":
      return <RouteScene>{props.children}</RouteScene>;
    case "waiting":
      return <WaitingScene from={props.from}>{props.children}</WaitingScene>;
    case "menu":
      return <MenuScene>{props.children}</MenuScene>;
    case "bowl":
      return <BowlScene>{props.children}</BowlScene>;
    case "eat":
      return <EatScene>{props.children}</EatScene>;
    case "verdict":
      return <VerdictScene scores={props.scores}>{props.children}</VerdictScene>;
    case "info":
      return <InfoScene>{props.children}</InfoScene>;
  }
}
