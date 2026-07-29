import {
  NEUTRAL_RADII,
  PUSHER_BACK_Y,
  centerX,
  halfWidthAt,
  type Board,
  type Coin,
} from "./physics";
import type { Game } from "./setup";
import { BURST_RADIUS, BURST_SECONDS, CATAPULT_RADIUS, CATAPULT_SECONDS } from "./events";
import { FALL_ANIM_SECONDS, type FallingCoin } from "./loop";

/** 화면상 y축을 이 비율로 압축해 비스듬한 시점을 만든다 */
export const PERSPECTIVE_SCALE = 0.72;

const SIDE_PADDING = 18;
const VERTICAL_PADDING = 20;

/**
 * 배율 상한. 판이 좁고 깊어서 큰 화면에서는 화면 폭에 맞추면 코인 하나가 80px을 넘고
 * 판이 코인 7개 폭밖에 안 되는 것처럼 보인다. 상한을 두고 남는 공간은 여백으로 둔다.
 */
const MAX_SCALE = 1.6;

/** 코인이 투입된 뒤 위에서 내려앉는 연출에 걸리는 시간(초) */
const ENTRY_SECONDS = 0.42;
/** 내려앉기 시작하는 높이(월드 단위) */
const ENTRY_HEIGHT = 190;

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
  const scale = Math.max(0.01, Math.min(widthFit, heightFit, MAX_SCALE));
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
  /** 판 바닥(앞쪽) */
  board: string;
  /** 판 바닥(뒤쪽) — 깊이감을 주려고 앞보다 어둡다 */
  boardFar: string;
  boardEdge: string;
  pusher: string;
  /** 푸셔 앞면(두께) — 판보다 진해야 밀고 나오는 게 보인다 */
  pusherFace: string;
  /** NEUTRAL_RADII와 같은 순서의 [윗면, 옆면] 색 3쌍 */
  coinBySize: ReadonlyArray<readonly [string, string]>;
  /** 투석 구역 표시색 */
  catapult: string;
  player: string;
  playerSide: string;
  text: string;
  accent: string;
}

/** CSS 커스텀 프로퍼티에서 팔레트를 읽는다. 이 사이트는 현재 라이트 테마 하나만 제공하므로
 * 다크모드 전환을 따라가는 동작은 없다. */
export function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const accent = v("--color-accent", "#2563eb");
  const border = v("--color-border", "#e5e7eb");
  const text = v("--color-text-primary", "#23272f");
  return {
    bg: v("--color-bg", "#ffffff"),
    // 판 바닥은 흰 배경 위에서 형태가 보여야 하므로 카드 배경 대신 고정 회색조를 쓴다
    board: "#f2f4f8",
    boardFar: "#d9dee7",
    boardEdge: border,
    pusher: "#c4cad5",
    pusherFace: "#8b94a3",
    // 중립 코인은 크기별로 색이 조금씩 다르다 (작을수록 밝고, 클수록 진하다)
    coinBySize: [
      ["#e2e7ef", "#b6bfcd"],
      ["#c6ccd7", "#98a1b0"],
      ["#a7b0c0", "#7c8697"],
    ],
    catapult: "#f59e0b",
    player: accent,
    playerSide: accent,
    text,
    accent,
  };
}

/** 코인 두께는 반지름에 비례한다 (반지름 14 기준 5) */
function coinThickness(radius: number): number {
  return radius * (5 / 14);
}

function coinColors(coin: Coin, palette: Palette): readonly [string, string] {
  if (coin.kind === "player") return [palette.player, palette.playerSide];
  // 크기 3종 중 몇 번째인지로 색을 고른다. 목록에 없는 반지름이면 가운데 색.
  const size = NEUTRAL_RADII.indexOf(coin.radius as (typeof NEUTRAL_RADII)[number]);
  return palette.coinBySize[size < 0 ? 1 : size];
}

/** 판의 좌우 가장자리를 화면 x로 옮긴다 */
function edgeX(board: Board, y: number, cam: Camera): { left: number; right: number } {
  const half = halfWidthAt(board, y);
  const c = centerX(board);
  return {
    left: projectPoint(c - half, y, cam).sx,
    right: projectPoint(c + half, y, cam).sx,
  };
}

/** 뒤(backY)에서 앞(frontY)까지 판 모양을 따라가는 사다리꼴 경로 */
function tracePanel(
  ctx: CanvasRenderingContext2D,
  board: Board,
  backY: number,
  frontY: number,
  cam: Camera,
): void {
  const back = edgeX(board, backY, cam);
  const front = edgeX(board, frontY, cam);
  const backSy = projectPoint(0, backY, cam).sy;
  const frontSy = projectPoint(0, frontY, cam).sy;
  ctx.beginPath();
  ctx.moveTo(back.left, backSy);
  ctx.lineTo(back.right, backSy);
  ctx.lineTo(front.right, frontSy);
  ctx.lineTo(front.left, frontSy);
  ctx.closePath();
}

function drawCoin(
  ctx: CanvasRenderingContext2D,
  coin: Coin,
  cam: Camera,
  palette: Palette,
  names: string[],
  elapsed: number,
  yOffset: number,
  alpha: number,
): void {
  const { sx, sy } = projectPoint(coin.x, coin.y, cam);
  const y = sy + yOffset;
  const rx = coin.radius * cam.scale;
  const ry = rx * PERSPECTIVE_SCALE;
  const thickness = coinThickness(coin.radius) * cam.scale;
  const [top, side] = coinColors(coin, palette);

  ctx.save();
  ctx.globalAlpha = alpha;

  // 바닥 그림자 — 코인이 공중에 떠 있을수록 작고 옅어진다
  const lift = Math.min(1, Math.max(0, -yOffset / (ENTRY_HEIGHT * cam.scale)));
  ctx.fillStyle = `rgba(0,0,0,${0.18 * (1 - lift * 0.75)})`;
  ctx.beginPath();
  // 낙하 연출(yOffset > 0)에서는 그림자도 코인을 따라 내려간다
  const shadowY = sy + thickness + 2 + Math.max(0, yOffset);
  ctx.ellipse(sx, shadowY, rx * (0.95 - lift * 0.35), ry * (0.8 - lift * 0.3), 0, 0, Math.PI * 2);
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

  // 안쪽 테두리 — 동전 각인 느낌
  ctx.strokeStyle = side;
  ctx.lineWidth = Math.max(0.5, rx * 0.08);
  ctx.beginPath();
  ctx.ellipse(sx, y, rx * 0.72, ry * 0.72, 0, 0, Math.PI * 2);
  ctx.stroke();

  if (coin.ownerIndex >= 0) {
    // 참가자 이름
    const name = names[coin.ownerIndex] ?? "";
    ctx.fillStyle = "#ffffff";
    ctx.font = `600 ${Math.max(8, rx * 0.62)}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const label = name.length > 4 ? `${name.slice(0, 3)}…` : name;
    ctx.fillText(label, sx, y);
  } else {
    // 평범한 코인 — 회전이 보이도록 각인 하나를 돌린다
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = side;
    ctx.beginPath();
    ctx.ellipse(
      sx + Math.cos(coin.spin) * rx * 0.38,
      y + Math.sin(coin.spin) * ry * 0.38,
      rx * 0.16,
      ry * 0.16,
      0,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }

  ctx.restore();
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  game: Game,
  cam: Camera,
  palette: Palette,
  falling: FallingCoin[],
  shake = 0,
): void {
  const { board, elapsed } = game.world;

  ctx.save();
  if (shake > 0) {
    // 화면 흔들림 — 물리와 무관한 연출이라 렌더 시각으로만 흔든다
    ctx.translate(Math.sin(elapsed * 61) * shake, Math.cos(elapsed * 47) * shake * 0.6);
  }

  const backSy = projectPoint(0, PUSHER_BACK_Y, cam).sy;
  const frontSy = projectPoint(0, board.fallLine, cam).sy;

  // 판 바닥 — 뒤에서 앞으로 갈수록 넓어지는 사다리꼴
  const grad = ctx.createLinearGradient(0, backSy, 0, frontSy);
  grad.addColorStop(0, palette.boardFar);
  grad.addColorStop(1, palette.board);
  ctx.fillStyle = grad;
  tracePanel(ctx, board, PUSHER_BACK_Y, board.fallLine, cam);
  ctx.fill();

  // 좌우 벽
  const back = edgeX(board, PUSHER_BACK_Y, cam);
  const front = edgeX(board, board.fallLine, cam);
  ctx.strokeStyle = palette.boardEdge;
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(back.left, backSy);
  ctx.lineTo(front.left, frontSy);
  ctx.moveTo(back.right, backSy);
  ctx.lineTo(front.right, frontSy);
  ctx.stroke();

  // 푸셔 — 판과 같은 기울기를 가진 사다리꼴 + 앞면 두께
  const pusherY = game.world.pusher.y;
  ctx.fillStyle = palette.pusher;
  tracePanel(ctx, board, PUSHER_BACK_Y, Math.max(PUSHER_BACK_Y, pusherY), cam);
  ctx.fill();
  const pusherEdge = edgeX(board, pusherY, cam);
  const pusherSy = projectPoint(0, pusherY, cam).sy;
  ctx.fillStyle = palette.pusherFace;
  ctx.beginPath();
  ctx.moveTo(pusherEdge.left, pusherSy);
  ctx.lineTo(pusherEdge.right, pusherSy);
  ctx.lineTo(pusherEdge.right, pusherSy + 7 * cam.scale);
  ctx.lineTo(pusherEdge.left, pusherSy + 7 * cam.scale);
  ctx.closePath();
  ctx.fill();

  // 코인 — 뒤쪽부터 그려야 앞쪽 코인이 위로 겹친다
  const sorted = [...game.world.coins].sort((a, b) => a.y - b.y);
  for (const coin of sorted) {
    // 투입 직후 위에서 떨어져 내리는 연출
    const age = Math.max(0, elapsed - coin.bornAt);
    const dropOffset =
      age < ENTRY_SECONDS
        ? -((1 - age / ENTRY_SECONDS) ** 2) * ENTRY_HEIGHT * cam.scale
        : 0;
    drawCoin(ctx, coin, cam, palette, game.names, elapsed, dropOffset, 1);
  }

  // 낙하선 — 판 앞 가장자리
  ctx.strokeStyle = palette.accent;
  ctx.lineWidth = 4;
  ctx.shadowColor = palette.accent;
  ctx.shadowBlur = 16;
  ctx.beginPath();
  ctx.moveTo(front.left, frontSy);
  ctx.lineTo(front.right, frontSy);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // 융기 이벤트 — 솟구치는 지점에서 퍼져 나가는 충격파
  const burst = game.world.burst;
  if (burst) {
    const { sx, sy } = projectPoint(burst.x, burst.y, cam);
    const p = Math.min(1, burst.t / BURST_SECONDS);
    for (const delay of [0, 0.3]) {
      const q = Math.min(1, Math.max(0, (p - delay) / (1 - delay)));
      if (q <= 0) continue;
      ctx.save();
      ctx.globalAlpha = (1 - q) * 0.85;
      ctx.strokeStyle = palette.accent;
      ctx.lineWidth = 5 * (1 - q) * cam.scale;
      const r = BURST_RADIUS * q * cam.scale;
      ctx.beginPath();
      ctx.ellipse(sx, sy, r, r * PERSPECTIVE_SCALE, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
  }

  // 투석 이벤트 — 걷어간 구역을 안쪽으로 조여드는 고리로 보여준다.
  // 융기(퍼져 나감)와 반대 방향이라 둘을 눈으로 구분할 수 있다.
  const catapult = game.world.catapult;
  if (catapult) {
    const { sx, sy } = projectPoint(catapult.x, catapult.y, cam);
    const p = Math.min(1, catapult.t / CATAPULT_SECONDS);
    ctx.save();
    ctx.globalAlpha = 1 - p;
    ctx.strokeStyle = palette.catapult;
    ctx.lineWidth = 4 * cam.scale;
    const r = CATAPULT_RADIUS * (1 - p * 0.85) * cam.scale;
    ctx.beginPath();
    ctx.ellipse(sx, sy, r, r * PERSPECTIVE_SCALE, 0, 0, Math.PI * 2);
    ctx.stroke();
    // 뒤로 날아간다는 방향을 화살촉으로 표시
    ctx.fillStyle = palette.catapult;
    const lift = r * 0.5 + 14 * cam.scale;
    ctx.beginPath();
    ctx.moveTo(sx, sy - lift - 10 * cam.scale);
    ctx.lineTo(sx - 7 * cam.scale, sy - lift);
    ctx.lineTo(sx + 7 * cam.scale, sy - lift);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 판 밖으로 떨어지는 코인 — 물리에서 분리된 순수 연출
  for (const f of falling) {
    const drop = 260 * f.t * f.t * cam.scale;
    const alpha = Math.max(0, 1 - f.t / FALL_ANIM_SECONDS);
    drawCoin(ctx, f.coin, cam, palette, game.names, elapsed, drop, alpha);
  }

  ctx.restore();
}

export type { FallingCoin };
