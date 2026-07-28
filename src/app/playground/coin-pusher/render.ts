import { COIN_RADIUS, PUSHER_BACK_Y, type Board, type Coin } from "./physics";
import type { Game } from "./setup";
import { FALL_ANIM_SECONDS } from "./loop";

/** 화면상 y축을 이 비율로 압축해 비스듬한 시점을 만든다 */
export const PERSPECTIVE_SCALE = 0.55;

const SIDE_PADDING = 16;
const VERTICAL_PADDING = 24;

export interface Viewport {
  w: number;
  h: number;
}

export interface Camera {
  scale: number;
  offsetX: number;
  offsetY: number;
}

export function computeCamera(vp: Viewport, board: Board): Camera {
  const depth = (board.fallLine - PUSHER_BACK_Y) * PERSPECTIVE_SCALE;
  const widthFit = (vp.w - SIDE_PADDING * 2) / board.width;
  const heightFit = (vp.h - VERTICAL_PADDING * 2) / depth;
  // 두 축 모두 들어가는 배율을 쓴다. 판 좌우가 잘리면 벽 근처 코인이 안 보이므로
  // 너비를 넘기지 않는 쪽을 우선하고, 세로가 모자란 화면에서는 세로에 맞춘다.
  const scale = Math.max(0.01, Math.min(widthFit, heightFit));
  const projectedHeight = depth * scale;
  return {
    scale,
    offsetX: (vp.w - board.width * scale) / 2,
    offsetY: (vp.h - projectedHeight) / 2 - PUSHER_BACK_Y * PERSPECTIVE_SCALE * scale,
  };
}

export function projectPoint(x: number, y: number, cam: Camera): { sx: number; sy: number } {
  return {
    sx: cam.offsetX + x * cam.scale,
    sy: cam.offsetY + y * PERSPECTIVE_SCALE * cam.scale,
  };
}

export interface Palette {
  bg: string;
  board: string;
  boardEdge: string;
  pusher: string;
  coin: string;
  coinSide: string;
  gold: string;
  goldSide: string;
  spring: string;
  springSide: string;
  player: string;
  playerSide: string;
  text: string;
  accent: string;
}

export interface FallingCoin {
  coin: Coin;
  /** 낙하 연출 경과 시간(초) */
  t: number;
}

/** CSS 커스텀 프로퍼티에서 팔레트를 읽는다. 이 사이트는 현재 라이트 테마 하나만 제공하므로
 * 다크모드 전환을 따라가는 동작은 없다. */
export function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const accent = v("--color-accent", "#2563eb");
  const border = v("--color-border", "#e5e7eb");
  const text = v("--color-text-primary", "#23272f");
  const cardBg = v("--color-card-bg", "#ffffff");
  return {
    bg: v("--color-bg", "#ffffff"),
    board: cardBg,
    boardEdge: border,
    pusher: border,
    coin: "#c9ced6",
    coinSide: "#9aa1ab",
    gold: "#f2c23e",
    goldSide: "#c99a1f",
    spring: "#5ec9a5",
    springSide: "#3d9c7c",
    player: accent,
    playerSide: accent,
    text,
    accent,
  };
}

const COIN_THICKNESS = 5;

function coinColors(coin: Coin, palette: Palette): [string, string] {
  if (coin.kind === "player") return [palette.player, palette.playerSide];
  if (coin.kind === "gold") return [palette.gold, palette.goldSide];
  if (coin.kind === "spring") return [palette.spring, palette.springSide];
  return [palette.coin, palette.coinSide];
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  coin: Coin,
  cam: Camera,
  palette: Palette,
  names: string[],
  yOffset: number,
  alpha: number,
): void {
  const { sx, sy } = projectPoint(coin.x, coin.y, cam);
  const y = sy + yOffset;
  const rx = COIN_RADIUS * cam.scale;
  const ry = rx * PERSPECTIVE_SCALE;
  const thickness = COIN_THICKNESS * cam.scale;
  const [top, side] = coinColors(coin, palette);

  ctx.save();
  ctx.globalAlpha = alpha;

  // 바닥 그림자
  ctx.fillStyle = "rgba(0,0,0,0.16)";
  ctx.beginPath();
  ctx.ellipse(sx, y + thickness + 2, rx * 0.95, ry * 0.8, 0, 0, Math.PI * 2);
  ctx.fill();

  // 옆면
  ctx.fillStyle = side;
  ctx.beginPath();
  ctx.ellipse(sx, y + thickness, rx, ry, 0, 0, Math.PI);
  ctx.rect(sx - rx, y, rx * 2, thickness);
  ctx.fill();

  // 윗면
  ctx.fillStyle = top;
  ctx.beginPath();
  ctx.ellipse(sx, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();

  // 참가자 이름
  if (coin.ownerIndex >= 0) {
    const name = names[coin.ownerIndex] ?? "";
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${Math.max(8, rx * 0.62)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = name.length > 4 ? `${name.slice(0, 3)}…` : name;
    ctx.fillText(label, sx, y);
  }

  ctx.restore();
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  game: Game,
  cam: Camera,
  palette: Palette,
  falling: FallingCoin[],
): void {
  const { board } = game.world;
  const topLeft = projectPoint(0, PUSHER_BACK_Y, cam);
  const bottomRight = projectPoint(board.width, board.fallLine, cam);
  const boardW = bottomRight.sx - topLeft.sx;
  const boardH = bottomRight.sy - topLeft.sy;

  // 캔버스 지우기는 Stage.draw가 CSS 픽셀 기준으로 이미 처리한다.

  // 판
  ctx.fillStyle = palette.board;
  ctx.fillRect(topLeft.sx, topLeft.sy, boardW, boardH);
  ctx.strokeStyle = palette.boardEdge;
  ctx.lineWidth = 2;
  ctx.strokeRect(topLeft.sx, topLeft.sy, boardW, boardH);

  // 낙하선 — 판 앞 가장자리
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(topLeft.sx, bottomRight.sy);
  ctx.lineTo(bottomRight.sx, bottomRight.sy);
  ctx.stroke();

  // 푸셔
  const pusherFront = projectPoint(0, game.world.pusher.y, cam);
  ctx.fillStyle = palette.pusher;
  ctx.fillRect(topLeft.sx, topLeft.sy, boardW, Math.max(0, pusherFront.sy - topLeft.sy));

  // 코인 — 뒤쪽부터 그려야 앞쪽 코인이 위로 겹친다
  const sorted = [...game.world.coins].sort((a, b) => a.y - b.y);
  for (const coin of sorted) {
    // 투입 직후 0.25초 동안 위에서 내려앉는 연출
    const age = Math.max(0, game.world.elapsed - coin.bornAt);
    const dropOffset = age < 0.25 ? -Math.pow(1 - age / 0.25, 2) * 60 * cam.scale : 0;
    drawCoin(ctx, coin, cam, palette, game.names, dropOffset, 1);
  }

  // 판 밖으로 떨어지는 코인 — 물리에서 분리된 순수 연출
  for (const f of falling) {
    const drop = 220 * f.t * f.t * cam.scale;
    const alpha = Math.max(0, 1 - f.t / FALL_ANIM_SECONDS);
    drawCoin(ctx, f.coin, cam, palette, game.names, drop, alpha);
  }
}
