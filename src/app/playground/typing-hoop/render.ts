/**
 * 픽셀 코트 그리기.
 *
 * 낮은 해상도 캔버스(240×320)에 그리고 CSS로 확대한다. 큰 캔버스에 작은 도형을
 * 그리는 것보다 이쪽이 확실하다 — 확대는 브라우저가 최근접 이웃으로 하므로
 * 계단이 또렷하게 남고, 기기 배율이 얼마든 같은 그림이 나온다.
 *
 * 시점은 3인칭이다. 카메라가 던지는 사람 뒤 위쪽에 고정돼 있고, 골대는
 * 거리에 따라 저 앞에서 작아진다. 원근은 z 하나로만 나눈다.
 */

import {
  BALL_RADIUS,
  BOARD_BOTTOM,
  BOARD_TOP,
  RIM_HEIGHT,
  RIM_RADIUS,
  boardZ,
  type Vec3,
} from "./flight";
import { createRng } from "../_shared/random";

export const SCENE_W = 240;
export const SCENE_H = 320;

/** 눈높이가 화면에서 걸리는 줄. 이 위가 벽과 관중석, 아래가 바닥이다 */
export const HORIZON = 96;
/** 초점거리(px·m). 클수록 망원처럼 눌린다 */
export const FOCAL = 330;
/**
 * 카메라 높이(m)와 던지는 사람으로부터 뒤로 물러난 거리(m).
 *
 * 높이가 림(3.05m)보다 높아야 한다. 눈높이에 두면 림을 옆에서 보게 되어
 * 골대 구멍이 안 보이고, 공이 들어가는지 튕기는지 구분이 안 된다.
 * 뒤로 물러난 거리는 사람이 화면 아래에 적당히 걸리도록 높이와 같이 맞춘 값이다.
 */
export const CAM_Y = 3.2;
export const CAM_Z = -7.2;
/** 이보다 가까운 건 그리지 않는다. 카메라 뒤로 넘어간 점은 좌표가 뒤집힌다 */
const NEAR_Z = CAM_Z + 0.8;

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
  skin: "#f0c193",
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
const CROWD = (() => {
  const rng = createRng(20260803);
  const rows = 5;
  const dots: { x: number; y: number; color: number; w: number }[] = [];
  for (let r = 0; r < rows; r++) {
    const y = 44 + r * 9;
    for (let x = 2; x < SCENE_W - 2; x += 5) {
      if (rng() < 0.22) continue;
      dots.push({
        x: x + Math.floor(rng() * 2),
        y,
        color: Math.floor(rng() * PALETTE.crowd.length),
        w: rng() < 0.3 ? 4 : 3,
      });
    }
  }
  return dots;
})();

function drawBackground(ctx: CanvasRenderingContext2D): void {
  px(ctx, 0, 0, SCENE_W, HORIZON, PALETTE.wall);

  // 천장 조명 두 줄. 위쪽이 새까맣기만 하면 실내로 안 읽힌다
  for (const y of [8, 18]) {
    for (let x = 24; x < SCENE_W - 24; x += 26) {
      px(ctx, x, y, 14, 3, "#3d4668");
    }
  }

  // 관중석 계단
  for (let r = 0; r < 6; r++) {
    px(ctx, 0, 40 + r * 9, SCENE_W, 7, r % 2 === 0 ? PALETTE.standRow : PALETTE.wallTrim);
  }
  for (const d of CROWD) {
    px(ctx, d.x, d.y, d.w, 4, PALETTE.crowd[d.color]);
  }

  // 관중석과 코트 사이 광고판
  px(ctx, 0, HORIZON - 12, SCENE_W, 12, PALETTE.wallTrim);
  px(ctx, 0, HORIZON - 12, SCENE_W, 1, "#4a5578");
  for (let x = 6; x < SCENE_W; x += 30) {
    px(ctx, x, HORIZON - 8, 18, 4, "#39426a");
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

  // 림. 위에서 내려다보므로 타원이다
  const rimC = project({ x: 0, y: RIM_HEIGHT, z: hoopZ });
  const rx = RIM_RADIUS * rimC.scale;
  // 카메라가 림보다 낮으면 안쪽이 안 보인다. 눈높이 차이로 납작한 정도를 정한다
  const flat = Math.min(0.62, Math.max(0.12, (CAM_Y - RIM_HEIGHT + 1.6) / 4));
  const ry = Math.max(1.5, rx * flat);
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
  // 앞으로 튀어나온 링으로 읽힌다
  pixelArc(ctx, rimC.x, rimC.y, rx, ry, Math.PI, Math.PI * 2, rimT, PALETTE.rimDark);
  pixelArc(ctx, rimC.x, rimC.y, rx, ry, 0, Math.PI, rimT, PALETTE.rim);

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

/** 공 하나. 크기는 깊이에 따라 줄어든다 */
function drawBall(ctx: CanvasRenderingContext2D, pos: Vec3, spin: number): void {
  const s = project(pos);
  const r = Math.max(2, BALL_RADIUS * s.scale);
  fillEllipse(ctx, s.x, s.y, r, r, PALETTE.ball);
  // 솔기 두 줄. 돌아가는 게 보여야 날아가는 느낌이 산다
  const off = Math.sin(spin) * r * 0.55;
  pixelLine(ctx, s.x - r, s.y + off * 0.4, s.x + r, s.y - off * 0.4, 1, PALETTE.ballDark);
  pixelLine(ctx, s.x + off, s.y - r, s.x + off, s.y + r, 1, PALETTE.ballDark);
  // 아래쪽 그늘
  px(ctx, s.x - r * 0.6, s.y + r * 0.55, r * 1.2, Math.max(1, r * 0.3), PALETTE.ballDark);
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

export interface PlayerPose {
  /** 0이면 팔이 내려와 있고 1이면 머리 위로 뻗은 상태 */
  armLift: number;
  /** 공을 아직 들고 있는가 */
  holding: boolean;
  /** 무릎을 굽힌 정도 0~1 */
  crouch: number;
}

/**
 * 던지는 사람. 뒷모습이다.
 *
 * 카메라와 사람의 상대 위치가 고정이라 화면 크기도 고정이다. 그래서 원근으로
 * 계산하지 않고 픽셀 좌표를 직접 박는다 — 그래야 몸통 도트가 프레임마다
 * 1픽셀씩 떨리지 않는다.
 */
function drawPlayer(ctx: CanvasRenderingContext2D, pose: PlayerPose): void {
  const feet = floorPoint(0, 0);
  const cx = Math.round(feet.x);
  const dip = Math.round(pose.crouch * 5);
  const bottom = Math.round(feet.y);
  const top = bottom - 96 + dip;

  const P = PALETTE;
  // 발밑 그림자
  ctx.globalAlpha = 0.3;
  fillEllipse(ctx, cx, bottom + 1, 20, 5, P.shadow);
  ctx.globalAlpha = 1;

  // 다리 — 굽히면 짧아진다
  const legTop = top + 62;
  px(ctx, cx - 11, legTop, 8, 26 - dip, P.skin);
  px(ctx, cx + 3, legTop, 8, 26 - dip, P.skin);
  // 양말과 신발
  px(ctx, cx - 12, bottom - 9, 10, 4, P.shoe);
  px(ctx, cx + 2, bottom - 9, 10, 4, P.shoe);
  px(ctx, cx - 13, bottom - 5, 12, 5, P.shoe);
  px(ctx, cx + 1, bottom - 5, 12, 5, P.shoe);

  // 반바지
  px(ctx, cx - 13, top + 46, 26, 18, P.shorts);
  px(ctx, cx - 1, top + 52, 2, 12, "#1e2740");

  // 몸통
  px(ctx, cx - 13, top + 18, 26, 30, P.jersey);
  px(ctx, cx - 13, top + 18, 5, 30, P.jerseyDark);
  px(ctx, cx + 8, top + 18, 5, 30, P.jerseyDark);
  // 등번호 8
  px(ctx, cx - 4, top + 26, 8, 3, "#ffffff");
  px(ctx, cx - 4, top + 31, 8, 3, "#ffffff");
  px(ctx, cx - 4, top + 36, 8, 3, "#ffffff");
  px(ctx, cx - 4, top + 29, 2, 2, "#ffffff");
  px(ctx, cx + 2, top + 29, 2, 2, "#ffffff");
  px(ctx, cx - 4, top + 34, 2, 2, "#ffffff");
  px(ctx, cx + 2, top + 34, 2, 2, "#ffffff");

  // 목과 머리. 뒷모습이라 보이는 건 뒤통수와 귀뿐이다.
  // 네모 한 덩이로 두면 검은 블록이 얹힌 것처럼 보여서 위아래 모서리를 깎는다
  px(ctx, cx - 4, top + 13, 8, 6, P.skin);
  px(ctx, cx - 7, top + 1, 14, 14, P.hair);
  px(ctx, cx - 6, top, 12, 1, P.hair);
  px(ctx, cx - 8, top + 4, 1, 8, P.hair);
  px(ctx, cx + 7, top + 4, 1, 8, P.hair);
  px(ctx, cx - 6, top + 1, 12, 2, "#3f3125");
  px(ctx, cx - 7, top + 13, 14, 2, "#241b13");
  // 귀
  px(ctx, cx - 9, top + 7, 2, 4, P.skin);
  px(ctx, cx + 7, top + 7, 2, 4, P.skin);

  // 팔. 어깨에서 손까지 한 줄로 긋는다
  const lift = Math.min(1, Math.max(0, pose.armLift));
  const shoulderY = top + 21;
  const handDown = { x: 16, y: top + 48 };
  const handUp = { x: 11, y: top - 10 };
  const hx = handDown.x + (handUp.x - handDown.x) * lift;
  const hy = handDown.y + (handUp.y - handDown.y) * lift;
  // 팔꿈치를 살짝 바깥으로 빼야 일자 막대로 안 보인다
  const ex = (handDown.x + hx) / 2 + 3;
  const ey = (shoulderY + hy) / 2 + (1 - lift) * 4;
  for (const side of [-1, 1]) {
    pixelLine(ctx, cx + side * 12, shoulderY, cx + side * ex, ey, 5, P.skin);
    pixelLine(ctx, cx + side * ex, ey, cx + side * hx, hy, 4, P.skin);
  }

  // 손에 든 공
  if (pose.holding) {
    const ballY = hy - 3 + (1 - lift) * 6;
    fillEllipse(ctx, cx, ballY, 9, 9, P.ball);
    pixelLine(ctx, cx - 9, ballY, cx + 9, ballY, 1, P.ballDark);
    pixelLine(ctx, cx, ballY - 9, cx, ballY + 9, 1, P.ballDark);
  }
}

export interface Scene {
  distanceM: number;
  pose: PlayerPose;
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
  if (scene.shake > 0.01) {
    // 정수로 흔들어야 픽셀이 어긋나지 않는다
    const a = Math.round(scene.shake * 3);
    ctx.translate(a % 2 === 0 ? a : -a, Math.round(scene.shake * 2));
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

  drawPlayer(ctx, scene.pose);
  ctx.restore();
}
