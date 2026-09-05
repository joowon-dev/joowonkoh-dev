/**
 * 캔버스 그리기. 상태를 만들지도 바꾸지도 않고, 받은 세계를 그리기만 한다.
 *
 * 입자를 점이 아니라 **직전 위치에서 지금 위치까지 그은 선분**으로 그린다.
 * 점으로 찍으면 60fps에서도 알갱이가 뚝뚝 끊겨 보이고, 잔상을 남기려면 캔버스를
 * 반투명 검정으로 덮어야 하는데 그러면 뒤에 깔린 웹캠 화면이 가려진다.
 * 선분으로 그으면 캔버스를 매 프레임 깨끗이 지우고도 꼬리가 남는다.
 */

import type { HandState } from "./gesture";
import type { Flash, Particle, Shell, World } from "./firework";
import type { CoverRect } from "./viewport";

/** CSS 픽셀 기준 좌표계에서 그린다고 가정한다 — 배율은 컴포넌트가 transform으로 걸어 둔다 */
export interface Viewport {
  /** CSS 픽셀 폭 */
  w: number;
  /** CSS 픽셀 높이. 세계 좌표 1이 이 값이다 */
  h: number;
}

/** 수명이 끝나갈 때 훅 꺼지지 않고 서서히 사그라들게 */
const fade = (p: Particle): number => {
  const t = Math.max(0, Math.min(1, p.life / p.maxLife));
  return t * t;
};

/** 반짝이 화약. 위상을 x좌표에서 뽑아 입자마다 제각각 깜빡이게 한다 */
const flicker = (p: Particle, time: number): number =>
  0.35 + 0.65 * Math.abs(Math.sin(time * 26 + p.x * 97));

export function drawWorld(ctx: CanvasRenderingContext2D, world: World, vp: Viewport, time: number) {
  ctx.clearRect(0, 0, vp.w, vp.h);
  // 겹칠수록 밝아진다. 불꽃이 빽빽한 한가운데가 하얗게 타는 것이 이 한 줄이다.
  ctx.globalCompositeOperation = "lighter";
  ctx.lineCap = "round";

  // 섬광이 먼저다. 알갱이 밑에 깔려야 «빛 속에서 알갱이가 튀어나온다»로 읽힌다.
  for (const f of world.flashes) {
    drawFlash(ctx, f, vp);
  }

  for (const p of world.particles) {
    const a = fade(p) * (p.twinkle ? flicker(p, time) : 1);
    if (a <= 0.01) continue;
    ctx.strokeStyle = `hsla(${p.hue}, 95%, ${58 + 22 * a}%, ${a})`;
    ctx.lineWidth = p.size * (0.5 + 0.5 * a);
    ctx.beginPath();
    ctx.moveTo(p.px * vp.h, p.py * vp.h);
    ctx.lineTo(p.x * vp.h, p.y * vp.h);
    ctx.stroke();
  }

  for (const s of world.shells) {
    drawShell(ctx, s, vp);
  }

  ctx.globalCompositeOperation = "source-over";
}

/**
 * 터지는 순간의 빛. 사그라들면서 조금 더 퍼진다 —
 * 크기가 고정이면 «켜졌다 꺼지는 전구»로 보이고, 퍼져야 폭발로 읽힌다.
 */
function drawFlash(ctx: CanvasRenderingContext2D, f: Flash, vp: Viewport) {
  const t = Math.max(0, f.life / f.maxLife);
  const a = t * t * 0.55;
  const r = f.radius * vp.h * (1.35 - 0.35 * t);
  if (r <= 0 || a <= 0.005) return;

  const cx = f.x * vp.h;
  const cy = f.y * vp.h;
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, `hsla(${f.hue}, 90%, 92%, ${a})`);
  g.addColorStop(0.3, `hsla(${f.hue}, 95%, 66%, ${a * 0.45})`);
  g.addColorStop(1, `hsla(${f.hue}, 95%, 50%, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
}

/** 탄두 둘레의 빛. 화면 높이에 비례해서, 큰 화면에서도 같은 크기로 보인다 */
const SHELL_GLOW = 0.05;

function drawShell(ctx: CanvasRenderingContext2D, s: Shell, vp: Viewport) {
  const x = s.x * vp.h;
  const y = s.y * vp.h;

  ctx.strokeStyle = `hsla(${s.hue}, 100%, 78%, 0.9)`;
  ctx.lineWidth = 5.5;
  ctx.beginPath();
  ctx.moveTo(s.px * vp.h, s.py * vp.h);
  ctx.lineTo(x, y);
  ctx.stroke();

  // 탄두를 감싼 빛. 이게 없으면 아무리 굵게 그어도 «점»으로 보인다.
  const r = SHELL_GLOW * vp.h;
  const g = ctx.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `hsla(${s.hue}, 100%, 92%, 0.5)`);
  g.addColorStop(1, `hsla(${s.hue}, 100%, 70%, 0)`);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();

  // 탄두. 꼬리보다 밝아야 «올라가는 중»이 읽힌다
  ctx.fillStyle = "rgba(255,248,224,0.98)";
  ctx.beginPath();
  ctx.arc(x, y, 5, 0, Math.PI * 2);
  ctx.fill();
}

/**
 * 손바닥 표시. 잡히고 있다는 것과 «지금 얼마나 폈는지»를 같이 보여준다 —
 * 이게 없으면 안 나갈 때 손이 안 잡힌 건지 덜 편 건지 알 수가 없다.
 */
export function drawHands(
  ctx: CanvasRenderingContext2D,
  hands: HandState[],
  rect: CoverRect,
  ready: boolean,
) {
  for (const hand of hands) {
    // 손 좌표는 영상 프레임 기준이라 영상이 실제로 놓인 사각형을 거쳐야 한다
    const x = rect.x + hand.palm.x * rect.w;
    const y = rect.y + hand.palm.y * rect.h;
    const r = 16 + 26 * hand.openness;

    // 바탕 고리는 늘 같은 크기. 안쪽 호가 펼침도만큼 차오른다.
    ctx.strokeStyle = "rgba(255,255,255,0.22)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(x, y, 42, 0, Math.PI * 2);
    ctx.stroke();

    // 잠긴(주먹) 손은 따뜻한 색으로 «장전됨»을 알린다
    ctx.strokeStyle = hand.cocked
      ? "rgba(255,196,92,0.95)"
      : ready
        ? "rgba(255,255,255,0.5)"
        : "rgba(140,190,255,0.6)";
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.stroke();
  }
}
