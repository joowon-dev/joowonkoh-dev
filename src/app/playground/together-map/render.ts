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

/**
 * 꼬리와 링의 길이는 «타임라인 시간»이 아니라 «영상 시간»으로 정한다.
 *
 * 이 도구는 몇 달을 몇십 초로 압축한다. 90일을 10초에 담으면 한 프레임이
 * 타임라인 7시간을 건너뛴다 — 꼬리를 타임라인 6시간으로 잡으면 꼬리 전체가
 * 한 프레임보다 짧아서 선이 아예 안 그려지고, 링을 20분으로 잡으면 만남 하나가
 * 프레임 사이 틈으로 통째로 빠져 한 번도 안 보인다. 실제로 샘플 90일/10초에서
 * 만남 28건 중 화면에 링이 뜬 프레임은 300장 중 3장뿐이었다.
 *
 * 그래서 프레임당 진행량(pace)에 비례해 잡는다. 압축률이 얼마든 꼬리는 1.5초,
 * 링은 1초 동안 보인다. 짧은 타임라인에서 pace가 작아 꼬리가 사라지지 않도록
 * 최소값을 함께 둔다.
 */
const TAIL_FRAMES = 45;
const MIN_TAIL_MS = 30 * 60_000;
const PULSE_FRAMES = 30;
const MIN_PULSE_MS = 5 * 60_000;

/** 이번 프레임에 그릴 꼬리 길이(타임라인 ms). */
export function tailMsFor(paceMsPerFrame: number): number {
  return Math.max(paceMsPerFrame * TAIL_FRAMES, MIN_TAIL_MS);
}

/** 만남 링이 퍼졌다가 잦아드는 데 걸리는 시간(타임라인 ms). */
export function pulseMsFor(paceMsPerFrame: number): number {
  return Math.max(paceMsPerFrame * PULSE_FRAMES, MIN_PULSE_MS);
}

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
export function meetingPulse(
  meeting: Meeting,
  now: number,
  pulseMs: number,
): number {
  // 창은 «만남이 실제로 이어진 시간»과 «최소 노출 시간» 중 긴 쪽이다.
  // 앞은 두 시간짜리 만남이 20분 만에 링을 잃지 않게 하고,
  // 뒤는 압축된 영상에서 짧은 만남이 프레임 사이로 사라지지 않게 한다.
  const window = Math.max(meeting.end - meeting.start, pulseMs);
  if (now < meeting.start || now > meeting.start + window) return 0;
  const age = now - meeting.start;
  return Math.max(0, 1 - age / window);
}

/**
 * 실제 거리(m)를 화면 픽셀로 바꾼다. 집 주변 가리기 반경을 그릴 때 쓴다.
 * 메르카토르는 위도가 높을수록 늘어나므로 cos(위도)로 보정한다.
 */
export function blurRadiusScreen(
  radiusM: number,
  lat: number,
  view: View,
): number {
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
  /**
   * 한 프레임이 건너뛰는 타임라인 시간(ms). 꼬리 길이와 링 지속을 여기에 맞춘다.
   * 자세한 이유는 TAIL_FRAMES 위 주석 참조.
   */
  paceMsPerFrame: number;
  /** 날짜를 보는 사람의 언어·시간대로 적기 위한 로캘 코드. */
  lang: string;
  /** 기간 전체에서 지금 어디쯤인가(0~1). 진행 막대에 쓴다. */
  progress: number;
}

const FONT_STACK =
  'system-ui, -apple-system, "Apple SD Gothic Neo", sans-serif';

/**
 * 타임스탬프를 «보는 사람의 시각»으로 적는다.
 *
 * toISOString()을 쓰면 안 된다 — 그건 UTC라 한국에서는 오전 9시 이전의 순간이
 * 하루 전날로 찍힌다. 만남 목록(MeetList)은 이미 현지 시각으로 보여 주고 있어서,
 * 같은 만남이 카드와 목록에서 다른 날짜로 나오게 된다. 카드는 사람들이 캡처해
 * 공유하는 프레임이라 그 어긋남이 그대로 남는다.
 */
export function formatDate(t: number, lang: string): string {
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(t));
}

/** 날짜에 시:분까지 붙여 «지금 흐르고 있는 시각»을 보여 준다. */
export function formatDateTime(t: number, lang: string): string {
  return new Intl.DateTimeFormat(lang, {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(t));
}

/**
 * `now` 시각의 위치를 구한다.
 *
 * `points`는 시간순으로 정렬돼 있다고 가정한다(parseTimeline이 이미 정렬해 준다).
 * `now`를 감싸는 두 점을 찾아 보간한다. 기록이 아예 없는 구간 — `now`가 첫 기록보다
 * 이르거나 마지막 기록 이후일 때 — 만 «모른다»(null)로 답한다.
 *
 * 앞뒤 점 사이가 MAX_GAP_MS를 넘는 «구멍»일 때는 null이 아니라 마지막으로 알던
 * 자리를 `stale: true`로 돌려준다. 예전엔 여기서도 null을 줬는데, 그러면 샘플
 * 90일 기준 프레임의 42%에서 두 사람 다 화면에서 사라졌다 — 영상 내내 점이
 * 깜빡거렸다. 구멍을 «이어서 그리지 않는» 규칙은 꼬리(tailSegments)와 만남
 * 감지기(meet.ts)가 계속 지킨다. 그쪽은 없는 이동과 없는 만남을 지어내지만,
 * 마지막으로 알던 자리에 점을 두는 것은 아무것도 지어내지 않는다. 대신 호출부는
 * `stale`을 보고 «지금 기록이 비어 있다»는 걸 그림으로 구분해 줘야 한다.
 *
 * `until`이 있는 방문 점은 예외다. [t, until] 구간 전체가 «그 자리에 있었다»는
 * 기록이므로, 그 안이면 바로 그 점을 준다 — 사람이 한자리에 오래 머무는 동안
 * 점이 사라지거나 다음 점으로 순간이동하면 안 된다. until은 MAX_STAY_MS로
 * 상한을 둔다(resample과 같은 규칙) — 손상된 until을 그대로 믿지 않는다.
 */
export interface Head extends LatLon {
  /** 지금 이 순간의 기록이 없어서 «마지막으로 알던 자리»를 보여 주는 중이다. */
  stale: boolean;
}

export function currentPosition(
  points: RawPoint[],
  now: number,
): Head | null {
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
    if (now <= stayEnd) return { lat: cur.lat, lon: cur.lon, stale: false };
  }

  const next = points[idx + 1];
  if (next === undefined) return null; // 마지막 기록 이후 — 모른다
  // 구멍. 이어서 «움직였다»고 그리지는 않되, 마지막으로 알던 자리는 남긴다.
  if (next.t - cur.t > MAX_GAP_MS) {
    return { lat: cur.lat, lon: cur.lon, stale: true };
  }

  const f = (now - cur.t) / (next.t - cur.t);
  return { ...lerpLatLon(cur, next, f), stale: false };
}

/**
 * 상단 제목, 하단 이름/카운터, 우하단 저작권 표기를 그린다.
 *
 * 폰트는 전부 시스템 폰트 스택으로 지정한다 — 캔버스는 웹폰트를 못 쓸 수 있고,
 * 웹폰트 이름을 적으면 조용히 기본 폰트로 떨어져서 미리보기와 결과물이 달라진다.
 */
function drawChrome(ctx: CanvasRenderingContext2D, state: FrameState): void {
  const { size, tracks } = state;
  const pad = size.w * 0.04;

  ctx.textBaseline = "alphabetic";

  // 상단 — 지금 재생 중인 날짜와 시각.
  //
  // 이게 없으면 화면이 멈춘 것처럼 보인다. 점이 크게 움직이지 않는 구간에서는
  // 사람이 «시간이 흐르고 있다»고 읽을 단서가 아무것도 없기 때문이다.
  const stampSize = Math.round(size.w / 26);
  ctx.font = `700 ${stampSize}px ${FONT_STACK}`;
  ctx.fillStyle = "#1a1a1a";
  ctx.textAlign = "left";
  let topY = pad + stampSize;
  ctx.fillText(formatDateTime(state.now, state.lang), pad, topY);

  // 사용자가 직접 넣은 제목이 있을 때만 그 아래에 적는다. 기본 제목을 항상
  // 얹으면 화면 위쪽이 «날짜와 시각»만 남기를 바라는 기본 구성과 어긋난다.
  if (state.title) {
    const titleSize = Math.round(size.w / 34);
    topY += titleSize * 1.4;
    ctx.font = `600 ${titleSize}px ${FONT_STACK}`;
    ctx.fillStyle = "#5b6270";
    ctx.fillText(state.title, pad, topY);
  }

  // 그리고 진행 막대. 날짜는 계단처럼 툭툭 바뀌므로, 매 프레임 조금씩 자라는
  // 것이 하나는 있어야 «흐르는» 느낌이 난다.
  const barY = topY + stampSize * 0.7;
  const barW = size.w - pad * 2;
  const barH = Math.max(2, size.w / 300);
  const progress = Math.max(0, Math.min(1, state.progress));

  ctx.fillStyle = "rgba(26, 26, 26, 0.12)";
  ctx.fillRect(pad, barY, barW, barH);
  ctx.fillStyle = "#1a1a1a";
  ctx.fillRect(pad, barY, barW * progress, barH);

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

  // 우하단 구석 — 타일 저작권 표기. 지도를 깔았으면 반드시 있어야 한다.
  ctx.font = `${Math.round(size.w / 70)}px ${FONT_STACK}`;
  ctx.fillStyle = "rgba(26, 26, 26, 0.65)";
  ctx.textAlign = "right";
  ctx.fillText(TILE_ATTRIBUTION, size.w - pad * 0.4, size.h - pad * 0.4);
}

/**
 * 마무리 카드.
 *
 * 지도를 완전히 덮지 않는다. 이 화면의 주인공은 «둘이 함께 지나온 길»이고 수치는
 * 그 위에 얹히는 것이다. 옅은 흰 막만 깔아 길이 비쳐 보이게 한 뒤, 가운데
 * 카드에 두 사람 이름과 요약을 쌓는다.
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
  const { size, strings, tracks } = state;

  ctx.globalAlpha = opacity;

  // 1. 길이 비쳐 보이는 옅은 막. 진하게 깔면 «전체 경로를 보여준다»는 목적이
  //    막 뒤에서 지워진다 — 글자가 읽힐 만큼만 덮는다.
  ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
  ctx.fillRect(0, 0, size.w, size.h);

  // 2. 본문 줄들을 먼저 정해야 카드 높이를 잴 수 있다.
  const rows: string[] = [];
  if (summary.totalTogetherMs > 0) {
    const hours = summary.totalTogetherMs / 3_600_000;
    // 문자열 자체가 구분자(": ")를 이미 품고 있다(meetingsFound와 같은 관례) —
    // 여기서 또 ": "를 붙이면 두 번 찍힌다. {n}은 값만 채운다.
    rows.push(
      strings.totalTogether.replace("{n}", `${hours.toFixed(1)}${strings.hoursUnit}`),
    );
  }
  if (summary.favourite) {
    // 좌표를 그대로 찍지 않는다. 지도 위 집 주변 가리기(6.5)는 지도에만 적용되고
    // 이 카드는 건드리지 않는다 — 두 사람이 가장 자주 만난 곳은 대개 둘 중 한쪽
    // 집이라, 좌표를 4자리(≈11m 오차)까지 적으면 지도에서 가린 집 주소를 카드가
    // 그대로 흘린다. 카드는 스크린샷으로 공유되는 프레임이라 더 위험하다.
    // 좌표 대신 몇 번 만났는지(count)를 보여준다 — 그게 실제로 궁금한 값이다.
    rows.push(strings.favouriteSpot.replace("{n}", String(summary.favourite.count)));
  }
  if (summary.farthest) {
    const km = (summary.farthest.meters / 1000).toFixed(1);
    const date = formatDate(summary.farthest.at, state.lang);
    rows.push(
      strings.farthestApart.replace("{n}", `${km}${strings.kmUnit} (${date})`),
    );
  }

  const nameSize = Math.round(size.w / 28);
  const headlineSize = Math.round(size.w / 15);
  const rowSize = Math.round(size.w / 27);
  const rowGap = rowSize * 1.75;
  const inset = size.w * 0.07;

  const cardW = size.w * 0.86;
  const cardX = (size.w - cardW) / 2;
  const cardH =
    inset * 2 + nameSize * 1.6 + headlineSize * 1.5 + rows.length * rowGap;
  // 카드는 아래쪽에 앉힌다. 한가운데 두면 궤적이 제일 촘촘한 생활권 위를 그대로
  // 덮어서, 정작 «함께 걸은 길»이 카드 뒤에 숨는다.
  const cardY = size.h - cardH - size.h * 0.1;

  // 3. 카드 바탕.
  ctx.beginPath();
  ctx.roundRect(cardX, cardY, cardW, cardH, size.w * 0.045);
  ctx.fillStyle = "rgba(255, 255, 255, 0.95)";
  ctx.fill();
  ctx.lineWidth = Math.max(1, size.w / 540);
  ctx.strokeStyle = "rgba(26, 26, 26, 0.10)";
  ctx.stroke();

  let y = cardY + inset + nameSize;

  // 4. 두 사람 — 각자의 색 점과 이름, 사이에 하트. 이 영상이 «둘»의 것이라는 걸
  //    수치보다 먼저 보여 준다.
  ctx.textBaseline = "alphabetic";
  ctx.font = `600 ${nameSize}px ${FONT_STACK}`;
  const heart = " ♥ ";
  const dotR = nameSize * 0.3;
  const gap = dotR * 1.6;
  const [ta, tb] = tracks;
  const wA = ctx.measureText(ta.name).width;
  const wB = ctx.measureText(tb.name).width;
  const wHeart = ctx.measureText(heart).width;
  const total = dotR * 2 + gap + wA + wHeart + dotR * 2 + gap + wB;

  let x = (size.w - total) / 2;
  ctx.textAlign = "left";

  ctx.beginPath();
  ctx.arc(x + dotR, y - nameSize * 0.32, dotR, 0, Math.PI * 2);
  ctx.fillStyle = ta.color;
  ctx.fill();
  x += dotR * 2 + gap;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText(ta.name, x, y);
  x += wA;

  ctx.fillStyle = "#e0447c";
  ctx.fillText(heart, x, y);
  x += wHeart;

  ctx.beginPath();
  ctx.arc(x + dotR, y - nameSize * 0.32, dotR, 0, Math.PI * 2);
  ctx.fillStyle = tb.color;
  ctx.fill();
  x += dotR * 2 + gap;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText(tb.name, x, y);

  y += nameSize * 0.6 + headlineSize;

  // 5. 큰 한 줄 — 만난 횟수.
  ctx.textAlign = "center";
  ctx.font = `700 ${headlineSize}px ${FONT_STACK}`;
  ctx.fillStyle = "#1a1a1a";
  ctx.fillText(
    summary.meetCount > 0
      ? strings.meetingsFound.replace("{n}", String(summary.meetCount))
      : strings.noMeetings,
    size.w / 2,
    y,
  );

  y += headlineSize * 0.5;

  // 6. 나머지 수치들.
  ctx.font = `500 ${rowSize}px ${FONT_STACK}`;
  ctx.fillStyle = "#4a5160";
  for (const row of rows) {
    y += rowGap;
    ctx.fillText(row, size.w / 2, y);
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
export function drawFrame(
  ctx: CanvasRenderingContext2D,
  state: FrameState,
): void {
  const { size, view, tracks, meetings, now } = state;

  // save()/restore()를 try/finally로 감싼다. 안에서(특히 drawSummaryCard의
  // 날짜 포맷팅) 던져진 예외가 restore()를 건너뛰면, 이번 프레임에서 바꾼
  // globalAlpha·fillStyle 등이 지워지지 않은 채 다음 프레임의 «깨끗한» save()
  // 시작점이 돼 버린다 — 즉 한 번의 실패가 이후 모든 프레임에 새어 나간다.
  ctx.save();
  try {
    // 1. 배경. 타일이 아직 안 왔을 때 검은 화면이 되지 않게 흰색으로 채운다.
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
    // 궤적은 이 영상의 주인공이다. 지도 타일 위에서 가늘면 도로선과 섞여 버려서,
    // 두 사람의 «걸은 길»이 배경의 일부처럼 읽힌다. 확실히 더 굵게 긋는다.
    // 마무리에서는 영상에 나왔던 길 «전체»를 다시 펼친다. 꼬리 길이를 그대로 두면
    // 마지막 몇 시간만 남아서, 요약 수치가 가리키는 여정이 정작 화면에 없다.
    const finale = state.summary !== null;
    const tailMs = finale ? Number.POSITIVE_INFINITY : tailMsFor(state.paceMsPerFrame);

    // 마무리는 오히려 «가늘게» 긋는다.
    //
    // 직관과 반대라 이유를 적어 둔다. 마무리는 여정 전체가 담기도록 시야가 크게
    // 물러나 있는데, 그러면 하루하루의 이동은 화면에서 아주 짧아진다. 샘플에서
    // 재 보니 시야는 줌 7.2로 벌어지고 제일 긴 조각도 12.6px뿐이었다 — 재생 때
    // 굵기(9.4px)로 그으면 선이 아니라 뭉친 점 158개가 된다. 가늘게 그어야
    // 그 조각들이 «지나온 길»의 모양으로 읽힌다.
    ctx.lineWidth = finale ? Math.max(1.5, size.w / 400) : size.w / 150;

    for (const track of tracks) {
      const segments = tailSegments(track.points, now, tailMs, MAX_GAP_MS);
      ctx.strokeStyle = track.color;

      for (const seg of segments) {
        // 오래된 쪽이 옅어지도록 두 점씩 끊어 그린다. 한 번에 그리면
        // 조각 전체가 같은 투명도라 «지나온 흔적»으로 안 읽힌다.
        for (let i = 1; i < seg.length; i += 1) {
          // 재생 중에는 오래된 쪽이 옅어져야 «지나온 흔적»으로 읽힌다. 마무리에서는
          // 전체 여정을 한 장으로 보여주는 것이므로 고르게 진하게 긋는다.
          ctx.globalAlpha = finale ? 0.9 : 0.28 + 0.72 * (i / seg.length);
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
    //
    // 마무리에서는 그리지 않는다. 그때는 «지금 어디»가 아니라 «지나온 전부»를
    // 보여주는 화면이고, 물러난 시야에서 이 점(약 17px)은 궤적 조각(약 12px)보다
    // 커서 정작 보여주려는 길을 덮어 버린다.
    for (const track of finale ? [] : tracks) {
      const head = currentPosition(track.points, now);
      if (!head) continue;
      const s = viewToScreen(head, view, size);
      const r = size.w / 62;

      // 흰 후광을 먼저 깐다. 지도 타일에는 초록 공원도 회색 도로도 있어서,
      // 점만 찍으면 배경색에 따라 있는 듯 없는 듯 묻힌다 — 특히 영상이
      // 시작하자마자 «두 사람이 어디 있는지»부터 눈에 들어와야 한다.
      ctx.globalAlpha = head.stale ? 0.8 : 1;
      ctx.beginPath();
      ctx.arc(s.x, s.y, r * 1.5, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255, 255, 255, 0.85)";
      ctx.fill();

      // 기록이 비는 동안은 «마지막으로 알던 자리»다. 속을 비워 그려서
      // 지금 확실히 아는 위치와 구분한다 — 채워진 점과 똑같이 그리면
      // 모르는 것을 안다고 말하는 셈이다.
      ctx.beginPath();
      ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
      ctx.fillStyle = head.stale ? "#ffffff" : track.color;
      ctx.fill();
      ctx.lineWidth = r * 0.4;
      ctx.strokeStyle = head.stale ? track.color : "#ffffff";
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    // 6. 만남 링. 진행 중인 것만 그린다 — 끝난 만남이 계속 빛나면
    //    지금 만나고 있는 것과 구분이 안 된다.
    const pulseMs = pulseMsFor(state.paceMsPerFrame);
    for (const m of meetings) {
      const pulse = meetingPulse(m, now, pulseMs);
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
        ctx.arc(
          s.x,
          s.y,
          blurRadiusScreen(spot.radiusM, spot.lat, view),
          0,
          Math.PI * 2,
        );
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
  } finally {
    ctx.restore();
  }
}
