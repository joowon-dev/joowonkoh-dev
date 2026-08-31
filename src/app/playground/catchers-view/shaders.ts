/**
 * 셰이더 셋.
 *
 * 화면을 덮는 사각형 하나에 프래그먼트에서 광선을 쏘는 방식으로 통일했다.
 * 구장 모델도 공 메시도 만들지 않는다 — 그릴 게 땅 평면, 포물면 마운드,
 * 원기둥 담장, 사람 실루엣 몇 장, 구 하나뿐이라 정점 버퍼를 만드는 쪽이
 * 오히려 일이 많다.
 *
 * 공을 구체로 «푸는» 이유는 따로 있다. 폴리곤 구를 쓰면 공이 화면을 채우는
 * 마지막 3m — 이 페이지에서 제일 중요한 프레임 — 에서 각이 진다.
 *
 * 낮과 밤은 셰이더를 두 벌 두지 않고 `uDaylight` 하나(0=밤, 1=낮)로 색을
 * 섞는다. 그래야 전환이 뚝 끊기지 않고 넘어간다.
 */

/** 화면을 덮는 사각형. 모든 패스가 이걸 쓴다 */
export const QUAD_VERTEX = `#version 300 es
in vec2 aPos;
out vec2 vNdc;
void main() {
  vNdc = aPos;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

/** 카메라 광선. camera.ts의 project()를 거꾸로 돌린 것이라 둘이 어긋나면 안 된다 */
const RAY = `
uniform vec3 uEye;
uniform vec3 uForward;
uniform vec3 uRight;
uniform vec3 uUp;
uniform float uTanHalfFov;
uniform float uAspect;

vec3 rayDir(vec2 ndc) {
  return normalize(
    uForward
    + uRight * (ndc.x * uAspect * uTanHalfFov)
    + uUp * (ndc.y * uTanHalfFov)
  );
}`;

const NOISE = `
float hash(vec2 p) {
  return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
}

float valueNoise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
    mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x),
    f.y
  );
}

float fbm(vec2 p) {
  return 0.55 * valueNoise(p)
       + 0.28 * valueNoise(p * 2.1)
       + 0.17 * valueNoise(p * 4.3);
}`;

/**
 * 배경 전체. 하늘·구장·사람이 한 패스에 들어간다.
 *
 * 물체마다 광선 교차 거리를 재서 가장 가까운 것만 남긴다. 그리는 순서로
 * 덮어쓰면 지평선 근처에서 땅이 담장을 뚫고 나온다 — 거의 수평인 광선은
 * 담장보다 먼 데서 땅에 닿기 때문이다.
 */
export const SCENE_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vNdc;
out vec4 outColor;
${RAY}
${NOISE}

uniform float uDaylight;  // 0 밤 → 1 낮
uniform float uPitcherX;
uniform float uPitcherZ;
uniform float uHand;      // 우투 +1, 좌투 -1
uniform float uArmPhase;  // 0 와인드업 시작 → 1 릴리스
uniform vec3 uBases[3];   // (x, z, _) — 1루, 2루, 3루
uniform vec3 uFielders[7];

const int FIELDER_COUNT = 7;
const float HOME_APEX_Z = -0.43;
const float MOUND_R = 2.74;
const float MOUND_H = 0.254;
const float MOUND_Z = 18.44;
const float FENCE_R = 118.0;
const float FENCE_H = 3.6;
const float STAND_H = 27.0;
const float TOWER_R = 142.0;
const float PI = 3.14159265359;
const float FOUL = 0.78539816;  // 45°
/** 조명탑 네 기가 선 방위각(rad). 23°와 58° */
const float TOWER_AZIMUTH[4] = float[4](0.40, -0.40, 1.02, -1.02);

/** 해는 3루 쪽 위에서 든다. 그림자가 1루 쪽으로 눕는다 */
const vec2 SUN_SHADOW = vec2(0.62, 0.34);

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float sdSegment(vec2 p, vec2 a, vec2 b, float r) {
  return segDist(p, a, b) - r;
}

/** 낮/밤 두 색을 섞는다 */
vec3 tone(vec3 night, vec3 day) {
  return mix(night, day, uDaylight);
}

vec3 horizonHaze() {
  return tone(vec3(0.055, 0.060, 0.085), vec3(0.72, 0.79, 0.88));
}

vec3 sky(vec3 dir) {
  float up = clamp(dir.y, 0.0, 1.0);
  vec3 zenith = tone(vec3(0.030, 0.040, 0.072), vec3(0.24, 0.46, 0.80));
  vec3 c = mix(horizonHaze(), zenith, pow(up, 0.65));

  // 낮에는 구름을, 밤에는 조명탑이 만드는 옅은 헤일로를 얹는다
  if (uDaylight > 0.01 && dir.y > 0.02) {
    vec2 sp = dir.xz / max(dir.y, 0.05);
    float cloud = smoothstep(0.52, 0.86, fbm(sp * 0.42 + vec2(3.1, 1.7)));
    cloud *= smoothstep(0.02, 0.30, dir.y);
    c = mix(c, vec3(0.96, 0.97, 0.99), cloud * 0.75 * uDaylight);
  }
  c += vec3(0.055, 0.055, 0.048)
     * (1.0 - uDaylight)
     * pow(clamp(1.0 - abs(dir.y) * 3.0, 0.0, 1.0), 3.0);
  return c;
}

/**
 * 카메라가 안쪽에 있는 수직 원기둥과의 교차. 관중석과 조명탑이 쓴다.
 * 안에서 쏘므로 언제나 큰 근 하나만 뜻이 있다.
 */
float cylinderT(vec3 rd, float radius) {
  vec2 o = uEye.xz;
  vec2 d = rd.xz;
  float a = dot(d, d);
  if (a < 1e-9) return -1.0;
  float b = dot(o, d);
  float c = dot(o, o) - radius * radius;
  float disc = b * b - a * c;
  if (disc < 0.0) return -1.0;
  return (-b + sqrt(disc)) / a;
}

/**
 * 마운드. 계단이 아니라 포물면이다 — 실제 마운드는 가장자리에서 그라운드와
 * 매끄럽게 만나므로, 원기둥으로 세우면 흙을 깐 단상처럼 보인다.
 * «y = H(1 - r²/R²)»를 광선식에 넣으면 t에 대한 이차식이라 그냥 풀린다.
 */
bool moundHit(vec3 rd, out float t, out vec3 normal) {
  float k = MOUND_H / (MOUND_R * MOUND_R);
  vec2 o = vec2(uEye.x, uEye.z - MOUND_Z);
  vec2 d = vec2(rd.x, rd.z);

  float a = -k * dot(d, d);
  float b = -2.0 * k * dot(o, d) - rd.y;
  float c = MOUND_H - k * dot(o, o) - uEye.y;
  if (abs(a) < 1e-12) return false;

  float disc = b * b - 4.0 * a * c;
  if (disc < 0.0) return false;
  float s = sqrt(disc);
  float t0 = (-b - s) / (2.0 * a);
  float t1 = (-b + s) / (2.0 * a);
  float near = min(t0, t1);
  float far = max(t0, t1);

  t = near > 0.001 ? near : far;
  if (t <= 0.001) return false;

  vec3 p = uEye + rd * t;
  // y ≥ 0이 곧 r ≤ R이다. 포물면이 땅 밑으로 내려간 부분은 마운드가 아니다
  if (p.y < 0.0) return false;

  normal = normalize(vec3(2.0 * k * (p.x), 1.0, 2.0 * k * (p.z - MOUND_Z)));
  return true;
}

/** 사람이 서 있는 자리에 눕는 그림자. 낮에는 길고 밤에는 발밑에 뭉친다 */
float shadowAt(vec2 q, vec2 foot, float scale) {
  vec2 offset = SUN_SHADOW * uDaylight * scale;
  vec2 rel = q - foot - offset;
  // 해 쪽으로 늘어난 타원
  float r = length(vec2(rel.x / (0.42 + 0.55 * uDaylight), rel.y / 0.34)) / scale;
  return (1.0 - smoothstep(0.55, 1.15, r)) * (0.30 + 0.28 * uDaylight);
}

vec3 ground(vec3 p) {
  // 다이아몬드는 홈플레이트 꼭짓점에서 잰다
  vec2 q = vec2(p.x, p.z - HOME_APEX_Z);
  float r = length(q);
  float ax = abs(q.x);

  vec3 grassA = tone(vec3(0.115, 0.235, 0.125), vec3(0.239, 0.451, 0.192));
  vec3 grassB = tone(vec3(0.090, 0.195, 0.105), vec3(0.198, 0.396, 0.161));
  vec3 dirt = tone(vec3(0.330, 0.215, 0.150), vec3(0.596, 0.404, 0.282));
  vec3 chalk = tone(vec3(0.850, 0.860, 0.845), vec3(0.965, 0.969, 0.961));

  // 잔디 깎은 줄무늬. 홈에서 뻗는 부채꼴로 깔아 봤다가 물렀다 —
  // 잔디가 아니라 조명이 갈라 놓은 자국처럼 보였다
  vec3 c = mix(grassA, grassB, step(0.5, fract(q.y / 7.0)));

  vec2 first = vec2(uBases[0].x, uBases[0].y - HOME_APEX_Z);
  vec2 second = vec2(uBases[1].x, uBases[1].y - HOME_APEX_Z);
  vec2 third = vec2(uBases[2].x, uBases[2].y - HOME_APEX_Z);
  vec2 home = vec2(0.0, 0.0);

  // 흙 — 홈 원, 베이스 원 셋, 그 사이를 잇는 베이스패스
  float skin = 1.0 - smoothstep(3.6, 4.0, r);
  skin = max(skin, 1.0 - smoothstep(3.5, 3.9, length(q - first)));
  skin = max(skin, 1.0 - smoothstep(3.5, 3.9, length(q - second)));
  skin = max(skin, 1.0 - smoothstep(3.5, 3.9, length(q - third)));

  float path = min(
    min(segDist(q, home, first), segDist(q, first, second)),
    min(segDist(q, second, third), segDist(q, third, home))
  );
  skin = max(skin, 1.0 - smoothstep(0.85, 1.05, path));
  // 마운드 흙
  skin = max(skin, 1.0 - smoothstep(MOUND_R - 0.3, MOUND_R + 0.1, length(q - vec2(0.0, MOUND_Z - HOME_APEX_Z))));
  c = mix(c, dirt, skin);

  // 파울라인 — 홈 꼭짓점에서 담장까지
  float lineDist = abs(ax - q.y) * 0.70710678;
  float foul = (q.y > 0.0 && r < FENCE_R) ? 1.0 - smoothstep(0.028, 0.048, lineDist) : 0.0;
  c = mix(c, chalk, foul * 0.9);

  // 베이스 — 흙 위의 흰 사각형
  float base = 0.0;
  base = max(base, 1.0 - smoothstep(0.16, 0.20, max(abs(q.x - first.x), abs(q.y - first.y))));
  base = max(base, 1.0 - smoothstep(0.16, 0.20, max(abs(q.x - second.x), abs(q.y - second.y))));
  base = max(base, 1.0 - smoothstep(0.16, 0.20, max(abs(q.x - third.x), abs(q.y - third.y))));
  c = mix(c, vec3(0.94), base);

  // 타석 흰 선
  float boxX = min(abs(ax - 0.33), abs(ax - 1.25));
  float boxZ = min(abs(p.z + 1.05), abs(p.z - 0.83));
  bool inBoxX = ax > 0.30 && ax < 1.28;
  bool inBoxZ = p.z > -1.08 && p.z < 0.86;
  float boxLine = 0.0;
  if (inBoxZ && boxX < 0.03) boxLine = 1.0;
  if (inBoxX && boxZ < 0.03) boxLine = 1.0;
  c = mix(c, chalk, boxLine * 0.8);

  // 홈플레이트 — 포수 쪽으로 뾰족한 오각형. 넓은 모서리가 투수를 향한다
  if (p.z > -0.43 && p.z < 0.0) {
    float halfWidth = p.z > -0.216 ? 0.216 : p.z + 0.43;
    if (ax < halfWidth) c = vec3(0.90, 0.91, 0.88);
  }

  // 사람 그림자
  float shade = 0.0;
  for (int i = 0; i < FIELDER_COUNT; i++) {
    shade = max(shade, shadowAt(q, vec2(uFielders[i].x, uFielders[i].y - HOME_APEX_Z), 1.0));
  }
  shade = max(shade, shadowAt(q, vec2(uPitcherX, uPitcherZ - HOME_APEX_Z), 1.0));
  c *= 1.0 - shade;

  // 흙과 잔디의 얼룩
  c *= 0.90 + 0.20 * hash(floor(vec2(p.x, p.z) * 24.0));

  // 멀수록 대기에 잠긴다
  float fog = 1.0 - exp(-length(p - uEye) * (uDaylight > 0.5 ? 0.0055 : 0.016));
  return mix(c, horizonHaze(), clamp(fog, 0.0, 0.92));
}

/** 담장·관중석·전광판·파울폴. 전부 반경 118m 원기둥 위에 있다 */
bool fenceHit(vec3 rd, out float t, out vec3 color) {
  t = cylinderT(rd, FENCE_R);
  if (t <= 0.0) return false;
  vec3 p = uEye + rd * t;
  if (p.y < 0.0 || p.y > STAND_H) return false;

  float azimuth = atan(p.x, p.z);

  // 파울폴 — 파울라인이 담장과 만나는 자리에 노랗게 선다
  if (abs(abs(azimuth) - FOUL) < 0.006 && p.y < 14.0) {
    color = vec3(0.92, 0.74, 0.14) * (0.55 + 0.45 * uDaylight);
    return true;
  }

  if (p.y < FENCE_H) {
    // 담장 패드와 그 위를 두르는 노란 선
    vec3 pad = tone(vec3(0.048, 0.098, 0.068), vec3(0.106, 0.243, 0.157));
    color = p.y > FENCE_H - 0.22 ? mix(pad, vec3(0.85, 0.72, 0.22), 0.75) : pad;
    return true;
  }

  // 전광판 — 가운데 담장 위에 선 큰 판.
  // 난수 픽셀은 QR코드처럼, 얇은 여러 줄은 주사선처럼 보였다. 굵은 글줄 셋이
  // 118m 밖에서 전광판으로 읽히는 최소한이다
  if (abs(azimuth) < 0.20 && p.y > 12.5 && p.y < 22.0) {
    vec3 panel = tone(vec3(0.026, 0.030, 0.038), vec3(0.095, 0.105, 0.125));
    float band = step(0.55, fract((p.y - 13.2) * 0.36));
    float inset = step(13.2, p.y) * step(p.y, 21.3);
    color = panel + vec3(0.22, 0.26, 0.13) * band * inset * (1.0 - 0.65 * uDaylight);
    return true;
  }

  // 관중석. 중간에 통로 한 줄이 지난다
  vec3 seats = tone(vec3(0.048, 0.052, 0.068), vec3(0.216, 0.226, 0.251));
  // 위로 갈수록 처마 그늘에 들어간다
  seats *= 1.0 - 0.30 * smoothstep(FENCE_H, STAND_H, p.y);
  seats *= 0.93 + 0.10 * step(0.5, fract(p.y * 1.1));
  if (abs(p.y - 13.0) < 0.6) seats *= 0.62;
  // 관중. 칸을 크게 잡았더니 낮에 모자이크처럼 보여서 잘게 쪼갰다
  vec2 cell = floor(vec2(p.x * 2.4, p.y * 2.0));
  vec3 shirt = tone(vec3(0.028, 0.030, 0.038), vec3(0.088, 0.084, 0.096));
  seats += shirt * step(0.62, hash(cell)) * (0.6 + 0.8 * hash(cell + 7.3));
  color = seats;
  return true;
}

/** 조명탑 넷. 관중석보다 뒤에 서서 위로 솟는다 */
bool towerHit(vec3 rd, out float t, out vec3 color) {
  t = cylinderT(rd, TOWER_R);
  if (t <= 0.0) return false;
  vec3 p = uEye + rd * t;
  if (p.y < 0.0 || p.y > 46.0) return false;

  float azimuth = atan(p.x, p.z);
  float nearest = 9.0;
  for (int i = 0; i < 4; i++) {
    nearest = min(nearest, abs(azimuth - TOWER_AZIMUTH[i]));
  }

  vec3 steel = tone(vec3(0.038, 0.042, 0.056), vec3(0.29, 0.31, 0.34));

  // 기둥. 가늘어도 142m에서 8픽셀쯤 되어 보인다
  if (nearest < 0.014 && p.y < 37.0) {
    color = steel;
    return true;
  }
  // 조명 머리. 가로줄로 쪼갰더니 142m 밖에서 주사선처럼 보여서, 통째로
  // 켜진 판 하나로 두고 테두리만 철골을 남겼다
  if (nearest < 0.058 && p.y > 35.5 && p.y < 42.2) {
    float lit = smoothstep(0.058, 0.046, nearest)
              * smoothstep(35.5, 36.4, p.y)
              * smoothstep(42.2, 41.3, p.y);
    color = mix(steel, vec3(1.0, 0.97, 0.88), lit * (1.0 - uDaylight) * 0.92);
    return true;
  }
  return false;
}

/** 마운드 위 투수. 세로 좌표는 발이 닿은 높이에서 잰다 */
float pitcherMask(vec2 local) {
  vec2 p = vec2(local.x * uHand, local.y);

  // 던지는 팔은 뒤에서 앞으로 넘어온다
  vec2 hand = mix(vec2(-0.55, 1.05), vec2(0.42, 1.62), smoothstep(0.0, 1.0, uArmPhase));

  float d = 1e9;
  d = min(d, sdSegment(p, vec2(-0.16, 0.0), vec2(0.0, 0.82), 0.085));  // 뒷다리
  d = min(d, sdSegment(p, vec2(0.30, 0.02), vec2(0.03, 0.84), 0.085)); // 앞다리
  d = min(d, sdSegment(p, vec2(0.0, 0.80), vec2(0.05, 1.44), 0.155));  // 몸통
  d = min(d, length(p - vec2(0.07, 1.63)) - 0.125);                    // 머리
  d = min(d, sdSegment(p, vec2(0.05, 1.40), hand, 0.062));             // 던지는 팔
  d = min(d, sdSegment(p, vec2(0.03, 1.36), vec2(-0.34, 1.20), 0.07)); // 글러브 팔

  return 1.0 - smoothstep(-0.012, 0.012, d);
}

/** 야수. 40~90m 밖이라 화면에서 20~40픽셀이고, 몸통과 머리면 충분하다 */
float fielderMask(vec2 p) {
  float d = 1e9;
  d = min(d, sdSegment(p, vec2(-0.11, 0.0), vec2(-0.05, 0.86), 0.075));
  d = min(d, sdSegment(p, vec2(0.11, 0.0), vec2(0.05, 0.86), 0.075));
  d = min(d, sdSegment(p, vec2(0.0, 0.82), vec2(0.0, 1.42), 0.145));
  d = min(d, length(p - vec2(0.0, 1.58)) - 0.115);
  d = min(d, sdSegment(p, vec2(-0.03, 1.36), vec2(-0.27, 1.02), 0.06));
  d = min(d, sdSegment(p, vec2(0.03, 1.36), vec2(0.27, 1.02), 0.06));
  return 1.0 - smoothstep(-0.012, 0.012, d);
}

/** 사람은 카메라를 마주 보는 판 한 장에 그린다 */
bool billboardHit(vec3 rd, vec3 foot, out float t, out vec2 local) {
  // 'flat'은 GLSL ES 3.0의 보간 한정자라 변수 이름으로 못 쓴다
  vec3 toFoot = vec3(foot.x - uEye.x, 0.0, foot.z - uEye.z);
  float horizontal = length(toFoot);
  if (horizontal < 0.5) return false;

  vec3 n = toFoot / horizontal;
  float denom = dot(rd, n);
  if (denom < 1e-4) return false;

  t = dot(foot - uEye, n) / denom;
  if (t <= 0.0) return false;

  vec3 hit = uEye + rd * t;
  vec3 side = vec3(-n.z, 0.0, n.x);
  local = vec2(dot(hit - foot, side), hit.y - foot.y);
  return true;
}

/**
 * 멀리 있는 사람일수록 대기에 묻힌다.
 *
 * 밤에도 새까맣게 두지 않는다. 조명탑 넷이 켜진 구장에서 선수만 실루엣으로
 * 남을 이유가 없다. 대신 공(0.94)보다는 확실히 어둡게 눌러 시선을 안 뺏는다.
 */
vec3 personColor(float distance) {
  vec3 body = tone(vec3(0.315, 0.325, 0.350), vec3(0.80, 0.81, 0.84));
  float fog = 1.0 - exp(-distance * (uDaylight > 0.5 ? 0.0055 : 0.016));
  return mix(body, horizonHaze(), clamp(fog, 0.0, 0.9));
}

void main() {
  vec3 dir = rayDir(vNdc);
  vec3 color = sky(dir);
  float best = 1e9;

  float t;
  vec3 c;

  if (towerHit(dir, t, c) && t < best) { best = t; color = c; }
  if (fenceHit(dir, t, c) && t < best) { best = t; color = c; }

  if (dir.y < -1e-5) {
    float tg = -uEye.y / dir.y;
    if (tg > 0.0 && tg < best) {
      best = tg;
      color = ground(uEye + dir * tg);
    }
  }

  vec3 normal;
  if (moundHit(dir, t, normal) && t < best) {
    best = t;
    vec3 p = uEye + dir * t;
    vec3 dirtTop = tone(vec3(0.355, 0.232, 0.162), vec3(0.639, 0.435, 0.302));
    // 마운드는 가운데가 부풀어 있어 앞면이 밝고 옆으로 갈수록 어두워진다
    float lambert = clamp(dot(normal, normalize(vec3(-0.4, 0.85, -0.35))), 0.0, 1.0);
    vec3 m = dirtTop * (0.70 + 0.45 * lambert);
    m *= 0.92 + 0.16 * hash(floor(vec2(p.x, p.z) * 26.0));
    // 투구판
    if (abs(p.x) < 0.305 && abs(p.z - MOUND_Z) < 0.076) m = vec3(0.90, 0.90, 0.87);
    float fog = 1.0 - exp(-length(p - uEye) * (uDaylight > 0.5 ? 0.0055 : 0.016));
    color = mix(m, horizonHaze(), clamp(fog, 0.0, 0.9));
  }

  // 야수 일곱
  vec2 local;
  for (int i = 0; i < FIELDER_COUNT; i++) {
    vec3 foot = vec3(uFielders[i].x, 0.0, uFielders[i].y);
    if (!billboardHit(dir, foot, t, local)) continue;
    if (t >= best) continue;
    if (fielderMask(local) < 0.5) continue;
    best = t;
    color = personColor(t);
  }

  // 투수. 마운드가 부푼 만큼 발이 올라가 있다
  float toCenter = length(vec2(uPitcherX, uPitcherZ - MOUND_Z)) / MOUND_R;
  float stand = MOUND_H * max(0.0, 1.0 - toCenter * toCenter);
  vec3 pitcherFoot = vec3(uPitcherX, stand, uPitcherZ);
  if (billboardHit(dir, pitcherFoot, t, local) && t < best) {
    float mask = pitcherMask(local);
    if (mask > 0.5) {
      best = t;
      color = personColor(t);
      // 조명 반대편에서 들어오는 가장자리 빛
      float rim = 1.0 - pitcherMask(local + vec2(0.02, 0.02));
      color += tone(vec3(0.10, 0.11, 0.13), vec3(0.10, 0.10, 0.08)) * rim;
    }
  }

  outColor = vec4(color, 1.0);
}`;

/**
 * 공. 광선-구 교차를 풀고 실밥 지도를 씌운다.
 *
 * 실밥은 몸통 좌표로 되돌린 법선으로 읽으므로, 회전 행렬만 바꾸면 실밥이
 * 따라 돈다. 그 회전축은 궤적을 만든 회전축과 같은 숫자에서 나온다 —
 * 화면에서 도는 방향과 공이 휘는 방향이 어긋날 수 없다.
 */
export const BALL_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vNdc;
out vec4 outColor;
${RAY}

uniform vec3 uCenter;
uniform float uRadius;
uniform mat3 uToBody;   // 월드 법선 → 공 몸통 좌표
uniform sampler2D uSeam;
uniform vec3 uLight;
uniform float uFade;
uniform float uDaylight;

const float PI = 3.14159265359;

void main() {
  vec3 dir = rayDir(vNdc);
  vec3 oc = uEye - uCenter;
  float b = dot(oc, dir);
  float c = dot(oc, oc) - uRadius * uRadius;
  float disc = b * b - c;
  if (disc < 0.0) discard;

  float t = -b - sqrt(disc);
  if (t <= 0.0) discard;

  vec3 n = (uEye + dir * t - uCenter) / uRadius;
  vec3 body = normalize(uToBody * n);

  // seam.ts가 지도를 만든 방식 그대로 읽는다
  float azimuth = atan(body.z, body.x);
  if (azimuth < 0.0) azimuth += 2.0 * PI;
  vec2 uv = vec2(azimuth / (2.0 * PI), acos(clamp(body.y, -1.0, 1.0)) / PI);
  float seam = texture(uSeam, uv).r;

  vec3 leather = vec3(0.94, 0.93, 0.90);
  vec3 stitch = vec3(0.72, 0.11, 0.13);
  vec3 base = mix(leather, stitch, smoothstep(0.30, 0.62, seam));

  float lambert = max(dot(n, normalize(uLight)), 0.0);
  float rim = pow(1.0 - max(dot(n, -dir), 0.0), 2.5);
  // 밤에는 조명 하나가 때리고, 낮에는 하늘 전체가 반사광을 준다
  float ambient = mix(0.32, 0.55, uDaylight);
  float direct = mix(0.80, 0.58, uDaylight);
  vec3 color = base * (ambient + direct * lambert)
             + mix(vec3(0.10, 0.12, 0.16), vec3(0.14, 0.16, 0.20), uDaylight) * rim;

  outColor = vec4(color, uFade);
}`;

/** 궤적선과 스트라이크존. 화면 좌표를 CPU에서 만들어 그대로 넘긴다 */
export const LINE_VERTEX = `#version 300 es
in vec2 aPos;
in float aAlpha;
out float vAlpha;
void main() {
  vAlpha = aAlpha;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

export const LINE_FRAGMENT = `#version 300 es
precision highp float;
in float vAlpha;
out vec4 outColor;
uniform vec3 uColor;
uniform float uOpacity;
void main() {
  outColor = vec4(uColor, vAlpha * uOpacity);
}`;
