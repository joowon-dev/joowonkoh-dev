import { createRng, randRange, type Rng } from "../_shared/random";
import { lerpLatLon, type LatLon } from "./geo";
import { haversineMeters } from "./geo";

/**
 * 가상 여행 데이터.
 *
 * 진짜 Timeline.json을 손에 넣기 전까지 이 도구를 만들 유일한 방법이고,
 * 동시에 파서 테스트 픽스처다. 그래서 «그럴듯한 그림»이 아니라
 * 구글이 실제로 뱉는 모양을 그대로 흉내 낸다.
 *
 * 구글은 한 번의 머묾을 세그먼트 하나(좌표 하나 + 시작·끝 시각)로 적는다.
 * 예전 구현은 방문 구간을 10~20분 간격의 방문 세그먼트 여러 개로 잘게 쪼개서
 * 이 사실을 우회했었다 — parse.ts가 endTime을 못 읽던 시절 resample이 구멍을
 * 못 메워서였다. 이제 parse.ts가 endTime을 읽고 resample이 «머문 구간»을
 * 알아보므로, 머묾은 다시 세그먼트 하나로 돌아간다.
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
  /** 구멍과 튄 점 시험용. 실제 위치 어디와도 안 겹치게 멀리 있다. */
  tokyo: { lat: 35.6812, lon: 139.7671 },
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

/** 구글이 실제로 적는 세그먼트 세 종류. */
type StayEvent = { type: "visit"; at: LatLon; from: number; to: number };
type PathEvent = { type: "path"; points: { t: number; at: LatLon }[] };
type ActivityEvent = {
  type: "activity";
  from: LatLon;
  to: LatLon;
  fromT: number;
  toT: number;
};
type Event = StayEvent | PathEvent | ActivityEvent;

function eventStart(e: Event): number {
  return e.type === "path" ? e.points[0].t : e.type === "visit" ? e.from : e.fromT;
}

/** 한 자리 주변에서 몇 미터씩 흔들리는 값. 실제 GPS는 가만히 있어도 떨린다. */
function jitter(rng: Rng, at: LatLon, meters: number): LatLon {
  const deg = meters / 111_000;
  return {
    lat: at.lat + randRange(rng, -deg, deg),
    lon: at.lon + randRange(rng, -deg, deg) / Math.cos((at.lat * Math.PI) / 180),
  };
}

/** 머묾 하나 — 좌표 하나, 시작·끝 시각 하나. 구글이 실제로 이렇게 적는다. */
function visit(rng: Rng, at: LatLon, from: number, to: number): StayEvent {
  return { type: "visit", at: jitter(rng, at, 15), from, to };
}

/** 촘촘한 경로 기록(timelinePath가 있는 이동). */
function pathTravel(rng: Rng, from: LatLon, to: LatLon, startT: number, endT: number): PathEvent {
  const steps = Math.max(2, Math.round((endT - startT) / (5 * MIN)));
  const points: { t: number; at: LatLon }[] = [];
  for (let i = 0; i <= steps; i += 1) {
    const f = i / steps;
    points.push({ t: startT + (endT - startT) * f, at: jitter(rng, lerpLatLon(from, to, f), 25) });
  }
  return { type: "path", points };
}

/**
 * 활동만 있는 이동(timelinePath 없이 activity.start/end만 있는 세그먼트).
 * 실제 파일에는 이 모양도 섞여 있는데, 예전 샘플은 한 번도 이 길을 밟지 않았다.
 */
function activityTravel(rng: Rng, from: LatLon, to: LatLon, startT: number, endT: number): ActivityEvent {
  return {
    type: "activity",
    from: jitter(rng, from, 20),
    to: jitter(rng, to, 20),
    fromT: startT,
    toT: endT,
  };
}

/** 날짜 짝홀로 두 이동 기록 모양을 번갈아 쓴다 — 실제 파일도 둘 다 나온다. */
function commute(rng: Rng, day: number, from: LatLon, to: LatLon, startT: number, endT: number): Event {
  return day % 2 === 0 ? pathTravel(rng, from, to, startT, endT) : activityTravel(rng, from, to, startT, endT);
}

/** GPS가 순간적으로 멀리 튀었다가 돌아오는 촘촘한 경로 — 필터가 걸러야 할 대상. */
function spike(rng: Rng, near: LatLon, t: number): PathEvent {
  return {
    type: "path",
    points: [
      { t, at: jitter(rng, PLACES.tokyo, 25) },
      { t: t + 2 * MIN, at: jitter(rng, near, 15) },
    ],
  };
}

function buildEvents(who: "a" | "b", seed: number): Event[] {
  const rng = createRng(seed + (who === "a" ? 0 : 7919));
  const out: Event[] = [];

  const home = who === "a" ? PLACES.homeA : PLACES.homeB;
  const work = who === "a" ? PLACES.workA : PLACES.workB;

  for (let day = 0; day < DAYS; day += 1) {
    const dayStart = START + day * DAY;
    const inBusan = dayStart >= SAMPLE_BUSAN_RANGE.from && dayStart < SAMPLE_BUSAN_RANGE.to;
    const inJeju = dayStart >= SAMPLE_JEJU_RANGE.from && dayStart < SAMPLE_JEJU_RANGE.to;

    // 제주에는 지호만 간다. 수아는 그동안 평소대로 서울에 있는다.
    if (inJeju && who === "a") {
      out.push(visit(rng, PLACES.jeju, dayStart + 9 * HOUR, dayStart + 21 * HOUR));
      continue;
    }
    if (inBusan) {
      // 둘 다 해운대에 있다 — 같은 자리를 공유하므로 만남이 잡힌다
      out.push(visit(rng, PLACES.busan, dayStart + 9 * HOUR, dayStart + 22 * HOUR));
      continue;
    }

    const weekday = new Date(dayStart).getUTCDay(); // START가 KST 자정이라 요일이 맞는다
    const isWeekend = weekday === 0 || weekday === 6;

    if (isWeekend) {
      // 주말 — 성수와 홍대를 번갈아 간다. 둘 다 같은 곳으로 가므로 만난다.
      const spot = day % 4 < 2 ? PLACES.seongsu : PLACES.hongdae;
      out.push(visit(rng, home, dayStart + 9 * HOUR, dayStart + 12 * HOUR));
      out.push(commute(rng, day, home, spot, dayStart + 12 * HOUR, dayStart + 13 * HOUR));
      out.push(visit(rng, spot, dayStart + 13 * HOUR, dayStart + 18 * HOUR));
      out.push(commute(rng, day, spot, home, dayStart + 18 * HOUR, dayStart + 19 * HOUR));
      out.push(visit(rng, home, dayStart + 19 * HOUR, dayStart + 23 * HOUR));
      continue;
    }

    // 평일 — 각자 다른 회사로 간다
    out.push(visit(rng, home, dayStart + 7 * HOUR, dayStart + 8 * HOUR));

    // 열흘에 한 번쯤 낮 이후 기록이 통째로 빈다 — 다음날 아침까지 아무 것도 안 남는다.
    // resample이 이 구멍을 구멍 그대로 두는지(보간해 버리지 않는지) 시험해야 한다.
    if (day % 11 === 5) {
      continue;
    }

    out.push(commute(rng, day, home, work, dayStart + 8 * HOUR, dayStart + 9 * HOUR));
    out.push(visit(rng, work, dayStart + 9 * HOUR, dayStart + 18 * HOUR));
    out.push(commute(rng, day, work, home, dayStart + 18 * HOUR, dayStart + 19 * HOUR));
    out.push(visit(rng, home, dayStart + 19 * HOUR, dayStart + 23 * HOUR));

    // 스무날에 한 번쯤 GPS가 도쿄로 튀었다가 돌아온다 — 비현실적 속도만으로 설명되는 점.
    if (day % 19 === 3) {
      out.push(spike(rng, home, dayStart + 19 * HOUR + 5 * MIN));
    }
  }

  out.sort((x, y) => eventStart(x) - eventStart(y));
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
  const events = buildEvents(who, seed);

  const segments = events.map((e) => {
    if (e.type === "visit") {
      return shape === "android"
        ? {
            startTime: iso(e.from),
            endTime: iso(e.to),
            visit: {
              topCandidate: {
                placeId: `sample-${e.from}`,
                placeLocation: { latLng: androidLatLng(e.at) },
              },
            },
          }
        : {
            startTime: iso(e.from),
            endTime: iso(e.to),
            visit: {
              topCandidate: { placeID: `sample-${e.from}`, placeLocation: iosLatLng(e.at) },
            },
          };
    }

    if (e.type === "path") {
      const startT = e.points[0].t;
      const endT = e.points[e.points.length - 1].t;
      const path = e.points.map((p) =>
        shape === "android"
          ? { point: androidLatLng(p.at), time: iso(p.t) }
          : {
              point: iosLatLng(p.at),
              durationMinutesOffsetFromStartTime: String(Math.round((p.t - startT) / MIN)),
            },
      );
      return { startTime: iso(startT), endTime: iso(endT), timelinePath: path };
    }

    // activity — timelinePath 없이 시작·끝 좌표만 있다. 안드로이드는 거리를 숫자로,
    // 아이폰은 문자열로 적는 차이를 살린다.
    const distanceMeters = Math.round(haversineMeters(e.from, e.to));
    return shape === "android"
      ? {
          startTime: iso(e.fromT),
          endTime: iso(e.toT),
          activity: {
            start: { latLng: androidLatLng(e.from) },
            end: { latLng: androidLatLng(e.to) },
            distanceMeters,
          },
        }
      : {
          startTime: iso(e.fromT),
          endTime: iso(e.toT),
          activity: {
            start: iosLatLng(e.from),
            end: iosLatLng(e.to),
            distanceMeters: String(distanceMeters),
          },
        };
  });

  return shape === "android" ? { semanticSegments: segments } : segments;
}
