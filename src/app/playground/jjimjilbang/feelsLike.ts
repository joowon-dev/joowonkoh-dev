/**
 * 체감온도를 직접 계산한다.
 *
 * 기상청 단기예보는 기온·습도·풍속만 주고 체감온도는 주지 않는다.
 * 이 페이지의 방 판정이 체감온도에 걸려 있으므로 여기서 만들어야 한다.
 *
 * 기상청이 쓰는 식을 그대로 옮겼다. 여름과 겨울이 서로 다른 식이고,
 * 둘 다 아닌 구간에서는 기온을 그대로 쓴다 — 없는 값을 지어내는 것보다
 * "그날은 체감이 기온과 다르지 않았다"가 사실에 가깝다.
 */

/**
 * 습구온도. Stull(2011)의 추정식으로, 기상청 여름철 체감온도 산출에 쓰인다.
 * 상대습도 5~99%, 기온 -20~50°C 범위에서 맞도록 만들어진 근사식이다.
 *
 * arctan은 라디안이다. 도(°)로 바꿔 넣으면 첫 항이 기온의 57배가 되어
 * 수천 단위 값이 나온다 — 실제로 그렇게 잘못 짰다가 "습도 100%면 습구온도가
 * 기온과 같다"는 검사에서 걸렸다.
 */
export function wetBulb(tempC: number, humidity: number): number {
  return (
    tempC * Math.atan(0.151977 * Math.sqrt(humidity + 8.313659)) +
    Math.atan(tempC + humidity) -
    Math.atan(humidity - 1.67633) +
    0.00391838 * Math.pow(humidity, 1.5) * Math.atan(0.023101 * humidity) -
    4.686035
  );
}

/** 여름철 체감온도(기상청, 2022-06-02 개정) */
export function summerFeelsLike(tempC: number, humidity: number): number {
  const tw = wetBulb(tempC, humidity);
  return (
    -0.2442 +
    0.55399 * tw +
    0.45535 * tempC -
    0.0022 * tw * tw +
    0.00278 * tw * tempC +
    3.0
  );
}

/** 겨울철 체감온도(바람 냉각). 풍속은 m/s로 받아 km/h로 바꿔 쓴다 */
export function winterFeelsLike(tempC: number, windMs: number): number {
  const windKmh = windMs * 3.6;
  const v = Math.pow(windKmh, 0.16);
  return 13.12 + 0.6215 * tempC - 11.37 * v + 0.3965 * v * tempC;
}

/** 이 아래는 겨울 식, 위는 여름 식. 사이는 둘을 이어 붙인다 */
const COLD_EDGE = 10;
const WARM_EDGE = 20;

/**
 * 바람은 시원하게만 만든다.
 *
 * 냉각식은 바람이 약할 때 기온보다 **높은** 값을 낸다. 기상청이 풍속
 * 1.3m/s 미만에서 이 식을 안 쓰는 이유다. 문턱을 두는 대신 기온으로
 * 잘라내면 같은 목적을 이루면서 값이 튀지 않는다 — 문턱은 그 지점에서
 * 체감온도를 계단처럼 끊어 놓는다.
 */
function coldSide(tempC: number, windMs: number): number {
  return Math.min(tempC, winterFeelsLike(tempC, windMs));
}

/**
 * 기온·습도·풍속에서 체감온도 하나를 낸다.
 *
 * 기상청은 여름과 겨울에 서로 다른 식을 쓰고, 그 사이 구간에는 정해 둔
 * 값이 없다. 처음에는 그 구간에서 기온을 그대로 썼는데 경계에 절벽이
 * 생겼다 — 기온 10.0°C에서 체감 7.6°C, 10.2°C에서 10.2°C로 **기온이
 * 조금 오르자 체감이 2.6도 뛰었다.** 그 0.2도 차이로 얼음방과 수면실이
 * 갈렸다.
 *
 * 그래서 10~20°C를 두 식 사이의 이음매로 쓴다. 양 끝에서 각각의 식과
 * 정확히 만나므로 어디에서도 값이 끊기지 않는다.
 */
export function feelsLike(tempC: number, humidity: number, windMs: number): number {
  if (tempC <= COLD_EDGE) return coldSide(tempC, windMs);
  if (tempC >= WARM_EDGE) return summerFeelsLike(tempC, humidity);

  const towardWarm = (tempC - COLD_EDGE) / (WARM_EDGE - COLD_EDGE);
  return (
    coldSide(tempC, windMs) * (1 - towardWarm) + summerFeelsLike(tempC, humidity) * towardWarm
  );
}
