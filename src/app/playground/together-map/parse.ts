import type { LatLon } from "./geo";

export type TimelineFormat = "android" | "ios" | "records";

export interface RawPoint {
  t: number;
  lat: number;
  lon: number;
  /** 미터. 옛 형식에만 있다. 없는 것과 «정확함»은 다르므로 0으로 채우지 않는다. */
  accuracy?: number;
  kind: "visit" | "path";
}

export class TimelineParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "TimelineParseError";
  }
}

/**
 * 좌표 문자열 한 줄을 읽는다.
 *
 * 구글은 같은 값을 기기마다 다르게 적는다.
 *   안드로이드  "37.5665°, 126.9780°"
 *   아이폰      "geo:37.5665,126.9780"
 * 도 기호와 geo: 접두사를 걷어내고 숫자 두 개만 남기면 둘 다 같은 길로 처리된다.
 */
export function parseLatLngString(s: unknown): LatLon | null {
  if (typeof s !== "string") return null;
  const cleaned = s.replace(/^geo:/i, "").replace(/°/g, "");
  const parts = cleaned.split(",");
  if (parts.length !== 2) return null;

  const lat = Number(parts[0].trim());
  const lon = Number(parts[1].trim());
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) return null;
  // 범위를 벗어나면 파싱이 어긋난 것이다. 그대로 통과시키면 지도 바깥에 점이 찍힌다.
  if (Math.abs(lat) > 90 || Math.abs(lon) > 180) return null;

  return { lat, lon };
}

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null && !Array.isArray(v);
}

export function detectFormat(data: unknown): TimelineFormat | null {
  if (Array.isArray(data)) return "ios";
  if (!isRecord(data)) return null;
  if (Array.isArray(data.semanticSegments)) return "android";
  if (Array.isArray(data.locations)) return "records";
  return null;
}

/** 숫자든 문자열이든 받는다 — 아이폰은 거리와 오프셋을 문자열로 적는다. */
function num(v: unknown): number | undefined {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string") {
    const n = Number(v);
    if (Number.isFinite(n)) return n;
  }
  return undefined;
}

function parseTime(v: unknown): number | undefined {
  if (typeof v !== "string") return undefined;
  const t = Date.parse(v);
  return Number.isNaN(t) ? undefined : t;
}

/**
 * 방문 좌표를 꺼낸다. 안드로이드는 placeLocation.latLng 아래 한 겹 더 들어가 있고
 * 아이폰은 placeLocation 자체가 문자열이다.
 */
function visitLatLon(visit: unknown): LatLon | null {
  if (!isRecord(visit)) return null;
  const top = visit.topCandidate;
  if (!isRecord(top)) return null;

  const loc = top.placeLocation;
  if (typeof loc === "string") return parseLatLngString(loc);
  if (isRecord(loc)) return parseLatLngString(loc.latLng);
  return null;
}

function activityLatLon(endpoint: unknown): LatLon | null {
  if (typeof endpoint === "string") return parseLatLngString(endpoint);
  if (isRecord(endpoint)) return parseLatLngString(endpoint.latLng);
  return null;
}

function parseSegments(segments: unknown[]): RawPoint[] {
  const out: RawPoint[] = [];

  for (const seg of segments) {
    if (!isRecord(seg)) continue;
    const start = parseTime(seg.startTime);
    const end = parseTime(seg.endTime);

    // 방문 — 머무른 자리 하나
    const visited = visitLatLon(seg.visit);
    if (visited && start !== undefined) {
      out.push({ t: start, ...visited, kind: "visit" });
    }

    // 이동 — 출발점과 도착점
    if (isRecord(seg.activity)) {
      const from = activityLatLon(seg.activity.start);
      const to = activityLatLon(seg.activity.end);
      if (from && start !== undefined) out.push({ t: start, ...from, kind: "path" });
      if (to && end !== undefined) out.push({ t: end, ...to, kind: "path" });
    }

    // 경로 — 촘촘한 부스러기 점들
    if (Array.isArray(seg.timelinePath) && start !== undefined) {
      for (const step of seg.timelinePath) {
        if (!isRecord(step)) continue;
        const at = parseLatLngString(step.point);
        if (!at) continue;

        // 안드로이드는 절대 시각, 아이폰은 시작시각으로부터 몇 분인지를 적는다.
        const abs = parseTime(step.time);
        const offset = num(step.durationMinutesOffsetFromStartTime);
        const t = abs ?? (offset === undefined ? undefined : start + offset * 60_000);
        if (t === undefined) continue;

        out.push({ t, ...at, kind: "path" });
      }
    }
  }

  return out;
}

function parseRecords(locations: unknown[]): RawPoint[] {
  const out: RawPoint[] = [];

  for (const loc of locations) {
    if (!isRecord(loc)) continue;
    const latE7 = num(loc.latitudeE7);
    const lonE7 = num(loc.longitudeE7);
    if (latE7 === undefined || lonE7 === undefined) continue;

    const t = parseTime(loc.timestamp) ?? num(loc.timestampMs);
    if (t === undefined) continue;

    out.push({
      t,
      lat: latE7 / 1e7,
      lon: lonE7 / 1e7,
      accuracy: num(loc.accuracy),
      kind: "path",
    });
  }

  return out;
}

/**
 * 타임라인 파일 하나를 점 목록으로 바꾼다.
 *
 * timelinePath와 activity를 둘 다 담지만, 거리를 합산하는 데 쓰지 않는다.
 * 둘은 같은 땅을 두 번 적은 것이라 더하면 이동거리가 두 배가 된다.
 * 여기서는 선을 그리는 것이 목적이라 촘촘할수록 좋다.
 */
export function parseTimeline(data: unknown): RawPoint[] {
  const format = detectFormat(data);
  if (format === null) {
    const shape = isRecord(data)
      ? `최상위 키: ${Object.keys(data).slice(0, 8).join(", ") || "(없음)"}`
      : `최상위 타입: ${Array.isArray(data) ? "배열" : typeof data}`;
    throw new TimelineParseError(
      `구글 타임라인 형식으로 보이지 않습니다. semanticSegments(안드로이드), ` +
        `배열(아이폰), locations(옛 Takeout) 중 하나여야 합니다. ${shape}`,
    );
  }

  let points: RawPoint[];
  if (format === "android") {
    points = parseSegments((data as { semanticSegments: unknown[] }).semanticSegments);
  } else if (format === "ios") {
    points = parseSegments(data as unknown[]);
  } else {
    points = parseRecords((data as { locations: unknown[] }).locations);
  }

  if (points.length === 0) {
    throw new TimelineParseError(
      `${format} 형식으로 읽었지만 위치가 하나도 없습니다. 내보내기 범위가 비어 있는지 확인해 주세요.`,
    );
  }

  points.sort((a, b) => a.t - b.t);
  return points;
}
