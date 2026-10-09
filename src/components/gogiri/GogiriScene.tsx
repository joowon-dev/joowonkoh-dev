import type { ReactNode } from "react";
import EatScene from "./EatScene";
import InfoScene from "./InfoScene";
import MenuScene from "./MenuScene";
import { SERIF_HREF } from "./palette";
import { Hold, Seam } from "./stage";
import { BowlScene, CoverScene, DoorScene, LiftScene, RouteScene, SidesScene, VerdictScene, type Score } from "./scenes";

/**
 * 고기리막국수 글의 장면 하나. MDX 에서 이렇게 쓴다.
 *
 *   <GogiriScene kind="route">
 *     판교에서 고기리 계곡 쪽으로…
 *   </GogiriScene>
 *
 * 안쪽 문단은 장면 위에 글로 얹힌다. 글은 MDX 에 남으니 검색에도 읽힌다.
 * 화면 전체를 쓰므로 frontmatter 에 `immersive: true` 가 있는 글에서만 쓴다.
 *
 * 표지 다음 장면부터는 앞 장면 위로 겹쳐 올라와 서서히 나타난다(Seam).
 * 그래서 장면들은 반드시 표지로 시작해야 한다.
 */
type Props =
  | { kind: "cover"; title: string; date?: string; children?: ReactNode }
  | { kind: "route" | "menu" | "bowl" | "lift" | "eat" | "sides" | "info"; children?: ReactNode }
  | { kind: "door"; from?: number; children?: ReactNode }
  | { kind: "verdict"; scores: Score[]; children?: ReactNode };

export default function GogiriScene(props: Props) {
  return (
    <>
      {/* React 가 head 로 올리고 같은 href 는 한 번만 넣는다 */}
      <link rel="stylesheet" href={SERIF_HREF} precedence="default" />
      {props.kind === "cover" ? (
        <Scene {...props} />
      ) : (
        <Seam>
          <Scene {...props} />
        </Seam>
      )}
    </>
  );
}

function Scene(props: Props) {
  switch (props.kind) {
    case "cover":
      return <CoverScene title={props.title} date={props.date}>{props.children}</CoverScene>;
    case "route":
      return <RouteScene>{props.children}</RouteScene>;
    case "door":
      return <DoorScene from={props.from}>{props.children}</DoorScene>;
    case "menu":
      return (
        <Hold>
          <MenuScene>{props.children}</MenuScene>
        </Hold>
      );
    case "bowl":
      return <BowlScene>{props.children}</BowlScene>;
    case "lift":
      return <LiftScene>{props.children}</LiftScene>;
    case "sides":
      return <SidesScene>{props.children}</SidesScene>;
    case "eat":
      return (
        <Hold>
          <EatScene>{props.children}</EatScene>
        </Hold>
      );
    case "verdict":
      return <VerdictScene scores={props.scores}>{props.children}</VerdictScene>;
    case "info":
      // 마지막이지만 앞 장면이 SEAM 만큼 더 길게 붙어 있으니 같이 붙잡아 끝을 맞춘다
      return (
        <Hold>
          <InfoScene>{props.children}</InfoScene>
        </Hold>
      );
  }
}
