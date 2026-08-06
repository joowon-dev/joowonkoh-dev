"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import styles from "./backdrop.module.css";
import Timeline from "./Timeline";
import VerdictCard from "./VerdictCard";
import { CITIES, DEFAULT_CITY, nearestCity, type City } from "./cities";
import { roomFor, ROOMS } from "./rooms";
import { fetchWeather, fromNow, type Weather } from "./weather";

/**
 * 위치·로딩·오류만 여기서 다룬다. 방을 고르는 규칙은 rooms.ts,
 * 응답을 읽는 일은 weather.ts에 있고 이 파일은 둘을 화면에 잇기만 한다.
 *
 * 화면을 통째로 덮는다. 사이트의 머리말·꼬리말은 흰 배경 위에 설계돼 있어서
 * 사진 위에 얹으면 읽히지 않고, 날씨 앱이라면 사진이 화면 끝까지 가야 한다.
 * 대신 왼쪽 위에 돌아가는 길을 남겨 둔다.
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
  const upcoming = weather ? fromNow(weather) : [];
  const temps = upcoming.map((reading) => reading.apparent);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto overscroll-none bg-black">
      <div
        aria-hidden
        className="fixed inset-0"
        style={{ backgroundImage: `linear-gradient(160deg, ${room.bg[0]}, ${room.bg[1]})` }}
      >
        {weather ? (
          <div
            /* key를 방으로 두면 방이 바뀔 때마다 새로 떠오른다 */
            key={room.id}
            className={`${styles.photo} absolute inset-0 bg-cover bg-center`}
            style={{ backgroundImage: `url(${room.image})` }}
          />
        ) : null}
        {/* 사진이 어디로 튀든 글자가 읽히게 하는 막. 위아래를 더 눌러 둔다 */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/25 to-black/80" />
      </div>

      <div
        className="relative flex min-h-dvh flex-col px-5 pb-8"
        style={{
          paddingTop: "calc(env(safe-area-inset-top) + 0.75rem)",
          paddingBottom: "calc(env(safe-area-inset-bottom) + 2rem)",
        }}
      >
        <Link
          href="/playground"
          className="self-start rounded-full bg-black/25 px-3 py-1.5 text-xs font-medium text-white/90 ring-1 ring-white/20 backdrop-blur-md"
        >
          ← Playground
        </Link>

        {/* 도시 목록. 아이폰 날씨의 도시 전환 자리를 대신한다 */}
        <nav className={`${styles.strip} -mx-5 mt-3 overflow-x-auto px-5`} aria-label="도시">
          <ul className="flex gap-1.5">
            {CITIES.map((option) => (
              <li key={option.name}>
                <button
                  type="button"
                  onClick={() => setCity(option)}
                  aria-pressed={option.name === city.name}
                  className={`rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap backdrop-blur-md transition-colors ${
                    option.name === city.name
                      ? "bg-white text-black"
                      : "bg-black/25 text-white/80 ring-1 ring-white/15 hover:text-white"
                  }`}
                >
                  {option.name}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {weather ? (
          <>
            <div className="mt-8 mb-9">
              <VerdictCard
                cityName={city.name}
                room={room}
                apparent={weather.now.apparent}
                high={Math.max(...temps, weather.now.apparent)}
                low={Math.min(...temps, weather.now.apparent)}
              />
            </div>
            <div className="mx-auto w-full max-w-md space-y-3">
              <Timeline hourly={upcoming} />
              <div className="grid grid-cols-2 gap-3">
                <Detail label="체감온도" value={`${Math.round(weather.now.apparent)}°`} />
                <Detail label="습도" value={`${Math.round(weather.now.humidity)}%`} />
              </div>
              <p className="pt-1 text-center text-[11px] text-white/45">
                Open-Meteo · 방 사진은 만들어 낸 것입니다
              </p>
            </div>
          </>
        ) : failed ? (
          <div className="flex flex-1 flex-col items-center justify-center text-center text-white">
            <h1 className="font-display text-2xl font-bold">지금은 탈의실</h1>
            <p className="mt-2 text-sm text-white/75">날씨를 못 가져왔습니다.</p>
            <button
              type="button"
              onClick={() => setAttempt((n) => n + 1)}
              className="mt-6 rounded-full bg-white px-5 py-2 text-sm font-semibold text-black"
            >
              다시 시도
            </button>
          </div>
        ) : (
          <div className="flex flex-1 animate-pulse flex-col items-center justify-center" aria-busy>
            <div className="h-7 w-24 rounded-lg bg-white/25" />
            <div className="mt-4 h-20 w-36 rounded-2xl bg-white/25" />
            <div className="mt-4 h-5 w-32 rounded-lg bg-white/20" />
            <span className="sr-only">날씨를 가져오는 중</span>
          </div>
        )}
      </div>
    </div>
  );
}

/** 아이폰 날씨 아래쪽 격자에 있는 작은 유리 타일 하나 */
function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-white/12 p-3.5 ring-1 ring-white/20 backdrop-blur-xl">
      <p className="text-[11px] font-medium tracking-wide text-white/65">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold tabular-nums text-white">
        {value}
      </p>
    </div>
  );
}
