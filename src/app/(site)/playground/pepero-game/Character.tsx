/**
 * 막대과자를 무는 캐릭터. 오른쪽을 보는 옆모습을 기준으로 그리고,
 * (0,0) 이 입 자리다 — 막대 끝이 여기에 닿는다. 오른쪽 사람은 Stage 에서 좌우를 뒤집는다.
 *
 * 몸·머리(<CharacterBody>)와 입술(<CharacterLips>)을 따로 그린다.
 * 막대를 그 사이에 끼워 그려야 입에 문 것처럼 보이기 때문이다.
 */

export type Expr =
  | "idle" // 막대를 물고 기다림
  | "chew" // 오물오물
  | "nervous" // 가까워져서 긴장
  | "shy" // 다 먹고 수줍
  | "meh" // 남은 게 길어서 머쓱
  | "ouch" // 입술을 깨물렸다
  | "oops" // 깨물어 버렸다
  | "proud" // 도전장 다 만들고 뿌듯
  | "mystery"; // 아직 누군지 모름

export interface CharacterDef {
  name: string;
  hair: string;
  hairLine: string;
  shirt: string;
  skin: string;
  style: "bob" | "spiky" | "pony" | "curly";
}

export const CHARACTERS: CharacterDef[] = [
  { name: "딸기", hair: "#7a4a2c", hairLine: "#4a2a18", shirt: "#ff8fab", skin: "#ffe1cc", style: "bob" },
  { name: "민트", hair: "#2f2a33", hairLine: "#1a161d", shirt: "#6cc4a9", skin: "#ffe4d0", style: "spiky" },
  { name: "바나나", hair: "#f2bd45", hairLine: "#b9821c", shirt: "#8cc8ff", skin: "#ffe6d4", style: "pony" },
  { name: "블루베리", hair: "#4d4f9c", hairLine: "#2c2d66", shirt: "#c3a6f5", skin: "#fbdcc6", style: "curly" },
];

const MYSTERY: CharacterDef = {
  name: "?",
  hair: "#d5c9be",
  hairLine: "#b8a99c",
  shirt: "#e3d9cf",
  skin: "#efe6dd",
  style: "spiky",
};

const LINE = "#4a2f27";

export const charOf = (index: number | "mystery") => (index === "mystery" ? MYSTERY : CHARACTERS[index]);

/** 팔 각도 — 아래로 늘어뜨린 팔에서 얼마나 앞으로 들었나(도). */
const ARM: Partial<Record<Expr, number>> = {
  nervous: -62, // 주먹 꼭 쥐고 배 앞에
  shy: -128,
  ouch: -146, // 입을 감싼다
  oops: -96,
  proud: -168, // 주먹 번쩍
};

export function CharacterBody({ def, expr }: { def: CharacterDef; expr: Expr }) {
  const mystery = expr === "mystery";
  return (
    <g className={expr === "ouch" ? "pp-hop" : expr === "chew" ? "pp-bob" : "pp-breathe"}>
      {/* 몸 */}
      <path d="M-60 96 C-62 52 -54 22 -32 20 C-12 22 -6 52 -8 96 Z" fill={def.shirt} stroke={LINE} strokeWidth={2.4} />
      {!mystery && <path d="M-40 21 Q-32 30 -24 21" fill="none" stroke="#fff" strokeWidth={2.4} opacity={0.8} />}

      <Hair def={def} layer="back" />
      {/* 얼굴 */}
      <circle cx={-28} cy={-14} r={30} fill={def.skin} stroke={LINE} strokeWidth={2.4} />
      {/* 코 */}
      <path d="M0.5 -22.5 Q5 -19.5 1.2 -15" fill={def.skin} stroke={LINE} strokeWidth={2.2} strokeLinecap="round" />
      {/* 귀 */}
      {!mystery && (
        <g>
          <path d="M-44 -15 C-52 -17 -54 -3 -45 -2" fill={def.skin} stroke={LINE} strokeWidth={2.2} strokeLinecap="round" />
          <path d="M-46 -11 Q-49 -9 -46 -6" fill="none" stroke={LINE} strokeWidth={1.4} strokeLinecap="round" />
        </g>
      )}
      <Hair def={def} layer="front" />

      {!mystery && <Face def={def} expr={expr} />}

      {/* 팔 — 어깨를 축으로 돌린다 */}
      <g
        className="pp-arm"
        style={{ transform: `rotate(${ARM[expr] ?? -24}deg)`, transformOrigin: "-26px 34px" }}
      >
        <path d="M-26 34 Q-27 46 -24 54" fill="none" stroke={LINE} strokeWidth={11} strokeLinecap="round" />
        <path d="M-26 34 Q-27 46 -24 54" fill="none" stroke={def.shirt} strokeWidth={6.6} strokeLinecap="round" />
        <circle cx={-23.5} cy={57} r={5.2} fill={def.skin} stroke={LINE} strokeWidth={2} />
      </g>

      {expr === "ouch" && <DizzyStars />}
    </g>
  );
}

function Face({ def, expr }: { def: CharacterDef; expr: Expr }) {
  const blush = expr === "shy" || expr === "ouch";
  return (
    <g>
      {/* 볼 — 오물거릴 때 볼록 */}
      <ellipse
        cx={-11}
        cy={-6}
        rx={blush ? 8.5 : 7}
        ry={blush ? 5 : 4.2}
        fill="#ff8fa3"
        opacity={blush ? 0.85 : 0.5}
        className={expr === "chew" ? "pp-cheek" : undefined}
      />
      {expr === "shy" && (
        <path
          d="M-16 -8 l2 -3 M-12 -8 l2 -3 M-8 -8 l2 -3"
          stroke="#e05a77"
          strokeWidth={1.4}
          strokeLinecap="round"
        />
      )}
      <Brow expr={expr} />
      <Eye expr={expr} />
      {def.style === "curly" && (
        // 동그란 안경
        <g>
          <circle cx={-8.5} cy={-20} r={7.5} fill="#fff" fillOpacity={0.25} stroke={LINE} strokeWidth={2} />
          <path d="M-16 -21 L-35 -14" stroke={LINE} strokeWidth={2} strokeLinecap="round" />
        </g>
      )}
      {(expr === "nervous" || expr === "meh" || expr === "oops") && (
        <path
          d="M-50 -40 C-50 -35 -45 -33 -43 -37 C-43 -40 -47 -44 -50 -40 Z"
          fill="#9fd4ff"
          stroke="#5aa6dd"
          strokeWidth={1}
          className="pp-sweat"
        />
      )}
      {expr === "ouch" && (
        <path d="M-8 -14 C-10 -8 -6 -4 -4 -8 C-3 -11 -6 -14 -8 -14 Z" fill="#9fd4ff" className="pp-tear" />
      )}
    </g>
  );
}

function Brow({ expr }: { expr: Expr }) {
  const d =
    expr === "nervous" || expr === "oops"
      ? "M-15 -32 Q-10 -35 -4 -31"
      : expr === "ouch"
        ? "M-15 -31 Q-10 -29 -4 -27"
        : expr === "meh"
          ? "M-15 -29 L-4 -29"
          : "M-15 -29 Q-10 -31 -4 -28.5";
  return <path d={d} fill="none" stroke={LINE} strokeWidth={2.2} strokeLinecap="round" />;
}

function Eye({ expr }: { expr: Expr }) {
  const stroke = { fill: "none", stroke: "#2c1d18", strokeWidth: 2.6, strokeLinecap: "round" as const };
  switch (expr) {
    case "chew":
    case "shy":
    case "proud":
      return <path d="M-13 -19 Q-9 -25 -4.5 -19" {...stroke} />;
    case "meh":
      return <path d="M-13 -20 L-5 -20" {...stroke} />;
    case "ouch":
      return <path d="M-13 -25 L-5.5 -20.5 L-13 -16" {...stroke} strokeLinejoin="round" />;
    case "nervous":
    case "oops":
      return (
        <g>
          <ellipse cx={-8.5} cy={-20} rx={5} ry={5.8} fill="#fff" stroke="#2c1d18" strokeWidth={2} />
          <circle cx={-7} cy={-20} r={2.3} fill="#2c1d18" className="pp-jitter" />
        </g>
      );
    default:
      return (
        <g className="pp-blink">
          <ellipse cx={-8.5} cy={-20} rx={3.4} ry={4.6} fill="#2c1d18" />
          <circle cx={-7.4} cy={-22} r={1.4} fill="#fff" />
        </g>
      );
  }
}

function Hair({ def, layer }: { def: CharacterDef; layer: "back" | "front" }) {
  const p = { fill: def.hair, stroke: def.hairLine, strokeWidth: 2.2, strokeLinejoin: "round" as const };
  const shine = <path d="M-46 -38 Q-36 -46 -24 -45" fill="none" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" opacity={0.45} />;

  switch (def.style) {
    case "bob":
      return layer === "back" ? (
        <path d="M-60 -14 C-63 -44 -38 -52 -20 -47 C-8 -44 -1 -36 1 -28 L-44 -10 L-46 12 C-55 15 -60 6 -60 -14 Z" {...p} />
      ) : (
        <g>
          <path
            d="M-54 -26 C-50 -50 -12 -52 0.5 -30 C-7 -33 -13 -30 -16 -25 C-20 -32 -29 -33 -35 -28 C-41 -33 -49 -31 -54 -26 Z"
            {...p}
          />
          {shine}
          {/* 딸기 머리핀 */}
          <g transform="translate(-22 -40) rotate(-20)">
            <path d="M-4 -3 Q0 -6 4 -3 Q4 3 0 6 Q-4 3 -4 -3 Z" fill="#ff4d6d" stroke={LINE} strokeWidth={1.4} />
            <path d="M-3 -4 L0 -6 L3 -4" fill="none" stroke="#3fa66a" strokeWidth={1.8} strokeLinecap="round" />
          </g>
        </g>
      );
    case "spiky":
      return layer === "back" ? (
        <circle cx={-31} cy={-18} r={30} {...p} />
      ) : (
        <g>
          <path
            d="M-56 -24 C-52 -48 -20 -54 -1 -32 L-7 -30 L-9 -23 L-15 -30 L-19 -22 L-25 -30 L-31 -23 L-35 -31 L-44 -25 L-50 -30 Z"
            {...p}
          />
          <path d="M-30 -46 C-27 -61 -13 -60 -16 -51" fill="none" stroke={def.hair} strokeWidth={3.6} strokeLinecap="round" />
          {shine}
        </g>
      );
    case "pony":
      return layer === "back" ? (
        <g>
          {/* 포니테일은 살랑살랑 흔들린다 */}
          <g className="pp-sway" style={{ transformOrigin: "-56px -24px" }}>
            <path d="M-55 -30 C-84 -32 -88 -2 -74 14 C-76 -4 -68 -16 -55 -18 Z" {...p} />
          </g>
          <circle cx={-31} cy={-18} r={30} {...p} />
        </g>
      ) : (
        <g>
          <path d="M-56 -24 C-52 -50 -14 -54 0 -30 C-14 -38 -36 -36 -56 -24 Z" {...p} />
          {shine}
          {/* 리본 */}
          <g transform="translate(-57 -25)">
            <path d="M0 0 L-8 -7 L-8 7 Z M0 0 L8 -7 L8 7 Z" fill="#ff6f91" stroke={LINE} strokeWidth={1.4} strokeLinejoin="round" />
            <circle r={2.8} fill="#ff6f91" stroke={LINE} strokeWidth={1.4} />
          </g>
        </g>
      );
    case "curly": {
      const back: [number, number, number][] = [
        [-52, -26, 13],
        [-42, -40, 14],
        [-26, -44, 13],
        [-58, -10, 11],
        [-52, 4, 9],
      ];
      const front: [number, number, number][] = [
        [-6, -33, 7],
        [-16, -39, 8],
        [-29, -41, 8.5],
        [-42, -36, 8.5],
        [-51, -26, 8],
      ];
      const set = layer === "back" ? back : front;
      return (
        <g>
          {set.map(([cx, cy, r]) => (
            <circle key={`${cx}${cy}`} cx={cx} cy={cy} r={r} {...p} />
          ))}
          {layer === "front" && shine}
        </g>
      );
    }
  }
}

function DizzyStars() {
  const star = "M0 -5 L1.5 -1.5 L5 -1.2 L2.3 1.2 L3.1 4.8 L0 2.9 L-3.1 4.8 L-2.3 1.2 L-5 -1.2 L-1.5 -1.5 Z";
  return (
    <g transform="translate(-28 -52)">
      <g className="pp-orbit">
        {[0, 120, 240].map((deg) => (
          <path
            key={deg}
            d={star}
            transform={`rotate(${deg}) translate(18 0) scale(0.9)`}
            fill="#ffd34d"
            stroke={LINE}
            strokeWidth={1.2}
          />
        ))}
      </g>
    </g>
  );
}

export function CharacterLips({ expr }: { expr: Expr }) {
  if (expr === "mystery") return null;
  const chew = expr === "chew";
  const lip = { fill: "#ff94a8", stroke: "#d4607b", strokeWidth: 1.3, strokeLinejoin: "round" as const };
  return (
    <g className={chew ? "pp-bob" : expr === "ouch" ? "pp-hop" : "pp-breathe"}>
      <g className={chew ? "pp-chomp-top" : undefined}>
        <path d="M-6 -4 Q-3.5 -8.5 0.5 -6.8 Q2.5 -5.6 2.5 -4 Z" {...lip} />
      </g>
      <g className={chew ? "pp-chomp-bottom" : undefined}>
        <path d="M-6 4 Q-3.5 8.5 0.5 6.8 Q2.5 5.6 2.5 4 Z" {...lip} />
      </g>
      {expr === "ouch" && (
        // 반창고
        <g className="pp-bandage" transform="translate(-3 8) rotate(-20)">
          <rect x={-10} y={-4} width={20} height={8} rx={4} fill="#f6d7a7" stroke="#b98a52" strokeWidth={1.2} />
          <rect x={-3.5} y={-4} width={7} height={8} fill="#eec48c" />
          <circle cx={-6.5} cy={-1} r={0.7} fill="#b98a52" />
          <circle cx={6.5} cy={1} r={0.7} fill="#b98a52" />
        </g>
      )}
    </g>
  );
}

/** 캐릭터 고르기 버튼에 넣는 얼굴 동그라미. */
export function Portrait({ index, size = 56 }: { index: number; size?: number }) {
  const def = CHARACTERS[index];
  return (
    <svg viewBox="-70 -62 84 84" width={size} height={size} aria-hidden>
      <CharacterBody def={def} expr="idle" />
      <CharacterLips expr="idle" />
    </svg>
  );
}
