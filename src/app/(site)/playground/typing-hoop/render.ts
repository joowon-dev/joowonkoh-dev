/**
 * 픽셀 코트 그리기.
 *
 * 낮은 해상도 캔버스(240×320)에 그리고 CSS로 확대한다. 큰 캔버스에 작은 도형을
 * 그리는 것보다 이쪽이 확실하다 — 확대는 브라우저가 최근접 이웃으로 하므로
 * 계단이 또렷하게 남고, 기기 배율이 얼마든 같은 그림이 나온다.
 *
 * 시점은 1인칭이다. 카메라가 곧 던지는 사람의 눈이라 몸은 안 그리고, 화면
 * 아래에 자기 손과 공이 걸린다. 골대는 눈높이보다 높아서 올려다보게 되고,
 * 거리에 따라 저 앞에서 작아진다. 원근은 z 하나로만 나눈다.
 */

import {
  BALL_RADIUS,
  BOARD_BOTTOM,
  BOARD_TOP,
  READY,
  RELEASE,
  RIM_HEIGHT,
  RIM_RADIUS,
  boardZ,
  type Vec3,
} from "./flight";
import { createRng } from "../_shared/random";

export const SCENE_W = 240;
export const SCENE_H = 320;

/**
 * 눈높이가 화면에서 걸리는 줄. 이 위가 벽과 관중석, 아래가 바닥이다.
 *
 * 화면 한가운데(160)가 아니라 아래쪽(200)에 있다. 이게 곧 카메라를 위로
 * 기울인 것과 같다 — 골대는 눈높이보다 높으니 올려다봐야 한다.
 */
export const HORIZON = 200;
/**
 * 초점거리(px·m). 화각으로는 약 70°다.
 *
 * 3인칭 때(330, 약 50°)보다 넓혔다. 1인칭은 카메라가 공에 붙어 있어서 좁은
 * 화각으로는 던진 공이 곧장 화면 위로 사라진다.
 */
export const FOCAL = 170;
/**
 * 카메라 높이(m)와 던지는 사람 기준 앞뒤 위치(m).
 *
 * 던지는 사람의 눈이다. 뒤통수가 아니라 시야를 보여주는 것이므로 사람 몸을
 * 그리지 않고, 대신 화면 아래에 자기 손과 공이 걸린다.
 *
 * 림(3.05m)보다 낮다. 그래서 골대를 아래에서 올려다보게 되는데, 그게 실제로
 * 슛을 쏘는 사람이 보는 그림이다. 링 타원의 납작한 정도도 이 높이 차이에서
 * 그대로 나온다.
 */
export const CAM_Y = 1.72;
export const CAM_Z = -0.15;
/** 이보다 가까운 건 그리지 않는다. 카메라 뒤로 넘어간 점은 좌표가 뒤집힌다 */
const NEAR_Z = CAM_Z + 0.35;

export interface Screen {
  x: number;
  y: number;
  /** 이 깊이에서 1m가 몇 픽셀인지. 크기를 정할 때 쓴다 */
  scale: number;
}

export function project(p: Vec3): Screen {
  const depth = Math.max(0.1, p.z - CAM_Z);
  const scale = FOCAL / depth;
  return {
    x: SCENE_W / 2 + p.x * scale,
    y: HORIZON - (p.y - CAM_Y) * scale,
    scale,
  };
}

/** 바닥(y=0) 위의 한 점 */
export function floorPoint(x: number, z: number): Screen {
  return project({ x, y: 0, z });
}

export interface Palette {
  wall: string;
  wallTrim: string;
  standRow: string;
  crowd: string[];
  floor: string;
  floorDark: string;
  line: string;
  lineFaint: string;
  pole: string;
  poleDark: string;
  board: string;
  boardEdge: string;
  boardSquare: string;
  rim: string;
  rimDark: string;
  net: string;
  ball: string;
  ballDark: string;
  skin: string;
  /** 손 테두리. 살색이 마룻바닥과 비슷해서 이게 없으면 손이 코트에 묻힌다 */
  skinLine: string;
  hair: string;
  jersey: string;
  jerseyDark: string;
  shorts: string;
  shoe: string;
  shadow: string;
}

export const PALETTE: Palette = {
  wall: "#1b2036",
  wallTrim: "#2b3352",
  standRow: "#252c47",
  // 관중 색은 일부러 채도를 낮췄다. 원색으로 두면 관중석이 제일 화려해져서
  // 정작 봐야 할 골대와 공에서 눈이 떠난다
  crowd: ["#b8503a", "#bb8f42", "#4e7ea0", "#5c8f57", "#9c5878", "#a8a294"],
  floor: "#c98a4b",
  floorDark: "#b8793e",
  line: "#f4e8d2",
  lineFaint: "#dcbf94",
  pole: "#767e94",
  poleDark: "#565d70",
  board: "#eef3fa",
  boardEdge: "#98a8c0",
  boardSquare: "#e8622c",
  rim: "#f0682c",
  rimDark: "#b8441a",
  net: "#f2efe6",
  ball: "#d9762e",
  ballDark: "#89441a",
  skin: "#f5cfa4",
  skinLine: "#7a4a2a",
  hair: "#2b2118",
  jersey: "#e8532e",
  jerseyDark: "#b83b1c",
  shorts: "#2e3a5c",
  shoe: "#f4f4f4",
  shadow: "rgba(0,0,0,0.22)",
};

/** 정수 좌표로 채운다. 소수로 채우면 가장자리가 반투명해져 픽셀이 뭉갠다 */
function px(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  color: string,
): void {
  if (w <= 0 || h <= 0) return;
  ctx.fillStyle = color;
  ctx.fillRect(Math.round(x), Math.round(y), Math.max(1, Math.round(w)), Math.max(1, Math.round(h)));
}

/** 두께가 있는 픽셀 선. 대각선도 계단으로 남게 블록을 찍어 나간다 */
function pixelLine(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  thickness: number,
  color: string,
): void {
  const dx = x1 - x0;
  const dy = y1 - y0;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(dx), Math.abs(dy))));
  const t = Math.max(1, Math.round(thickness));
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    px(ctx, x0 + dx * u - t / 2, y0 + dy * u - t / 2, t, t, color);
  }
}

/** 타원 테두리. 픽셀 느낌을 지키려고 arc 대신 점을 찍는다 */
function pixelArc(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  from: number,
  to: number,
  thickness: number,
  color: string,
): void {
  const steps = Math.max(10, Math.round(rx * 3));
  const t = Math.max(1, Math.round(thickness));
  for (let i = 0; i <= steps; i++) {
    const a = from + ((to - from) * i) / steps;
    px(ctx, cx + Math.cos(a) * rx - t / 2, cy + Math.sin(a) * ry - t / 2, t, t, color);
  }
}

function pixelEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  thickness: number,
  color: string,
): void {
  pixelArc(ctx, cx, cy, rx, ry, 0, Math.PI * 2, thickness, color);
}

function fillEllipse(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  rx: number,
  ry: number,
  color: string,
): void {
  const top = Math.round(cy - ry);
  const bottom = Math.round(cy + ry);
  ctx.fillStyle = color;
  for (let y = top; y <= bottom; y++) {
    const dy = (y - cy) / Math.max(0.001, ry);
    const half = rx * Math.sqrt(Math.max(0, 1 - dy * dy));
    if (half < 0.5) continue;
    ctx.fillRect(Math.round(cx - half), y, Math.max(1, Math.round(half * 2)), 1);
  }
}

/**
 * 관중석 점들. 매 프레임 난수를 뽑으면 관중이 발작하듯 깜빡인다.
 * 모듈이 뜰 때 한 번만 만들어 고정한다.
 */
const CROWD_ROWS = 3;
const CROWD = (() => {
  const rng = createRng(20260803);
  const dots: { x: number; row: number; color: number; w: number }[] = [];
  for (let row = 0; row < CROWD_ROWS; row++) {
    for (let x = 2; x < SCENE_W - 2; x += 5) {
      if (rng() < 0.22) continue;
      dots.push({
        x: x + Math.floor(rng() * 2),
        row,
        color: Math.floor(rng() * PALETTE.crowd.length),
        w: rng() < 0.3 ? 4 : 3,
      });
    }
  }
  return dots;
})();

/**
 * 체육관 안쪽. 관중석은 수평선 바로 위 얇은 띠뿐이다.
 *
 * 올려다보는 시점이라 화면 위쪽 대부분은 천장과 벽이다. 관중을 크게 깔면
 * 골대 뒤가 알록달록해져서 정작 봐야 할 백보드가 묻힌다.
 */
function drawBackground(ctx: CanvasRenderingContext2D): void {
  px(ctx, 0, 0, SCENE_W, HORIZON, PALETTE.wall);

  // 천장 조명. 위를 올려다보는 시점이라 화면 맨 위에 걸린다
  for (const y of [9, 25]) {
    for (let x = 18; x < SCENE_W - 18; x += 30) {
      px(ctx, x, y, 16, 4, "#4a5578");
      px(ctx, x + 2, y + 4, 12, 1, "#39426a");
    }
  }
  // 천장 트러스. 가로선 두 줄만 그으면 뜬금없는 줄로 보여서 사이를 격자로 묶는다
  px(ctx, 0, 44, SCENE_W, 3, PALETTE.wallTrim);
  px(ctx, 0, 64, SCENE_W, 2, PALETTE.standRow);
  for (let x = 6; x < SCENE_W; x += 20) {
    px(ctx, x, 47, 2, 17, PALETTE.standRow);
    pixelLine(ctx, x + 2, 62, x + 18, 49, 1, PALETTE.standRow);
  }

  // 관중석 계단 — 수평선 바로 위
  const standTop = HORIZON - 8 - CROWD_ROWS * 8;
  for (let r = 0; r < CROWD_ROWS; r++) {
    px(ctx, 0, standTop + r * 8, SCENE_W, 7, r % 2 === 0 ? PALETTE.standRow : PALETTE.wallTrim);
  }
  for (const d of CROWD) {
    px(ctx, d.x, standTop + d.row * 8 + 1, d.w, 4, PALETTE.crowd[d.color]);
  }

  // 관중석과 코트 사이 광고판
  px(ctx, 0, HORIZON - 10, SCENE_W, 10, PALETTE.wallTrim);
  px(ctx, 0, HORIZON - 10, SCENE_W, 1, "#4a5578");
  for (let x = 6; x < SCENE_W; x += 30) {
    px(ctx, x, HORIZON - 7, 18, 4, "#39426a");
  }
}

/** 바닥. 멀수록 촘촘해지는 마루널로 원근을 보여준다 */
function drawFloor(ctx: CanvasRenderingContext2D): void {
  px(ctx, 0, HORIZON, SCENE_W, SCENE_H - HORIZON, PALETTE.floor);
  for (let z = 0; z < 40; z += 1) {
    const near = floorPoint(0, z);
    const far = floorPoint(0, z + 0.5);
    if (near.y <= HORIZON) break;
    if (z % 2 === 0) {
      px(ctx, 0, far.y, SCENE_W, Math.max(1, near.y - far.y), PALETTE.floorDark);
    }
  }
}

/** 바닥 위 폴리라인. 카메라 뒤로 넘어간 점은 버린다 */
function floorPolyline(
  ctx: CanvasRenderingContext2D,
  pts: { x: number; z: number }[],
  thickness: number,
  color: string,
): void {
  let prev: Screen | null = null;
  for (const p of pts) {
    if (p.z <= NEAR_Z) {
      prev = null;
      continue;
    }
    const s = floorPoint(p.x, p.z);
    if (prev) pixelLine(ctx, prev.x, prev.y, s.x, s.y, thickness, color);
    prev = s;
  }
}

/**
 * 코트 라인. 골대 밑을 기준으로 그린다.
 *
 * 3점 라인은 골대 밑을 중심으로 한 반지름 6.75m 호다. 던지는 사람이 그 안에
 * 있으면 호가 등 뒤로 가서 화면에 안 보이는데, 그게 맞다 — 2점 자리라는 뜻이다.
 */
function drawCourtLines(ctx: CanvasRenderingContext2D, hoopZ: number): void {
  const baselineZ = hoopZ + 1.2;
  const half = 7.5;

  // 엔드라인과 사이드라인
  floorPolyline(
    ctx,
    [
      { x: -half, z: baselineZ },
      { x: half, z: baselineZ },
    ],
    2,
    PALETTE.line,
  );
  for (const side of [-half, half]) {
    floorPolyline(
      ctx,
      [
        { x: side, z: baselineZ },
        { x: side, z: baselineZ - 14 },
      ],
      2,
      PALETTE.lineFaint,
    );
  }

  // 페인트존과 자유투 라인
  const keyHalf = 2.45;
  const ftZ = baselineZ - 5.8;
  floorPolyline(
    ctx,
    [
      { x: -keyHalf, z: baselineZ },
      { x: -keyHalf, z: ftZ },
      { x: keyHalf, z: ftZ },
      { x: keyHalf, z: baselineZ },
    ],
    2,
    PALETTE.line,
  );

  // 자유투 서클
  const ftCircle: { x: number; z: number }[] = [];
  for (let i = 0; i <= 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    ftCircle.push({ x: Math.sin(a) * 1.8, z: ftZ + Math.cos(a) * 1.8 });
  }
  floorPolyline(ctx, ftCircle, 1, PALETTE.lineFaint);

  // 3점 라인
  const arc: { x: number; z: number }[] = [];
  for (let i = 0; i <= 40; i++) {
    const a = -Math.PI / 2 + (i / 40) * Math.PI;
    arc.push({ x: Math.sin(a) * 6.75, z: hoopZ - Math.cos(a) * 6.75 });
  }
  floorPolyline(ctx, arc, 2, PALETTE.line);

  // 골대 바로 밑 반원
  const restricted: { x: number; z: number }[] = [];
  for (let i = 0; i <= 16; i++) {
    const a = -Math.PI / 2 + (i / 16) * Math.PI;
    restricted.push({ x: Math.sin(a) * 1.25, z: hoopZ - Math.cos(a) * 1.25 });
  }
  floorPolyline(ctx, restricted, 1, PALETTE.lineFaint);
}

/** 골대. 기둥 → 백보드 → 림 → 그물 순으로 겹친다 */
function drawHoop(ctx: CanvasRenderingContext2D, hoopZ: number, netSwing: number): void {
  const bZ = boardZ(hoopZ);
  const boardMid = project({ x: 0, y: (BOARD_TOP + BOARD_BOTTOM) / 2, z: bZ });
  const s = boardMid.scale;

  // 천장 매달림 구조.
  //
  // 바닥에서 올라오는 지주로 그렸더니 카메라가 위에서 내려다보는 탓에 기둥
  // 밑동이 화면상 던지는 사람 머리 높이에 걸렸다. 정중앙이라 피할 수도 없다.
  // 실내 체육관에서 흔한 천장 고정으로 바꾸면 화면 위로 빠져나가 안 겹친다.
  const boardTopY = project({ x: 0, y: BOARD_TOP, z: bZ }).y;
  const armW = Math.max(1, 0.09 * s);
  for (const side of [-1, 1]) {
    const footX = boardMid.x + side * 0.55 * s;
    pixelLine(ctx, footX, boardTopY, boardMid.x + side * 0.22 * s, -4, armW, PALETTE.poleDark);
  }
  // 두 팔을 묶는 가로 브레이스
  px(
    ctx,
    boardMid.x - 0.5 * s,
    boardTopY - 0.5 * s,
    1.0 * s,
    Math.max(1, 0.07 * s),
    PALETTE.pole,
  );

  // 골대 뒤 어두운 판.
  //
  // 먼 슛에서는 골대가 관중석 높이까지 내려와서, 알록달록한 점들 위에 흰
  // 백보드와 그물이 얹히면 뭐가 뭔지 안 보인다. 골대가 갈 만한 자리에 미리
  // 어두운 판을 깔아 항상 같은 배경 위에 서게 한다.
  px(
    ctx,
    boardMid.x - 1.15 * s,
    project({ x: 0, y: BOARD_TOP + 0.2, z: bZ }).y,
    2.3 * s,
    (BOARD_TOP + 0.2 - (RIM_HEIGHT - 0.7)) * s,
    // 위쪽 벽과 같은 색이라 관중석에 난 '골대 자리'처럼 자연스럽게 이어진다.
    // 더 어두운 색을 쓰면 검은 사각형이 오려붙은 것처럼 튄다.
    PALETTE.wall,
  );

  // 백보드
  const boardW = 1.8 * s;
  const boardH = (BOARD_TOP - BOARD_BOTTOM) * s;
  const bx = boardMid.x - boardW / 2;
  const by = boardMid.y - boardH / 2;
  px(ctx, bx, by, boardW, boardH, PALETTE.board);
  px(ctx, bx, by, boardW, Math.max(1, 0.06 * s), PALETTE.boardEdge);
  px(ctx, bx, by + boardH - Math.max(1, 0.06 * s), boardW, Math.max(1, 0.06 * s), PALETTE.boardEdge);
  px(ctx, bx, by, Math.max(1, 0.06 * s), boardH, PALETTE.boardEdge);
  px(ctx, bx + boardW - Math.max(1, 0.06 * s), by, Math.max(1, 0.06 * s), boardH, PALETTE.boardEdge);

  // 백보드 안쪽 사각형 — 뱅크슛이 어디를 맞는지 보이라고 있는 표시다
  const sqW = 0.59 * s;
  const sqH = 0.45 * s;
  const sqX = boardMid.x - sqW / 2;
  const sqY = project({ x: 0, y: RIM_HEIGHT + 0.45, z: bZ }).y;
  const t = Math.max(1, Math.round(0.05 * s));
  px(ctx, sqX, sqY, sqW, t, PALETTE.boardSquare);
  px(ctx, sqX, sqY + sqH, sqW, t, PALETTE.boardSquare);
  px(ctx, sqX, sqY, t, sqH, PALETTE.boardSquare);
  px(ctx, sqX + sqW - t, sqY, t, sqH, PALETTE.boardSquare);

  // 림. 눈높이보다 높이 있으니 아래에서 올려다보는 타원이다.
  //
  // 납작한 정도는 올려다보는 각도 그대로다 — 가까우면 많이 올려다봐서 링이
  // 동그랗게 열리고, 멀수록 눈높이에 가까워져 한 줄로 눕는다. 이 변화 자체가
  // 거리감을 준다. 완전히 눕지 않게 바닥값만 둔다.
  const rimC = project({ x: 0, y: RIM_HEIGHT, z: hoopZ });
  const rx = RIM_RADIUS * rimC.scale;
  const elevation = Math.atan2(RIM_HEIGHT - CAM_Y, hoopZ - CAM_Z);
  const ry = Math.max(1.5, rx * Math.max(0.14, Math.sin(elevation)));
  const rimT = Math.max(2, 0.08 * rimC.scale);
  // 백보드와 림을 잇는 목. 림보다 먼저 그려야 뒤로 간다
  pixelLine(
    ctx,
    rimC.x,
    rimC.y,
    boardMid.x,
    project({ x: 0, y: RIM_HEIGHT, z: bZ }).y,
    rimT,
    PALETTE.rimDark,
  );
  // 뒤쪽 반은 어둡게, 앞쪽 반은 밝게. 이 차이가 있어야 납작한 타원이 아니라
  // 앞으로 튀어나온 링으로 읽힌다.
  //
  // 올려다보는 시점이라 링의 **가까운** 쪽이 화면에서 위(작은 y)에 온다.
  // 내려다볼 때와 반대다 — 여기를 뒤집으면 링이 뒤로 누운 것처럼 보인다.
  pixelArc(ctx, rimC.x, rimC.y, rx, ry, 0, Math.PI, rimT, PALETTE.rimDark);
  pixelArc(ctx, rimC.x, rimC.y, rx, ry, Math.PI, Math.PI * 2, rimT, PALETTE.rim);

  // 그물. 공이 지나가면 옆으로 흔들린다
  const netBottom = project({ x: 0, y: RIM_HEIGHT - 0.42, z: hoopZ });
  const swing = netSwing * rx * 0.35;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2;
    const topX = rimC.x + Math.cos(a) * rx;
    const topY = rimC.y + Math.sin(a) * ry;
    const botX = netBottom.x + Math.cos(a) * rx * 0.45 + Math.sin(a * 3) * swing;
    const botY = netBottom.y + Math.sin(a) * ry * 0.45;
    pixelLine(ctx, topX, topY, botX, botY, 1, PALETTE.net);
  }
  pixelEllipse(ctx, netBottom.x, netBottom.y, rx * 0.55, ry * 0.55, 1, PALETTE.net);
}

/**
 * 공 하나. 크기는 깊이에 따라 줄어든다.
 *
 * 어두운 원을 깔고 그 위에 살짝 왼쪽 위로 옮긴 밝은 원을 얹는다. 그러면
 * 오른쪽 아래에 초승달 모양 그늘이 남아 구(球)로 읽힌다. 예전처럼 아래에
 * 사각형 그늘을 붙이면 작을 때는 괜찮아도, 손에 든 큰 공에서는 갈색 막대가
 * 튀어나온 것처럼 보인다.
 */
function drawBall(ctx: CanvasRenderingContext2D, pos: Vec3, spin: number): void {
  const s = project(pos);
  const r = Math.max(2, BALL_RADIUS * s.scale);
  fillEllipse(ctx, s.x, s.y, r, r, PALETTE.ballDark);
  fillEllipse(ctx, s.x - r * 0.1, s.y - r * 0.12, r * 0.92, r * 0.92, PALETTE.ball);
  // 솔기 두 줄. 돌아가는 게 보여야 날아가는 느낌이 산다
  const off = Math.sin(spin) * r * 0.55;
  const seam = Math.max(1, r * 0.09);
  pixelLine(ctx, s.x - r * 0.95, s.y + off * 0.4, s.x + r * 0.95, s.y - off * 0.4, seam, PALETTE.ballDark);
  pixelLine(ctx, s.x + off, s.y - r * 0.95, s.x + off, s.y + r * 0.95, seam, PALETTE.ballDark);
  // 왼쪽 위 하이라이트. 작을 때는 안 그린다 — 점 하나가 솔기처럼 보인다
  if (r >= 8) {
    fillEllipse(ctx, s.x - r * 0.42, s.y - r * 0.45, r * 0.22, r * 0.18, "#f0a05a");
  }
}

/** 바닥에 지는 그림자. 높이 올라갈수록 작고 옅어진다 */
function drawShadow(ctx: CanvasRenderingContext2D, pos: Vec3): void {
  const ground = floorPoint(pos.x, pos.z);
  const shrink = 1 / (1 + pos.y * 0.5);
  const r = Math.max(1.5, BALL_RADIUS * ground.scale * 1.4 * shrink);
  ctx.globalAlpha = 0.45 * shrink;
  fillEllipse(ctx, ground.x, ground.y, r, Math.max(1, r * 0.4), PALETTE.shadow);
  ctx.globalAlpha = 1;
}

export interface ShooterPose {
  /** 0이면 공을 가슴 앞에 든 상태, 1이면 머리 위로 완전히 뻗은 상태 */
  armLift: number;
  /** 공을 아직 들고 있는가 */
  holding: boolean;
  /** 무릎을 굽힌 정도 0~1. 1인칭에서는 시야가 살짝 내려앉는 것으로 보인다 */
  crouch: number;
}

/** 지금 손에 든 공이 있어야 할 3차원 위치. 팔을 올릴수록 RELEASE로 다가간다 */
export function heldBallAt(armLift: number): Vec3 {
  const t = Math.min(1, Math.max(0, armLift));
  return {
    x: READY.x + (RELEASE.x - READY.x) * t,
    y: READY.y + (RELEASE.y - READY.y) * t,
    z: READY.z + (RELEASE.z - READY.z) * t,
  };
}

/**
 * 내 손. 1인칭이라 몸 대신 이게 보인다.
 *
 * 손 위치를 화면 좌표로 박지 않고 공의 투영 위치에서 끌어낸다. 그래야 손을
 * 떠나는 순간 공이 튀지 않는다 — 들고 있을 때와 날아가기 시작할 때가
 * 같은 좌표계를 쓰기 때문이다.
 */
function drawHands(ctx: CanvasRenderingContext2D, pose: ShooterPose): void {
  const held = heldBallAt(pose.armLift);
  const s = project(held);
  const r = Math.max(6, BALL_RADIUS * s.scale);
  const cx = Math.round(s.x);
  const cy = Math.round(s.y);
  const P = PALETTE;

  // 공을 먼저 깔고 손가락을 그 **위에** 얹는다. 손을 공 옆에 나란히 두면
  // 잡은 게 아니라 받침대에 올려둔 것처럼 보인다. 겹쳐야 쥔 걸로 읽힌다.
  if (pose.holding) drawBall(ctx, held, 0);

  // 살색과 마룻바닥 색이 가깝다. 테두리를 안 두르면 손이 코트에 묻혀서
  // 아무것도 안 든 것처럼 보인다. 그래서 조각마다 한 겹 키워 먼저 깐다.
  const limb = (x0: number, y0: number, x1: number, y1: number, w: number) => {
    pixelLine(ctx, x0, y0, x1, y1, w + 2, P.skinLine);
    pixelLine(ctx, x0, y0, x1, y1, w, P.skin);
  };

  // 놓고 나면 손이 위로 뻗으며 손가락이 펴진다 (팔로스루)
  const held0 = pose.holding;
  const lift = held0 ? 0 : -r * 0.5;

  for (const side of [-1, 1]) {
    // 손목은 공의 아래 바깥, 팔뚝은 거기서 화면 아래 모서리로 빠진다
    const wx = cx + side * r * 1.0;
    const wy = cy + r * 0.62 + lift;
    // 팔뚝은 화면 아래 '바깥쪽 모서리'로 빠져야 한다. 덜 벌리면 손이 올라갈수록
    // 팔이 화면 한복판을 가로지르는 굵은 대각선 두 개가 된다.
    limb(wx, wy, cx + side * r * 3.4, SCENE_H + 12, Math.max(3, r * 0.42));
    // 손바닥 — 공의 아래 바깥 모서리를 받친다
    limb(wx, wy, wx - side * r * 0.12, wy - r * 0.3, Math.max(4, r * 0.42));

    /**
     * 손가락. 공 가장자리를 따라 짧게 걸친다.
     *
     * 손목 한 점에서 공 중심 쪽으로 길게 뻗으면 양손 손가락이 공 위에서
     * 서로 엇갈려 거미 다리처럼 보인다. 각자 자기 각도에서 안쪽으로 조금만
     * 들어오는 짧은 마디여야 '쥐고 있다'로 읽힌다.
     */
    // 화면 좌표는 y가 아래로 자라므로 각도도 시계 방향이다.
    // 180°가 왼쪽, 220°가 왼쪽 위, 150°가 왼쪽 아래다.
    const gripDeg = [150, 185, 220];
    const fw = Math.max(2, r * 0.17);
    gripDeg.forEach((deg, i) => {
      if (held0) {
        const a = ((side < 0 ? deg : 180 - deg) * Math.PI) / 180;
        limb(
          cx + Math.cos(a) * r * 1.05,
          cy + Math.sin(a) * r * 1.05,
          cx + Math.cos(a) * r * 0.55,
          cy + Math.sin(a) * r * 0.55,
          fw,
        );
      } else {
        // 놓은 뒤에는 나란히 위로 편다
        const off = (i - 1) * r * 0.3;
        limb(wx + side * off * 0.4, wy - r * 0.25, wx + side * (r * 0.2) + off, wy - r * 1.15, fw);
      }
    });
  }
}

export interface Scene {
  distanceM: number;
  pose: ShooterPose;
  /** 날아가는 공. 손에 있으면 null */
  ball: Vec3 | null;
  /** 공이 림을 지난 뒤 흐른 시간(ms). 아직이면 null */
  swishAgeMs: number | null;
  /** 화면 흔들림 0~1 */
  shake: number;
  /** 공 회전 각도 */
  spin: number;
}

export function drawScene(ctx: CanvasRenderingContext2D, scene: Scene): void {
  ctx.save();
  // 흔들림과 무릎 굽힘을 화면 전체를 밀어서 표현한다. 1인칭에서는 몸이 안
  // 보이므로 자세가 곧 시야의 움직임이다. 정수로 밀어야 픽셀이 안 어긋난다.
  const dip = Math.round(scene.pose.crouch * 4);
  const jolt = Math.round(scene.shake * 3);
  if (dip !== 0 || jolt !== 0) {
    ctx.translate(jolt % 2 === 0 ? jolt : -jolt, dip + Math.round(scene.shake * 2));
  }

  drawBackground(ctx);
  drawFloor(ctx);
  drawCourtLines(ctx, scene.distanceM);

  // 그물 흔들림은 공이 지난 직후 400ms 동안 잦아든다
  const netSwing =
    scene.swishAgeMs === null
      ? 0
      : Math.max(0, 1 - scene.swishAgeMs / 400) * Math.sin(scene.swishAgeMs / 28);

  // 공이 백보드보다 뒤에 있으면 골대에 가려야 한다
  const behindBoard = scene.ball !== null && scene.ball.z > boardZ(scene.distanceM);
  if (scene.ball && behindBoard) {
    drawShadow(ctx, scene.ball);
    drawBall(ctx, scene.ball, scene.spin);
  }

  drawHoop(ctx, scene.distanceM, netSwing);

  if (scene.ball && !behindBoard) {
    drawShadow(ctx, scene.ball);
    drawBall(ctx, scene.ball, scene.spin);
  }

  // 내 손은 맨 앞이다. 무엇에도 가리지 않는다
  drawHands(ctx, scene.pose);
  ctx.restore();
}
