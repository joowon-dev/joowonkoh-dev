/**
 * 듀오 데칼코마니의 계산. 화면 그리기(CSS)와 저장(캔버스)이 같은 규칙을 쓰도록 여기 모았다.
 *
 * 펼친 정도 `open` 은 0(닫힘)~100(다 펼침). 왼쪽 반이 경첩(가운데 세로선)을 축으로
 * 보는 사람 쪽으로 접혀 오른쪽 반 위에 덮인다 — 애플 뷰어의 iPhone Duo 와 같은 방향이다.
 */

/** 펼친 화면의 가로:세로. 애플 뷰어에서 다 펼친 기기를 재 보면 1.4 쯤이다. */
export const OPEN_RATIO = 1.4;

/** 이만큼 닫히면 두 화면이 맞닿았다고 본다(찍힌다). */
export const SHUT_AT = 1;

export type Side = "left" | "right";

/** 펼친 정도 → 왼쪽 반이 돈 각도(0 = 평평, 180 = 다 덮음). */
export function angleFor(open: number): number {
  const clamped = Math.min(100, Math.max(0, open));
  return ((100 - clamped) / 100) * 180;
}

export function isShut(open: number): boolean {
  return open <= SHUT_AT;
}

/** 찍는 쪽의 반대편 — 물감이 옮겨 가는 쪽. */
export function otherSide(side: Side): Side {
  return side === "left" ? "right" : "left";
}

/**
 * object-fit: cover 와 같은 잘라내기. 가운데를 기준으로 자르므로
 * 좌우로 뒤집은 그림도 정확히 거울상이 된다(데칼코마니가 이음매에서 딱 맞는다).
 */
export function coverCrop(iw: number, ih: number, bw: number, bh: number) {
  const scale = Math.max(bw / iw, bh / ih);
  const sw = bw / scale;
  const sh = bh / scale;
  return { sx: (iw - sw) / 2, sy: (ih - sh) / 2, sw, sh };
}

/** 사진이 한쪽에만 들어갔을 때 빈 칸의 색 — 화면의 `.duo-paper` 와 같다. */
export const PAPER = "#f5f5f7";

/**
 * 결과를 캔버스에 그린다. 화면에서처럼 그림을 깔고, 찍혔다면 반대쪽 반에
 * 좌우로 뒤집은 그림을 덮는다 — 뒤집은 그림의 왼쪽 반이 곧 원래 오른쪽 반의 거울상이다.
 *
 * `half` 면 그림을 `source` 반 칸에만 맞춰 넣고 나머지는 빈 종이로 둔다.
 */
export function drawDecal(
  ctx: CanvasRenderingContext2D,
  img: CanvasImageSource & { width: number; height: number },
  w: number,
  h: number,
  printed: boolean,
  source: Side,
  half = false,
) {
  const dx = half && source === "right" ? w / 2 : 0;
  const dw = half ? w / 2 : w;
  const { sx, sy, sw, sh } = coverCrop(img.width, img.height, dw, h);
  if (half) {
    ctx.fillStyle = PAPER;
    ctx.fillRect(0, 0, w, h);
  }
  ctx.drawImage(img, sx, sy, sw, sh, dx, 0, dw, h);
  if (!printed) return;
  ctx.save();
  ctx.beginPath();
  ctx.rect(source === "right" ? 0 : w / 2, 0, w / 2, h);
  ctx.clip();
  ctx.translate(w, 0);
  ctx.scale(-1, 1);
  ctx.drawImage(img, sx, sy, sw, sh, dx, 0, dw, h);
  ctx.restore();
}
