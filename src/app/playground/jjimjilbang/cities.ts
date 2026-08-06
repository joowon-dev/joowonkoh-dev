/**
 * 좌표를 도시 이름으로 바꾼다.
 *
 * 역지오코딩 API를 부르지 않고 이 목록에서 가장 가까운 곳을 고른다.
 * 요청을 하나 덜 쓰고, 무엇보다 한국어 이름이 보장된다 —
 * 외부 지오코더는 "Seoul"이나 행정동 이름을 돌려주기도 한다.
 */

export interface City {
  name: string;
  lat: number;
  lon: number;
}

export const CITIES: City[] = [
  { name: "서울", lat: 37.5665, lon: 126.978 },
  { name: "인천", lat: 37.4563, lon: 126.7052 },
  { name: "춘천", lat: 37.8813, lon: 127.7298 },
  { name: "강릉", lat: 37.7519, lon: 128.8761 },
  { name: "대전", lat: 36.3504, lon: 127.3845 },
  { name: "대구", lat: 35.8714, lon: 128.6014 },
  { name: "광주", lat: 35.1595, lon: 126.8526 },
  { name: "부산", lat: 35.1796, lon: 129.0756 },
  { name: "제주", lat: 33.4996, lon: 126.5312 },
];

export const DEFAULT_CITY = CITIES[0];

const toRad = (deg: number) => (deg * Math.PI) / 180;

/**
 * 두 좌표 사이 거리의 제곱에 비례하는 값. 순서를 매기는 데만 쓰므로
 * 지구 반지름을 곱해 km로 만들 이유가 없다. 위도에 따라 좁아지는
 * 경도 간격만 cos으로 보정해 준다.
 */
function distanceRank(a: City, lat: number, lon: number): number {
  const dLat = toRad(a.lat - lat);
  const dLon = toRad(a.lon - lon) * Math.cos(toRad(lat));
  return dLat * dLat + dLon * dLon;
}

export function nearestCity(lat: number, lon: number): City {
  return CITIES.reduce((best, city) =>
    distanceRank(city, lat, lon) < distanceRank(best, lat, lon) ? city : best,
  );
}
