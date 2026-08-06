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

/**
 * 기온·습도·풍속에서 체감온도 하나를 낸다.
 *
 * 기상청은 겨울철 체감온도를 **기온 10°C 이하, 풍속 1.3m/s 이상**일 때만
 * 산출한다. 그 조건을 그대로 지킨다 — 바람이 없는 날까지 냉각식을 돌리면
 * 기온보다 높은 체감온도가 나온다.
 *
 * 여름철 식은 20°C 밑으로 내려가면 실제와 벌어져서 20°C를 경계로 뒀다.
 * 그 사이(10~20°C, 또는 바람 없는 추운 날)는 기온을 그대로 쓴다.
 */
export function feelsLike(tempC: number, humidity: number, windMs: number): number {
  if (tempC <= 10 && windMs >= 1.3) return winterFeelsLike(tempC, windMs);
  if (tempC >= 20) return summerFeelsLike(tempC, humidity);
  return tempC;
}
