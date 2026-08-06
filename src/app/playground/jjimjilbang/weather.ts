/**
 * Open-Meteo에서 오늘 날씨를 가져온다.
 *
 * 키가 없고 브라우저에서 바로 부를 수 있어서 서버 라우트를 만들지 않았다.
 * 기상청 단기예보 API는 키 발급과 격자 좌표 변환이 필요해서 쓰지 않는다.
 *
 * 파싱을 fetch에서 떼어 놓았다. 응답 모양이 맞는지 확인하는 쪽은 순수 함수라
 * 그대로 테스트할 수 있고, fetch 쪽에는 감쌀 만한 판단이 남지 않는다.
 */

export interface Reading {
  /** "2026-08-06T14:00" 같은 현지 시각 */
  time: string;
  apparent: number;
  humidity: number;
}

export interface Weather {
  now: Reading;
  /** 오늘 0시부터 23시까지 */
  hourly: Reading[];
}

const ENDPOINT = "https://api.open-meteo.com/v1/forecast";

function numbersAt(source: unknown, key: string): number[] {
  const value = (source as Record<string, unknown>)?.[key];
  if (!Array.isArray(value) || value.some((v) => typeof v !== "number")) {
    throw new Error(`날씨 응답에 ${key}가 없다`);
  }
  return value as number[];
}

export function parseForecast(json: unknown): Weather {
  const root = json as Record<string, unknown> | null;
  const current = root?.current as Record<string, unknown> | undefined;
  const hourly = root?.hourly as Record<string, unknown> | undefined;

  if (
    typeof current?.time !== "string" ||
    typeof current.apparent_temperature !== "number" ||
    typeof current.relative_humidity_2m !== "number"
  ) {
    throw new Error("날씨 응답에 현재 값이 없다");
  }

  const times = (hourly?.time ?? []) as unknown[];
  if (!Array.isArray(times) || times.some((t) => typeof t !== "string")) {
    throw new Error("날씨 응답에 시간대가 없다");
  }
  const apparents = numbersAt(hourly, "apparent_temperature");
  const humidities = numbersAt(hourly, "relative_humidity_2m");
  if (apparents.length !== times.length || humidities.length !== times.length) {
    throw new Error("날씨 응답의 시간대 개수가 맞지 않는다");
  }

  return {
    now: {
      time: current.time,
      apparent: current.apparent_temperature,
      humidity: current.relative_humidity_2m,
    },
    hourly: (times as string[]).map((time, i) => ({
      time,
      apparent: apparents[i],
      humidity: humidities[i],
    })),
  };
}

export async function fetchWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<Weather> {
  const url = new URL(ENDPOINT);
  url.searchParams.set("latitude", String(lat));
  url.searchParams.set("longitude", String(lon));
  url.searchParams.set("current", "apparent_temperature,relative_humidity_2m");
  url.searchParams.set("hourly", "apparent_temperature,relative_humidity_2m");
  url.searchParams.set("timezone", "Asia/Seoul");
  url.searchParams.set("forecast_days", "1");

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`날씨를 못 가져왔다 (${response.status})`);
  return parseForecast(await response.json());
}

/** "2026-08-06T14:00" → 14 */
export function hourOf(time: string): number {
  return Number(time.slice(11, 13));
}
