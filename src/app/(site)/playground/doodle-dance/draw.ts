import { createRng } from "../_shared/random";
import { FIGURE_BOTTOM, FIGURE_LEFT, FIGURE_RIGHT, FIGURE_TOP, type Pt, type Stroke } from "./figure";

/**
 * 캔버스에 잉크를 얹는 층. 매력의 대부분은 여기 있는 두 가지에서 나온다.
 * 하나는 모든 선을 자로 그은 듯 곧게 두지 않고 미세하게 떨리게 만드는 것,
 * 다른 하나는 그 떨림의 씨앗을 프레임마다 갈아 손으로 다시 그린 것처럼 보이게 하는 것.
 */

export const PAPER = "#eeebe3";
export const INK = "#22211e";

/** 몸이 화면 높이에서 차지하는 비율 */
const FIT_HEIGHT = 0.8;
/** 몸이 화면 폭에서 차지할 수 있는 최대 비율. 좁은 화면에서 팔이 잘리지 않게 한다. */
const FIT_WIDTH = 0.92;

export interface Camera {
  scale: number;
  /** 몸 공간 원점(골반)이 놓이는 화면 좌표 */
  cx: number;
  cy: number;
}

export function computeCamera(w: number, h: number): Camera {
  const spanY = FIGURE_TOP - FIGURE_BOTTOM;
  const spanX = FIGURE_RIGHT - FIGURE_LEFT;
  const scale = Math.max(0.1, Math.min((h * FIT_HEIGHT) / spanY, (w * FIT_WIDTH) / spanX));
  // 상자의 가운데가 화면 가운데에 오도록 원점을 옮긴다. 상자가 좌우 대칭이 아니라서
  // 골반을 화면 정중앙에 두면 왼쪽으로 뻗은 손이 잘린다.
  return {
    scale,
    cx: w / 2 - ((FIGURE_LEFT + FIGURE_RIGHT) / 2) * scale,
    cy: h / 2 + ((FIGURE_TOP + FIGURE_BOTTOM) / 2) * scale,
  };
}

function project(p: Pt, cam: Camera): Pt {
  return { x: cam.cx + p.x * cam.scale, y: cam.cy - p.y * cam.scale };
}

/** 씨앗과 번호로 정해지는 -1~1 사이의 값. 같은 입력이면 같은 결과. */
function noise(seed: number, i: number): number {
  let h = Math.imul(seed ^ 0x9e3779b9, 0x85ebca6b) ^ Math.imul(i + 0x165667b1, 0xc2b2ae35);
  h ^= h >>> 13;
  h = Math.imul(h, 0x27d4eb2d);
  h ^= h >>> 16;
  return ((h >>> 0) / 0xffffffff) * 2 - 1;
}

/** 떨림을 얹을 간격(px). 촘촘하면 지글거리고 넓으면 선이 뭉개진다. */
const WOBBLE_STEP = 11;
/** 떨림 폭(px) */
const WOBBLE_AMP = 0.9;
/** 선 하나가 통째로 밀리는 폭(px). 프레임마다 다시 그린 티. */
const DRIFT = 0.7;

/** 화면 좌표 폴리라인을 일정 간격으로 다시 표본화한다 */
function resample(pts: Pt[], step: number): Pt[] {
  const out: Pt[] = [pts[0]];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1];
    const b = pts[i];
    const len = Math.hypot(b.x - a.x, b.y - a.y);
    const n = Math.max(1, Math.round(len / step));
    for (let k = 1; k <= n; k++) {
      out.push({ x: a.x + ((b.x - a.x) * k) / n, y: a.y + ((b.y - a.y) * k) / n });
    }
  }
  return out;
}

/** 표본점들을 법선 방향으로 흔든다 */
function wobble(pts: Pt[], seed: number, id: number): Pt[] {
  const dx = noise(seed, id * 7919) * DRIFT;
  const dy = noise(seed, id * 7919 + 1) * DRIFT;
  return pts.map((p, i) => {
    const prev = pts[Math.max(0, i - 1)];
    const next = pts[Math.min(pts.length - 1, i + 1)];
    const tx = next.x - prev.x;
    const ty = next.y - prev.y;
    const len = Math.hypot(tx, ty) || 1;
    // 양 끝은 덜 흔들어야 선이 이어지는 곳에서 벌어지지 않는다
    const edge = Math.min(1, Math.min(i, pts.length - 1 - i) / 2 + 0.35);
    const n = noise(seed, id * 131 + i) * WOBBLE_AMP * edge;
    return { x: p.x + dx + (-ty / len) * n, y: p.y + dy + (tx / len) * n };
  });
}

/** 표본점들을 중간점 이차곡선으로 부드럽게 잇는다 */
function tracePath(ctx: CanvasRenderingContext2D, pts: Pt[], closed: boolean): void {
  ctx.beginPath();
  ctx.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i++) {
    const mx = (pts[i].x + pts[i + 1].x) / 2;
    const my = (pts[i].y + pts[i + 1].y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, mx, my);
  }
  const last = pts[pts.length - 1];
  ctx.lineTo(last.x, last.y);
  if (closed) ctx.closePath();
  ctx.stroke();
}

/** 손으로 그린 원. 반지름을 흔들고 시작점을 조금 지나쳐 닫는다. */
function traceCircle(ctx: CanvasRenderingContext2D, c: Pt, r: number, seed: number, id: number): void {
  const steps = Math.max(12, Math.round((r * 2 * Math.PI) / WOBBLE_STEP));
  const pts: Pt[] = [];
  const overshoot = 0.22;
  for (let i = 0; i <= steps; i++) {
    const t = (i / steps) * (Math.PI * 2 + overshoot) - 0.1;
    const rr = r + noise(seed, id * 977 + i) * WOBBLE_AMP;
    pts.push({ x: c.x + Math.cos(t) * rr, y: c.y + Math.sin(t) * rr });
  }
  tracePath(ctx, pts, false);
}

export function drawFigure(
  ctx: CanvasRenderingContext2D,
  strokes: Stroke[],
  cam: Camera,
  seed: number,
): void {
  ctx.save();
  ctx.strokeStyle = INK;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.globalAlpha = 0.93;

  strokes.forEach((stroke, id) => {
    ctx.lineWidth = Math.max(1, stroke.width * cam.scale * 0.55);
    if (stroke.kind === "circle") {
      traceCircle(ctx, project(stroke.c, cam), stroke.r * cam.scale, seed, id);
      return;
    }
    const screen = stroke.pts.map((p) => project(p, cam));
    const pts = stroke.closed ? [...screen, screen[0]] : screen;
    tracePath(ctx, wobble(resample(pts, WOBBLE_STEP), seed, id), false);
  });

  ctx.restore();
}

/**
 * 종이 배경을 미리 한 장 그려 둔다. 결·접힌 자국·비네트를 매 프레임 다시 그리면
 * 배경만 지글거려 정작 인물의 떨림이 묻힌다.
 */
export function makePaper(w: number, h: number, dpr: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(w * dpr));
  canvas.height = Math.max(1, Math.round(h * dpr));
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  ctx.fillStyle = PAPER;
  ctx.fillRect(0, 0, w, h);

  const rng = createRng(0x5eed1);
  // 종이 결
  ctx.fillStyle = "#000";
  for (let i = 0; i < Math.round((w * h) / 90); i++) {
    ctx.globalAlpha = 0.02 + rng() * 0.05;
    ctx.fillRect(rng() * w, rng() * h, 1, 1);
  }
  // 구겨진 자국. 길고 곧게 그으면 종이가 아니라 긁힌 자국으로 보인다.
  ctx.strokeStyle = "#8d8878";
  ctx.lineWidth = 1;
  for (let i = 0; i < 10; i++) {
    ctx.globalAlpha = 0.03 + rng() * 0.03;
    ctx.beginPath();
    let x = rng() * w;
    let y = rng() * h;
    ctx.moveTo(x, y);
    for (let k = 0; k < 6; k++) {
      x += (rng() - 0.5) * w * 0.18;
      y += (rng() - 0.5) * h * 0.18;
      ctx.lineTo(x, y);
    }
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  const vignette = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.hypot(w, h) / 2);
  vignette.addColorStop(0.55, "rgba(0,0,0,0)");
  vignette.addColorStop(1, "rgba(60,52,38,0.14)");
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, w, h);
  return canvas;
}
