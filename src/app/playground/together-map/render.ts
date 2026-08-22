import { TILE_SIZE, type View } from "./camera";
import { lerpLatLon, projectMercator, type LatLon } from "./geo";
import { MAX_GAP_MS, MAX_STAY_MS, type Meeting } from "./meet";
import type { RawPoint } from "./parse";
import type { Strings } from "./i18n";
import type { Summary } from "./summary";
import { TILE_ATTRIBUTION } from "./tiles";

export interface Size {
  w: number;
  h: number;
}

export interface Screen {
  x: number;
  y: number;
}

/** 화면에 남기는 꼬리 길이. 전체를 계속 그리면 곧 실뭉치가 된다. */
export const TAIL_MS = 6 * 3_600_000;

/** 링이 퍼졌다가 잦아드는 데 걸리는 시간. */
const PULSE_MS = 20 * 60_000;

export function viewToScreen(p: LatLon, view: View, size: Size): Screen {
  const worldPx = TILE_SIZE * 2 ** view.zoom;
  const here = projectMercator(p);
  const center = projectMercator({ lat: view.centerLat, lon: view.centerLon });

  return {
    x: (here.x - center.x) * worldPx + size.w / 2,
    y: (here.y - center.y) * worldPx + size.h / 2,
  };
}

/**
 * 지금 그려야 할 꼬리를 조각들로 나눠 준다.
 *
 * 하나의 이어진 선으로 주지 않는다. 기록이 비는 구간을 이으면 화면을 가로지르는
 * 직선이 생기고, 그건 실제로 가지 않은 길이다. 조각마다 따로 그린다.
 */
export function tailSegments(
  points: RawPoint[],
  now: number,
  tailMs: number,
  maxGapMs: number,
): LatLon[][] {
  const from = now - tailMs;
  const segments: LatLon[][] = [];
  let current: LatLon[] = [];
  let prevT = -Infinity;

  for (const p of points) {
    if (p.t < from) continue;
    if (p.t > now) break;

    if (current.length > 0 && p.t - prevT > maxGapMs) {
      segments.push(current);
      current = [];
    }
    current.push({ lat: p.lat, lon: p.lon });
    prevT = p.t;
  }
  if (current.length > 0) segments.push(current);

  return segments;
}

/**
 * 만남 링의 세기. 시작 순간 1이고 서서히 0으로 잦아든다.
 * 만남이 끝난 뒤에도 잔상이 남게 두지 않는다 — 끝난 만남이 계속 빛나면
 * 지금 만나고 있는 것과 구분이 안 된다.
 */
export function meetingPulse(meeting: Meeting, now: number): number {
  if (now < meeting.start || now > meeting.end) return 0;
  const age = now - meeting.start;
  return Math.max(0, 1 - age / PULSE_MS);
}

/**
 * 실제 거리(m)를 화면 픽셀로 바꾼다. 집 주변 가리기 반경을 그릴 때 쓴다.
 * 메르카토르는 위도가 높을수록 늘어나므로 cos(위도)로 보정한다.
 */
export function blurRadiusScreen(radiusM: number, lat: number, view: View): number {
  const worldPx = TILE_SIZE * 2 ** view.zoom;
  const metersPerWorldUnit = 40_075_016.686 * Math.cos((lat * Math.PI) / 180);
  return (radiusM / metersPerWorldUnit) * worldPx;
}

export interface Track {
  id: "a" | "b";
  name: string;
  color: string;
  points: RawPoint[];
}

export interface FrameState {
  size: Size;
  view: View;
  tracks: [Track, Track];
  meetings: Meeting[];
  now: number;
  /** 그려진 타일들. 없으면 배경은 흰색으로 둔다. */
  tiles: { image: CanvasImageSource; x: number; y: number; size: number }[];
  /** 지금까지 지나온 만남 수. 하단 카운터에 쓴다. */
  meetCount: number;
  title: string;
  /** 집 주변 가리기. null이면 안 가린다. */
  hide: { lat: number; lon: number; radiusM: number }[] | null;
  strings: Strings;
  /**
   * 마무리 카드. 0이면 안 그리고, 1이면 완전히 덮는다.
   * 재생이 끝나기 3초 전부터 1로 올린다.
   */
  summary: { data: Summary; opacity: number } | null;
}

const FONT_STACK = 'system-ui, -apple-system, "Apple SD Gothic Neo", sans-serif';

/**
 * `now` 시각의 위치를 구한다.
 *
 * `points`는 시간순으로 정렬돼 있다고 가정한다(parseTimeline이 이미 정렬해 준다).
 * `now`를 감싸는 두 점을 찾아 보간하되, 두 가지는 «모른다»로 답한다:
 *   - `now`가 기록 시작보다 이르거나 마지막 기록 이후일 때
 *   - 앞뒤 점 사이 간격이 MAX_GAP_MS를 넘을 때(구멍 — 이으면 없는 이동이 생긴다)
 *
 * `until`이 있는 방문 점은 예외다. [t, until] 구간 전체가 «그 자리에 있었다»는
 * 기록이므로, 그 안이면 바로 그 점을 준다 — 사람이 한자리에 오래 머무는 동안
 * 점이 사라지거나 다음 점으로 순간이동하면 안 된다. until은 MAX_STAY_MS로
 * 상한을 둔다(resample과 같은 규칙) — 손상된 until을 그대로 믿지 않는다.
 */
export function currentPosition(points: RawPoint[], now: number): LatLon | null {
  if (points.length === 0) return null;

  // now 이전(또는 같은) 마지막 점을 찾는다. points는 정렬돼 있다.
  let idx = -1;
  for (let i = 0; i < points.length; i += 1) {
    if (points[i].t > now) break;
    idx = i;
  }
  if (idx === -1) return null; // 첫 기록보다 이전 — 모른다

  const cur = points[idx];

  if (cur.until !== undefined) {
    const stayEnd = Math.min(cur.until, cur.t + MAX_STAY_MS);
    if (now <= stayEnd) return { lat: cur.lat, lon: cur.lon };
  }

  const next = points[idx + 1];
  if (next === undefined) return null; // 마지막 기록 이후 — 모른다
  if (next.t - cur.t > MAX_GAP_MS) return null; // 구멍 — 잇지 않는다

  const f = (now - cur.t) / (next.t - cur.t);
  return lerpLatLon(cur, next, f);
}

/**
 * 상단 제목, 하단 이름/카운터, 우하단 저작권 표기를 그린다.
 *
 * 폰트는 전부 시스템 폰트 스택으로 지정한다 — 캔버스는 웹폰트를 못 쓸 수 있고,
 * 웹폰트 이름을 적으면 조용히 기본 폰트로 떨어져서 미리보기와 결과물이 달라진다.
 */
function drawChrome(ctx: CanvasRenderingContext2D, state: FrameState): void {
  const { size, tracks, strings } = state;
  const pad = size.w * 0.04;

  ctx.textBaseline = "alphabetic";

  // 상단 제목
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `700 ${Math.round(size.w / 24)}px ${FONT_STACK}`;
  ctx.textAlign = "left";
  ctx.fillText(state.title, pad, pad + size.w / 24);

  // 하단 왼쪽 — 두 사람 이름과 색 점
  const nameFontSize = Math.round(size.w / 40);
  ctx.font = `600 ${nameFontSize}px ${FONT_STACK}`;
  ctx.textAlign = "left";
  let ny = size.h - pad;
  for (let i = tracks.length - 1; i >= 0; i -= 1) {
    const track = tracks[i];
    const dotR = nameFontSize * 0.28;

    ctx.beginPath();
    ctx.arc(pad + dotR, ny - nameFontSize * 0.35, dotR, 0, Math.PI * 2);
    ctx.fillStyle = track.color;
    ctx.fill();

    ctx.fillStyle = "#1a1a1a";
    ctx.fillText(track.name, pad + dotR * 2 + dotR, ny);

    ny -= nameFontSize * 1.4;
  }

  // 하단 오른쪽 — 만남 카운터
  const countText = strings.meetingsFound.replace("{n}", String(state.meetCount));
  ctx.textAlign = "right";
  ctx.fillStyle = "#1a1a1a";
  ctx.font = `600 ${nameFontSize}px ${FONT_STACK}`;
  ctx.fillText(countText, size.w - pad, size.h - pad);

  // 우하단 구석 — 타일 저작권 표기. 지도를 깔았으면 반드시 있어야 한다.
  ctx.font = `${Math.round(size.w / 70)}px ${FONT_STACK}`;
  ctx.fillStyle = "rgba(26, 26, 26, 0.65)";
  ctx.textAlign = "right";
  ctx.fillText(TILE_ATTRIBUTION, size.w - pad * 0.4, size.h - pad * 0.4);
}

/**
 * 마무리 카드. 화면을 반투명 흰색으로 덮고 요약 수치를 큰 글씨로 쌓는다.
 *
 * favourite와 farthest는 null일 수 있다 — 계산이 안 된 것과 실제로 0/없음인 것을
 * 구분할 수 없으므로 「0km」나 「-」를 적지 않고 그 줄 자체를 건너뛴다.
 */
function drawSummaryCard(
  ctx: CanvasRenderingContext2D,
  state: FrameState,
  summary: Summary,
  opacity: number,
): void {
  const { size, strings } = state;

  ctx.globalAlpha = opacity * 0.94;
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size.w, size.h);
  ctx.globalAlpha = opacity;

  const pad = size.w * 0.08;
  const lineGap = size.w / 14;
  let y = size.h * 0.34;

  ctx.textAlign = "left";
  ctx.fillStyle = "#1a1a1a";

  ctx.font = `700 ${Math.round(size.w / 16)}px ${FONT_STACK}`;
  ctx.fillText(
    summary.meetCount > 0
      ? strings.meetingsFound.replace("{n}", String(summary.meetCount))
      : strings.noMeetings,
    pad,
    y,
  );
  y += lineGap;

  ctx.font = `500 ${Math.round(size.w / 26)}px ${FONT_STACK}`;

  if (summary.totalTogetherMs > 0) {
    const hours = summary.totalTogetherMs / 3_600_000;
    ctx.fillText(`${strings.totalTogether}: ${hours.toFixed(1)}h`, pad, y);
    y += lineGap;
  }

  if (summary.favourite) {
    ctx.fillText(
      `${strings.favouriteSpot}: ${summary.favourite.lat.toFixed(4)}, ${summary.favourite.lon.toFixed(4)}`,
      pad,
      y,
    );
    y += lineGap;
  }

  if (summary.farthest) {
    const km = (summary.farthest.meters / 1000).toFixed(1);
    const date = new Date(summary.farthest.at).toISOString().slice(0, 10);
    ctx.fillText(`${strings.farthestApart}: ${km}km (${date})`, pad, y);
    y += lineGap;
  }

  ctx.globalAlpha = 1;
}

/**
 * 한 프레임을 캔버스에 그린다. 호출 순서가 곧 겹치는 순서다.
 *
 * 배경(흰색) → 타일 → 꼬리(오래된 쪽이 옅게, 조각별로 끊어서) → 현재 위치(흰 테두리
 * 원) → 만남 링(진행 중인 것만) → 집 주변 가리기(궤적 위에 덮어야 실제로 가려진다)
 * → 글자(system-ui 계열 폰트) → 마무리 카드(마지막에 전체를 덮는다).
 * 이 순서를 바꾸면 궤적이 타일 밑에 깔리거나, 가리기가 궤적보다 먼저 그려져
 * 가림 효과가 사라지는 등 조용한 시각 버그가 생긴다.
 */
export function drawFrame(ctx: CanvasRenderingContext2D, state: FrameState): void {
  const { size, view, tracks, meetings, now } = state;

  // 1. 배경. 타일이 아직 안 왔을 때 검은 화면이 되지 않게 흰색으로 채운다.
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size.w, size.h);

  // 2. 타일. size는 반드시 명시한다 — 타일은 @2x(512px)로 받아 오지만
  //    TileRef.size는 TILE_SIZE=256 기준으로 계산돼 있다. drawImage의 크기
  //    인자를 생략하면 원본 이미지 크기(512)로 그려져 지도가 두 배로 커진다.
  for (const tile of state.tiles) {
    ctx.drawImage(tile.image, tile.x, tile.y, tile.size, tile.size);
  }

  // 3. 가릴 구역. 궤적보다 먼저 깔면 안 된다 — 궤적을 덮어야 가려진다.
  //    그래서 여기가 아니라 4번 뒤에 온다. (아래 6.5 참조)

  // 4. 꼬리. 조각마다 따로 그린다 — 이어 그리면 기록이 빈 구간에
  //    실제로 가지 않은 직선이 생긴다.
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = size.w / 270;

  for (const track of tracks) {
    const segments = tailSegments(track.points, now, TAIL_MS, MAX_GAP_MS);
    ctx.strokeStyle = track.color;

    for (const seg of segments) {
      // 오래된 쪽이 옅어지도록 두 점씩 끊어 그린다. 한 번에 그리면
      // 조각 전체가 같은 투명도라 «지나온 흔적»으로 안 읽힌다.
      for (let i = 1; i < seg.length; i += 1) {
        ctx.globalAlpha = 0.15 + 0.85 * (i / seg.length);
        const from = viewToScreen(seg[i - 1], view, size);
        const to = viewToScreen(seg[i], view, size);
        ctx.beginPath();
        ctx.moveTo(from.x, from.y);
        ctx.lineTo(to.x, to.y);
        ctx.stroke();
      }
    }
  }
  ctx.globalAlpha = 1;

  // 5. 현재 위치. 흰 테두리를 둘러야 어느 색 지도 위에서도 보인다.
  for (const track of tracks) {
    const head = currentPosition(track.points, now);
    if (!head) continue;
    const s = viewToScreen(head, view, size);
    const r = size.w / 90;

    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fillStyle = track.color;
    ctx.fill();
    ctx.lineWidth = r * 0.35;
    ctx.strokeStyle = "#ffffff";
    ctx.stroke();
  }

  // 6. 만남 링. 진행 중인 것만 그린다 — 끝난 만남이 계속 빛나면
  //    지금 만나고 있는 것과 구분이 안 된다.
  for (const m of meetings) {
    const pulse = meetingPulse(m, now);
    if (pulse <= 0) continue;
    const s = viewToScreen(m, view, size);

    ctx.globalAlpha = pulse;
    ctx.strokeStyle = "#e0447c";
    ctx.lineWidth = size.w / 200;
    ctx.beginPath();
    ctx.arc(s.x, s.y, size.w * 0.02 * (1 + (1 - pulse) * 3), 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // 6.5. 집 주변 가리기. 궤적 위에 덮어야 실제로 가려진다.
  if (state.hide) {
    ctx.globalAlpha = 0.92;
    ctx.fillStyle = "#ffffff";
    for (const spot of state.hide) {
      const s = viewToScreen(spot, view, size);
      ctx.beginPath();
      ctx.arc(s.x, s.y, blurRadiusScreen(spot.radiusM, spot.lat, view), 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  // 7. 글자. 캔버스는 웹폰트를 못 쓸 수 있으므로 시스템 폰트로 지정한다.
  drawChrome(ctx, state);

  // 8. 마무리 카드
  if (state.summary && state.summary.opacity > 0) {
    drawSummaryCard(ctx, state, state.summary.data, state.summary.opacity);
  }

  ctx.restore();
}
