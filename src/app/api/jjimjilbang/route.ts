/**
 * 찜질방 날씨 중계. 브라우저는 기상청을 직접 부르지 않고 여기를 부른다.
 *
 * 서버를 끼운 이유는 하나다. 공공데이터포털 인증키는 비밀이고, 브라우저에서
 * 부르면 주소창에 그대로 실려 누구나 가져다 쓸 수 있다. Open-Meteo는 키가
 * 없어서 클라이언트에서 바로 불렀지만 기상청은 그럴 수 없다.
 *
 * 덤으로 캐시가 붙는다. 기상청 발표는 실황이 한 시간, 예보가 세 시간에
 * 한 번이라, 그 사이에 같은 격자를 다시 물어볼 이유가 없다.
 */

import { NextResponse } from "next/server";
import {
  latestFcstBase,
  latestNcstBase,
  parseUltraSrtNcst,
  parseVilageFcst,
  ultraSrtNcstUrl,
  vilageFcstUrl,
} from "@/app/playground/jjimjilbang/kma";
import { toGrid } from "@/app/playground/jjimjilbang/grid";
import type { Reading, Weather } from "@/app/playground/jjimjilbang/weather";

/** 실황은 한 시간마다 바뀐다. 그 절반쯤이면 새 발표를 놓치지 않는다 */
const CACHE_SECONDS = 30 * 60;

async function getJson(url: string, revalidate: number): Promise<unknown> {
  const response = await fetch(url, { next: { revalidate } });
  if (!response.ok) throw new Error(`기상청 응답 ${response.status}`);
  return response.json();
}

export async function GET(request: Request) {
  const serviceKey = process.env.KMA_SERVICE_KEY;
  if (!serviceKey) {
    return NextResponse.json({ error: "KMA_SERVICE_KEY가 없다" }, { status: 500 });
  }

  const params = new URL(request.url).searchParams;
  const lat = Number(params.get("lat"));
  const lon = Number(params.get("lon"));
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "lat, lon이 필요하다" }, { status: 400 });
  }

  const { nx, ny } = toGrid(lat, lon);
  const now = new Date();
  const fcstBase = latestFcstBase(now);
  const ncstBase = latestNcstBase(now);

  try {
    /*
     * 예보를 먼저 확보한다. 실황은 있으면 좋은 것이라, 실패해도 예보의
     * 첫 칸으로 큰 숫자를 채울 수 있다. 순서를 뒤집으면 실황 하나 때문에
     * 화면 전체가 못 뜬다.
     */
    const hourly: Reading[] = parseVilageFcst(
      await getJson(vilageFcstUrl(serviceKey, fcstBase, nx, ny), CACHE_SECONDS),
    );
    if (hourly.length === 0) {
      return NextResponse.json({ error: "예보가 비어 있다" }, { status: 502 });
    }

    let current: Reading | null = null;
    try {
      current = parseUltraSrtNcst(
        await getJson(ultraSrtNcstUrl(serviceKey, ncstBase, nx, ny), CACHE_SECONDS),
        ncstBase,
      );
    } catch {
      current = null; // 예보 첫 칸으로 물러난다
    }

    const weather: Weather = { now: current ?? hourly[0], hourly };
    return NextResponse.json(weather, {
      headers: { "Cache-Control": `public, max-age=0, s-maxage=${CACHE_SECONDS}` },
    });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "날씨를 못 가져왔다" },
      { status: 502 },
    );
  }
}
