/**
 * 기상청 단기예보 조회서비스(공공데이터포털)를 읽는다.
 *
 * 두 가지를 쓴다.
 * - **초단기실황**(getUltraSrtNcst): 지금 관측된 기온·습도·풍속. 큰 숫자에 쓴다.
 * - **단기예보**(getVilageFcst): 시간별 예보. 아래 띠에 쓴다.
 *
 * 실황을 따로 부르는 건 화면 맨 위가 "지금 서울은"이라고 말하기 때문이다.
 * 예보값으로 그 자리를 채우면 관측이 아니라 예측을 관측인 척 보여주게 된다.
 * 대신 실황이 실패하면 예보의 첫 칸으로 물러난다 — 큰 숫자가 비는 것보다 낫다.
 *
 * 시각 계산은 전부 KST로 한다. 서버가 UTC로 도는 곳(Cloudflare)이라
 * 로컬 시간대에 기대면 base_time이 어긋나 빈 응답을 받는다.
 */

import { feelsLike } from "./feelsLike";
import type { Reading } from "./weather";

/**
 * 체감온도는 여기서 한 번만 반올림한다.
 *
 * 화면은 정수로 보여주고 방 판정은 원래 값으로 하면 경계에서 어긋난다.
 * 실제로 서울이 34.97°일 때 "35°"라고 써 놓고 35° 미만이라 건식사우나로
 * 갔다 — 판정표에는 35°부터 불가마라고 적혀 있는데도. 보여주는 수와
 * 판정하는 수를 같게 만들어야 그런 일이 없다.
 */
const roundTemp = (value: number) => Math.round(value);

const HOST = "https://apis.data.go.kr/1360000/VilageFcstInfoService_2.0";

/** 단기예보가 발표되는 시각(KST). 각 발표는 10분쯤 뒤부터 받을 수 있다 */
const FCST_BASE_HOURS = [2, 5, 8, 11, 14, 17, 20, 23];

/** UTC 기준 Date를 KST 달력 값으로 본다 */
function kstParts(now: Date) {
  const kst = new Date(now.getTime() + 9 * 60 * 60 * 1000);
  return {
    year: kst.getUTCFullYear(),
    month: kst.getUTCMonth() + 1,
    day: kst.getUTCDate(),
    hour: kst.getUTCHours(),
    minute: kst.getUTCMinutes(),
    at: kst,
  };
}

const pad2 = (n: number) => String(n).padStart(2, "0");

function yyyymmdd(date: Date): string {
  return `${date.getUTCFullYear()}${pad2(date.getUTCMonth() + 1)}${pad2(date.getUTCDate())}`;
}

export interface BaseTime {
  baseDate: string;
  baseTime: string;
}

/**
 * 초단기실황의 최신 발표. 매시 정시 관측이 40분쯤부터 올라오므로
 * 40분 전에는 한 시간 전 것을 부른다.
 */
export function latestNcstBase(now: Date): BaseTime {
  const { minute, at } = kstParts(now);
  const base = new Date(at);
  if (minute < 40) base.setUTCHours(base.getUTCHours() - 1);
  return { baseDate: yyyymmdd(base), baseTime: `${pad2(base.getUTCHours())}00` };
}

/**
 * 단기예보의 최신 발표. 02·05·…·23시 발표를 10분 지나서부터 쓴다.
 * 자정~02시 10분 사이에는 어제 23시 발표가 최신이다.
 */
export function latestFcstBase(now: Date): BaseTime {
  const { hour, minute, at } = kstParts(now);
  const usable = FCST_BASE_HOURS.filter((h) => hour > h || (hour === h && minute >= 10));

  if (usable.length === 0) {
    const yesterday = new Date(at);
    yesterday.setUTCDate(yesterday.getUTCDate() - 1);
    return { baseDate: yyyymmdd(yesterday), baseTime: "2300" };
  }
  return { baseDate: yyyymmdd(at), baseTime: `${pad2(usable[usable.length - 1])}00` };
}

interface KmaItem {
  category: string;
  fcstDate?: string;
  fcstTime?: string;
  fcstValue?: string;
  obsrValue?: string;
}

interface KmaResponse {
  response?: {
    header?: { resultCode?: string; resultMsg?: string };
    body?: { items?: { item?: unknown } };
  };
}

/**
 * 응답 껍데기를 벗기고 항목 배열만 꺼낸다.
 *
 * 기상청은 실패해도 HTTP 200을 준다. 인증 실패도, 격자 밖 좌표도 200에
 * resultCode만 다르게 실려 오므로 여기서 직접 봐야 한다.
 */
function itemsOf(json: unknown): KmaItem[] {
  const { response } = (json ?? {}) as KmaResponse;
  const header = response?.header;
  if (!header) throw new Error("기상청 응답 형식이 아니다");
  if (header.resultCode !== "00") {
    throw new Error(`기상청 오류 ${header.resultCode}: ${header.resultMsg ?? ""}`);
  }
  const items = response?.body?.items?.item;
  if (!Array.isArray(items)) throw new Error("기상청 응답에 항목이 없다");
  return items as KmaItem[];
}

/** "20260806" + "1400" → "2026-08-06T14:00" — 화면이 쓰는 현지 시각 문자열 */
function toLocalTime(date: string, time: string): string {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}T${time.slice(0, 2)}:00`;
}

/**
 * 단기예보를 시간별 Reading으로 바꾼다.
 *
 * 응답은 한 시각에 대해 TMP·REH·WSD가 각각 따로 온다. 시각으로 묶은 뒤
 * 세 값이 다 있는 시각만 남긴다 — 하나라도 비면 체감온도를 낼 수 없다.
 */
export function parseVilageFcst(json: unknown): Reading[] {
  const bucket = new Map<string, { tmp?: number; reh?: number; wsd?: number }>();

  for (const item of itemsOf(json)) {
    if (!item.fcstDate || !item.fcstTime || item.fcstValue === undefined) continue;
    const key = toLocalTime(item.fcstDate, item.fcstTime);
    const slot = bucket.get(key) ?? {};
    const value = Number(item.fcstValue);
    if (Number.isNaN(value)) continue;
    if (item.category === "TMP") slot.tmp = value;
    else if (item.category === "REH") slot.reh = value;
    else if (item.category === "WSD") slot.wsd = value;
    bucket.set(key, slot);
  }

  return [...bucket.entries()]
    .filter(([, v]) => v.tmp !== undefined && v.reh !== undefined && v.wsd !== undefined)
    .map(([time, v]) => ({
      time,
      apparent: roundTemp(feelsLike(v.tmp!, v.reh!, v.wsd!)),
      humidity: v.reh!,
    }))
    .sort((a, b) => a.time.localeCompare(b.time));
}

/** 초단기실황을 지금 값 하나로 바꾼다 */
export function parseUltraSrtNcst(json: unknown, base: BaseTime): Reading {
  const values = new Map<string, number>();
  for (const item of itemsOf(json)) {
    if (item.obsrValue === undefined) continue;
    const value = Number(item.obsrValue);
    if (!Number.isNaN(value)) values.set(item.category, value);
  }

  const temp = values.get("T1H");
  const humidity = values.get("REH");
  const wind = values.get("WSD");
  if (temp === undefined || humidity === undefined || wind === undefined) {
    throw new Error("실황에 기온·습도·풍속이 다 있지 않다");
  }

  return {
    time: toLocalTime(base.baseDate, base.baseTime),
    apparent: roundTemp(feelsLike(temp, humidity, wind)),
    humidity,
  };
}

function endpoint(
  path: string,
  serviceKey: string,
  base: BaseTime,
  nx: number,
  ny: number,
  rows: number,
): string {
  const url = new URL(`${HOST}/${path}`);
  // 포털이 주는 "일반 인증키(Decoding)"를 넣는다. 인코딩된 키를 넣으면
  // URLSearchParams가 한 번 더 인코딩해서 인증이 깨진다.
  url.searchParams.set("serviceKey", serviceKey);
  url.searchParams.set("dataType", "JSON");
  url.searchParams.set("pageNo", "1");
  url.searchParams.set("numOfRows", String(rows));
  url.searchParams.set("base_date", base.baseDate);
  url.searchParams.set("base_time", base.baseTime);
  url.searchParams.set("nx", String(nx));
  url.searchParams.set("ny", String(ny));
  return url.toString();
}

export function vilageFcstUrl(serviceKey: string, base: BaseTime, nx: number, ny: number) {
  // 한 시각에 12개 항목이 오고 3일치를 준다. 이틀치 시간별을 다 담으려면 넉넉해야 한다
  return endpoint("getVilageFcst", serviceKey, base, nx, ny, 1000);
}

export function ultraSrtNcstUrl(serviceKey: string, base: BaseTime, nx: number, ny: number) {
  return endpoint("getUltraSrtNcst", serviceKey, base, nx, ny, 60);
}
