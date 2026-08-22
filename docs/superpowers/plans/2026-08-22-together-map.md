# 같이 걸은 지도 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 두 사람의 구글 타임라인을 한 지도에 겹쳐 재생하고, 서로 가까이 있었던 순간을 찾아 영상으로 뽑는 플레이그라운드 도구를 만든다.

**Architecture:** 순수 함수 모듈(좌표·파서·필터·검출·카메라·렌더)을 먼저 테스트와 함께 쌓고, 그 위에 `"use client"` 컴포넌트 하나가 상태 기계로 얹힌다. 서버 코드는 없다 — 파일은 브라우저를 떠나지 않고 지도 타일 요청만 나간다. 캔버스 한 프레임을 그리는 함수는 부수효과가 없어서 좌표 변환과 꼬리 계산만 따로 테스트한다.

**Tech Stack:** Next.js 16.2.2 App Router, React 19.2.4, TypeScript, Tailwind v4, Canvas 2D, MediaRecorder, vitest. **새 의존성은 추가하지 않는다.**

## Global Constraints

- 설계 문서: `docs/superpowers/specs/2026-08-22-together-map-design.md`. 충돌하면 설계가 우선이다.
- 브랜치는 `feat/together-map`. master에 직접 커밋하지 않는다.
- `package.json`에 의존성을 추가하지 않는다.
- 테스트는 `npm test` (vitest, `environment: "node"`, `include: ["src/**/*.test.ts"]`).
- 린트는 `npm run lint`. 이 저장소는 기존 오류 345건을 안고 있다 — **내가 건드린 파일에서 새 오류가 나지 않는 것**만 확인한다.
- **테스트가 도는 `.ts` 모듈에서는 `@/` 별칭을 쓰지 않는다.** `vitest.config.ts`에
  `resolve.alias`가 없어서 해석되지 않는다. 상대 경로로 가져온다.
  (`.tsx` 컴포넌트는 Next.js가 빌드 때 처리하므로 그쪽은 `@/`를 써도 된다.)
- 난수는 `../_shared/random`의 `createRng`를 쓴다. `Math.random()`은 쓰지 않는다.
- 주석과 UI 문구는 한국어. 주변 코드의 말투를 따른다 — 무엇을 하는지가 아니라 **왜 그렇게 했는지**를 적는다.
- 모든 파일은 `src/app/playground/together-map/` 아래. 라우트는 `/playground/together-map`.
- 이 페이지는 서버에서 데이터를 가져오지 않으므로 `runtime = "edge"`를 쓰지 않는다. 마지막 작업에서 빌드 출력이 `○`(static)인지 확인한다.

---

### Task 1: geo.ts — 좌표·거리·투영

**Files:**
- Create: `src/app/playground/together-map/geo.ts`
- Test: `src/app/playground/together-map/geo.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `LatLon`, `haversineMeters(a, b): number`, `projectMercator(p): {x, y}`, `unprojectMercator(x, y): LatLon`, `lerpLatLon(a, b, f): LatLon`, `EARTH_RADIUS_M`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/geo.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import {
  haversineMeters,
  lerpLatLon,
  projectMercator,
  unprojectMercator,
  type LatLon,
} from "./geo";

const SEOUL: LatLon = { lat: 37.5665, lon: 126.978 };
const BUSAN: LatLon = { lat: 35.1796, lon: 129.0756 };

describe("haversineMeters", () => {
  it("같은 점은 0", () => {
    expect(haversineMeters(SEOUL, SEOUL)).toBe(0);
  });

  it("서울-부산이 실제 직선거리(약 325km) 근처로 나온다", () => {
    const d = haversineMeters(SEOUL, BUSAN);
    expect(d).toBeGreaterThan(320_000);
    expect(d).toBeLessThan(330_000);
  });

  it("위도 1도는 약 111km", () => {
    const d = haversineMeters({ lat: 0, lon: 0 }, { lat: 1, lon: 0 });
    expect(d).toBeGreaterThan(110_000);
    expect(d).toBeLessThan(112_000);
  });

  it("방향이 바뀌어도 같다", () => {
    expect(haversineMeters(SEOUL, BUSAN)).toBeCloseTo(haversineMeters(BUSAN, SEOUL), 6);
  });
});

describe("projectMercator", () => {
  it("경위도 0,0은 정중앙", () => {
    const p = projectMercator({ lat: 0, lon: 0 });
    expect(p.x).toBeCloseTo(0.5, 10);
    expect(p.y).toBeCloseTo(0.5, 10);
  });

  it("동쪽으로 갈수록 x가 커지고, 북쪽으로 갈수록 y가 작아진다", () => {
    const a = projectMercator({ lat: 0, lon: 0 });
    const b = projectMercator({ lat: 10, lon: 10 });
    expect(b.x).toBeGreaterThan(a.x);
    expect(b.y).toBeLessThan(a.y);
  });

  it("왕복하면 제자리", () => {
    const p = projectMercator(SEOUL);
    const back = unprojectMercator(p.x, p.y);
    expect(back.lat).toBeCloseTo(SEOUL.lat, 9);
    expect(back.lon).toBeCloseTo(SEOUL.lon, 9);
  });

  it("극단 위도는 잘라낸다 — 메르카토르는 극에서 발산한다", () => {
    const p = projectMercator({ lat: 89.9999, lon: 0 });
    expect(Number.isFinite(p.y)).toBe(true);
    expect(p.y).toBeGreaterThanOrEqual(0);
  });
});

describe("lerpLatLon", () => {
  it("f=0이면 a, f=1이면 b", () => {
    expect(lerpLatLon(SEOUL, BUSAN, 0)).toEqual(SEOUL);
    expect(lerpLatLon(SEOUL, BUSAN, 1)).toEqual(BUSAN);
  });

  it("f=0.5면 중간", () => {
    const mid = lerpLatLon(SEOUL, BUSAN, 0.5);
    expect(mid.lat).toBeCloseTo((SEOUL.lat + BUSAN.lat) / 2, 9);
    expect(mid.lon).toBeCloseTo((SEOUL.lon + BUSAN.lon) / 2, 9);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/geo.test.ts`
Expected: FAIL — `Failed to resolve import "./geo"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/geo.ts`:

```ts
export interface LatLon {
  lat: number;
  lon: number;
}

/** WGS84 평균 반지름(m). */
export const EARTH_RADIUS_M = 6371008.8;

/**
 * 두 지점의 대권 거리(m).
 *
 * 평면 근사(위도 1도=111km)를 쓰지 않는다. 이 도구는 100m 안팎을 판정하는데,
 * 위도가 높아질수록 경도 1도의 실제 길이가 줄어서 평면 근사는 서울에서만도
 * 수십 미터씩 어긋난다. 그 오차가 그대로 «만났다/아니다»를 뒤집는다.
 */
export function haversineMeters(a: LatLon, b: LatLon): number {
  const toRad = Math.PI / 180;
  const dLat = (b.lat - a.lat) * toRad;
  const dLon = (b.lon - a.lon) * toRad;
  const lat1 = a.lat * toRad;
  const lat2 = b.lat * toRad;

  const h =
    Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  return 2 * EARTH_RADIUS_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/**
 * 메르카토르는 극에서 무한대로 발산한다. 타일 지도가 쓰는 관례대로
 * 남북 85.0511도에서 자른다 — 이 값이 정확히 정사각형 세계를 만든다.
 */
const MAX_LAT = 85.05112878;

/** 경위도 → 정규화 세계 좌표. x, y 모두 0~1이고 y는 북쪽이 0이다. */
export function projectMercator(p: LatLon): { x: number; y: number } {
  const lat = Math.max(-MAX_LAT, Math.min(MAX_LAT, p.lat));
  const s = Math.sin((lat * Math.PI) / 180);
  return {
    x: (p.lon + 180) / 360,
    y: 0.5 - Math.log((1 + s) / (1 - s)) / (4 * Math.PI),
  };
}

export function unprojectMercator(x: number, y: number): LatLon {
  const n = Math.PI * (1 - 2 * y);
  return {
    lat: (180 / Math.PI) * Math.atan(Math.sinh(n)),
    lon: x * 360 - 180,
  };
}

/**
 * 두 점 사이 선형 보간.
 *
 * 대권 보간(slerp)을 쓰지 않는다. 이 도구가 잇는 두 점은 길어야 몇십 킬로미터라
 * 차이가 화면에서 1픽셀도 안 되고, 대신 계산이 훨씬 싸다.
 */
export function lerpLatLon(a: LatLon, b: LatLon, f: number): LatLon {
  return {
    lat: a.lat + (b.lat - a.lat) * f,
    lon: a.lon + (b.lon - a.lon) * f,
  };
}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/geo.test.ts`
Expected: PASS — 11 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/geo.ts src/app/playground/together-map/geo.test.ts
git commit -m "feat(together-map): 좌표 거리와 메르카토르 투영"
```

---

### Task 2: parse.ts — 타임라인 세 형식 읽기

**Files:**
- Create: `src/app/playground/together-map/parse.ts`
- Test: `src/app/playground/together-map/parse.test.ts`

**Interfaces:**
- Consumes: `LatLon` from `./geo`
- Produces: `RawPoint`, `TimelineFormat`, `TimelineParseError`, `parseLatLngString(s): LatLon | null`, `detectFormat(data): TimelineFormat | null`, `parseTimeline(data): RawPoint[]`

`RawPoint`는 이후 모든 작업이 쓰는 기본 단위다:

```ts
export interface RawPoint {
  t: number;          // epoch ms
  lat: number;
  lon: number;
  accuracy?: number;  // 미터. 없으면 undefined
  kind: "visit" | "path";
}
```

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/parse.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { TimelineParseError, detectFormat, parseLatLngString, parseTimeline } from "./parse";

describe("parseLatLngString", () => {
  it("안드로이드 표기 — 도 기호가 붙는다", () => {
    expect(parseLatLngString("37.5665°, 126.9780°")).toEqual({ lat: 37.5665, lon: 126.978 });
  });

  it("아이폰 표기 — geo: URI", () => {
    expect(parseLatLngString("geo:37.5665,126.9780")).toEqual({ lat: 37.5665, lon: 126.978 });
  });

  it("음수 좌표", () => {
    expect(parseLatLngString("-33.8688°, 151.2093°")).toEqual({ lat: -33.8688, lon: 151.2093 });
  });

  it("공백이 없어도 읽는다", () => {
    expect(parseLatLngString("37.5665°,126.9780°")).toEqual({ lat: 37.5665, lon: 126.978 });
  });

  it("읽을 수 없으면 null", () => {
    expect(parseLatLngString("")).toBeNull();
    expect(parseLatLngString("서울")).toBeNull();
    expect(parseLatLngString("37.5665")).toBeNull();
  });

  it("범위를 벗어난 좌표는 null — 잘못 읽은 것이다", () => {
    expect(parseLatLngString("999.0°, 126.0°")).toBeNull();
    expect(parseLatLngString("37.0°, 999.0°")).toBeNull();
  });
});

describe("detectFormat", () => {
  it("안드로이드 — semanticSegments 키", () => {
    expect(detectFormat({ semanticSegments: [] })).toBe("android");
  });

  it("아이폰 — 배열 그 자체", () => {
    expect(detectFormat([{ startTime: "2026-01-01T00:00:00Z" }])).toBe("ios");
  });

  it("옛 Takeout — locations 키", () => {
    expect(detectFormat({ locations: [] })).toBe("records");
  });

  it("모르는 모양은 null", () => {
    expect(detectFormat({ hello: 1 })).toBeNull();
    expect(detectFormat(null)).toBeNull();
    expect(detectFormat("문자열")).toBeNull();
  });
});

describe("parseTimeline — 안드로이드", () => {
  const android = {
    semanticSegments: [
      {
        startTime: "2026-01-01T09:00:00.000+09:00",
        endTime: "2026-01-01T10:00:00.000+09:00",
        visit: {
          topCandidate: {
            placeId: "abc",
            placeLocation: { latLng: "37.5665°, 126.9780°" },
          },
        },
      },
      {
        startTime: "2026-01-01T10:00:00.000+09:00",
        endTime: "2026-01-01T10:30:00.000+09:00",
        timelinePath: [
          { point: "37.5700°, 126.9800°", time: "2026-01-01T10:10:00.000+09:00" },
          { point: "37.5750°, 126.9850°", time: "2026-01-01T10:20:00.000+09:00" },
        ],
      },
    ],
  };

  it("방문과 경로를 모두 읽는다", () => {
    const points = parseTimeline(android);
    expect(points).toHaveLength(3);
  });

  it("방문 점은 kind가 visit", () => {
    expect(parseTimeline(android)[0].kind).toBe("visit");
  });

  it("경로 점은 kind가 path", () => {
    const points = parseTimeline(android);
    expect(points[1].kind).toBe("path");
    expect(points[2].kind).toBe("path");
  });

  it("시간 오름차순으로 정렬된다", () => {
    const points = parseTimeline(android);
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].t).toBeGreaterThanOrEqual(points[i - 1].t);
    }
  });

  it("시각을 epoch ms로 바꾼다", () => {
    const points = parseTimeline(android);
    expect(points[0].t).toBe(Date.parse("2026-01-01T09:00:00.000+09:00"));
  });
});

describe("parseTimeline — 아이폰", () => {
  const ios = [
    {
      startTime: "2026-01-01T09:00:00.000+09:00",
      endTime: "2026-01-01T10:00:00.000+09:00",
      visit: {
        topCandidate: {
          placeID: "abc",
          placeLocation: "geo:37.5665,126.9780",
        },
      },
    },
    {
      startTime: "2026-01-01T10:00:00.000+09:00",
      endTime: "2026-01-01T10:30:00.000+09:00",
      timelinePath: [
        { point: "geo:37.5700,126.9800", durationMinutesOffsetFromStartTime: "10" },
        { point: "geo:37.5750,126.9850", durationMinutesOffsetFromStartTime: "20" },
      ],
    },
  ];

  it("placeLocation이 문자열인 모양을 읽는다", () => {
    const points = parseTimeline(ios);
    expect(points[0]).toMatchObject({ lat: 37.5665, lon: 126.978, kind: "visit" });
  });

  it("경로 점 시각을 시작시각 + 분 오프셋으로 계산한다", () => {
    const points = parseTimeline(ios);
    const base = Date.parse("2026-01-01T10:00:00.000+09:00");
    expect(points[1].t).toBe(base + 10 * 60_000);
    expect(points[2].t).toBe(base + 20 * 60_000);
  });
});

describe("parseTimeline — 옛 Takeout", () => {
  const records = {
    locations: [
      {
        latitudeE7: 375665000,
        longitudeE7: 1269780000,
        accuracy: 12,
        timestamp: "2026-01-01T09:00:00.000Z",
      },
      {
        latitudeE7: 375700000,
        longitudeE7: 1269800000,
        timestampMs: "1767258000000",
      },
    ],
  };

  it("E7 정수를 도로 되돌린다", () => {
    const points = parseTimeline(records);
    expect(points[0].lat).toBeCloseTo(37.5665, 7);
    expect(points[0].lon).toBeCloseTo(126.978, 7);
  });

  it("정확도를 그대로 가져온다", () => {
    expect(parseTimeline(records)[0].accuracy).toBe(12);
  });

  it("timestamp와 timestampMs를 모두 받는다", () => {
    const points = parseTimeline(records);
    expect(points.every((p) => Number.isFinite(p.t))).toBe(true);
  });
});

describe("parseTimeline — 오류", () => {
  it("모르는 형식이면 무엇으로 보였는지 적어서 던진다", () => {
    expect(() => parseTimeline({ hello: 1 })).toThrow(TimelineParseError);
    try {
      parseTimeline({ hello: 1 });
    } catch (e) {
      expect((e as Error).message).toContain("hello");
    }
  });

  it("형식은 맞는데 점이 하나도 안 나오면 던진다", () => {
    expect(() => parseTimeline({ semanticSegments: [] })).toThrow(TimelineParseError);
  });

  it("읽을 수 없는 좌표가 섞여 있으면 그 점만 건너뛴다", () => {
    const mixed = {
      semanticSegments: [
        {
          startTime: "2026-01-01T09:00:00Z",
          endTime: "2026-01-01T10:00:00Z",
          visit: { topCandidate: { placeLocation: { latLng: "쓰레기" } } },
        },
        {
          startTime: "2026-01-01T11:00:00Z",
          endTime: "2026-01-01T12:00:00Z",
          visit: { topCandidate: { placeLocation: { latLng: "37.5°, 127.0°" } } },
        },
      ],
    };
    expect(parseTimeline(mixed)).toHaveLength(1);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/parse.test.ts`
Expected: FAIL — `Failed to resolve import "./parse"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/parse.ts`:

```ts
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
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/parse.test.ts`
Expected: PASS — 21 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/parse.ts src/app/playground/together-map/parse.test.ts
git commit -m "feat(together-map): 타임라인 세 형식 파서

안드로이드 semanticSegments, 아이폰 배열, 옛 Takeout locations를
같은 RawPoint 목록으로 모은다. 형식을 못 알아보면 최상위 키를 적어서
던진다 — 빈 화면만 주면 왜 안 되는지 알 수 없다."
```

---

### Task 3: filter.ts — 정확도와 이상치

**Files:**
- Create: `src/app/playground/together-map/filter.ts`
- Test: `src/app/playground/together-map/filter.test.ts`

**Interfaces:**
- Consumes: `RawPoint` from `./parse`, `haversineMeters` from `./geo`
- Produces: `FilterOptions`, `MAX_PLAUSIBLE_KMH`, `DEFAULT_ACCURACY_LIMIT_M`, `filterPoints(points, opts): RawPoint[]`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/filter.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_ACCURACY_LIMIT_M, filterPoints } from "./filter";
import type { RawPoint } from "./parse";

const T0 = Date.parse("2026-01-01T00:00:00Z");
const MIN = 60_000;

function p(minute: number, lat: number, lon: number, accuracy?: number): RawPoint {
  return { t: T0 + minute * MIN, lat, lon, accuracy, kind: "path" };
}

const OFF = { accuracyLimitM: DEFAULT_ACCURACY_LIMIT_M, outlier: "off" } as const;
const ON = { accuracyLimitM: DEFAULT_ACCURACY_LIMIT_M, outlier: "conservative" } as const;

describe("정확도 필터", () => {
  it("한계를 넘는 점을 버린다", () => {
    const points = [p(0, 37.5, 127.0, 10), p(1, 37.5, 127.0, 500)];
    expect(filterPoints(points, OFF)).toHaveLength(1);
  });

  it("경계값은 남긴다", () => {
    const points = [p(0, 37.5, 127.0, DEFAULT_ACCURACY_LIMIT_M)];
    expect(filterPoints(points, OFF)).toHaveLength(1);
  });

  it("accuracy가 없는 점은 버리지 않는다 — 옛 형식엔 이 값이 아예 없다", () => {
    const points = [p(0, 37.5, 127.0), p(1, 37.5, 127.0)];
    expect(filterPoints(points, OFF)).toHaveLength(2);
  });

  it("한계를 0으로 두면 accuracy 있는 점은 다 버리고 없는 점은 남는다", () => {
    const points = [p(0, 37.5, 127.0, 5), p(1, 37.5, 127.0)];
    const kept = filterPoints(points, { accuracyLimitM: 0, outlier: "off" });
    expect(kept).toHaveLength(1);
    expect(kept[0].accuracy).toBeUndefined();
  });
});

describe("이상치 필터 (보수적)", () => {
  it("혼자 튄 점 하나를 버린다", () => {
    // 1분 만에 서울에서 도쿄로 갔다가 돌아온다 — GPS가 튄 것이다
    const points = [p(0, 37.5, 127.0), p(1, 35.68, 139.65), p(2, 37.5, 127.0)];
    const kept = filterPoints(points, ON);
    expect(kept).toHaveLength(2);
    expect(kept.every((q) => q.lon < 130)).toBe(true);
  });

  it("연속으로 빠르면 남긴다 — 실제 비행일 수 있다", () => {
    // 서울에서 도쿄로 가서 그대로 머문다
    const points = [p(0, 37.5, 127.0), p(60, 35.68, 139.65), p(120, 35.68, 139.65)];
    expect(filterPoints(points, ON)).toHaveLength(3);
  });

  it("끄면 튄 점도 남는다", () => {
    const points = [p(0, 37.5, 127.0), p(1, 35.68, 139.65), p(2, 37.5, 127.0)];
    expect(filterPoints(points, OFF)).toHaveLength(3);
  });

  it("첫 점과 끝 점은 앞뒤가 없으므로 그대로 둔다", () => {
    const points = [p(0, 37.5, 127.0), p(1, 37.5, 127.0)];
    expect(filterPoints(points, ON)).toHaveLength(2);
  });

  it("앞뒤가 둘 다 같은 시각이면 버린다 — 기록이 깨진 것이다", () => {
    const points = [p(0, 37.5, 127.0), p(0, 37.6, 127.1), p(0, 37.5, 127.0), p(5, 37.5, 127.0)];
    const kept = filterPoints(points, ON);
    expect(kept).toHaveLength(3);
  });

  it("한쪽만 같은 시각이면 남긴다 — 촘촘한 기록을 버리면 안 된다", () => {
    const points = [p(0, 37.5, 127.0), p(0, 37.5001, 127.0), p(5, 37.5002, 127.0)];
    expect(filterPoints(points, ON)).toHaveLength(3);
  });

  it("같은 시각의 점이 있어도 0으로 나누지 않는다", () => {
    const points = [p(0, 37.5, 127.0), p(0, 37.6, 127.1), p(1, 37.5, 127.0)];
    expect(() => filterPoints(points, ON)).not.toThrow();
  });

  it("정상적인 도보 이동은 전부 남는다", () => {
    const points = Array.from({ length: 10 }, (_, i) => p(i, 37.5 + i * 0.0005, 127.0));
    expect(filterPoints(points, ON)).toHaveLength(10);
  });
});

describe("빈 입력", () => {
  it("빈 배열은 빈 배열", () => {
    expect(filterPoints([], ON)).toEqual([]);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/filter.test.ts`
Expected: FAIL — `Failed to resolve import "./filter"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/filter.ts`:

```ts
import { haversineMeters } from "./geo";
import type { RawPoint } from "./parse";

export interface FilterOptions {
  /** 이 값(m)보다 오차가 큰 점을 버린다. */
  accuracyLimitM: number;
  outlier: "conservative" | "off";
}

export const DEFAULT_ACCURACY_LIMIT_M = 200;

/**
 * 이 속도를 넘으면 GPS가 튄 것으로 본다.
 * 여객기 순항속도가 900km/h 언저리라 그 위는 사람이 낼 수 없는 속도다.
 */
export const MAX_PLAUSIBLE_KMH = 900;

function kmh(a: RawPoint, b: RawPoint): number {
  const hours = Math.abs(b.t - a.t) / 3_600_000;
  // 같은 시각에 다른 좌표가 찍혔다는 건 기록 자체가 깨진 것이다. 이 도구는
  // 점을 하나 더 버리는 것보다 튄 점을 남겨 없던 만남을 만드는 쪽이 훨씬 나쁘다.
  // 그래서 판단을 보류하지 않고 «말이 안 된다»로 친다.
  //
  // 이상치 규칙이 앞뒤 둘 다 비현실적일 때만 버리므로, 한쪽만 시간차가 0인
  // 촘촘한 기록은 그대로 살아남는다. 양쪽이 다 0인 점만 걸린다.
  if (hours === 0) return Infinity;
  return haversineMeters(a, b) / 1000 / hours;
}

/**
 * 점 목록을 걸러낸다. 정확도 먼저, 이상치 나중이다.
 *
 * 순서가 중요하다. 오차 큰 점을 먼저 치우지 않으면 그 점이 앞뒤 점의 속도를
 * 부풀려서 멀쩡한 점까지 이상치로 몰린다.
 */
export function filterPoints(points: RawPoint[], opts: FilterOptions): RawPoint[] {
  // 1단계 — 정확도. accuracy가 없는 점은 «모름»이지 «부정확»이 아니므로 남긴다.
  const accurate = points.filter(
    (p) => p.accuracy === undefined || p.accuracy <= opts.accuracyLimitM,
  );

  if (opts.outlier === "off" || accurate.length < 3) return accurate;

  // 2단계 — 이상치. 앞에서도 뒤에서도 말이 안 되는 속도로만 닿는 점을 버린다.
  //
  // 한쪽만 보면 안 된다. 실제로 비행기를 탔다면 «직전 점에서 여기까지»가 빠른 게
  // 정상이고, 그 뒤로는 계속 그 자리에 있다. 튄 점은 갔다가 곧바로 돌아온다 —
  // 앞뒤가 둘 다 비현실적인 것은 그 경우뿐이다.
  return accurate.filter((p, i) => {
    if (i === 0 || i === accurate.length - 1) return true;
    const fromPrev = kmh(accurate[i - 1], p);
    const toNext = kmh(p, accurate[i + 1]);
    return !(fromPrev > MAX_PLAUSIBLE_KMH && toNext > MAX_PLAUSIBLE_KMH);
  });
}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/filter.test.ts`
Expected: PASS — 12 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/filter.ts src/app/playground/together-map/filter.test.ts
git commit -m "feat(together-map): 정확도·이상치 필터

정확도를 먼저 걸러야 한다. 오차 큰 점을 남겨 두면 그 점이 앞뒤 점의
속도를 부풀려 멀쩡한 점까지 이상치로 몰린다. 이상치는 앞뒤가 둘 다
비현실적인 점만 버려서 실제 비행을 살린다."
```

---

### Task 4: meet.ts — 만난 순간 검출

**Files:**
- Create: `src/app/playground/together-map/meet.ts`
- Test: `src/app/playground/together-map/meet.test.ts`

**Interfaces:**
- Consumes: `RawPoint` from `./parse`, `LatLon` · `haversineMeters` · `lerpLatLon` from `./geo`
- Produces: `Meeting`, `MeetOptions`, `GRID_MS`, `MAX_GAP_MS`, `DEFAULT_MEET_RADIUS_M`, `DEFAULT_MEET_MIN_MS`, `resample(points, from, to, stepMs, maxGapMs): (LatLon | null)[]`, `findMeetings(a, b, opts): Meeting[]`, `overlapRange(a, b): {from, to} | null`

```ts
export interface Meeting {
  start: number;
  end: number;
  lat: number;
  lon: number;
  minDistance: number;
}
```

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/meet.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { GRID_MS, findMeetings, overlapRange, resample } from "./meet";
import type { RawPoint } from "./parse";

const T0 = Date.parse("2026-01-01T00:00:00Z");
const MIN = 60_000;
const OPTS = { radiusM: 100, minDurationMs: 15 * MIN };

function p(minute: number, lat: number, lon: number): RawPoint {
  return { t: T0 + minute * MIN, lat, lon, kind: "path" };
}

/** start분부터 end분까지 5분 간격으로 한 자리에 머무는 사람. */
function stay(start: number, end: number, lat: number, lon: number): RawPoint[] {
  const out: RawPoint[] = [];
  for (let m = start; m <= end; m += 5) out.push(p(m, lat, lon));
  return out;
}

describe("resample", () => {
  it("격자 위 값을 보간해서 채운다", () => {
    const points = [p(0, 37.0, 127.0), p(10, 37.1, 127.0)];
    const grid = resample(points, T0, T0 + 10 * MIN, 5 * MIN, 30 * MIN);
    expect(grid).toHaveLength(3);
    expect(grid[1]?.lat).toBeCloseTo(37.05, 6);
  });

  it("범위 밖은 null — 없는 것을 지어내지 않는다", () => {
    const points = [p(10, 37.0, 127.0), p(20, 37.0, 127.0)];
    const grid = resample(points, T0, T0 + 30 * MIN, 10 * MIN, 30 * MIN);
    expect(grid[0]).toBeNull();
    expect(grid[3]).toBeNull();
  });

  it("구멍을 건너뛰며 보간하지 않는다", () => {
    // 서울에 있다가 두 시간 기록이 없고 부산에서 다시 나타난다.
    // 그 사이를 이으면 있지도 않은 궤적이 국토를 가로지른다.
    const points = [p(0, 37.5665, 126.978), p(120, 35.1796, 129.0756)];
    const grid = resample(points, T0, T0 + 120 * MIN, 30 * MIN, 30 * MIN);
    expect(grid[0]).not.toBeNull();
    expect(grid[1]).toBeNull();
    expect(grid[2]).toBeNull();
    expect(grid[3]).toBeNull();
    expect(grid[4]).not.toBeNull();
  });

  it("구멍이 허용치 이내면 잇는다", () => {
    const points = [p(0, 37.0, 127.0), p(20, 37.2, 127.0)];
    const grid = resample(points, T0, T0 + 20 * MIN, 10 * MIN, 30 * MIN);
    expect(grid[1]).not.toBeNull();
  });

  it("빈 입력은 전부 null", () => {
    const grid = resample([], T0, T0 + 10 * MIN, 5 * MIN, 30 * MIN);
    expect(grid.every((g) => g === null)).toBe(true);
  });
});

describe("overlapRange", () => {
  it("겹치는 기간을 찾는다", () => {
    const a = [p(0, 37, 127), p(60, 37, 127)];
    const b = [p(30, 37, 127), p(90, 37, 127)];
    expect(overlapRange(a, b)).toEqual({ from: T0 + 30 * MIN, to: T0 + 60 * MIN });
  });

  it("안 겹치면 null", () => {
    const a = [p(0, 37, 127), p(10, 37, 127)];
    const b = [p(60, 37, 127), p(90, 37, 127)];
    expect(overlapRange(a, b)).toBeNull();
  });

  it("한쪽이 비면 null", () => {
    expect(overlapRange([], [p(0, 37, 127)])).toBeNull();
  });
});

describe("findMeetings", () => {
  it("같은 자리에 30분 함께 있으면 만남 한 건", () => {
    const a = stay(0, 30, 37.5, 127.0);
    const b = stay(0, 30, 37.5, 127.0);
    const meets = findMeetings(a, b, OPTS);
    expect(meets).toHaveLength(1);
    expect(meets[0].minDistance).toBeCloseTo(0, 6);
  });

  it("최소 지속시간에 못 미치면 만남이 아니다", () => {
    // 10분만 겹친다 — 지하철역에서 스쳐 지나간 것에 가깝다
    const a = stay(0, 10, 37.5, 127.0);
    const b = stay(0, 10, 37.5, 127.0);
    expect(findMeetings(a, b, OPTS)).toHaveLength(0);
  });

  it("판정 거리 밖이면 만남이 아니다", () => {
    // 위도 0.01도 = 약 1.1km
    const a = stay(0, 60, 37.5, 127.0);
    const b = stay(0, 60, 37.51, 127.0);
    expect(findMeetings(a, b, OPTS)).toHaveLength(0);
  });

  it("구멍 너머로 가짜 만남을 만들지 않는다", () => {
    // A는 계속 서울에 있다. B는 서울에 잠깐 있다가 기록이 끊기고 부산에서 나타난다.
    // B의 두 점을 직선으로 이으면 그 선이 A를 오래 스쳐서 없던 만남이 생긴다.
    const a = stay(0, 300, 36.5, 127.5);
    const b = [p(0, 37.5665, 126.978), p(300, 35.1796, 129.0756)];
    expect(findMeetings(a, b, OPTS)).toHaveLength(0);
  });

  it("떨어졌다 다시 만나면 두 건으로 센다", () => {
    const a = stay(0, 200, 37.5, 127.0);
    const b = [...stay(0, 30, 37.5, 127.0), ...stay(35, 90, 37.6, 127.0), ...stay(95, 200, 37.5, 127.0)];
    expect(findMeetings(a, b, OPTS)).toHaveLength(2);
  });

  it("대표 위치는 중앙값이라 끝에 붙은 이동에 끌려가지 않는다", () => {
    // 대부분 37.5에 있다가 마지막에 살짝 움직인다
    const a = stay(0, 60, 37.5, 127.0);
    const b = [...stay(0, 55, 37.5, 127.0), p(60, 37.5008, 127.0)];
    const meets = findMeetings(a, b, OPTS);
    expect(meets).toHaveLength(1);
    expect(meets[0].lat).toBeCloseTo(37.5, 4);
  });

  it("시작과 끝 시각이 실제 구간과 맞는다", () => {
    const a = stay(0, 60, 37.5, 127.0);
    const b = stay(0, 60, 37.5, 127.0);
    const [m] = findMeetings(a, b, OPTS);
    expect(m.start).toBe(T0);
    expect(m.end).toBe(T0 + 60 * MIN);
    expect(m.end - m.start).toBeGreaterThanOrEqual(OPTS.minDurationMs);
  });

  it("겹치는 기간이 없으면 빈 배열", () => {
    const a = stay(0, 60, 37.5, 127.0);
    const b = stay(600, 660, 37.5, 127.0);
    expect(findMeetings(a, b, OPTS)).toEqual([]);
  });

  it("격자 간격은 5분이다", () => {
    expect(GRID_MS).toBe(5 * MIN);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/meet.test.ts`
Expected: FAIL — `Failed to resolve import "./meet"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/meet.ts`:

```ts
import { haversineMeters, lerpLatLon, type LatLon } from "./geo";
import type { RawPoint } from "./parse";

export interface Meeting {
  start: number;
  end: number;
  /** 구간의 대표 위치. 평균이 아니라 중앙값이다. */
  lat: number;
  lon: number;
  /** 구간 중 가장 가까웠던 거리(m). */
  minDistance: number;
}

export interface MeetOptions {
  radiusM: number;
  minDurationMs: number;
}

/** 두 사람을 같은 시각에 놓고 비교하기 위한 격자 간격. */
export const GRID_MS = 5 * 60_000;

/**
 * 이보다 오래 기록이 비면 그 사이는 «위치를 모르는 구간»으로 둔다.
 *
 * 이 도구에서 제일 위험한 버그를 막는 값이다. 구멍을 건너뛰며 보간하면
 * 서울에서 부산까지 직선이 그어지고, 그 선이 상대 궤적을 스쳐 지나가면서
 * 있지도 않은 만남이 만들어진다.
 */
export const MAX_GAP_MS = 30 * 60_000;

export const DEFAULT_MEET_RADIUS_M = 100;
export const DEFAULT_MEET_MIN_MS = 15 * 60_000;

/**
 * 점 목록을 고른 간격의 격자에 올린다.
 * 아는 구간은 보간해서 채우고, 모르는 구간은 null로 비운다.
 */
export function resample(
  points: RawPoint[],
  from: number,
  to: number,
  stepMs: number,
  maxGapMs: number,
): (LatLon | null)[] {
  const count = Math.floor((to - from) / stepMs) + 1;
  const out: (LatLon | null)[] = new Array(count).fill(null);
  if (points.length === 0) return out;

  let cursor = 0;
  for (let i = 0; i < count; i += 1) {
    const t = from + i * stepMs;

    // 이 시각을 감싸는 두 점을 찾는다. 입력이 정렬돼 있으므로 앞으로만 간다.
    //
    // 비교가 <= 여야 한다. < 로 두면 격자 시각이 점의 시각과 정확히 같을 때
    // 커서가 그 점에 닿지 못하고, 마지막 칸이 «구멍»으로 오인돼 항상 비어 버린다.
    while (cursor < points.length - 1 && points[cursor + 1].t <= t) cursor += 1;

    const prev = points[cursor];
    const next = points[cursor + 1];

    if (prev.t === t) {
      out[i] = { lat: prev.lat, lon: prev.lon };
      continue;
    }
    if (t < prev.t || next === undefined) continue; // 기록 범위 밖
    if (next.t - prev.t > maxGapMs) continue; // 구멍 — 잇지 않는다

    const f = (t - prev.t) / (next.t - prev.t);
    out[i] = lerpLatLon(prev, next, f);
  }

  return out;
}

/** 두 사람의 기록이 모두 존재하는 기간. */
export function overlapRange(a: RawPoint[], b: RawPoint[]): { from: number; to: number } | null {
  if (a.length === 0 || b.length === 0) return null;
  const from = Math.max(a[0].t, b[0].t);
  const to = Math.min(a[a.length - 1].t, b[b.length - 1].t);
  return from <= to ? { from, to } : null;
}

function median(values: number[]): number {
  const sorted = [...values].sort((x, y) => x - y);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 === 1 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * 두 사람이 가까이 있었던 구간들을 찾는다.
 *
 * 공통 격자에 올려놓고 거리를 잰 뒤, 판정 거리 안에 든 칸이 최소 지속시간만큼
 * 이어지면 만남 하나로 센다. 한쪽이라도 null인 칸은 «가깝지 않다»가 아니라
 * «모른다»여서 구간을 끊는다.
 */
export function findMeetings(a: RawPoint[], b: RawPoint[], opts: MeetOptions): Meeting[] {
  const range = overlapRange(a, b);
  if (!range) return [];

  const gridA = resample(a, range.from, range.to, GRID_MS, MAX_GAP_MS);
  const gridB = resample(b, range.from, range.to, GRID_MS, MAX_GAP_MS);

  const meetings: Meeting[] = [];
  let runStart = -1;
  let lats: number[] = [];
  let lons: number[] = [];
  let closest = Infinity;

  const close = (endIndex: number) => {
    if (runStart < 0) return;
    const start = range.from + runStart * GRID_MS;
    const end = range.from + endIndex * GRID_MS;
    if (end - start >= opts.minDurationMs) {
      meetings.push({ start, end, lat: median(lats), lon: median(lons), minDistance: closest });
    }
    runStart = -1;
    lats = [];
    lons = [];
    closest = Infinity;
  };

  for (let i = 0; i < gridA.length; i += 1) {
    const pa = gridA[i];
    const pb = gridB[i];
    const near = pa !== null && pb !== null && haversineMeters(pa, pb) <= opts.radiusM;

    if (near) {
      if (runStart < 0) runStart = i;
      const d = haversineMeters(pa!, pb!);
      if (d < closest) closest = d;
      // 대표 위치는 두 사람의 가운데로 잡는다
      lats.push((pa!.lat + pb!.lat) / 2);
      lons.push((pa!.lon + pb!.lon) / 2);
    } else {
      close(i - 1);
    }
  }
  close(gridA.length - 1);

  return meetings;
}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/meet.test.ts`
Expected: PASS — 18 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/meet.ts src/app/playground/together-map/meet.test.ts
git commit -m "feat(together-map): 만난 순간 검출

공통 5분 격자에 두 사람을 올려놓고 100m 이내가 15분 이상 이어지면
만남으로 센다. 30분 넘는 기록 구멍은 잇지 않는다 — 이으면 서울에서
부산까지 직선이 그어지고 그 선이 상대를 스쳐 가짜 만남이 생긴다."
```

---

### Task 5: sample.ts — 가상 여행

**Files:**
- Create: `src/app/playground/together-map/sample.ts`
- Test: `src/app/playground/together-map/sample.test.ts`

**Interfaces:**
- Consumes: `createRng` · `randRange` from `@/app/playground/_shared/random`, `RawPoint` · `parseTimeline` from `./parse`, `findMeetings` from `./meet`
- Produces: `SAMPLE_SEED`, `SAMPLE_NAMES`, `buildSampleTimeline(who: "a" | "b", shape: "android" | "ios", seed?): unknown`

가상의 두 사람이 3개월간 움직인 기록을 **안드로이드 모양과 아이폰 모양 양쪽으로** 만든다. 파일이 없어도 바로 돌려볼 수 있게 하는 것이 첫째 목적이고, 파서 테스트 픽스처로 쓰는 것이 둘째다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/sample.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DEFAULT_MEET_MIN_MS, DEFAULT_MEET_RADIUS_M, findMeetings } from "./meet";
import { parseTimeline } from "./parse";
import {
  SAMPLE_BUSAN_RANGE,
  SAMPLE_JEJU_RANGE,
  SAMPLE_NAMES,
  buildSampleTimeline,
} from "./sample";

const OPTS = { radiusM: DEFAULT_MEET_RADIUS_M, minDurationMs: DEFAULT_MEET_MIN_MS };

describe("buildSampleTimeline", () => {
  it("안드로이드 모양은 semanticSegments를 갖는다", () => {
    const data = buildSampleTimeline("a", "android") as Record<string, unknown>;
    expect(Array.isArray(data.semanticSegments)).toBe(true);
  });

  it("아이폰 모양은 배열 그 자체다", () => {
    expect(Array.isArray(buildSampleTimeline("a", "ios"))).toBe(true);
  });

  it("양쪽 모양 모두 파서가 읽는다", () => {
    expect(parseTimeline(buildSampleTimeline("a", "android")).length).toBeGreaterThan(100);
    expect(parseTimeline(buildSampleTimeline("a", "ios")).length).toBeGreaterThan(100);
  });

  it("같은 시드면 같은 결과", () => {
    const one = JSON.stringify(buildSampleTimeline("a", "android", 42));
    const two = JSON.stringify(buildSampleTimeline("a", "android", 42));
    expect(one).toBe(two);
  });

  it("시드가 다르면 결과가 다르다", () => {
    const one = JSON.stringify(buildSampleTimeline("a", "android", 1));
    const two = JSON.stringify(buildSampleTimeline("a", "android", 2));
    expect(one).not.toBe(two);
  });

  it("두 사람은 서로 다른 기록을 갖는다", () => {
    const a = JSON.stringify(buildSampleTimeline("a", "android"));
    const b = JSON.stringify(buildSampleTimeline("b", "android"));
    expect(a).not.toBe(b);
  });

  it("두 사람 이름이 정해져 있다", () => {
    expect(SAMPLE_NAMES.a).toBeTruthy();
    expect(SAMPLE_NAMES.b).toBeTruthy();
    expect(SAMPLE_NAMES.a).not.toBe(SAMPLE_NAMES.b);
  });

  it("시간 오름차순이다", () => {
    const points = parseTimeline(buildSampleTimeline("a", "android"));
    for (let i = 1; i < points.length; i += 1) {
      expect(points[i].t).toBeGreaterThanOrEqual(points[i - 1].t);
    }
  });
});

describe("가상 여행이 검출기를 제대로 돌린다", () => {
  const a = parseTimeline(buildSampleTimeline("a", "android"));
  const b = parseTimeline(buildSampleTimeline("b", "android"));
  const meets = findMeetings(a, b, OPTS);

  it("만남이 여러 건 잡힌다 — 안 잡히면 볼 게 없다", () => {
    expect(meets.length).toBeGreaterThanOrEqual(5);
  });

  it("만남이 너무 많지도 않다 — 매일 잡히면 검출기가 헐거운 것이다", () => {
    expect(meets.length).toBeLessThan(60);
  });

  it("한 명만 제주에 간 기간에는 만남이 없다", () => {
    // 이 기간에 만남이 잡히면 검출기가 헐거운 것이다. 샘플에서 가장 중요한 시험이다.
    const during = meets.filter(
      (m) => m.end > SAMPLE_JEJU_RANGE.from && m.start < SAMPLE_JEJU_RANGE.to,
    );
    expect(during).toEqual([]);
  });

  it("같이 부산에 간 기간에는 만남이 있다", () => {
    const during = meets.filter(
      (m) => m.end > SAMPLE_BUSAN_RANGE.from && m.start < SAMPLE_BUSAN_RANGE.to,
    );
    expect(during.length).toBeGreaterThan(0);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/sample.test.ts`
Expected: FAIL — `Failed to resolve import "./sample"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/sample.ts`:

```ts
// 상대 경로로 가져온다. vitest.config.ts에 resolve.alias가 없어서 `@/`는
// 테스트에서 해석되지 않는다. 저장소의 다른 `@/` import는 전부 .tsx라
// 테스트 글롭(src/**/*.test.ts)에 안 걸려서 이제껏 드러나지 않았을 뿐이다.
import { createRng, randRange, type Rng } from "../_shared/random";
import { lerpLatLon, type LatLon } from "./geo";

/**
 * 가상 여행 데이터.
 *
 * 진짜 Timeline.json을 손에 넣기 전까지 이 도구를 만들 유일한 방법이고,
 * 동시에 파서 테스트 픽스처다. 그래서 «그럴듯한 그림»이 아니라
 * 구글이 실제로 뱉는 모양을 그대로 흉내 낸다.
 *
 * 검출기를 시험하려면 만남이 있는 구간과 없는 구간이 둘 다 있어야 한다.
 *   평일  — 각자 다른 동네에서 출퇴근한다 (안 만난다)
 *   주말  — 성수나 홍대에서 만난다 (만난다)
 *   부산  — 같이 다녀온다 (멀리서도 붙어 있다)
 *   제주  — 한 명만 간다 (절대 만나면 안 된다)
 */

export const SAMPLE_SEED = 20260822;

export const SAMPLE_NAMES = { a: "지호", b: "수아" } as const;

/** 2026-03-01 09:00 KST. 샘플의 시작. */
const START = Date.parse("2026-03-01T00:00:00+09:00");
const DAY = 86_400_000;
const HOUR = 3_600_000;
const MIN = 60_000;

/** 샘플이 다루는 기간(일). */
const DAYS = 90;

const PLACES = {
  homeA: { lat: 37.5219, lon: 127.0411 },   // 강남
  homeB: { lat: 37.5563, lon: 126.9236 },   // 홍대
  workA: { lat: 37.5045, lon: 127.0495 },   // 역삼
  workB: { lat: 37.5172, lon: 127.0473 },   // 삼성
  seongsu: { lat: 37.5445, lon: 127.0557 }, // 성수
  hongdae: { lat: 37.5563, lon: 126.9236 },
  busan: { lat: 35.1587, lon: 129.1604 },   // 해운대
  jeju: { lat: 33.4996, lon: 126.5312 },
} as const;

/** 같이 부산에 다녀오는 기간 — 만남이 잡혀야 한다. */
export const SAMPLE_BUSAN_RANGE = {
  from: START + 40 * DAY,
  to: START + 43 * DAY,
};

/** 지호만 제주에 가는 기간 — 만남이 잡히면 안 된다. */
export const SAMPLE_JEJU_RANGE = {
  from: START + 60 * DAY,
  to: START + 63 * DAY,
};

interface Sample {
  t: number;
  at: LatLon;
  kind: "visit" | "path";
}

/** 한 자리 주변에서 몇 미터씩 흔들리는 값. 실제 GPS는 가만히 있어도 떨린다. */
function jitter(rng: Rng, at: LatLon, meters: number): LatLon {
  const deg = meters / 111_000;
  return {
    lat: at.lat + randRange(rng, -deg, deg),
    lon: at.lon + randRange(rng, -deg, deg) / Math.cos((at.lat * Math.PI) / 180),
  };
}

function stayAt(rng: Rng, out: Sample[], at: LatLon, from: number, to: number, stepMs: number) {
  for (let t = from; t <= to; t += stepMs) {
    out.push({ t, at: jitter(rng, at, 15), kind: "visit" });
  }
}

function travel(rng: Rng, out: Sample[], from: LatLon, to: LatLon, startT: number, endT: number) {
  const steps = Math.max(2, Math.round((endT - startT) / (5 * MIN)));
  for (let i = 0; i <= steps; i += 1) {
    const f = i / steps;
    out.push({
      t: startT + (endT - startT) * f,
      at: jitter(rng, lerpLatLon(from, to, f), 25),
      kind: "path",
    });
  }
}

function buildSamples(who: "a" | "b", seed: number): Sample[] {
  const rng = createRng(seed + (who === "a" ? 0 : 7919));
  const out: Sample[] = [];

  const home = who === "a" ? PLACES.homeA : PLACES.homeB;
  const work = who === "a" ? PLACES.workA : PLACES.workB;

  for (let day = 0; day < DAYS; day += 1) {
    const dayStart = START + day * DAY;
    const inBusan = dayStart >= SAMPLE_BUSAN_RANGE.from && dayStart < SAMPLE_BUSAN_RANGE.to;
    const inJeju = dayStart >= SAMPLE_JEJU_RANGE.from && dayStart < SAMPLE_JEJU_RANGE.to;

    // 제주에는 지호만 간다. 수아는 그동안 평소대로 서울에 있는다.
    if (inJeju && who === "a") {
      stayAt(rng, out, PLACES.jeju, dayStart + 9 * HOUR, dayStart + 21 * HOUR, 20 * MIN);
      continue;
    }
    if (inBusan) {
      // 둘 다 해운대에 있다 — 같은 자리를 공유하므로 만남이 잡힌다
      stayAt(rng, out, PLACES.busan, dayStart + 9 * HOUR, dayStart + 22 * HOUR, 15 * MIN);
      continue;
    }

    const weekday = new Date(dayStart).getUTCDay(); // START가 KST 자정이라 요일이 맞는다
    const isWeekend = weekday === 0 || weekday === 6;

    if (isWeekend) {
      // 주말 — 성수와 홍대를 번갈아 간다. 둘 다 같은 곳으로 가므로 만난다.
      const spot = day % 4 < 2 ? PLACES.seongsu : PLACES.hongdae;
      stayAt(rng, out, home, dayStart + 9 * HOUR, dayStart + 12 * HOUR, 30 * MIN);
      travel(rng, out, home, spot, dayStart + 12 * HOUR, dayStart + 13 * HOUR);
      stayAt(rng, out, spot, dayStart + 13 * HOUR, dayStart + 18 * HOUR, 10 * MIN);
      travel(rng, out, spot, home, dayStart + 18 * HOUR, dayStart + 19 * HOUR);
      stayAt(rng, out, home, dayStart + 19 * HOUR, dayStart + 23 * HOUR, 30 * MIN);
      continue;
    }

    // 평일 — 각자 다른 회사로 간다
    stayAt(rng, out, home, dayStart + 7 * HOUR, dayStart + 8 * HOUR, 20 * MIN);
    travel(rng, out, home, work, dayStart + 8 * HOUR, dayStart + 9 * HOUR);
    stayAt(rng, out, work, dayStart + 9 * HOUR, dayStart + 18 * HOUR, 20 * MIN);
    travel(rng, out, work, home, dayStart + 18 * HOUR, dayStart + 19 * HOUR);
    stayAt(rng, out, home, dayStart + 19 * HOUR, dayStart + 23 * HOUR, 30 * MIN);

    // 열흘에 한 번쯤 기록이 통째로 비는 날을 만든다. 필터와 구멍 처리를 시험해야 한다.
    if (day % 11 === 5) {
      out.splice(out.length - 20, 14);
    }
    // 스무날에 한 번쯤 GPS가 튄다
    if (day % 19 === 3 && out.length > 0) {
      const last = out[out.length - 1];
      out.push({ t: last.t + MIN, at: { lat: 35.68, lon: 139.65 }, kind: "path" });
      out.push({ t: last.t + 2 * MIN, at: last.at, kind: "path" });
    }
  }

  out.sort((x, y) => x.t - y.t);
  return out;
}

function iso(t: number): string {
  return new Date(t).toISOString();
}

function androidLatLng(at: LatLon): string {
  return `${at.lat.toFixed(7)}°, ${at.lon.toFixed(7)}°`;
}

function iosLatLng(at: LatLon): string {
  return `geo:${at.lat.toFixed(7)},${at.lon.toFixed(7)}`;
}

/**
 * 샘플을 구글이 뱉는 모양으로 포장한다.
 *
 * 안드로이드와 아이폰을 둘 다 만든다. 진짜 파일이 없으니 형식 오차를 줄이는
 * 방법은 양쪽 모양을 다 만들어 파서에 물려 보는 것뿐이다.
 */
export function buildSampleTimeline(
  who: "a" | "b",
  shape: "android" | "ios",
  seed: number = SAMPLE_SEED,
): unknown {
  const samples = buildSamples(who, seed);

  // 연속한 같은 종류를 한 세그먼트로 묶는다 — 실제 파일도 이렇게 생겼다
  const segments: unknown[] = [];
  let i = 0;
  while (i < samples.length) {
    const kind = samples[i].kind;
    let j = i;
    while (j < samples.length && samples[j].kind === kind && samples[j].t - samples[i].t < 6 * HOUR) {
      j += 1;
    }
    const chunk = samples.slice(i, j);
    const startT = chunk[0].t;
    const endT = chunk[chunk.length - 1].t;

    if (kind === "visit") {
      const at = chunk[Math.floor(chunk.length / 2)].at;
      segments.push(
        shape === "android"
          ? {
              startTime: iso(startT),
              endTime: iso(endT),
              visit: {
                topCandidate: { placeId: `sample-${startT}`, placeLocation: { latLng: androidLatLng(at) } },
              },
            }
          : {
              startTime: iso(startT),
              endTime: iso(endT),
              visit: {
                topCandidate: { placeID: `sample-${startT}`, placeLocation: iosLatLng(at) },
              },
            },
      );
    } else {
      const path = chunk.map((s) =>
        shape === "android"
          ? { point: androidLatLng(s.at), time: iso(s.t) }
          : {
              point: iosLatLng(s.at),
              durationMinutesOffsetFromStartTime: String(Math.round((s.t - startT) / MIN)),
            },
      );
      segments.push({ startTime: iso(startT), endTime: iso(endT), timelinePath: path });
    }

    i = j;
  }

  return shape === "android" ? { semanticSegments: segments } : segments;
}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/sample.test.ts`
Expected: PASS — 13 tests

만남 건수가 5건 미만으로 나오면 주말 만남 시간(13~18시)이 겹치는지, 성수/홍대 좌표가 `radiusM` 안에 드는지 확인한다. 60건 이상이면 평일 직장 좌표(역삼·삼성)가 서로 100m 안에 들어와 있는지 본다 — 두 곳은 3km 떨어져 있어야 한다.

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/sample.ts src/app/playground/together-map/sample.test.ts
git commit -m "feat(together-map): 가상 여행 샘플

파일 없이 바로 돌려볼 수 있게 하고, 동시에 파서 픽스처로 쓴다.
만남이 잡혀야 하는 구간(주말·부산)과 잡히면 안 되는 구간(제주)을
둘 다 넣어 검출기가 실제로 도는지 테스트가 확인한다."
```

---

### Task 6: camera.ts — 프레이밍과 카메라 모드

**Files:**
- Create: `src/app/playground/together-map/camera.ts`
- Test: `src/app/playground/together-map/camera.test.ts`

**Interfaces:**
- Consumes: `LatLon` · `projectMercator` · `unprojectMercator` from `./geo`
- Produces: `Bounds`, `View`, `CameraMode`, `TILE_SIZE`, `boundsOf(points): Bounds | null`, `padBounds(b, ratio): Bounds`, `fitView(b, w, h, paddingPx): View`, `stepCamera(current, target, damping): View`, `DAMPING`

```ts
export interface Bounds { minLat: number; maxLat: number; minLon: number; maxLon: number }
/** zoom은 타일 지도의 z 레벨이고 소수를 허용한다. */
export interface View { centerLat: number; centerLon: number; zoom: number }
export type CameraMode = "fixed" | "steady" | "dynamic";
```

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/camera.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DAMPING, boundsOf, fitView, padBounds, stepCamera, type View } from "./camera";

const SEOUL = { lat: 37.5665, lon: 126.978 };
const BUSAN = { lat: 35.1796, lon: 129.0756 };

describe("boundsOf", () => {
  it("점들을 감싸는 사각형", () => {
    expect(boundsOf([SEOUL, BUSAN])).toEqual({
      minLat: 35.1796,
      maxLat: 37.5665,
      minLon: 126.978,
      maxLon: 129.0756,
    });
  });

  it("점 하나면 넓이 0인 사각형", () => {
    const b = boundsOf([SEOUL]);
    expect(b).toEqual({ minLat: 37.5665, maxLat: 37.5665, minLon: 126.978, maxLon: 126.978 });
  });

  it("빈 배열은 null", () => {
    expect(boundsOf([])).toBeNull();
  });
});

describe("padBounds", () => {
  it("사각형을 비율만큼 넓힌다", () => {
    const b = padBounds({ minLat: 0, maxLat: 10, minLon: 0, maxLon: 10 }, 0.1);
    expect(b.minLat).toBeCloseTo(-1, 9);
    expect(b.maxLat).toBeCloseTo(11, 9);
  });

  it("넓이 0인 사각형도 최소 크기를 갖는다 — 안 그러면 줌이 무한대가 된다", () => {
    const b = padBounds({ minLat: 37.5, maxLat: 37.5, minLon: 127, maxLon: 127 }, 0.1);
    expect(b.maxLat).toBeGreaterThan(b.minLat);
    expect(b.maxLon).toBeGreaterThan(b.minLon);
  });
});

describe("fitView", () => {
  it("중심이 사각형 가운데로 온다", () => {
    const view = fitView({ minLat: 35, maxLat: 37, minLon: 126, maxLon: 128 }, 1080, 1080, 40);
    expect(view.centerLon).toBeCloseTo(127, 6);
    expect(view.centerLat).toBeGreaterThan(35);
    expect(view.centerLat).toBeLessThan(37);
  });

  it("좁은 범위일수록 줌이 크다", () => {
    const wide = fitView({ minLat: 30, maxLat: 40, minLon: 120, maxLon: 130 }, 1080, 1080, 40);
    const tight = fitView({ minLat: 37.5, maxLat: 37.6, minLon: 127, maxLon: 127.1 }, 1080, 1080, 40);
    expect(tight.zoom).toBeGreaterThan(wide.zoom);
  });

  it("줌이 유한하고 상식적인 범위에 든다", () => {
    const view = fitView({ minLat: 37.5, maxLat: 37.5001, minLon: 127, maxLon: 127.0001 }, 1080, 1080, 40);
    expect(Number.isFinite(view.zoom)).toBe(true);
    expect(view.zoom).toBeLessThanOrEqual(19);
    expect(view.zoom).toBeGreaterThanOrEqual(1);
  });

  it("세로 화면은 가로 화면보다 줌이 작거나 같다 — 가로 폭이 좁아 더 물러나야 한다", () => {
    const box = { minLat: 37, maxLat: 38, minLon: 126, maxLon: 128 };
    const portrait = fitView(box, 1080, 1920, 40);
    const landscape = fitView(box, 1920, 1080, 40);
    expect(portrait.zoom).toBeLessThanOrEqual(landscape.zoom);
  });
});

describe("stepCamera", () => {
  const from: View = { centerLat: 37, centerLon: 127, zoom: 10 };
  const to: View = { centerLat: 38, centerLon: 128, zoom: 12 };

  it("목표 쪽으로 다가간다", () => {
    const next = stepCamera(from, to, DAMPING.steady);
    expect(next.centerLat).toBeGreaterThan(from.centerLat);
    expect(next.centerLat).toBeLessThan(to.centerLat);
    expect(next.zoom).toBeGreaterThan(from.zoom);
  });

  it("감쇠가 클수록 빨리 붙는다", () => {
    const slow = stepCamera(from, to, DAMPING.steady);
    const fast = stepCamera(from, to, DAMPING.dynamic);
    expect(fast.centerLat).toBeGreaterThan(slow.centerLat);
  });

  it("감쇠 1이면 한 번에 목표", () => {
    expect(stepCamera(from, to, 1)).toEqual(to);
  });

  it("이미 목표면 그대로", () => {
    expect(stepCamera(to, to, DAMPING.steady)).toEqual(to);
  });

  it("역동 모드가 부드러운 모드보다 감쇠가 크다", () => {
    expect(DAMPING.dynamic).toBeGreaterThan(DAMPING.steady);
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/camera.test.ts`
Expected: FAIL — `Failed to resolve import "./camera"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/camera.ts`:

```ts
import { projectMercator, unprojectMercator, type LatLon } from "./geo";

export interface Bounds {
  minLat: number;
  maxLat: number;
  minLon: number;
  maxLon: number;
}

/** 화면이 보고 있는 곳. zoom은 타일 z 레벨이고 소수를 허용한다. */
export interface View {
  centerLat: number;
  centerLon: number;
  zoom: number;
}

export type CameraMode = "fixed" | "steady" | "dynamic";

/** 래스터 타일 한 장의 변(px). 표준값이다. */
export const TILE_SIZE = 256;

const MIN_ZOOM = 1;
/** 타일 서버가 대개 여기까지만 준다. 더 당겨도 빈 타일이 온다. */
const MAX_ZOOM = 19;

/** 사각형이 완전히 납작해지면 줌이 무한대가 된다. 최소한 이만큼은 벌려 둔다. */
const MIN_SPAN_DEG = 0.002;

export const DAMPING = {
  steady: 0.06,
  dynamic: 0.16,
} as const;

export function boundsOf(points: LatLon[]): Bounds | null {
  if (points.length === 0) return null;
  let minLat = Infinity;
  let maxLat = -Infinity;
  let minLon = Infinity;
  let maxLon = -Infinity;

  for (const p of points) {
    if (p.lat < minLat) minLat = p.lat;
    if (p.lat > maxLat) maxLat = p.lat;
    if (p.lon < minLon) minLon = p.lon;
    if (p.lon > maxLon) maxLon = p.lon;
  }
  return { minLat, maxLat, minLon, maxLon };
}

export function padBounds(b: Bounds, ratio: number): Bounds {
  const latSpan = Math.max(b.maxLat - b.minLat, MIN_SPAN_DEG);
  const lonSpan = Math.max(b.maxLon - b.minLon, MIN_SPAN_DEG);
  const latPad = latSpan * ratio + (latSpan - (b.maxLat - b.minLat)) / 2;
  const lonPad = lonSpan * ratio + (lonSpan - (b.maxLon - b.minLon)) / 2;

  return {
    minLat: b.minLat - latPad,
    maxLat: b.maxLat + latPad,
    minLon: b.minLon - lonPad,
    maxLon: b.maxLon + lonPad,
  };
}

/**
 * 사각형이 화면에 다 들어오는 시야를 구한다.
 *
 * 가로와 세로 중 더 빡빡한 쪽에 맞춘다. 넉넉한 쪽에 맞추면 반대편이 잘린다.
 */
export function fitView(b: Bounds, w: number, h: number, paddingPx: number): View {
  const topLeft = projectMercator({ lat: b.maxLat, lon: b.minLon });
  const bottomRight = projectMercator({ lat: b.minLat, lon: b.maxLon });

  const dx = Math.max(1e-9, bottomRight.x - topLeft.x);
  const dy = Math.max(1e-9, bottomRight.y - topLeft.y);

  const usableW = Math.max(1, w - paddingPx * 2);
  const usableH = Math.max(1, h - paddingPx * 2);

  const zoomX = Math.log2(usableW / (TILE_SIZE * dx));
  const zoomY = Math.log2(usableH / (TILE_SIZE * dy));
  const zoom = Math.max(MIN_ZOOM, Math.min(MAX_ZOOM, Math.min(zoomX, zoomY)));

  // 중심은 위경도 평균이 아니라 메르카토르 평면의 가운데다.
  // 위도가 높을수록 위아래 간격이 비선형이라 평균을 쓰면 중심이 밀린다.
  const center = unprojectMercator((topLeft.x + bottomRight.x) / 2, (topLeft.y + bottomRight.y) / 2);

  return { centerLat: center.lat, centerLon: center.lon, zoom };
}

/** 현재 시야를 목표 쪽으로 한 걸음 당긴다. damping이 1이면 한 번에 붙는다. */
export function stepCamera(current: View, target: View, damping: number): View {
  const f = Math.max(0, Math.min(1, damping));
  return {
    centerLat: current.centerLat + (target.centerLat - current.centerLat) * f,
    centerLon: current.centerLon + (target.centerLon - current.centerLon) * f,
    zoom: current.zoom + (target.zoom - current.zoom) * f,
  };
}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/camera.test.ts`
Expected: PASS — 13 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/camera.ts src/app/playground/together-map/camera.test.ts
git commit -m "feat(together-map): 프레이밍과 카메라 모드

가로세로 중 빡빡한 쪽에 맞춘다. 중심은 위경도 평균이 아니라 메르카토르
평면의 가운데다 — 위도가 높을수록 평균은 중심을 밀어낸다."
```

---

### Task 7: render.ts — 좌표 변환과 꼬리

**Files:**
- Create: `src/app/playground/together-map/render.ts`
- Test: `src/app/playground/together-map/render.test.ts`

**Interfaces:**
- Consumes: `LatLon` · `projectMercator` from `./geo`, `View` · `TILE_SIZE` from `./camera`, `RawPoint` from `./parse`, `Meeting` from `./meet`
- Produces: `Size`, `Screen`, `TAIL_MS`, `viewToScreen(p, view, size): Screen`, `tailSegments(points, now, tailMs, maxGapMs): LatLon[][]`, `meetingPulse(meeting, now): number`, `blurRadiusScreen(radiusM, lat, view): number`

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/render.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { View } from "./camera";
import type { RawPoint } from "./parse";
import { meetingPulse, tailSegments, viewToScreen } from "./render";

const VIEW: View = { centerLat: 37.5, centerLon: 127.0, zoom: 12 };
const SIZE = { w: 1080, h: 1080 };
const T0 = Date.parse("2026-01-01T00:00:00Z");
const MIN = 60_000;

function p(minute: number, lat: number, lon: number): RawPoint {
  return { t: T0 + minute * MIN, lat, lon, kind: "path" };
}

describe("viewToScreen", () => {
  it("시야 중심은 화면 한가운데", () => {
    const s = viewToScreen({ lat: VIEW.centerLat, lon: VIEW.centerLon }, VIEW, SIZE);
    expect(s.x).toBeCloseTo(540, 6);
    expect(s.y).toBeCloseTo(540, 6);
  });

  it("동쪽은 오른쪽, 북쪽은 위쪽", () => {
    const east = viewToScreen({ lat: 37.5, lon: 127.1 }, VIEW, SIZE);
    const north = viewToScreen({ lat: 37.6, lon: 127.0 }, VIEW, SIZE);
    expect(east.x).toBeGreaterThan(540);
    expect(north.y).toBeLessThan(540);
  });

  it("줌이 한 단계 오르면 중심에서의 거리가 두 배", () => {
    const at = { lat: 37.52, lon: 127.02 };
    const near = viewToScreen(at, VIEW, SIZE);
    const far = viewToScreen(at, { ...VIEW, zoom: 13 }, SIZE);
    expect(far.x - 540).toBeCloseTo((near.x - 540) * 2, 4);
  });

  it("세로 화면에서도 중심은 가운데", () => {
    const s = viewToScreen({ lat: 37.5, lon: 127.0 }, VIEW, { w: 1080, h: 1920 });
    expect(s.x).toBeCloseTo(540, 6);
    expect(s.y).toBeCloseTo(960, 6);
  });
});

describe("tailSegments", () => {
  it("꼬리 길이 안의 점만 남는다", () => {
    const points = [p(0, 37, 127), p(10, 37, 127), p(20, 37, 127)];
    const segs = tailSegments(points, T0 + 20 * MIN, 15 * MIN, 30 * MIN);
    expect(segs.flat()).toHaveLength(2);
  });

  it("현재 시각보다 미래의 점은 안 나온다", () => {
    const points = [p(0, 37, 127), p(50, 37, 127)];
    const segs = tailSegments(points, T0 + 10 * MIN, 60 * MIN, 30 * MIN);
    expect(segs.flat()).toHaveLength(1);
  });

  it("구멍이 있으면 선을 끊어서 여러 조각으로 준다", () => {
    // 두 점 사이가 60분 — 이으면 없는 길이 그어진다
    const points = [p(0, 37, 127), p(60, 38, 128), p(65, 38, 128)];
    const segs = tailSegments(points, T0 + 65 * MIN, 120 * MIN, 30 * MIN);
    expect(segs).toHaveLength(2);
    expect(segs[0]).toHaveLength(1);
    expect(segs[1]).toHaveLength(2);
  });

  it("점이 없으면 빈 배열", () => {
    expect(tailSegments([], T0, 30 * MIN, 30 * MIN)).toEqual([]);
  });

  it("한 조각도 못 만들면 빈 배열", () => {
    const points = [p(100, 37, 127)];
    expect(tailSegments(points, T0, 30 * MIN, 30 * MIN)).toEqual([]);
  });
});

describe("meetingPulse", () => {
  const meeting = { start: T0, end: T0 + 60 * MIN, lat: 37.5, lon: 127, minDistance: 10 };

  it("시작 직전엔 0", () => {
    expect(meetingPulse(meeting, T0 - MIN)).toBe(0);
  });

  it("시작 순간이 가장 세다", () => {
    expect(meetingPulse(meeting, T0)).toBeCloseTo(1, 6);
  });

  it("시간이 지나면 잦아든다", () => {
    const early = meetingPulse(meeting, T0 + 5 * MIN);
    const late = meetingPulse(meeting, T0 + 30 * MIN);
    expect(late).toBeLessThan(early);
  });

  it("0과 1 사이를 벗어나지 않는다", () => {
    for (let m = -10; m < 120; m += 5) {
      const v = meetingPulse(meeting, T0 + m * MIN);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThanOrEqual(1);
    }
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/render.test.ts`
Expected: FAIL — `Failed to resolve import "./render"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/render.ts`:

```ts
import { TILE_SIZE, type View } from "./camera";
import { projectMercator, type LatLon } from "./geo";
import type { Meeting } from "./meet";
import type { RawPoint } from "./parse";

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
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/render.test.ts`
Expected: PASS — 14 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/render.ts src/app/playground/together-map/render.test.ts
git commit -m "feat(together-map): 화면 좌표 변환과 꼬리

꼬리를 하나의 선으로 주지 않고 조각으로 나눈다. 기록이 비는 구간을
이으면 화면을 가로지르는 직선이 생기는데 그건 실제로 가지 않은 길이다."
```

---

### Task 8: tiles.ts — 지도 타일

**Files:**
- Create: `src/app/playground/together-map/tiles.ts`
- Test: `src/app/playground/together-map/tiles.test.ts`

**Interfaces:**
- Consumes: `View` · `TILE_SIZE` from `./camera`, `projectMercator` from `./geo`, `Size` from `./render`
- Produces: `TILE_ATTRIBUTION`, `TILE_URL_TEMPLATE`, `tileUrl(z, x, y): string`, `visibleTiles(view, size): TileRef[]`, `TileCache` (클래스)

```ts
export interface TileRef { z: number; x: number; y: number; screenX: number; screenY: number; size: number }
```

타일 로딩 자체(`Image` 객체)는 테스트하지 않는다. 어느 타일이 필요한지 계산하는 부분만 테스트한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/tiles.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { View } from "./camera";
import { TILE_ATTRIBUTION, tileUrl, visibleTiles } from "./tiles";

const VIEW: View = { centerLat: 37.5, centerLon: 127.0, zoom: 12 };
const SIZE = { w: 1080, h: 1080 };

describe("tileUrl", () => {
  it("z/x/y를 끼워 넣는다", () => {
    const url = tileUrl(12, 3494, 1585);
    expect(url).toContain("/12/3494/1585");
    expect(url).toMatch(/^https:\/\//);
  });

  it("2배 해상도 타일을 요청한다 — 1080p 영상에서 1배 타일은 뭉개진다", () => {
    expect(tileUrl(12, 1, 1)).toContain("@2x");
  });
});

describe("visibleTiles", () => {
  it("화면을 덮을 만큼 준다", () => {
    const tiles = visibleTiles(VIEW, SIZE);
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.length).toBeLessThan(200); // 폭주하지 않는다
  });

  it("정수 줌 레벨을 쓴다 — 타일 서버는 소수 z를 모른다", () => {
    const tiles = visibleTiles({ ...VIEW, zoom: 12.7 }, SIZE);
    expect(tiles.every((t) => Number.isInteger(t.z))).toBe(true);
  });

  it("타일 좌표가 그 줌의 범위 안에 든다", () => {
    const tiles = visibleTiles(VIEW, SIZE);
    for (const t of tiles) {
      const max = 2 ** t.z;
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThan(max);
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeLessThan(max);
    }
  });

  it("화면이 커지면 타일이 늘어난다", () => {
    const small = visibleTiles(VIEW, { w: 480, h: 480 });
    const big = visibleTiles(VIEW, { w: 1920, h: 1080 });
    expect(big.length).toBeGreaterThan(small.length);
  });

  it("중복 타일을 주지 않는다", () => {
    const tiles = visibleTiles(VIEW, SIZE);
    const keys = new Set(tiles.map((t) => `${t.z}/${t.x}/${t.y}`));
    expect(keys.size).toBe(tiles.length);
  });
});

describe("저작권 표기", () => {
  it("타일 출처를 담고 있다", () => {
    expect(TILE_ATTRIBUTION).toContain("OpenStreetMap");
    expect(TILE_ATTRIBUTION).toContain("CARTO");
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/tiles.test.ts`
Expected: FAIL — `Failed to resolve import "./tiles"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/tiles.ts`:

```ts
import { TILE_SIZE, type View } from "./camera";
import { projectMercator } from "./geo";
import type { Size } from "./render";

/**
 * CARTO의 밝은 무채색 지도. 궤적 색이 살아야 해서 배경이 조용한 것을 골랐다.
 * 컬러 지도를 깔면 두 사람의 선이 도로 색에 묻힌다.
 */
export const TILE_URL_TEMPLATE =
  "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png";

/** 지도 위에 반드시 표시해야 한다. 타일 제공자의 이용 조건이다. */
export const TILE_ATTRIBUTION = "© OpenStreetMap contributors © CARTO";

export interface TileRef {
  z: number;
  x: number;
  y: number;
  /** 캔버스에 그릴 왼쪽 위 좌표. */
  screenX: number;
  screenY: number;
  /** 그릴 크기(px). 소수 줌을 정수 줌으로 맞추느라 256이 아닐 수 있다. */
  size: number;
}

export function tileUrl(z: number, x: number, y: number): string {
  return TILE_URL_TEMPLATE.replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

/**
 * 지금 화면을 덮는 타일 목록.
 *
 * 시야의 줌은 소수인데 타일 서버는 정수 레벨만 안다. 반올림한 정수 레벨에서
 * 타일을 받아 와 소수 차이만큼 늘려 그린다. 내림이 아니라 반올림인 것은,
 * 내리면 항상 흐린 쪽으로 치우치기 때문이다.
 */
export function visibleTiles(view: View, size: Size): TileRef[] {
  const z = Math.max(0, Math.min(19, Math.round(view.zoom)));
  const scale = 2 ** (view.zoom - z);
  const drawSize = TILE_SIZE * scale;
  const worldTiles = 2 ** z;

  const center = projectMercator({ lat: view.centerLat, lon: view.centerLon });
  const centerTileX = center.x * worldTiles;
  const centerTileY = center.y * worldTiles;

  const halfW = size.w / 2 / drawSize;
  const halfH = size.h / 2 / drawSize;

  const minX = Math.floor(centerTileX - halfW);
  const maxX = Math.ceil(centerTileX + halfW);
  const minY = Math.floor(centerTileY - halfH);
  const maxY = Math.ceil(centerTileY + halfH);

  const tiles: TileRef[] = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      // 세로는 감싸지 않는다 — 극지방 바깥엔 타일이 없다
      if (y < 0 || y >= worldTiles) continue;
      // 가로는 감싼다 — 날짜변경선을 넘어가도 지도는 이어진다
      const wrappedX = ((x % worldTiles) + worldTiles) % worldTiles;

      tiles.push({
        z,
        x: wrappedX,
        y,
        screenX: (x - centerTileX) * drawSize + size.w / 2,
        screenY: (y - centerTileY) * drawSize + size.h / 2,
        size: drawSize,
      });
    }
  }

  return tiles;
}

/**
 * 받아 온 타일을 담아 둔다.
 *
 * crossOrigin을 반드시 anonymous로 둔다. 이걸 빠뜨리면 캔버스가 «오염»되어
 * captureStream이 통째로 막히고, 영상 저장이 아무 설명 없이 실패한다.
 */
export class TileCache {
  private images = new Map<string, HTMLImageElement>();
  private pending = new Set<string>();

  constructor(private onLoad: () => void) {}

  /** 이미 받아 둔 타일이면 준다. 없으면 받기 시작하고 null을 준다. */
  get(ref: TileRef): HTMLImageElement | null {
    const key = `${ref.z}/${ref.x}/${ref.y}`;
    const hit = this.images.get(key);
    if (hit) return hit;
    if (this.pending.has(key)) return null;

    this.pending.add(key);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      this.images.set(key, img);
      this.pending.delete(key);
      this.onLoad();
    };
    img.onerror = () => {
      this.pending.delete(key);
    };
    img.src = tileUrl(ref.z, ref.x, ref.y);
    return null;
  }

  /** 아직 받는 중인 타일 수. 영상 만들기 전에 0이 되기를 기다린다. */
  get pendingCount(): number {
    return this.pending.size;
  }
}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/tiles.test.ts`
Expected: PASS — 8 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/tiles.ts src/app/playground/together-map/tiles.test.ts
git commit -m "feat(together-map): 지도 타일

crossOrigin을 anonymous로 둔다. 빠뜨리면 캔버스가 오염돼 captureStream이
아무 설명 없이 막힌다. 소수 줌은 반올림한 정수 레벨 타일을 늘려 그린다."
```

---

### Task 9: i18n.ts — UI 문자열

**Files:**
- Create: `src/app/playground/together-map/i18n.ts`
- Test: `src/app/playground/together-map/i18n.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `Lang`, `LANGS`, `Strings`, `t(lang): Strings`, `resolveLang(pref, navigatorLangs): Lang`

레퍼런스와 같은 10개를 넣는다. 사전을 파일 하나에 몰아넣어서 나중에 줄이기로 하면 이 파일만 건드리면 되게 한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/i18n.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { LANGS, resolveLang, t } from "./i18n";

describe("LANGS", () => {
  it("레퍼런스와 같은 9개 언어 + 시스템 기본", () => {
    expect(LANGS).toHaveLength(9);
    expect(LANGS.map((l) => l.code)).toContain("ko");
    expect(LANGS.map((l) => l.code)).toContain("en");
  });

  it("각 언어에 표시 이름이 있다", () => {
    for (const lang of LANGS) {
      expect(lang.label.length).toBeGreaterThan(0);
    }
  });
});

describe("t", () => {
  it("모든 언어가 같은 키를 갖는다 — 하나라도 빠지면 그 자리가 빈다", () => {
    const koKeys = Object.keys(t("ko")).sort();
    for (const lang of LANGS) {
      expect(Object.keys(t(lang.code)).sort()).toEqual(koKeys);
    }
  });

  it("빈 문자열인 항목이 없다", () => {
    for (const lang of LANGS) {
      for (const [key, value] of Object.entries(t(lang.code))) {
        expect(value, `${lang.code}.${key}`).not.toBe("");
      }
    }
  });

  it("한국어와 영어가 실제로 다르다", () => {
    expect(t("ko").title).not.toBe(t("en").title);
  });
});

describe("resolveLang", () => {
  it("직접 고르면 그것을 쓴다", () => {
    expect(resolveLang("ja", ["ko-KR"])).toBe("ja");
  });

  it("시스템 기본이면 브라우저 언어를 따른다", () => {
    expect(resolveLang("system", ["ja-JP", "en-US"])).toBe("ja");
  });

  it("지역 코드가 붙어 있어도 알아본다", () => {
    expect(resolveLang("system", ["ko-KR"])).toBe("ko");
    expect(resolveLang("system", ["pt-BR"])).toBe("pt");
  });

  it("중국어는 간체와 번체를 가른다", () => {
    expect(resolveLang("system", ["zh-TW"])).toBe("zh-Hant");
    expect(resolveLang("system", ["zh-CN"])).toBe("zh-Hans");
  });

  it("모르는 언어면 한국어로 떨어진다 — 이 사이트의 기본 언어다", () => {
    expect(resolveLang("system", ["sw-KE"])).toBe("ko");
    expect(resolveLang("system", [])).toBe("ko");
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/i18n.test.ts`
Expected: FAIL — `Failed to resolve import "./i18n"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/i18n.ts`에 `Lang` 타입, `LANGS` 목록, `Strings` 인터페이스, 9개 언어 사전, `t()`, `resolveLang()`을 쓴다.

`Strings`에 들어가는 키(전부 채운다 — 하나라도 비면 테스트가 잡는다):

```ts
export interface Strings {
  title: string;
  intro: string;
  chooseA: string;              // "첫 번째 사람의 Timeline.json"
  chooseB: string;
  trySample: string;            // "가상 여행으로 해보기"
  consentTitle: string;
  consentBody: string;          // 타일 서버가 대략적 위치를 알게 된다는 설명
  consentAgree: string;         // "이해했고 지도를 불러오겠습니다"
  privacyNote: string;          // "파일은 이 기기를 벗어나지 않습니다"
  useRawData: string;
  accuracyLimit: string;
  outlierFilter: string;
  outlierConservative: string;
  outlierOff: string;
  exactDates: string;
  startDate: string;
  endDate: string;
  videoTitle: string;
  duration: string;
  seconds: string;              // "{n}초"
  cameraMotion: string;
  cameraFixed: string;
  cameraSteady: string;
  cameraDynamic: string;
  videoSize: string;
  sizeSquare: string;
  sizePortrait: string;
  sizeLandscape: string;
  preview: string;
  createVideo: string;
  cancelVideo: string;
  shareVideo: string;
  downloadVideo: string;
  language: string;
  systemDefault: string;
  personA: string;
  personB: string;
  meetRadius: string;
  meetMinDuration: string;
  hideHome: string;
  hideHomeRadius: string;
  showSummary: string;
  meetingsFound: string;        // "만남 {n}건"
  noMeetings: string;
  totalTogether: string;
  favouriteSpot: string;
  farthestApart: string;
  parseFailed: string;
  rendering: string;
  webmFallback: string;         // mp4를 못 만들 때 알리는 문구
  attribution: string;
}

export type Lang = "ko" | "en" | "ja" | "zh-Hans" | "zh-Hant" | "es" | "fr" | "de" | "pt";
export type LangPref = Lang | "system";

export const LANGS: { code: Lang; label: string }[] = [
  { code: "ko", label: "한국어" },
  { code: "en", label: "English" },
  { code: "ja", label: "日本語" },
  { code: "zh-Hans", label: "简体中文" },
  { code: "zh-Hant", label: "繁體中文" },
  { code: "es", label: "Español" },
  { code: "fr", label: "Français" },
  { code: "de", label: "Deutsch" },
  { code: "pt", label: "Português (Brasil)" },
];
```

`resolveLang`은 이렇게 쓴다:

```ts
/**
 * 브라우저 언어 목록에서 지원하는 언어를 고른다.
 * 못 찾으면 한국어로 떨어진다 — 이 사이트의 기본 언어다.
 */
export function resolveLang(pref: LangPref, navigatorLangs: readonly string[]): Lang {
  if (pref !== "system") return pref;

  for (const raw of navigatorLangs) {
    const lower = raw.toLowerCase();
    // 중국어만 간체·번체를 갈라야 해서 따로 본다
    if (lower.startsWith("zh")) {
      return /hant|tw|hk|mo/.test(lower) ? "zh-Hant" : "zh-Hans";
    }
    const base = lower.split("-")[0];
    const hit = LANGS.find((l) => l.code === base);
    if (hit) return hit.code;
  }
  return "ko";
}

export function t(lang: Lang): Strings {
  return DICT[lang];
}
```

`DICT`는 `Record<Lang, Strings>`이고 9개를 전부 채운다. 한국어를 먼저 쓰고 나머지를 옮긴다. **키를 빠뜨리면 타입 오류가 나므로 컴파일러가 잡아 준다.**

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/i18n.test.ts`
Expected: PASS — 9 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/i18n.ts src/app/playground/together-map/i18n.test.ts
git commit -m "feat(together-map): UI 문자열 9개 언어

사전을 파일 하나에 몰아넣는다. 이 사이트는 한국어 전용이라 9개 언어는
과한 면이 있고, 나중에 줄이기로 하면 이 파일만 건드리면 되게 했다."
```

---

### Task 10: encode.ts — 영상 저장

**Files:**
- Create: `src/app/playground/together-map/encode.ts`
- Test: `src/app/playground/together-map/encode.test.ts`

**Interfaces:**
- Consumes: 없음
- Produces: `VideoFormat`, `SIZES`, `DURATIONS`, `pickMimeType(isSupported): {mimeType, ext}`, `recordCanvas(canvas, seconds, onProgress, signal): Promise<Blob>`

`MediaRecorder`는 node 환경에 없으므로 **코덱 고르는 부분만** 함수로 빼서 테스트한다.

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/encode.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import { DURATIONS, SIZES, pickMimeType } from "./encode";

describe("SIZES", () => {
  it("레퍼런스와 같은 다섯 가지", () => {
    expect(SIZES).toHaveLength(5);
  });

  it("정사각 세 가지와 세로·가로가 있다", () => {
    const squares = SIZES.filter((s) => s.w === s.h);
    expect(squares).toHaveLength(3);
    expect(SIZES.some((s) => s.w === 1080 && s.h === 1920)).toBe(true);
    expect(SIZES.some((s) => s.w === 1920 && s.h === 1080)).toBe(true);
  });

  it("모든 변이 짝수다 — 홀수면 인코더가 거부하는 경우가 있다", () => {
    for (const s of SIZES) {
      expect(s.w % 2).toBe(0);
      expect(s.h % 2).toBe(0);
    }
  });
});

describe("DURATIONS", () => {
  it("레퍼런스와 같은 여섯 가지", () => {
    expect(DURATIONS).toEqual([10, 15, 20, 30, 45, 60]);
  });
});

describe("pickMimeType", () => {
  it("mp4를 지원하면 mp4", () => {
    const got = pickMimeType((type) => type.includes("mp4"));
    expect(got.mimeType).toContain("mp4");
    expect(got.ext).toBe("mp4");
  });

  it("mp4가 안 되면 webm으로 떨어진다", () => {
    const got = pickMimeType((type) => type.includes("webm"));
    expect(got.mimeType).toContain("webm");
    expect(got.ext).toBe("webm");
  });

  it("아무것도 지원 안 하면 빈 mimeType으로 브라우저 기본에 맡긴다", () => {
    const got = pickMimeType(() => false);
    expect(got.mimeType).toBe("");
    expect(got.ext).toBe("webm");
  });

  it("mp4와 webm이 둘 다 되면 mp4를 고른다 — 공유가 쉽다", () => {
    const got = pickMimeType(() => true);
    expect(got.ext).toBe("mp4");
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/encode.test.ts`
Expected: FAIL — `Failed to resolve import "./encode"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/encode.ts`:

```ts
export interface VideoFormat {
  /** 로그·테스트용 식별자. 화면에는 i18n 문구를 쓴다. */
  label: string;
  shape: "square" | "portrait" | "landscape";
  w: number;
  h: number;
}

/**
 * 레퍼런스와 같은 다섯 가지. 변은 모두 짝수여야 한다 — 홀수를 거부하는 인코더가 있다.
 *
 * label은 화면에 쓰지 않는다. SetupPanel이 i18n의 sizeSquare/sizePortrait/
 * sizeLandscape와 아래 치수를 합쳐 만든다. 여기 label은 로그와 테스트용이다.
 */
export const SIZES: VideoFormat[] = [
  { label: "square-480", shape: "square", w: 480, h: 480 },
  { label: "square-720", shape: "square", w: 720, h: 720 },
  { label: "square-1080", shape: "square", w: 1080, h: 1080 },
  { label: "portrait-1080", shape: "portrait", w: 1080, h: 1920 },
  { label: "landscape-1080", shape: "landscape", w: 1920, h: 1080 },
];

export const DURATIONS = [10, 15, 20, 30, 45, 60] as const;

export const FPS = 30;

/**
 * 쓸 수 있는 코덱을 고른다.
 *
 * mp4를 먼저 본다. webm은 카카오톡이나 인스타에 그냥 안 올라가는 경우가 많아서,
 * «영상을 만들었는데 공유가 안 된다»가 되기 쉽다. 사파리는 mp4만 되고
 * 크롬은 판마다 다르므로 런타임에 물어봐야 한다.
 */
export function pickMimeType(isSupported: (type: string) => boolean): {
  mimeType: string;
  ext: "mp4" | "webm";
} {
  const candidates: { type: string; ext: "mp4" | "webm" }[] = [
    { type: "video/mp4;codecs=avc1.42E01E", ext: "mp4" },
    { type: "video/mp4", ext: "mp4" },
    { type: "video/webm;codecs=vp9", ext: "webm" },
    { type: "video/webm;codecs=vp8", ext: "webm" },
    { type: "video/webm", ext: "webm" },
  ];

  for (const c of candidates) {
    if (isSupported(c.type)) return { mimeType: c.type, ext: c.ext };
  }
  // 아무것도 못 고르면 빈 문자열로 브라우저 기본 코덱에 맡긴다
  return { mimeType: "", ext: "webm" };
}

/**
 * 캔버스를 실시간으로 녹화한다.
 *
 * 프레임을 하나씩 만들어 붙이는 방식(WebCodecs)이 화질과 정확도 면에서 낫지만
 * 지원이 고르지 않고 코드가 몇 배로 길어진다. MediaRecorder는 어디서나 돌고,
 * 이 도구가 그리는 그림은 초당 30장으로 충분하다.
 *
 * 호출하는 쪽에서 재생을 seconds 안에 끝내야 한다 — 여기서는 시간만 잰다.
 */
export function recordCanvas(
  canvas: HTMLCanvasElement,
  seconds: number,
  onProgress: (ratio: number) => void,
  signal: AbortSignal,
): Promise<{ blob: Blob; ext: "mp4" | "webm" }> {
  return new Promise((resolve, reject) => {
    const { mimeType, ext } = pickMimeType((type) => MediaRecorder.isTypeSupported(type));
    const stream = canvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      window.clearInterval(timer);
      stream.getTracks().forEach((track) => track.stop());
      if (signal.aborted) {
        reject(new DOMException("취소했습니다", "AbortError"));
        return;
      }
      resolve({ blob: new Blob(chunks, { type: mimeType || "video/webm" }), ext });
    };
    recorder.onerror = () => {
      window.clearInterval(timer);
      reject(new Error("영상을 만들지 못했습니다."));
    };

    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      const ratio = (performance.now() - startedAt) / (seconds * 1000);
      onProgress(Math.min(1, ratio));
      if (ratio >= 1 && recorder.state === "recording") recorder.stop();
    }, 100);

    signal.addEventListener("abort", () => {
      if (recorder.state === "recording") recorder.stop();
    });

    recorder.start();
  });
}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/encode.test.ts`
Expected: PASS — 8 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/encode.ts src/app/playground/together-map/encode.test.ts
git commit -m "feat(together-map): 영상 저장

mp4를 먼저 본다. webm은 카카오톡·인스타에 안 올라가는 경우가 많아서
«만들었는데 공유가 안 된다»가 되기 쉽다. 지원 여부는 런타임에 묻는다."
```

---

### Task 10b: summary.ts — 마무리 통계

**Files:**
- Create: `src/app/playground/together-map/summary.ts`
- Test: `src/app/playground/together-map/summary.test.ts`

**Interfaces:**
- Consumes: `Meeting` · `GRID_MS` · `MAX_GAP_MS` · `resample` · `overlapRange` from `./meet`, `RawPoint` from `./parse`, `haversineMeters` from `./geo`
- Produces: `Summary`, `buildSummary(a, b, meetings): Summary`

```ts
export interface Summary {
  meetCount: number;
  /** 만난 구간의 합(ms). */
  totalTogetherMs: number;
  /** 가장 자주 만난 자리와 그 횟수. 만남이 없으면 null. */
  favourite: { lat: number; lon: number; count: number } | null;
  /** 가장 멀리 떨어져 있던 순간. 겹치는 기록이 없으면 null. */
  farthest: { meters: number; at: number } | null;
}
```

- [ ] **Step 1: 실패하는 테스트를 쓴다**

`src/app/playground/together-map/summary.test.ts`:

```ts
import { describe, expect, it } from "vitest";
import type { Meeting } from "./meet";
import type { RawPoint } from "./parse";
import { buildSummary } from "./summary";

const T0 = Date.parse("2026-01-01T00:00:00Z");
const MIN = 60_000;

function p(minute: number, lat: number, lon: number): RawPoint {
  return { t: T0 + minute * MIN, lat, lon, kind: "path" };
}

function stay(start: number, end: number, lat: number, lon: number): RawPoint[] {
  const out: RawPoint[] = [];
  for (let m = start; m <= end; m += 5) out.push(p(m, lat, lon));
  return out;
}

function meeting(startMin: number, endMin: number, lat: number, lon: number): Meeting {
  return {
    start: T0 + startMin * MIN,
    end: T0 + endMin * MIN,
    lat,
    lon,
    minDistance: 10,
  };
}

describe("buildSummary", () => {
  const a = stay(0, 120, 37.5, 127.0);
  const b = stay(0, 120, 37.5, 127.0);

  it("만난 횟수를 센다", () => {
    const s = buildSummary(a, b, [meeting(0, 30, 37.5, 127), meeting(60, 90, 37.5, 127)]);
    expect(s.meetCount).toBe(2);
  });

  it("함께한 시간은 구간 길이의 합이다", () => {
    const s = buildSummary(a, b, [meeting(0, 30, 37.5, 127), meeting(60, 90, 37.5, 127)]);
    expect(s.totalTogetherMs).toBe(60 * MIN);
  });

  it("가장 자주 만난 자리를 찾는다", () => {
    const s = buildSummary(a, b, [
      meeting(0, 30, 37.5445, 127.0557),   // 성수
      meeting(40, 70, 37.5563, 126.9236),  // 홍대
      meeting(80, 110, 37.5446, 127.0558), // 성수 — 몇십 미터 차이는 같은 자리로 본다
    ]);
    expect(s.favourite?.count).toBe(2);
    expect(s.favourite?.lat).toBeCloseTo(37.5445, 3);
  });

  it("같은 자리 판정은 거리로 한다 — 좌표가 정확히 같을 필요는 없다", () => {
    const s = buildSummary(a, b, [
      meeting(0, 30, 37.5, 127.0),
      meeting(40, 70, 37.5, 127.0001), // 약 9m
    ]);
    expect(s.favourite?.count).toBe(2);
  });

  it("멀리 떨어진 만남은 따로 센다", () => {
    const s = buildSummary(a, b, [
      meeting(0, 30, 37.5, 127.0),
      meeting(40, 70, 35.1, 129.0), // 부산
    ]);
    expect(s.favourite?.count).toBe(1);
  });

  it("가장 멀리 떨어졌던 순간을 찾는다", () => {
    const near = stay(0, 60, 37.5, 127.0);
    const far = [...stay(0, 30, 37.5, 127.0), ...stay(35, 60, 35.1796, 129.0756)];
    const s = buildSummary(near, far, []);
    expect(s.farthest?.meters).toBeGreaterThan(300_000);
    expect(s.farthest?.at).toBeGreaterThan(T0 + 30 * MIN);
  });

  it("만남이 없으면 favourite는 null이고 나머지는 0", () => {
    const s = buildSummary(a, b, []);
    expect(s.meetCount).toBe(0);
    expect(s.totalTogetherMs).toBe(0);
    expect(s.favourite).toBeNull();
  });

  it("겹치는 기록이 없으면 farthest는 null — 모르는 것을 지어내지 않는다", () => {
    const s = buildSummary(stay(0, 30, 37.5, 127), stay(600, 660, 37.5, 127), []);
    expect(s.farthest).toBeNull();
  });

  it("한쪽이 비어도 터지지 않는다", () => {
    const s = buildSummary([], b, []);
    expect(s.meetCount).toBe(0);
    expect(s.farthest).toBeNull();
  });
});
```

- [ ] **Step 2: 실패를 확인한다**

Run: `npx vitest run src/app/playground/together-map/summary.test.ts`
Expected: FAIL — `Failed to resolve import "./summary"`

- [ ] **Step 3: 구현한다**

`src/app/playground/together-map/summary.ts`:

```ts
import { haversineMeters } from "./geo";
import { GRID_MS, MAX_GAP_MS, overlapRange, resample, type Meeting } from "./meet";
import type { RawPoint } from "./parse";

export interface Summary {
  meetCount: number;
  totalTogetherMs: number;
  favourite: { lat: number; lon: number; count: number } | null;
  farthest: { meters: number; at: number } | null;
}

/**
 * 같은 자리로 볼 반경(m).
 *
 * 좌표가 정확히 같기를 기대하면 안 된다. 같은 카페를 열 번 가도 GPS가 매번
 * 몇십 미터씩 다른 자리를 찍어서, 좌표를 키로 세면 «가장 자주 간 곳»이
 * 전부 1회로 흩어진다.
 */
const SAME_PLACE_M = 300;

/**
 * 만남들을 자리별로 묶어 가장 잦은 곳을 찾는다.
 *
 * 클러스터링을 제대로 하지 않고 «먼저 나온 것을 중심으로 반경 안을 흡수»하는
 * 단순한 방법을 쓴다. 만남이 많아야 수십 건이라 이걸로 충분하고,
 * k-means 같은 것을 얹으면 결과가 실행마다 달라져서 오히려 나쁘다.
 */
function favouritePlace(meetings: Meeting[]): Summary["favourite"] {
  if (meetings.length === 0) return null;

  const clusters: { lat: number; lon: number; count: number }[] = [];
  for (const m of meetings) {
    const hit = clusters.find((c) => haversineMeters(c, m) <= SAME_PLACE_M);
    if (hit) {
      hit.count += 1;
    } else {
      clusters.push({ lat: m.lat, lon: m.lon, count: 1 });
    }
  }

  return clusters.reduce((best, c) => (c.count > best.count ? c : best));
}

/**
 * 두 사람이 가장 멀리 떨어져 있던 순간.
 *
 * 만남 검출과 같은 격자를 쓴다. 한쪽이라도 «모르는 구간»이면 건너뛴다 —
 * 기록이 없는 동안을 «멀리 떨어져 있었다»로 세면 안 된다.
 */
function farthestMoment(a: RawPoint[], b: RawPoint[]): Summary["farthest"] {
  const range = overlapRange(a, b);
  if (!range) return null;

  const gridA = resample(a, range.from, range.to, GRID_MS, MAX_GAP_MS);
  const gridB = resample(b, range.from, range.to, GRID_MS, MAX_GAP_MS);

  let best: { meters: number; at: number } | null = null;
  for (let i = 0; i < gridA.length; i += 1) {
    const pa = gridA[i];
    const pb = gridB[i];
    if (pa === null || pb === null) continue;

    const meters = haversineMeters(pa, pb);
    if (best === null || meters > best.meters) {
      best = { meters, at: range.from + i * GRID_MS };
    }
  }
  return best;
}

export function buildSummary(a: RawPoint[], b: RawPoint[], meetings: Meeting[]): Summary {
  return {
    meetCount: meetings.length,
    totalTogetherMs: meetings.reduce((sum, m) => sum + (m.end - m.start), 0),
    favourite: favouritePlace(meetings),
    farthest: farthestMoment(a, b),
  };
}
```

- [ ] **Step 4: 통과를 확인한다**

Run: `npx vitest run src/app/playground/together-map/summary.test.ts`
Expected: PASS — 9 tests

- [ ] **Step 5: 커밋**

```bash
git add src/app/playground/together-map/summary.ts src/app/playground/together-map/summary.test.ts
git commit -m "feat(together-map): 마무리 통계

같은 자리 판정을 좌표 일치가 아니라 300m 반경으로 한다. 같은 카페를
열 번 가도 GPS는 매번 다른 자리를 찍어서, 좌표를 키로 세면 «자주 간 곳»이
전부 1회로 흩어진다."
```

---

### Task 11: 그리기 — drawFrame

**Files:**
- Modify: `src/app/playground/together-map/render.ts` (파일 끝에 추가)

**Interfaces:**
- Consumes: 앞선 모든 모듈
- Produces: `Track`, `FrameState`, `drawFrame(ctx, state): void`

캔버스에 실제로 칠하는 부분이다. 부수효과 덩어리라 테스트하지 않는다 — 대신 계산은 전부 앞선 순수 함수에 있고 여기서는 호출만 한다.

- [ ] **Step 1: 타입과 함수를 추가한다**

`render.ts` 끝에 붙인다:

```ts
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
```

`Summary`는 `./summary`에서, `Strings`는 `./i18n`에서 가져온다.

`drawFrame`의 뼈대는 이렇다. **호출 순서가 곧 겹치는 순서다 — 바꾸면 궤적이 타일 밑에 깔린다:**

```ts
export function drawFrame(ctx: CanvasRenderingContext2D, state: FrameState): void {
  const { size, view, tracks, meetings, now } = state;

  // 1. 배경. 타일이 아직 안 왔을 때 검은 화면이 되지 않게 흰색으로 채운다.
  ctx.save();
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, size.w, size.h);

  // 2. 타일
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
```

같이 만드는 보조 함수 셋:

- `currentPosition(points, now): LatLon | null` — `now`를 감싸는 두 점을 `lerpLatLon`으로
  보간한다. 앞뒤 간격이 `MAX_GAP_MS`를 넘으면 `null`을 준다. 모르는 위치를 그리면
  점이 화면을 순간이동한다.
- `drawChrome(ctx, state)` — 상단에 `state.title`, 하단 왼쪽에 두 사람 이름과 색 점,
  하단 오른쪽에 `state.strings.meetingsFound`의 `{n}`을 `state.meetCount`로 바꾼 문구,
  우하단 구석에 `TILE_ATTRIBUTION`을 작게. 지도를 깔았으면 표기는 반드시 있어야 한다.
- `drawSummaryCard(ctx, state, summary, opacity)` — 화면을 반투명 흰색으로 덮고
  만난 횟수, 함께한 총 시간, 가장 자주 만난 자리, 가장 멀리 떨어졌던 거리와 날짜를
  큰 글씨로 쌓는다. `summary.favourite`나 `summary.farthest`가 `null`이면 그 줄을
  건너뛴다 — 「0km」나 「-」를 적으면 계산이 안 된 것인지 실제로 0인지 알 수 없다.

폰트는 전부 `system-ui, -apple-system, "Apple SD Gothic Neo", sans-serif`로 지정한다.
웹폰트 이름을 적으면 캔버스에서 조용히 기본 폰트로 떨어져서, 미리보기와 결과물의
글자 모양이 달라진다.

- [ ] **Step 2: 타입 검사가 통과하는지 본다**

Run: `npx tsc --noEmit`
Expected: `together-map` 관련 오류 없음

- [ ] **Step 3: 기존 테스트가 여전히 통과하는지 본다**

Run: `npx vitest run src/app/playground/together-map/`
Expected: PASS — 앞선 작업의 테스트 전부

- [ ] **Step 4: 커밋**

```bash
git add src/app/playground/together-map/render.ts
git commit -m "feat(together-map): 캔버스 한 프레임 그리기"
```

---

### Task 12: SetupPanel.tsx · MeetList.tsx — 설정 화면

**Files:**
- Create: `src/app/playground/together-map/SetupPanel.tsx`
- Create: `src/app/playground/together-map/MeetList.tsx`

**Interfaces:**
- Consumes: `Strings` from `./i18n`, `SIZES` · `DURATIONS` from `./encode`, `CameraMode` from `./camera`, `Meeting` from `./meet`
- Produces: `Settings` 타입과 두 컴포넌트

```ts
export interface Settings {
  langPref: LangPref;
  useRawData: boolean;
  accuracyLimitM: number;
  outlier: "conservative" | "off";
  exactDates: boolean;
  startDate: string;         // "YYYY-MM-DD"
  endDate: string;
  videoTitle: string;
  durationSec: number;
  camera: CameraMode;
  sizeIndex: number;
  nameA: string;
  nameB: string;
  colorA: string;
  colorB: string;
  meetRadiusM: number;
  meetMinMinutes: number;
  hideHome: boolean;
  hideHomeRadiusM: number;
  showSummary: boolean;
}
```

- [ ] **Step 1: SetupPanel을 쓴다**

`"use client"` 없이 쓴다 — 부모가 이미 클라이언트 컴포넌트다.

- 순수한 표현 컴포넌트로 만든다. 상태를 안에 두지 않고 `settings`와 `onChange`를 받는다.
- 묶음마다 `<fieldset>` + `<legend>`로 나눈다: 사람 · 데이터 · 기간 · 만남 · 영상 · 가리기
- 스타일은 저장소의 토큰을 쓴다: `border-border`, `text-text-secondary`, `bg-accent-soft`, `text-accent`, `rounded-2xl`, `spring-transition`
- 모든 입력에 `<label htmlFor>`을 붙인다. 라벨 없는 입력은 만들지 않는다.
- 숫자 입력에는 `min`/`max`를 건다 — 정확도 `0~5000`, 만남 거리 `10~2000`, 최소 시간 `1~240`, 가리기 반경 `50~5000`

- [ ] **Step 2: MeetList를 쓴다**

찾아낸 만남을 목록으로 보여준다. 이게 있어야 «검출이 이상하다»를 사용자가 바로 안다.

- 만남마다 날짜, 시각 범위, 지속시간, 가장 가까웠던 거리
- 만남이 0건이면 빈 목록 대신 **왜 없을 수 있는지** 적는다 — 기간이 안 겹치거나, 판정 거리가 좁거나, 정확도 필터가 셌거나
- 10건이 넘으면 접고 «더 보기»를 둔다

- [ ] **Step 3: 타입 검사와 린트**

Run: `npx tsc --noEmit && npx next lint --file src/app/playground/together-map/SetupPanel.tsx --file src/app/playground/together-map/MeetList.tsx`
Expected: 이 두 파일에서 새 오류 없음

- [ ] **Step 4: 커밋**

```bash
git add src/app/playground/together-map/SetupPanel.tsx src/app/playground/together-map/MeetList.tsx
git commit -m "feat(together-map): 설정 화면과 만남 목록

만남 목록이 있어야 검출이 이상할 때 사용자가 바로 안다. 0건일 때는
빈 목록 대신 왜 없을 수 있는지를 적는다."
```

---

### Task 13: TogetherMap.tsx — 상태 기계

**Files:**
- Create: `src/app/playground/together-map/TogetherMap.tsx`

**Interfaces:**
- Consumes: 앞선 전부
- Produces: 기본 내보내기 `TogetherMap`

- [ ] **Step 1: 컴포넌트를 쓴다**

맨 위에 `"use client"`.

화면 단계:

```ts
type Stage = "pick" | "consent" | "setup" | "playing" | "recording" | "done";
```

지켜야 할 것:

- **동의 전에는 타일을 한 장도 요청하지 않는다.** `TileCache`를 `stage === "consent"`를 지난 뒤에만 만든다. 이게 이 도구의 프라이버시 약속이라 어기면 안 된다.
- 파일 읽기는 `file.text()` + `JSON.parse` + `parseTimeline`. `TimelineParseError`를 잡아서 **메시지를 화면에 그대로 보여준다.** 이 메시지가 나중에 진짜 파일에서 뭐가 틀렸는지 알려 줄 유일한 단서다.
- 큰 파일(수백 MB)이 들어올 수 있다. 파싱 중에는 «읽는 중»을 띄우고 버튼을 잠근다.
- 파싱 → 필터 → 검출은 `useMemo`로 묶고 의존성에 관련 설정을 전부 넣는다. 설정을 바꿀 때마다 다시 계산된다.
- 재생 루프는 `requestAnimationFrame`. 진행 시각은 `(경과 / durationSec) * (기간 끝 - 기간 시작) + 기간 시작`으로 구한다 — 프레임 수로 세면 기기마다 영상 길이가 달라진다.
- 카메라: `fixed`는 전체 기간의 `fitView`를 한 번 구해서 고정. `steady`/`dynamic`은 매 프레임 **현재 두 사람 위치 + 최근 꼬리**의 `boundsOf` → `padBounds(0.35)` → `fitView`를 목표로 두고 `stepCamera`로 따라간다. `dynamic`은 진행 중인 만남이 있으면 목표 줌에 `+0.8`을 얹는다.
- 캔버스는 `SIZES[sizeIndex]` 크기로 잡고 CSS로 줄여 보여준다. 화면 크기와 영상 크기를 분리해야 «미리보기와 결과물이 다르다»가 안 생긴다.
- 녹화: `recordCanvas`를 부르고 **동시에** 재생을 처음부터 다시 시작한다. 타일이 아직 오는 중이면(`pendingCount > 0`) 최대 3초 기다렸다 시작한다 — 안 그러면 앞부분이 빈 지도로 녹화된다.
- 마무리 카드: `buildSummary(filteredA, filteredB, meetings)`를 `useMemo`로 한 번 구하고,
  재생 진행률이 `1 - 3 / durationSec`을 넘으면 `opacity`를 0에서 1로 올려
  `FrameState.summary`에 넣는다. `settings.showSummary`가 거짓이면 `null`을 넣는다.
  영상 길이가 10초면 카드가 3초를 차지하는데, 그게 「그래서 뭐」를 남기는 유일한 3초다.
- 취소는 `AbortController`.
- 완성되면 `URL.createObjectURL`로 미리보기와 다운로드. **`useEffect` 정리에서 `revokeObjectURL`을 부른다** — 안 부르면 여러 번 만들 때마다 메모리가 쌓인다.
- 공유는 `navigator.canShare({ files })`가 참일 때만 버튼을 보인다. 데스크톱 크롬에서는 대개 거짓이라 없는 버튼을 눌러 아무 일도 안 일어나는 것보다 낫다.
- 언어는 `resolveLang(settings.langPref, navigator.languages)`. `navigator`는 첫 렌더에 없으므로 `useEffect`에서 한 번 읽어 상태에 넣는다 — 서버와 클라이언트의 첫 렌더가 달라지면 하이드레이션 경고가 난다.

- [ ] **Step 2: 타입 검사**

Run: `npx tsc --noEmit`
Expected: 오류 없음

- [ ] **Step 3: 개발 서버로 손으로 확인한다**

Run: `npm run dev`, 브라우저에서 `http://localhost:3000/playground/together-map`

확인할 것:
1. 「가상 여행으로 해보기」를 누르면 동의 화면이 뜬다
2. **동의 전에는 네트워크 탭에 `cartocdn.com` 요청이 하나도 없다**
3. 동의 후 지도가 깔리고 만남 목록에 여러 건이 잡힌다
4. 미리보기를 누르면 두 선이 움직이고, 만날 때 링이 퍼진다
5. 카메라 세 모드가 실제로 다르게 움직인다
6. 크기를 세로로 바꾸면 캔버스 비율이 바뀐다
7. 「MP4 만들기」가 진행률을 보이고 끝나면 다운로드가 된다
8. 만든 파일이 실제로 재생된다
9. 쓰레기 JSON 파일을 넣으면 **왜 안 되는지 적힌 오류**가 뜬다

- [ ] **Step 4: 커밋**

```bash
git add src/app/playground/together-map/TogetherMap.tsx
git commit -m "feat(together-map): 화면 상태 기계

동의 전에는 타일을 한 장도 요청하지 않는다 — 이 도구의 프라이버시
약속이다. 진행 시각을 프레임 수가 아니라 실제 경과로 재서 기기가
느려도 영상 길이가 같게 한다."
```

---

### Task 14: 페이지와 목록 등록, 빌드 확인

**Files:**
- Create: `src/app/playground/together-map/page.tsx`
- Modify: `src/lib/projects.ts` (`IconName`에 `"together"` 추가, `projects` 배열에 항목 추가)
- Modify: `src/components/AppIcon.tsx` (`Together` 그림 추가, `ICONS`에 등록)

- [ ] **Step 1: page.tsx를 쓴다**

`marble-drop/page.tsx`와 같은 모양으로 만든다. `runtime = "edge"`는 **쓰지 않는다** — 서버에서 데이터를 가져오지 않으므로 정적 페이지여야 한다.

```tsx
import type { Metadata } from "next";
import TogetherMap from "./TogetherMap";

const TITLE = "같이 걸은 지도";
const DESCRIPTION =
  "두 사람의 구글 타임라인을 한 지도에 겹쳐 재생합니다. 서로 가까이 있었던 순간을 찾아 표시하고 영상으로 저장합니다. 파일은 이 기기를 벗어나지 않습니다.";
const URL = "https://joowonkoh.com/playground/together-map";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  keywords: ["구글 타임라인", "위치기록 시각화", "커플 지도", "이동경로 영상", "타임라인 시각화"],
  alternates: { canonical: URL },
  openGraph: {
    type: "website",
    locale: "ko_KR",
    siteName: "Joowon Koh",
    title: TITLE,
    description: DESCRIPTION,
    url: URL,
  },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION },
};

export default function TogetherMapPage() {
  return (
    <main>
      <TogetherMap />
    </main>
  );
}
```

- [ ] **Step 2: 아이콘을 그린다**

`AppIcon.tsx`에 `Together`를 추가한다. 64×64 좌표계에 **두 색의 선이 만나 겹치는 그림** — 이 프로젝트 화면에 실제로 보이는 것이다. 이모지를 쓰지 않는다.

`ICONS` 레코드에 `together: Together`를 넣고, `projects.ts`의 `IconName` 유니온에 `| "together"`를 더한다.

- [ ] **Step 3: 목록에 등록한다**

`src/lib/projects.ts`의 `projects` 배열에 넣는다:

```ts
{
  title: "같이 걸은 지도",
  description: "두 사람의 위치기록을 겹쳐서 만난 순간을 찾아 줍니다 🗺️",
  tags: ["Web", "Canvas", "Privacy"],
  href: "/playground/together-map",
  icon: "together",
  tile: ["#eef4ff", "#c7d8f5"],
  blurb:
    "구글 타임라인을 내려받아 두 사람 것을 한 지도에 겹쳐 재생합니다. 5분 간격으로 둘의 거리를 재서 100m 안에 15분 이상 함께 있었으면 «만남»으로 셉니다. 기록이 30분 넘게 비는 구간은 잇지 않습니다 — 이으면 서울에서 부산까지 직선이 그어지고 그 선이 상대를 스쳐 없던 만남이 생깁니다. 파일은 이 기기를 벗어나지 않고, 지도 타일만 받아 옵니다.",
},
```

- [ ] **Step 4: 전체 테스트와 빌드**

```bash
npm test
npm run build
```

Expected:
- 테스트 전부 통과
- 빌드 성공, 출력에서 `/playground/together-map`이 **`○`(Static)**으로 표시된다. `ƒ`(Dynamic)로 나오면 클라이언트 컴포넌트가 서버에서 뭔가를 읽고 있는 것이니 찾아서 고친다.

- [ ] **Step 5: 린트 회귀 확인**

```bash
npm run lint 2>&1 | tail -5
```

이 저장소는 기존 오류 345건을 안고 있다. 숫자가 **345보다 커지지 않았는지**만 본다. 커졌으면 새로 만든 파일에서 난 것이니 고친다.

- [ ] **Step 6: 커밋**

```bash
git add src/app/playground/together-map/page.tsx src/lib/projects.ts src/components/AppIcon.tsx
git commit -m "feat(together-map): 페이지와 플레이그라운드 등록"
```

---

## 마무리

전부 끝나면 이렇게 확인한다.

```bash
npm test && npm run build
git log --oneline master..feat/together-map
```

**PR은 만들되 머지하지 않는다.** 이 저장소의 규칙이다 — 머지는 사용자가 요청할 때만 한다.

## 남은 위험

**진짜 `Timeline.json`으로 검증하지 못했다.** 파서는 공개 문서의 형식 설명과
그것을 흉내 낸 샘플로만 확인했다. 실제 파일이 문서와 어긋날 여지가 남아 있고,
특히 `rawSignals`의 내부 모양은 문서에 없어서 「원본 위치 데이터 사용」 옵션이
실제 파일에서 어떻게 동작할지 확인되지 않았다.

이 위험을 줄이려고 파서가 형식을 못 알아볼 때 **최상위 키를 적어서 오류를 낸다.**
진짜 파일이 생기면 그 메시지만 보고 어디를 고칠지 바로 알 수 있다.
