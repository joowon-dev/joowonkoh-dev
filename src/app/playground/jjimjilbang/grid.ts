/**
 * 위경도를 기상청 격자 좌표로 바꾼다.
 *
 * 기상청 단기예보는 위경도를 받지 않는다. 전국을 5km 격자로 나눈 (nx, ny)만
 * 받으므로, 부르기 전에 우리 쪽에서 변환해야 한다.
 *
 * 람베르트 정각원추도법이고, 아래 상수는 기상청이 API 활용가이드에 못박아 둔
 * 값이다. 임의로 고칠 수 있는 숫자가 아니라서 이름만 붙여 그대로 옮겼다.
 */

const RE = 6371.00877; // 지구 반경(km)
const GRID = 5.0; // 격자 간격(km)
const SLAT1 = 30.0; // 표준 위도 1
const SLAT2 = 60.0; // 표준 위도 2
const OLON = 126.0; // 기준점 경도
const OLAT = 38.0; // 기준점 위도
const XO = 43; // 기준점 X 격자
const YO = 136; // 기준점 Y 격자

const DEG_TO_RAD = Math.PI / 180;

export interface GridPoint {
  nx: number;
  ny: number;
}

export function toGrid(lat: number, lon: number): GridPoint {
  const re = RE / GRID;
  const slat1 = SLAT1 * DEG_TO_RAD;
  const slat2 = SLAT2 * DEG_TO_RAD;
  const olon = OLON * DEG_TO_RAD;
  const olat = OLAT * DEG_TO_RAD;

  let sn =
    Math.tan(Math.PI * 0.25 + slat2 * 0.5) / Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sn = Math.log(Math.cos(slat1) / Math.cos(slat2)) / Math.log(sn);

  let sf = Math.tan(Math.PI * 0.25 + slat1 * 0.5);
  sf = (Math.pow(sf, sn) * Math.cos(slat1)) / sn;

  let ro = Math.tan(Math.PI * 0.25 + olat * 0.5);
  ro = (re * sf) / Math.pow(ro, sn);

  let ra = Math.tan(Math.PI * 0.25 + lat * DEG_TO_RAD * 0.5);
  ra = (re * sf) / Math.pow(ra, sn);

  let theta = lon * DEG_TO_RAD - olon;
  if (theta > Math.PI) theta -= 2 * Math.PI;
  if (theta < -Math.PI) theta += 2 * Math.PI;
  theta *= sn;

  return {
    nx: Math.floor(ra * Math.sin(theta) + XO + 0.5),
    ny: Math.floor(ro - ra * Math.cos(theta) + YO + 0.5),
  };
}
