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
    if (kind === "path") {
      // 경로는 세그먼트 하나에 점을 몇 개든 담을 수 있다(timelinePath 배열) —
      // 묶어도 정보 손실이 없으니 최대 6시간까지 뭉친다.
      while (j < samples.length && samples[j].kind === kind && samples[j].t - samples[i].t < 6 * HOUR) {
        j += 1;
      }
    } else {
      // 방문은 세그먼트 하나가 좌표 하나만 낸다(parse.ts가 startTime 한 점만 읽는다).
      // 그래서 원본 샘플 여러 개를 하나의 visit 세그먼트로 뭉치면 그 사이 몇 시간이
      // «점 하나뿐인 구간»이 되어 MAX_GAP_MS(30분)를 넘고, resample이 통째로 구멍
      // 취급해 버린다 — 하루 종일 회사에 있었다는 사실이 사라지는 것이다.
      // 원본 샘플 하나당 세그먼트 하나로 쪼개서 세그먼트 시작 시각 간격을
      // stayAt의 촘촘한 stepMs(10~30분)로 유지한다.
      j = i + 1;
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
