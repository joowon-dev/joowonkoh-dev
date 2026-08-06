"use client";

import { useEffect, useState } from "react";
import Timeline from "./Timeline";
import VerdictCard from "./VerdictCard";
import { CITIES, DEFAULT_CITY, nearestCity, type City } from "./cities";
import { roomFor, ROOMS } from "./rooms";
import { fetchWeather, hourOf, type Weather } from "./weather";

/**
 * 위치·로딩·오류만 여기서 다룬다. 방을 고르는 규칙은 rooms.ts,
 * 응답을 읽는 일은 weather.ts에 있고 이 파일은 둘을 화면에 잇기만 한다.
 */
export default function JjimjilbangWeather() {
  const [city, setCity] = useState<City>(DEFAULT_CITY);
  /** 다시 시도 버튼이 같은 도시로 요청을 한 번 더 걸게 하는 값 */
  const [attempt, setAttempt] = useState(0);
  /*
   * 결과에 어느 요청의 것인지를 같이 담아 둔다. 도시를 바꿀 때 결과를 먼저
   * 비우는 대신 지금 요청의 키와 맞는지만 보면 되므로, 렌더 도중 상태를
   * 되돌리는 일 없이 "아직 안 온 것"과 "온 것"이 갈린다.
   */
  const [result, setResult] = useState<{
    key: string;
    weather: Weather | null;
  } | null>(null);

  /*
   * 위치를 물어보되 답을 기다리지 않는다. 거절하거나 실패하면 서울에 머문다 —
   * 경고를 띄우지 않는 건 도시 선택기가 화면에 그대로 있어서
   * 사용자가 막힌 느낌 없이 바로 다른 도시를 고를 수 있기 때문이다.
   *
   * 좌표 그대로가 아니라 가장 가까운 도시의 좌표로 날씨를 받는다.
   * 화면에 "서울"이라 써 놓고 옆 동네 값을 보여주지 않기 위해서다.
   */
  useEffect(() => {
    if (!navigator.geolocation) return;
    let alive = true;
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        if (alive) setCity(nearestCity(coords.latitude, coords.longitude));
      },
      () => {},
      { timeout: 5000, maximumAge: 10 * 60 * 1000 },
    );
    return () => {
      alive = false;
    };
  }, []);

  const requestKey = `${city.name}#${attempt}`;

  useEffect(() => {
    const controller = new AbortController();
    fetchWeather(city.lat, city.lon, controller.signal)
      .then((weather) => setResult({ key: requestKey, weather }))
      .catch((error: unknown) => {
        if ((error as Error)?.name !== "AbortError") {
          setResult({ key: requestKey, weather: null });
        }
      });
    return () => controller.abort();
  }, [city, requestKey]);

  const settled = result?.key === requestKey ? result : null;
  const weather = settled?.weather ?? null;
  const failed = settled !== null && settled.weather === null;

  const room = weather ? roomFor(weather.now.apparent, weather.now.humidity) : ROOMS.ocher;

  return (
    <div className="animate-fade-in-up">
      <section
        /*
         * 방 색이 카드 한 장을 통째로 덮는다. 화면 가로를 다 채우는 쪽도 해 봤지만
         * 100vw는 스크롤바 너비만큼 넘쳐서 가로 스크롤을 만들고, 머리말·꼬리말이
         * 흰 배경 위에 설계돼 있어 색이 거기까지 번지면 오히려 깨져 보인다.
         * 이 사이트의 머리말도 둥근 카드라, 포스터 한 장으로 두는 편이 맞다.
         */
        className="rounded-3xl px-6 py-14 shadow-ambient transition-[background-image] duration-700"
        style={{
          backgroundImage: `linear-gradient(160deg, ${room.bg[0]}, ${room.bg[1]})`,
        }}
      >
        <div className="mx-auto max-w-xl">
          <nav className="mb-10 flex flex-wrap justify-center gap-1.5" aria-label="도시">
            {CITIES.map((option) => (
              <button
                key={option.name}
                type="button"
                onClick={() => setCity(option)}
                aria-pressed={option.name === city.name}
                className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                  option.name === city.name
                    ? "bg-white text-black"
                    : "bg-black/20 text-white/75 hover:bg-black/30 hover:text-white"
                }`}
              >
                {option.name}
              </button>
            ))}
          </nav>

          {weather ? (
            <>
              <VerdictCard
                cityName={city.name}
                room={room}
                apparent={weather.now.apparent}
                humidity={weather.now.humidity}
              />
              <Timeline hourly={weather.hourly} nowHour={hourOf(weather.now.time)} />
            </>
          ) : failed ? (
            <div className="text-center text-white">
              <p className="text-5xl" aria-hidden>
                🚪
              </p>
              <h2 className="mt-4 font-display text-2xl font-bold">지금은 탈의실</h2>
              <p className="mt-2 text-sm text-white/80">날씨를 못 가져왔습니다.</p>
              <button
                type="button"
                onClick={() => setAttempt((n) => n + 1)}
                className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="animate-pulse text-center" aria-busy>
              <div className="mx-auto h-4 w-24 rounded-full bg-white/25" />
              <div className="mx-auto mt-6 h-14 w-14 rounded-full bg-white/25" />
              <div className="mx-auto mt-5 h-9 w-48 rounded-xl bg-white/25" />
              <div className="mx-auto mt-4 h-4 w-56 rounded-full bg-white/20" />
              <div className="mx-auto mt-8 h-16 max-w-xs rounded-2xl bg-white/15" />
              <span className="sr-only">날씨를 가져오는 중</span>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
