import { allSegments, blockCircles, type Block } from "./blocks";
import { CAPTURE_FLASH_SECONDS } from "./loop";
import {
  MARBLE_RADIUS,
  WORLD_HEIGHT,
  WORLD_WIDTH,
  type Bucket,
  type MarbleKind,
  type SolidSegment,
  type World,
} from "./physics";
import type { Game } from "./setup";

export interface Viewport {
  w: number;
  h: number;
}

export interface Camera {
  scale: number;
  offsetX: number;
  offsetY: number;
}

/** 월드가 화면에 다 들어가는 배율. 비율이 다르면 남는 쪽을 여백으로 둔다. */
export function computeCamera(vp: Viewport): Camera {
  const scale = Math.max(0.01, Math.min(vp.w / WORLD_WIDTH, vp.h / WORLD_HEIGHT));
  return {
    scale,
    offsetX: (vp.w - WORLD_WIDTH * scale) / 2,
    offsetY: (vp.h - WORLD_HEIGHT * scale) / 2,
  };
}

export function projectPoint(x: number, y: number, cam: Camera): { sx: number; sy: number } {
  return { sx: cam.offsetX + x * cam.scale, sy: cam.offsetY + y * cam.scale };
}

/** 이 폭(px)보다 좁은 양동이는 이름을 세로로 쓴다. 가로로 쓰면 잘린다. */
export const HORIZONTAL_LABEL_MIN_PX = 56;

export function labelIsVertical(bucket: Bucket, cam: Camera): boolean {
  return (bucket.x1 - bucket.x0) * cam.scale < HORIZONTAL_LABEL_MIN_PX;
}

/**
 * 양동이 안에 쌓인 구슬 하나의 자리. 물리로 쌓지 않고 격자에 그린다.
 * 아래 줄부터 채우고, 각 줄은 양동이 안에서 가운데 정렬한다.
 */
export function stackSpot(bucket: Bucket, index: number): { x: number; y: number } {
  const step = MARBLE_RADIUS * 2;
  const row = Math.floor(index / bucket.perRow);
  const col = index % bucket.perRow;
  // 마지막(덜 찬) 줄도 가운데 정렬되도록 그 줄의 실제 개수를 센다
  const inRow = Math.min(bucket.perRow, bucket.count - row * bucket.perRow);
  const rowWidth = inRow * step;
  const left = (bucket.x0 + bucket.x1) / 2 - rowWidth / 2;
  return {
    x: left + step * (col + 0.5),
    y: WORLD_HEIGHT - MARBLE_RADIUS - 0.6 - row * step,
  };
}

export interface Palette {
  bg: string;
  bgFar: string;
  frame: string;
  marble: string;
  marbleHi: string;
  bomb: string;
  blockStatic: string;
  blockMoving: string;
  bumper: string;
  bucket: string;
  bucketFull: string;
  text: string;
  textMuted: string;
  accent: string;
}

/** CSS 커스텀 프로퍼티에서 팔레트를 읽는다. 이 사이트는 라이트 테마 하나만 제공한다. */
export function readPalette(el: HTMLElement): Palette {
  const cs = getComputedStyle(el);
  const v = (name: string, fallback: string) => cs.getPropertyValue(name).trim() || fallback;
  const accent = v("--color-accent", "#2563eb");
  return {
    bg: v("--color-bg", "#f7f7f8"),
    bgFar: v("--color-tag-bg", "#ecedf0"),
    frame: v("--color-border", "#d9dbe0"),
    marble: accent,
    marbleHi: "#ffffff",
    bomb: "#1b1d21",
    blockStatic: v("--color-text-muted", "#8b8f98"),
    blockMoving: v("--color-text-secondary", "#5b606b"),
    bumper: "#ef6f6c",
    bucket: v("--color-card-bg", "#ffffff"),
    bucketFull: "#f2c23e",
    text: v("--color-text-primary", "#1b1d21"),
    textMuted: v("--color-text-muted", "#8b8f98"),
    accent,
  };
}

function strokeSegment(
  ctx: CanvasRenderingContext2D,
  s: SolidSegment,
  cam: Camera,
  color: string,
): void {
  const a = projectPoint(s.x1, s.y1, cam);
  const b = projectPoint(s.x2, s.y2, cam);
  ctx.strokeStyle = color;
  ctx.lineWidth = Math.max(1.5, s.half * 2 * cam.scale);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(a.sx, a.sy);
  ctx.lineTo(b.sx, b.sy);
  ctx.stroke();
}

function drawBlock(
  ctx: CanvasRenderingContext2D,
  block: Block,
  t: number,
  cam: Camera,
  palette: Palette,
): void {
  if (block.kind === "bumper") {
    for (const c of blockCircles(block)) {
      const p = projectPoint(c.cx, c.cy, cam);
      const r = c.radius * cam.scale;
      ctx.fillStyle = palette.bumper;
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
      ctx.fill();
      // 안쪽 고리 — 핀볼 범퍼처럼 보이게 한다
      ctx.strokeStyle = palette.bg;
      ctx.lineWidth = Math.max(1, r * 0.14);
      ctx.beginPath();
      ctx.arc(p.sx, p.sy, r * 0.55, 0, Math.PI * 2);
      ctx.stroke();
    }
    return;
  }

  const moving = block.kind !== "wedge";
  const color = moving ? palette.blockMoving : palette.blockStatic;
  for (const s of allSegments([block], t)) strokeSegment(ctx, s, cam, color);

  // 회전 블록은 축을 찍어준다 — 무엇을 중심으로 도는지 보인다
  if (block.kind === "spinner" || block.kind === "wheel") {
    const p = projectPoint(block.x, block.y, cam);
    ctx.fillStyle = palette.frame;
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, Math.max(2, block.half * 1.8 * cam.scale), 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawMarble(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  cam: Camera,
  palette: Palette,
  kind: MarbleKind = "normal",
): void {
  const p = projectPoint(x, y, cam);
  const bomb = kind === "bomb";
  // 폭탄은 조금 크게 그린다. 눈에 띄어야 긴장이 생긴다. 다만 물리 반지름은 보통 구슬과
  // 같으므로 너무 키우면 블록을 스쳐 지나가는 것이 어색해 보인다.
  const r = MARBLE_RADIUS * cam.scale * (bomb ? 1.25 : 1);

  ctx.fillStyle = bomb ? palette.bomb : palette.marble;
  ctx.beginPath();
  ctx.arc(p.sx, p.sy, r, 0, Math.PI * 2);
  ctx.fill();

  if (bomb) {
    // 붉은 테 — 파란 구슬 무리 속에서 한눈에 구분된다
    ctx.strokeStyle = palette.bumper;
    ctx.lineWidth = Math.max(1, r * 0.28);
    ctx.beginPath();
    ctx.arc(p.sx, p.sy, r * 1.2, 0, Math.PI * 2);
    ctx.stroke();
    return;
  }

  // 왼쪽 위 하이라이트 — 구슬처럼 보이게 하는 최소한의 표현
  ctx.fillStyle = palette.marbleHi;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.arc(p.sx - r * 0.32, p.sy - r * 0.32, r * 0.32, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
}

function drawBucket(
  ctx: CanvasRenderingContext2D,
  bucket: Bucket,
  name: string,
  cam: Camera,
  palette: Palette,
): void {
  const topLeft = projectPoint(bucket.x0, bucket.top, cam);
  const bottomRight = projectPoint(bucket.x1, WORLD_HEIGHT, cam);
  const w = bottomRight.sx - topLeft.sx;
  const h = bottomRight.sy - topLeft.sy;
  const full = bucket.count >= bucket.capacity;

  ctx.fillStyle = full ? palette.bucketFull : palette.bucket;
  ctx.globalAlpha = full ? 0.35 : 0.75;
  ctx.fillRect(topLeft.sx, topLeft.sy, w, h);
  ctx.globalAlpha = 1;

  // 입구 선 — 여기를 넘으면 담긴다
  ctx.strokeStyle = full ? palette.bucketFull : palette.frame;
  ctx.lineWidth = full ? 3 : 1.5;
  ctx.beginPath();
  ctx.moveTo(topLeft.sx, topLeft.sy);
  ctx.lineTo(bottomRight.sx, topLeft.sy);
  ctx.stroke();

  // 이름 — 좁은 양동이는 세로로 쓴다
  const cx = (topLeft.sx + bottomRight.sx) / 2;
  ctx.save();
  ctx.fillStyle = full ? palette.text : palette.textMuted;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const size = Math.max(9, Math.min(15, w * 0.34));
  ctx.font = `600 ${size}px system-ui, sans-serif`;
  if (labelIsVertical(bucket, cam)) {
    // 글자를 눕히지 않고 한 자씩 세로로 쌓는다. 90도 돌린 한글은 읽기 어렵고,
    // 어느 쪽으로 돌리든 아래에서 위로 읽히거나 글자가 누워버린다.
    const chars = [...name];
    const lineHeight = size * 1.05;
    const top = topLeft.sy + h * 0.5 - ((chars.length - 1) * lineHeight) / 2;
    chars.forEach((ch, i) => ctx.fillText(ch, cx, top + i * lineHeight, w * 0.9));
  } else {
    ctx.fillText(name, cx, topLeft.sy + h * 0.5, w * 0.9);
  }
  ctx.restore();

  // 담긴 수 / 목표
  ctx.fillStyle = full ? palette.text : palette.textMuted;
  ctx.textAlign = "center";
  ctx.textBaseline = "bottom";
  ctx.font = `500 ${Math.max(8, Math.min(12, w * 0.26))}px system-ui, sans-serif`;
  ctx.fillText(`${bucket.count}/${bucket.capacity}`, cx, topLeft.sy - 3, w * 0.95);
}

export function drawScene(
  ctx: CanvasRenderingContext2D,
  game: Game,
  cam: Camera,
  palette: Palette,
  vp: Viewport,
): void {
  const world: World = game.world;

  // 배경 — 위가 밝고 아래가 살짝 어두워 낙하 방향이 읽힌다
  const grad = ctx.createLinearGradient(0, 0, 0, vp.h);
  grad.addColorStop(0, palette.bg);
  grad.addColorStop(1, palette.bgFar);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, vp.w, vp.h);

  // 판 테두리
  const tl = projectPoint(0, 0, cam);
  const br = projectPoint(WORLD_WIDTH, WORLD_HEIGHT, cam);
  ctx.strokeStyle = palette.frame;
  ctx.lineWidth = 1;
  ctx.strokeRect(tl.sx, tl.sy, br.sx - tl.sx, br.sy - tl.sy);

  // 양동이 (구슬보다 먼저 — 담긴 구슬이 위에 그려져야 한다)
  world.buckets.forEach((b) => drawBucket(ctx, b, game.names[b.ownerIndex] ?? "", cam, palette));

  // 벽·유도판
  for (const s of world.staticSolids) strokeSegment(ctx, s, cam, palette.frame);

  // 이벤트 블록
  for (const block of game.blocks) drawBlock(ctx, block, world.elapsed, cam, palette);

  // 날아다니는 구슬 — 폭탄을 나중에 그려 다른 구슬에 가리지 않게 한다
  for (const m of world.marbles) {
    if (m.kind === "normal") drawMarble(ctx, m.x, m.y, cam, palette);
  }
  for (const m of world.marbles) {
    if (m.kind === "bomb") drawMarble(ctx, m.x, m.y, cam, palette, "bomb");
  }

  // 양동이에 쌓인 구슬
  for (const b of world.buckets) {
    for (let i = 0; i < b.count; i++) {
      const spot = stackSpot(b, i);
      if (spot.y < b.top) break; // 넘치면 그리지 않는다
      drawMarble(ctx, spot.x, spot.y, cam, palette);
    }
  }

  // 방금 담긴 자리에 번지는 표시
  for (const c of world.captures) {
    const age = (world.elapsed - c.at) / CAPTURE_FLASH_SECONDS;
    if (age < 0 || age > 1) continue;
    const p = projectPoint(c.x, c.y, cam);
    const bomb = c.kind === "bomb";
    ctx.globalAlpha = (1 - age) * (bomb ? 0.85 : 0.5);
    ctx.strokeStyle = bomb ? palette.bumper : palette.accent;
    ctx.lineWidth = bomb ? 4 : 2;
    ctx.beginPath();
    // 폭탄은 훨씬 크게 번진다 — 무슨 일이 일어났는지 놓치면 안 된다
    ctx.arc(
      p.sx,
      p.sy,
      MARBLE_RADIUS * cam.scale * (1 + age * (bomb ? 12 : 2.5)),
      0,
      Math.PI * 2,
    );
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
}
