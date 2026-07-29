import {
  NEUTRAL_RADII,
  PUSHER_BACK_Y,
  centerX,
  halfWidthAt,
  type Board,
  type Coin,
} from "./physics";
import type { Game } from "./setup";
import { BURST_RADIUS, BURST_SECONDS } from "./events";
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

/**
 * 기울기 가속도가 최대일 때 화면이 기우는 각도(rad). 0.9도쯤.
 *
 * 처음에는 2.5도를 줬는데 기울기가 1.6초 주기로 좌우를 오가다 보니 화면 전체가 계속
 * 흔들려 멀미가 난다는 피드백을 받았다. 화면이 통째로 움직이는 연출은 눈에 잘 띄는 만큼
 * 피로도 크므로, 판이 기운다는 것만 알아볼 정도로 줄였다. 코인이 실제로 쏠리는 것은
 * 물리(`tiltAx`)가 그대로 보여준다.
 */
const MAX_LEAN = 0.016;
/** 이 가속도에서 MAX_LEAN에 도달한다. rollMagnitude의 tilt 상한과 맞춘 값. */
const LEAN_FULL_AX = 240;

/**
 * 화면 전체를 움직이는 연출(흔들림·기울기)에 곱하는 배율. OS에서 "동작 줄이기"를 켠
 * 사용자에게는 0이라 화면이 아예 안 움직인다 — 코인의 실제 움직임은 그대로 보인다.
 * 매 프레임 matchMedia를 부르지 않도록 한 번만 읽고 캐시한다.
 */
let reducedMotion: boolean | null = null;
function cameraMotionScale(): number {
  if (reducedMotion === null) {
    reducedMotion =
      typeof window !== "undefined" && typeof window.matchMedia === "function"
        ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
        : false;
  }
  return reducedMotion ? 0 : 1;
}

/** 기울기 가속도를 화면 회전각으로 옮긴다. 오른쪽으로 밀리면(+) 오른쪽이 내려간다. */
export function leanAngle(tiltAx: number): number {
  const t = Math.max(-1, Math.min(1, tiltAx / LEAN_FULL_AX));
  return t * MAX_LEAN;
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
  /** NEUTRAL_RADII와 같은 개수·순서의 [윗면, 옆면] 색 쌍 */
  coinBySize: ReadonlyArray<readonly [string, string]>;
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
    // 중립 코인은 크기별로 색이 다르다. 작을수록 밝고 클수록 진하며, 큰 쪽은 살짝
    // 따뜻한 색으로 빠져 은화/동화가 섞인 것처럼 보인다. NEUTRAL_RADII와 길이가 같아야 한다.
    coinBySize: [
      ["#eef1f6", "#c6cedb"],
      ["#dbe1ea", "#aeb8c7"],
      ["#c6ccd7", "#98a1b0"],
      ["#c8bda8", "#9d9179"],
      ["#c2ab8a", "#93805f"],
      ["#a99172", "#7b674c"],
    ],
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
  // 크기 목록 중 몇 번째인지로 색을 고른다. 목록에 없는 반지름이면 가운데 색.
  const size = NEUTRAL_RADII.indexOf(coin.radius as (typeof NEUTRAL_RADII)[number]);
  return palette.coinBySize[size < 0 ? Math.floor(palette.coinBySize.length / 2) : size];
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

  const motion = cameraMotionScale();

  ctx.save();
  if (shake > 0 && motion > 0) {
    // 화면 흔들림 — 물리와 무관한 연출이라 렌더 시각으로만 흔든다.
    // 진동수를 낮게 잡는다. 같은 진폭이라도 빠르게 떠는 화면이 훨씬 더 멀미를 부른다.
    const amp = shake * motion;
    ctx.translate(Math.sin(elapsed * 27) * amp, Math.cos(elapsed * 21) * amp * 0.6);
  }
  // 판이 기울면 화면도 같이 기운다. 코인이 좌우 어느 쪽으로 쏠리는지 눈으로 보이게 하는
  // 연출이며, 물리의 tiltAx가 부호를 바꿀 때 화면도 반대로 넘어간다.
  const lean = leanAngle(game.world.tiltAx) * motion;
  if (lean !== 0) {
    const cx = projectPoint(centerX(board), board.fallLine / 2, cam);
    ctx.translate(cx.sx, cx.sy);
    ctx.rotate(lean);
    ctx.translate(-cx.sx, -cx.sy);
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

  // 판 밖으로 떨어지는 코인 — 물리에서 분리된 순수 연출
  for (const f of falling) {
    const drop = 260 * f.t * f.t * cam.scale;
    const alpha = Math.max(0, 1 - f.t / FALL_ANIM_SECONDS);
    drawCoin(ctx, f.coin, cam, palette, game.names, elapsed, drop, alpha);
  }

  ctx.restore();
}

export type { FallingCoin };
