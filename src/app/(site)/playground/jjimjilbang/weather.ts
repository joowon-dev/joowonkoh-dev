/**
 * 화면이 쓰는 날씨 모양과, 그걸 받아오는 길.
 *
 * 예전에는 브라우저가 Open-Meteo를 직접 불렀다. 지금은 기상청을 쓰는데
 * 인증키가 비밀이라 브라우저에서 부를 수 없어, 우리 서버 라우트를 거친다.
 * 기상청을 어떻게 읽는지는 kma.ts와 api/jjimjilbang/route.ts에 있고,
 * 이 파일은 화면과 서버 사이의 약속만 들고 있다.
 */

export interface Reading {
  /** "2026-08-06T14:00" 같은 현지(KST) 시각 */
  time: string;
  /** 체감온도. 기상청 식으로 기온·습도·풍속에서 계산한 값이다 */
  apparent: number;
  humidity: number;
}

export interface Weather {
  now: Reading;
  hourly: Reading[];
}

export async function fetchWeather(
  lat: number,
  lon: number,
  signal?: AbortSignal,
): Promise<Weather> {
  const url = new URL("/api/jjimjilbang", window.location.origin);
  url.searchParams.set("lat", String(lat));
  url.searchParams.set("lon", String(lon));

  const response = await fetch(url, { signal });
  if (!response.ok) throw new Error(`날씨를 못 가져왔다 (${response.status})`);

  const weather = (await response.json()) as Weather;
  if (!weather?.now || !Array.isArray(weather.hourly)) {
    throw new Error("날씨 응답 형식이 아니다");
  }
  return weather;
}

/** "2026-08-06T14:00" → 14 */
export function hourOf(time: string): number {
  return Number(time.slice(11, 13));
}

/**
 * 지금 시각부터 24칸. 첫 칸이 "지금"이 되게 잘라 준다.
 *
 * 현지 시각 문자열끼리는 자리 수가 고정돼 있어서 사전순 비교가 곧 시간순
 * 비교다. Date로 바꾸면 표준 시간대를 한 번 더 다뤄야 하는데,
 * 값이 이미 KST 기준이라 그럴 이유가 없다.
 */
export function fromNow(weather: Weather, hours = 24): Reading[] {
  const nowHour = weather.now.time.slice(0, 13);
  const start = weather.hourly.findIndex((reading) => reading.time.slice(0, 13) >= nowHour);
  if (start === -1) return weather.hourly.slice(-hours);
  return weather.hourly.slice(start, start + hours);
}
