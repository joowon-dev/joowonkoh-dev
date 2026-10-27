/**
 * 캐릭터 스킨의 그림. 물리는 그대로 원판이므로 여기서 지키는 규칙이 셋 있다.
 *
 * 1. 실루엣은 반지름 안에 들어온다. 귀만 위로 삐져나온다 — 좌우로 튀어나오면 눈에 보이는
 *    몸집과 실제 충돌 반경이 어긋나 "닿지도 않았는데 밀렸다"처럼 보인다.
 * 2. 윗면 / 옆면(두께) 두 겹을 코인과 같은 순서로 그린다. 두께가 있어야 더미로 겹쳐 쌓인
 *    것이 읽힌다. 바닥 그림자는 코인과 공유한다(render.ts).
 * 3. 크기 6종이 곧 종족 6종이다. 코인이 크기별로 색을 달리해 더미 모양을 읽히게 했던
 *    자리를 종족이 대신한다.
 *
 * 화면 좌표(sx, sy, rx, ry)를 넘겨받기만 하고 카메라를 모른다 — render.ts와 순환 참조가
 * 생기지 않도록 투영은 호출하는 쪽에 남겨 둔다.
 */
import { NEUTRAL_RADII, type Coin } from "./physics";

export type SpeciesKind = "bean" | "chick" | "cat" | "bear" | "rabbit" | "frog";

export interface Species {
  kind: SpeciesKind;
  /** 윗면 색 */
  top: string;
  /** 옆면(두께) 색 */
  side: string;
  /** 옆면에 덮는 검정 투명도. 참가자 캐릭터처럼 옆면 색을 따로 정하지 않을 때 쓴다. */
  sideShade?: number;
}

/** 이 배열은 NEUTRAL_RADII와 길이·순서가 같아야 한다. */
export const NEUTRAL_SPECIES: readonly Species[] = [
  { kind: "bean", top: "#f7e6bd", side: "#dcc691" },
  { kind: "chick", top: "#ffe08a", side: "#e2bd57" },
  { kind: "cat", top: "#ffd3b3", side: "#e2a97f" },
  { kind: "bear", top: "#d9c0a4", side: "#b2947b" },
  { kind: "rabbit", top: "#f4e9e4", side: "#d5c3bc" },
  { kind: "frog", top: "#c1e4b2", side: "#95be83" },
];

/** 몸 두께 대 반지름 비. 코인(5/14)보다 두툼해 더 인형처럼 보인다. */
const THICKNESS_RATIO = 0.42;
const INK = "#3b3a36";
const CHEEK = "rgba(240,120,120,0.35)";
const BEAK = "#e79a3c";

/** 눈이 이 크기(px) 아래로 내려가면 표정이 뭉개지므로 하한을 둔다. */
const MIN_EYE = 1.1;

export function characterThickness(radius: number): number {
  return radius * THICKNESS_RATIO;
}

/**
 * 코인 하나에 배정되는 종족. 참가자 코인은 종족 대신 강조색 고양이 하나로 고정한다 —
 * 스무 명이 섞여 있어도 "내 캐릭터"를 한눈에 찾으려면 참가자끼리는 같아야 한다.
 */
export function speciesFor(coin: Coin, playerColor: string): Species {
  if (coin.kind === "player") {
    return { kind: "cat", top: playerColor, side: playerColor, sideShade: 0.22 };
  }
  const i = NEUTRAL_RADII.indexOf(coin.radius as (typeof NEUTRAL_RADII)[number]);
  return NEUTRAL_SPECIES[i < 0 ? Math.floor(NEUTRAL_SPECIES.length / 2) : i];
}

export interface PieceGeom {
  sx: number;
  sy: number;
  rx: number;
  ry: number;
  thickness: number;
}

/** 몸 뒤에 그리는 귀. 종족을 구분하는 유일한 실루엣 신호다. */
function drawEars(ctx: CanvasRenderingContext2D, g: PieceGeom, species: Species): void {
  const { sx, sy, rx, ry } = g;
  ctx.fillStyle = species.side;
  if (species.kind === "cat") {
    for (const s of [-1, 1]) {
      const x = sx + s * rx * 0.58;
      ctx.beginPath();
      ctx.moveTo(x - rx * 0.26, sy - ry * 0.72);
      ctx.lineTo(x + s * rx * 0.06, sy - ry * 1.62);
      ctx.lineTo(x + rx * 0.3, sy - ry * 0.6);
      ctx.closePath();
      ctx.fill();
    }
  } else if (species.kind === "bear") {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(sx + s * rx * 0.62, sy - ry * 0.78, rx * 0.3, rx * 0.3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (species.kind === "rabbit") {
    for (const s of [-1, 1]) {
      ctx.beginPath();
      ctx.ellipse(
        sx + s * rx * 0.34,
        sy - ry * 1.35,
        rx * 0.19,
        ry * 1.05,
        (s * 10 * Math.PI) / 180,
        0,
        Math.PI * 2,
      );
      ctx.fill();
    }
  }
}

/** 몸통 — 옆면 두께와 윗면. 코인의 drawCoin과 같은 순서다. */
function drawBody(ctx: CanvasRenderingContext2D, g: PieceGeom, species: Species): void {
  const { sx, sy, rx, ry, thickness } = g;
  const sidePath = () => {
    ctx.beginPath();
    ctx.ellipse(sx, sy + thickness, rx, ry, 0, 0, Math.PI);
    ctx.rect(sx - rx, sy, rx * 2, thickness);
  };
  ctx.fillStyle = species.side;
  sidePath();
  ctx.fill();
  if (species.sideShade) {
    // 옆면 색을 따로 정하지 않는 참가자 캐릭터용. 색 계산 없이 어둡게만 눌러
    // 강조색이 무엇으로 바뀌어도 두께가 보인다.
    ctx.fillStyle = `rgba(0,0,0,${species.sideShade})`;
    sidePath();
    ctx.fill();
  }
  ctx.fillStyle = species.top;
  ctx.beginPath();
  ctx.ellipse(sx, sy, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

/** 개구리 눈은 머리 위로 솟은 돌기다. 윗면을 덮으므로 몸통 다음에 그린다. */
function drawFrogEyes(ctx: CanvasRenderingContext2D, g: PieceGeom, species: Species): void {
  const { sx, sy, rx, ry } = g;
  const eye = Math.max(MIN_EYE, rx * 0.115);
  for (const s of [-1, 1]) {
    ctx.fillStyle = species.top;
    ctx.beginPath();
    ctx.ellipse(sx + s * rx * 0.5, sy - ry * 0.72, rx * 0.27, rx * 0.27, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = INK;
    ctx.beginPath();
    ctx.ellipse(sx + s * rx * 0.5, sy - ry * 0.78, eye * 1.15, eye * 1.15, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawCheeks(ctx: CanvasRenderingContext2D, g: PieceGeom, ey: number): void {
  const { sx, rx, ry } = g;
  // 작은 캐릭터에 볼터치까지 넣으면 얼굴이 색 얼룩으로 뭉개진다
  if (rx <= 14) return;
  ctx.fillStyle = CHEEK;
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(sx + s * rx * 0.6, ey + ry * 0.2, rx * 0.13, rx * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** 종족별 얼굴. 회전각(spin)으로 눈 하나를 감겨 판 위가 정지 화면처럼 보이지 않게 한다. */
function drawFace(
  ctx: CanvasRenderingContext2D,
  g: PieceGeom,
  species: Species,
  wink: boolean,
): void {
  const { sx, sy, rx, ry } = g;
  const eye = Math.max(MIN_EYE, rx * 0.115);
  const ey = sy - ry * 0.1;
  const ex = rx * 0.34;

  if (species.kind !== "frog") {
    ctx.fillStyle = INK;
    if (wink && rx > 12) {
      ctx.beginPath();
      ctx.ellipse(sx - ex, ey, eye, eye, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = INK;
      ctx.lineWidth = Math.max(1, eye * 0.7);
      ctx.lineCap = "round";
      ctx.beginPath();
      ctx.moveTo(sx + ex - eye * 1.3, ey);
      ctx.quadraticCurveTo(sx + ex, ey - eye * 1.4, sx + ex + eye * 1.3, ey);
      ctx.stroke();
    } else {
      for (const s of [-1, 1]) {
        ctx.beginPath();
        ctx.ellipse(sx + s * ex, ey, eye, eye, 0, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  drawCheeks(ctx, g, ey);

  const my = sy + ry * 0.34;
  ctx.lineCap = "round";
  if (species.kind === "chick") {
    ctx.fillStyle = BEAK;
    ctx.beginPath();
    ctx.moveTo(sx - rx * 0.15, my - ry * 0.1);
    ctx.lineTo(sx + rx * 0.15, my - ry * 0.1);
    ctx.lineTo(sx, my + ry * 0.28);
    ctx.closePath();
    ctx.fill();
  } else if (species.kind === "frog") {
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1, rx * 0.09);
    ctx.beginPath();
    ctx.moveTo(sx - rx * 0.42, my - ry * 0.15);
    ctx.quadraticCurveTo(sx, my + ry * 0.35, sx + rx * 0.42, my - ry * 0.15);
    ctx.stroke();
  } else if (species.kind !== "bean") {
    // 콩은 눈만 있다. 지름 16짜리 몸에 입까지 넣으면 점 세 개로 보인다.
    const w = rx * 0.17;
    ctx.strokeStyle = INK;
    ctx.lineWidth = Math.max(1, rx * 0.08);
    ctx.beginPath();
    ctx.moveTo(sx - w * 2, my - ry * 0.12);
    ctx.quadraticCurveTo(sx - w, my + ry * 0.22, sx, my - ry * 0.12);
    ctx.quadraticCurveTo(sx + w, my + ry * 0.22, sx + w * 2, my - ry * 0.12);
    ctx.stroke();
  }
}

/**
 * 참가자 이름표. 얼굴을 덮지 않도록 입 자리에 눕히고, 눈은 위로 올려 둔다.
 * 글자 색은 캐릭터의 몸 색(강조색)을 그대로 쓴다.
 */
function drawNameTag(
  ctx: CanvasRenderingContext2D,
  g: PieceGeom,
  name: string,
  color: string,
): void {
  const { sx, sy, rx, ry } = g;
  const h = ry * 0.9;
  const w = rx * 1.5;
  const top = sy + ry * 0.05;
  ctx.fillStyle = "rgba(255,255,255,0.95)";
  ctx.beginPath();
  if (typeof ctx.roundRect === "function") ctx.roundRect(sx - w / 2, top, w, h, h / 2);
  else ctx.rect(sx - w / 2, top, w, h);
  ctx.fill();

  ctx.fillStyle = color;
  ctx.font = `700 ${Math.max(8, h * 0.7)}px system-ui, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(name.length > 4 ? `${name.slice(0, 3)}…` : name, sx, top + h / 2);
}

/** 참가자 캐릭터의 얼굴 — 눈은 이름표 위로 올라가고 입은 이름표가 대신한다. */
function drawPlayerFace(ctx: CanvasRenderingContext2D, g: PieceGeom): void {
  const { sx, sy, rx, ry } = g;
  const eye = Math.max(MIN_EYE, rx * 0.12);
  ctx.fillStyle = "#ffffff";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(sx + s * rx * 0.32, sy - ry * 0.42, eye, eye, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = "rgba(255,255,255,0.32)";
  for (const s of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(sx + s * rx * 0.62, sy - ry * 0.16, rx * 0.13, rx * 0.09, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * 캐릭터 하나를 그린다. 바닥 그림자는 코인과 같은 것을 쓰므로 여기서는 그리지 않는다.
 * `name`이 있으면 참가자 캐릭터로 본다.
 */
export function drawCharacter(
  ctx: CanvasRenderingContext2D,
  g: PieceGeom,
  species: Species,
  wink: boolean,
  name?: string,
): void {
  drawEars(ctx, g, species);
  drawBody(ctx, g, species);
  if (species.kind === "frog") drawFrogEyes(ctx, g, species);

  if (name !== undefined) {
    drawPlayerFace(ctx, g);
    drawNameTag(ctx, g, name, species.top);
    return;
  }
  drawFace(ctx, g, species, wink);
}

/**
 * 눈을 감은 표정을 줄지. 코인 번호로만 정한다 — 회전각처럼 매 프레임 바뀌는 값에 걸면
 * 밀려 움직이는 동안 눈이 초당 몇 번씩 깜빡여 판 전체가 지글거린다.
 */
export function winksOf(coinId: number): boolean {
  return coinId % 5 === 2;
}
