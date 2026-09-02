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
uniform float uArmPhase;  // 0 셋포지션 → 1 릴리스
uniform float uFollow;    // 릴리스 뒤 팔로스루 0 → 1
uniform vec3 uBases[3];   // (x, z, _) — 1루, 2루, 3루
uniform vec3 uFielders[7];

const int FIELDER_COUNT = 7;
const float HOME_APEX_Z = -0.43;
const float MOUND_R = 2.74;
const float MOUND_H = 0.254;
const float MOUND_Z = 18.44;
/** 잠실 — 폴대 100m, 중앙 125m, 펜스 2.6m */
const float FENCE_CORNER = 100.0;
const float FENCE_CENTER = 125.0;
const float FENCE_H = 2.6;
const float TRACK = 4.6;
const float STAND_H = 15.5;
const float TOWER_R = 150.0;
const float PI = 3.14159265359;
const float FOUL = 0.78539816;  // 45°
/**
 * 조명탑이 선 방위각(rad). 잠실 실측 도면을 못 구해서 개수와 자리는 사진에서
 * 어림한 값이다 — 확실한 건 화각 안에 드는 넷이 좌우 대칭이라는 것뿐이다.
 */
const float TOWER_AZIMUTH[6] = float[6](0.30, -0.30, 0.76, -0.76, 1.22, -1.22);

/** 해는 3루 쪽 위에서 든다. 그림자가 1루 쪽으로 눕는다 */
const vec2 SUN_SHADOW = vec2(0.62, 0.34);

/**
 * 홈팀 흰 유니폼에 남색 모자·스타킹.
 *
 * 실루엣 한 덩어리로 두면 사람이긴 해도 야구선수로는 안 읽힌다. 반대로 등번호나
 * 핀스트라이프는 40~90m 밖에서 한 픽셀도 안 되니 넣어 봐야 얼룩이다. 이 여섯
 * 색이 그 사이에서 «야구선수»가 성립하는 최소 조합이었다.
 */
const vec3 JERSEY = vec3(0.905, 0.910, 0.925);
const vec3 PANTS  = vec3(0.845, 0.855, 0.878);
const vec3 TRIM   = vec3(0.086, 0.137, 0.310);  // 모자·스타킹·벨트
const vec3 SKIN   = vec3(0.760, 0.590, 0.470);
const vec3 GLOVE  = vec3(0.360, 0.205, 0.110);
const vec3 SHOE   = vec3(0.090, 0.095, 0.110);
const vec3 LEATHER = vec3(0.94, 0.93, 0.90);

float segDist(vec2 p, vec2 a, vec2 b) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h);
}

float sdSegment(vec2 p, vec2 a, vec2 b, float r) {
  return segDist(p, a, b) - r;
}

/** 더 앞에 있는 부위가 색을 가져간다 */
void nearer(float d, vec3 c, inout float best, inout vec3 albedo) {
  if (d < best) {
    best = d;
    albedo = c;
  }
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

/** 파울폴(100m)에서 중앙(125m)까지 멀어지는 담장 */
float fenceRadiusAt(float azimuth) {
  return FENCE_CENTER - (FENCE_CENTER - FENCE_CORNER) * min(abs(azimuth) / FOUL, 1.0);
}

/**
 * 반지름이 방위각에 따라 달라지는 벽과의 교차.
 *
 * 반지름을 하나 가정해 원기둥으로 풀고, 맞은 자리의 방위각으로 반지름을 고쳐
 * 다시 푼다. 눈이 거의 원점에 있어 방위각은 사실상 광선 방향이 정하므로 한
 * 번이면 수렴하지만, 한 번 더 돌아도 공짜다.
 */
float wallHit(vec3 rd, out vec3 p, out float azimuth) {
  float r = FENCE_CENTER;
  float t = -1.0;
  p = uEye;
  azimuth = 0.0;
  for (int i = 0; i < 2; i++) {
    t = cylinderT(rd, r);
    if (t <= 0.0) return -1.0;
    p = uEye + rd * t;
    azimuth = atan(p.x, p.z);
    r = fenceRadiusAt(azimuth);
  }
  return t;
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
  // 담장은 구장 원점 기준이라 따로 잰다
  float fromCenter = length(p.xz);
  float wallR = fenceRadiusAt(atan(p.x, p.z));

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
  // 경계를 40cm에 걸쳐 풀었더니 흙과 잔디가 서로 스며서 «물감»처럼 보였다.
  // 실제 그라운드는 삽으로 자른 것처럼 선이 서 있다
  float skin = 1.0 - smoothstep(3.90, 4.00, r);
  skin = max(skin, 1.0 - smoothstep(3.80, 3.90, length(q - first)));
  skin = max(skin, 1.0 - smoothstep(3.80, 3.90, length(q - second)));
  skin = max(skin, 1.0 - smoothstep(3.80, 3.90, length(q - third)));

  float path = min(
    min(segDist(q, home, first), segDist(q, first, second)),
    min(segDist(q, second, third), segDist(q, third, home))
  );
  skin = max(skin, 1.0 - smoothstep(0.95, 1.05, path));
  // 마운드 흙
  skin = max(skin, 1.0 - smoothstep(MOUND_R - 0.1, MOUND_R + 0.05, length(q - vec2(0.0, MOUND_Z - HOME_APEX_Z))));
  // 펜스 앞 경고 트랙. 담장이 잔디에서 바로 솟으면 외야가 «끝»이 아니라
  // «잘린» 것처럼 보인다
  skin = max(skin, smoothstep(wallR - TRACK, wallR - TRACK + 0.7, fromCenter));
  c = mix(c, dirt, skin);

  // 파울라인 — 홈 꼭짓점에서 담장까지
  float lineDist = abs(ax - q.y) * 0.70710678;
  float foul = (q.y > 0.0 && fromCenter < wallR) ? 1.0 - smoothstep(0.028, 0.048, lineDist) : 0.0;
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

  // 대기타석 원. 처음에 (±5.6, 5.2)에 뒀다가 베이스패스 흙에 통째로 먹혔다 —
  // 파울라인 바깥으로 물려야 잔디 위의 원으로 보인다
  float onDeck = min(length(q - vec2(7.6, 2.4)), length(q - vec2(-7.6, 2.4)));
  c = mix(c, dirt, (1.0 - smoothstep(1.42, 1.52, onDeck)) * 0.85);

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

  // 흙과 잔디의 얼룩. 발밑 몇 미터는 화면에서 한 칸이 30픽셀이 넘어가서, 같은
  // 세기로 뿌리면 그라운드가 아니라 자갈밭이 된다 — 가까울수록 눌러 준다
  float grain = smoothstep(2.0, 12.0, length(p - uEye));
  c *= 1.0 - 0.10 * grain + 0.20 * grain * hash(floor(vec2(p.x, p.z) * 24.0));

  // 멀수록 대기에 잠긴다
  float fog = 1.0 - exp(-length(p - uEye) * (uDaylight > 0.5 ? 0.0055 : 0.016));
  return mix(c, horizonHaze(), clamp(fog, 0.0, 0.92));
}

/** 담장·경고트랙 뒤 벽·외야석·전광판·파울폴 */
bool fenceHit(vec3 rd, out float t, out vec3 color) {
  vec3 p;
  float azimuth;
  t = wallHit(rd, p, azimuth);
  if (t <= 0.0 || p.y < 0.0) return false;

  // 파울폴. 반각 0.005rad로 뒀더니 100m 밖에서 1m 두께 — 화면 양 끝에 노란
  // 기둥 두 개가 서서 시야에서 제일 밝은 것이 되어 있었다. 실제 폴대 굵기인
  // 30cm로 줄이고 채도도 눌렀다
  if (abs(abs(azimuth) - FOUL) < 0.0016 && p.y < 11.0) {
    color = tone(vec3(0.24, 0.21, 0.11), vec3(0.56, 0.49, 0.24));
    return true;
  }

  // 전광판. 잠실 것은 중앙에서 좌중간 쪽으로 치우쳐 외야석 위에 선다
  if (azimuth > -0.33 && azimuth < 0.02 && p.y > 9.0 && p.y < 20.6) {
    vec3 frame = tone(vec3(0.030, 0.033, 0.040), vec3(0.135, 0.142, 0.156));
    bool inner = p.y > 9.7 && p.y < 19.9 && azimuth > -0.315 && azimuth < 0.005;
    if (!inner) {
      color = frame;
      return true;
    }
    vec3 panel = tone(vec3(0.022, 0.026, 0.033), vec3(0.082, 0.090, 0.104));
    // 난수 픽셀은 QR코드처럼, 얇은 여러 줄은 주사선처럼 보였다. 굵은 글줄 셋이
    // 100m 밖에서 전광판으로 읽히는 최소한이다
    float band = step(0.60, fract((p.y - 10.4) * 0.31));
    color = panel + vec3(0.21, 0.23, 0.25) * band * (1.0 - 0.60 * uDaylight);
    // 맨 위 한 줄만 색을 넣는다 — 전광판에는 늘 팀 색 리본이 하나 있다
    if (p.y > 19.1) color = mix(color, vec3(0.16, 0.26, 0.46), 0.85 - 0.35 * uDaylight);
    return true;
  }

  if (p.y > STAND_H) return false;

  if (p.y < FENCE_H) {
    // 외야 펜스 패드. 잠실은 짙은 초록이다. 실제로는 윗변에 노란 홈런 라인이
    // 그어져 있지만 뺐다 — 100m 밖에서 화면을 가로지르는 노란 띠 하나가 시야에서
    // 제일 밝은 것이 되어, 정작 봐야 할 공에서 눈을 빼앗아 간다
    vec3 pad = tone(vec3(0.040, 0.086, 0.058), vec3(0.086, 0.196, 0.129));
    pad *= 0.95 + 0.09 * step(0.5, fract(azimuth * 84.0));  // 패드 이음매

    // 광고판. KBO 구장 외야 담장은 광고로 덮여 있어서, 짙은 초록 한 색으로 두면
    // 어느 나라 어느 구장도 아닌 담장이 된다. 글자는 100m 밖에서 못 읽으니
    // 색 있는 칸으로만 남긴다
    float slot = floor(azimuth * 13.0);
    float within = fract(azimuth * 13.0);
    if (p.y > 0.30 && p.y < FENCE_H - 0.34 && within > 0.05 && within < 0.95) {
      float h = hash(vec2(slot, 3.0));
      // 원색을 그대로 쓰니 담장이 아니라 색종이가 됐다. 채도를 낮추고 초록
      // 패드와 섞는 비율도 줄인다
      vec3 ad = mix(vec3(0.42, 0.17, 0.16), vec3(0.14, 0.20, 0.36), fract(h * 5.7));
      ad = mix(ad, vec3(0.62, 0.61, 0.57), step(0.76, h));
      pad = mix(pad, ad * mix(0.30, 1.0, uDaylight), 0.62);
    }

    if (p.y > FENCE_H - 0.09) pad = mix(pad, tone(vec3(0.10, 0.12, 0.11), vec3(0.30, 0.33, 0.31)), 0.6);
    color = pad;
    return true;
  }

  // 펜스 뒤 통로. 그늘지긴 해도 낮에 새까맣게 두면 담장 위로 검은 띠가
  // 하나 더 생겨서, 방금 걷어낸 노란 띠와 똑같은 짓이 된다
  if (p.y < FENCE_H + 1.4) {
    color = tone(vec3(0.026, 0.030, 0.038), vec3(0.178, 0.186, 0.198));
    return true;
  }

  // 외야 관중석. 잠실 외야는 단층이라 여기서 끝나고 그 위는 그냥 하늘이다.
  // deck은 아래 0 → 위 1
  float deck = clamp((p.y - FENCE_H - 1.4) / (STAND_H - FENCE_H - 1.4), 0.0, 1.0);
  vec3 seats = tone(vec3(0.062, 0.072, 0.102), vec3(0.196, 0.234, 0.310));
  seats *= 0.88 + 0.22 * deck;
  seats *= 0.95 + 0.08 * step(0.5, fract(p.y * 1.3));  // 계단
  // 가로 통로 한 줄과 세로 통로 여럿. 이게 없으면 관중석이 아니라 자갈밭이다
  seats *= 1.0 - 0.42 * (1.0 - smoothstep(0.0, 0.05, abs(deck - 0.44)));
  seats *= 1.0 - 0.34 * (1.0 - smoothstep(0.0, 0.0045, abs(fract(azimuth * 5.0) - 0.5)));
  // 관중. 칸을 방위각으로 쪼개야 담장을 따라 밀도가 고르다. 색을 더하지 않고
  // 섞는다 — 더하면 관중이 아니라 텔레비전 노이즈가 된다
  vec2 cell = floor(vec2(azimuth * 430.0, p.y * 2.2));
  float who = hash(cell);
  vec3 shirt = tone(vec3(0.086, 0.088, 0.098), vec3(0.32, 0.31, 0.33));
  seats = mix(seats, shirt, step(0.44, who) * (0.35 + 0.40 * hash(cell + 7.3)));
  // 맨 윗줄 콘크리트 난간
  if (deck > 0.94) seats = tone(vec3(0.036, 0.039, 0.047), vec3(0.400, 0.410, 0.425));
  color = seats;
  return true;
}

/** 조명탑. 관중석보다 뒤에 서서 위로 솟는다 */
bool towerHit(vec3 rd, out float t, out vec3 color) {
  t = cylinderT(rd, TOWER_R);
  if (t <= 0.0) return false;
  vec3 p = uEye + rd * t;
  if (p.y < 0.0 || p.y > 48.0) return false;

  float azimuth = atan(p.x, p.z);
  float nearest = 9.0;
  for (int i = 0; i < 6; i++) {
    nearest = min(nearest, abs(azimuth - TOWER_AZIMUTH[i]));
  }

  vec3 steel = tone(vec3(0.038, 0.042, 0.056), vec3(0.29, 0.31, 0.34));

  // 기둥. 격자 철탑이라 가로 가새가 규칙적으로 지난다
  if (nearest < 0.013 && p.y < 38.0) {
    color = steel * (0.80 + 0.34 * step(0.5, fract(p.y * 0.85)));
    return true;
  }
  // 조명 머리. 램프를 줄로 쪼갰더니 150m 밖에서 주사선처럼 보였다. 통째로 한
  // 면으로 두되, 낮에는 꺼진 유리면이고 밤에만 켜진다
  if (nearest < 0.055 && p.y > 36.5 && p.y < 43.5) {
    bool lamp = nearest < 0.047 && p.y > 37.3 && p.y < 42.7;
    vec3 glass = tone(vec3(0.055, 0.060, 0.075), vec3(0.545, 0.555, 0.570));
    color = lamp ? mix(glass, vec3(1.0, 0.97, 0.88), (1.0 - uDaylight) * 0.92) : steel;
    return true;
  }
  return false;
}

/**
 * 어깨와 손, 골반과 발 사이를 접는 팔꿈치·무릎.
 *
 * bend는 관절이 옆으로 밀려나는 거리(m)다. 팔다리 길이에 비례해 정하게 뒀더니
 * 무릎이 25cm씩 바깥으로 튀어나가 다리가 «∧»자가 됐다 — 부위마다 정해 준다.
 */
vec2 hinge(vec2 root, vec2 tip, float bend) {
  vec2 d = tip - root;
  float l = max(length(d), 1e-3);
  vec2 n = vec2(-d.y, d.x) / l;
  return root + d * 0.5 + n * bend;
}

/** 모자. 머리 위에 얹는 크라운과 앞으로 나온 챙 */
void cap(vec2 p, vec2 head, inout float best, inout vec3 albedo) {
  nearer(sdSegment(p, head + vec2(-0.050, 0.055), head + vec2(0.050, 0.055), 0.068), TRIM, best, albedo);
  nearer(sdSegment(p, head + vec2(0.020, 0.035), head + vec2(0.155, 0.020), 0.026), TRIM, best, albedo);
}

/** 발. 원으로 그리면 공을 밟고 선 것처럼 보인다 */
void shoe(vec2 p, vec2 foot, float dir, inout float best, inout vec3 albedo) {
  nearer(sdSegment(p, foot, foot + vec2(0.075 * dir, 0.0), 0.042), SHOE, best, albedo);
}

/**
 * 야수. 40~90m 밖이라 화면에서 25~45픽셀이고, 유니폼 색이 전부다.
 *
 * 처음엔 몸통을 반지름 15cm 캡슐 하나로 뒀는데, 그러면 어깨가 골반과 같은 폭이라
 * 팔이 몸통 안에 파묻혀 눈사람이 된다. 어깨를 따로 긋고 팔을 그 바깥에서
 * 시작해야 그제야 사람이다. 서 있는 키 1.80m 기준.
 */
float fielderShape(vec2 p, out vec3 albedo) {
  float best = 1e9;
  albedo = JERSEY;

  // 다리 — 무릎 위는 바지, 아래는 스타킹
  nearer(sdSegment(p, vec2(-0.115, 0.52), vec2(-0.075, 0.98), 0.072), PANTS, best, albedo);
  nearer(sdSegment(p, vec2(0.115, 0.52), vec2(0.075, 0.98), 0.072), PANTS, best, albedo);
  nearer(sdSegment(p, vec2(-0.125, 0.11), vec2(-0.115, 0.53), 0.058), TRIM, best, albedo);
  nearer(sdSegment(p, vec2(0.125, 0.11), vec2(0.115, 0.53), 0.058), TRIM, best, albedo);
  shoe(p, vec2(-0.085, 0.045), -1.0, best, albedo);
  shoe(p, vec2(0.085, 0.045), 1.0, best, albedo);

  // 몸통·어깨·벨트
  nearer(sdSegment(p, vec2(0.0, 1.00), vec2(0.0, 1.44), 0.115), JERSEY, best, albedo);
  nearer(sdSegment(p, vec2(-0.19, 1.46), vec2(0.19, 1.46), 0.085), JERSEY, best, albedo);
  nearer(sdSegment(p, vec2(-0.105, 1.00), vec2(0.105, 1.00), 0.046), TRIM, best, albedo);

  // 팔 — 소매 아래는 맨살
  nearer(sdSegment(p, vec2(-0.21, 1.44), vec2(-0.26, 1.22), 0.058), JERSEY, best, albedo);
  nearer(sdSegment(p, vec2(0.21, 1.44), vec2(0.26, 1.22), 0.058), JERSEY, best, albedo);
  nearer(sdSegment(p, vec2(-0.26, 1.22), vec2(-0.245, 1.02), 0.046), SKIN, best, albedo);
  nearer(sdSegment(p, vec2(0.26, 1.22), vec2(0.245, 1.02), 0.046), SKIN, best, albedo);
  // 글러브는 던지는 손 반대쪽 — 대부분 우투라 포수가 볼 때 오른쪽이다
  nearer(length(p - vec2(0.255, 0.95)) - 0.082, GLOVE, best, albedo);

  // 목·머리·모자
  nearer(sdSegment(p, vec2(0.0, 1.46), vec2(0.0, 1.58), 0.048), SKIN, best, albedo);
  nearer(length(p - vec2(0.0, 1.68)) - 0.106, SKIN, best, albedo);
  cap(p, vec2(0.0, 1.68), best, albedo);

  return 1.0 - smoothstep(-0.012, 0.012, best);
}

/**
 * 투구 동작의 다섯 자세 사이를 잇는다.
 *
 * 셋포지션 → 레그킥 → 스트라이드 → 릴리스 → 팔로스루. f가 0에서 1로 가는 동안
 * 앞의 넷을 지나고, 공이 손을 떠난 뒤에는 g가 마지막 자세로 데려간다.
 * 팔 하나만 움직이면 «팔을 흔드는 사람»이지 투수가 아니다 — 다리를 들고,
 * 몸이 내려앉고, 축발이 따라 돌아야 그제야 던지는 것으로 보인다.
 */
vec2 pose(vec2 a, vec2 b, vec2 c, vec2 d, vec2 e, float f, float g) {
  vec2 p = mix(a, b, smoothstep(0.00, 0.34, f));
  p = mix(p, c, smoothstep(0.34, 0.74, f));
  p = mix(p, d, smoothstep(0.74, 1.00, f));
  return mix(p, e, smoothstep(0.0, 1.0, g));
}

/**
 * 마운드 위 투수. 세로 좌표는 발이 닿은 높이에서 잰다.
 *
 * 좌표는 «던지는 팔이 -x 쪽»인 우투수 기준이다 — 포수가 마주 보면 우투수의
 * 오른팔이 화면 왼쪽에 오고, 내딛는 왼발은 오른쪽에 떨어진다. 좌투는 uHand가
 * 통째로 뒤집는다.
 */
float pitcherShape(vec2 local, out vec3 albedo) {
  vec2 p = vec2(local.x * uHand, local.y);
  float f = uArmPhase;
  float g = uFollow;

  vec2 pelvis    = pose(vec2( 0.00, 1.02), vec2(-0.04, 1.08), vec2( 0.06, 0.98), vec2( 0.10, 0.95), vec2( 0.15, 0.88), f, g);
  vec2 chest     = pose(vec2( 0.00, 1.48), vec2(-0.05, 1.54), vec2( 0.02, 1.45), vec2( 0.05, 1.42), vec2( 0.10, 1.32), f, g);
  vec2 head      = pose(vec2(-0.02, 1.72), vec2(-0.06, 1.77), vec2(-0.02, 1.69), vec2( 0.00, 1.67), vec2( 0.06, 1.57), f, g);
  vec2 backFoot  = pose(vec2(-0.15, 0.05), vec2(-0.15, 0.05), vec2(-0.17, 0.05), vec2(-0.21, 0.14), vec2( 0.18, 0.05), f, g);
  vec2 frontFoot = pose(vec2(-0.01, 0.05), vec2( 0.03, 0.76), vec2( 0.46, 0.05), vec2( 0.50, 0.05), vec2( 0.50, 0.05), f, g);
  vec2 frontKnee = pose(vec2( 0.00, 0.55), vec2( 0.19, 1.14), vec2( 0.32, 0.54), vec2( 0.36, 0.56), vec2( 0.36, 0.54), f, g);
  vec2 hand      = pose(vec2( 0.06, 1.25), vec2( 0.02, 1.46), vec2(-0.60, 1.58), vec2(-0.26, 2.06), vec2( 0.38, 0.80), f, g);
  vec2 glove     = pose(vec2( 0.15, 1.25), vec2( 0.12, 1.46), vec2( 0.44, 1.50), vec2( 0.24, 1.22), vec2( 0.06, 1.08), f, g);

  // 어깨선. 던지는 어깨가 릴리스에서 올라갔다가 팔로스루에서 반대로 넘어간다 —
  // 이게 없으면 팔만 휘두르고 몸은 가만히 선 사람이 된다
  float tilt = mix(0.0, 0.22, smoothstep(0.00, 0.40, f));
  tilt = mix(tilt, 0.62, smoothstep(0.40, 1.00, f));
  tilt = mix(tilt, -0.55, smoothstep(0.0, 1.0, g));
  vec2 span = vec2(-cos(tilt), sin(tilt)) * 0.195;
  vec2 throwShoulder = chest + span;
  vec2 gloveShoulder = chest - span;

  vec2 backKnee = hinge(pelvis, backFoot, -0.055);
  vec2 elbow = hinge(throwShoulder, hand, 0.13);
  vec2 gloveElbow = hinge(gloveShoulder, glove, -0.13);

  float best = 1e9;
  albedo = JERSEY;

  // 다리 — 스타킹은 무릎 아래까지
  nearer(sdSegment(p, pelvis, backKnee, 0.078), PANTS, best, albedo);
  nearer(sdSegment(p, pelvis, frontKnee, 0.078), PANTS, best, albedo);
  nearer(sdSegment(p, backKnee, backFoot, 0.060), TRIM, best, albedo);
  nearer(sdSegment(p, frontKnee, frontFoot, 0.060), TRIM, best, albedo);
  shoe(p, backFoot, -1.0, best, albedo);
  shoe(p, frontFoot, 1.0, best, albedo);

  // 몸통·어깨·벨트
  nearer(sdSegment(p, pelvis, chest, 0.118), JERSEY, best, albedo);
  nearer(sdSegment(p, throwShoulder, gloveShoulder, 0.085), JERSEY, best, albedo);
  nearer(sdSegment(p, pelvis + vec2(-0.105, 0.01), pelvis + vec2(0.105, 0.01), 0.048), TRIM, best, albedo);

  // 팔 — 위팔은 소매, 아래팔은 맨살
  nearer(sdSegment(p, throwShoulder, elbow, 0.060), JERSEY, best, albedo);
  nearer(sdSegment(p, elbow, hand, 0.047), SKIN, best, albedo);
  nearer(sdSegment(p, gloveShoulder, gloveElbow, 0.060), JERSEY, best, albedo);
  nearer(sdSegment(p, gloveElbow, glove, 0.047), SKIN, best, albedo);
  nearer(length(p - glove) - 0.088, GLOVE, best, albedo);

  // 목·머리·모자
  nearer(sdSegment(p, chest, head, 0.048), SKIN, best, albedo);
  nearer(length(p - head) - 0.108, SKIN, best, albedo);
  cap(p, head, best, albedo);

  // 손에 든 공. 릴리스 전까지는 여기 있어야 «지금 던지려는 참»으로 보인다
  if (f < 0.99 && g < 0.02) {
    nearer(length(p - hand) - 0.040, LEATHER, best, albedo);
  }

  return 1.0 - smoothstep(-0.012, 0.012, best);
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
  // side를 vec3(-n.z, 0, n.x)로 두면 오른손 규칙상 -x를 가리켜, 판 위의 좌우가
  // 화면과 뒤집힌다. 우투수의 오른팔이 화면 오른쪽에 나오는 걸 보고서야 알았다
  vec3 side = vec3(n.z, 0.0, -n.x);
  local = vec2(dot(hit - foot, side), hit.y - foot.y);
  return true;
}

/**
 * 유니폼 색에 조명과 거리를 입힌다.
 *
 * 밤에도 새까맣게 두지 않는다. 조명탑이 켜진 구장에서 선수만 실루엣으로 남을
 * 이유가 없다. 대신 흰 유니폼이라도 공(0.94)보다는 확실히 눌러 시선을 안 뺏는다.
 */
vec3 personColor(vec3 albedo, float distance) {
  vec3 body = albedo * mix(0.44, 0.92, uDaylight);
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
  vec3 albedo;
  for (int i = 0; i < FIELDER_COUNT; i++) {
    vec3 foot = vec3(uFielders[i].x, 0.0, uFielders[i].y);
    if (!billboardHit(dir, foot, t, local)) continue;
    if (t >= best) continue;
    if (fielderShape(local, albedo) < 0.5) continue;
    best = t;
    color = personColor(albedo, t);
  }

  // 투수. 마운드가 부푼 만큼 발이 올라가 있다
  float toCenter = length(vec2(uPitcherX, uPitcherZ - MOUND_Z)) / MOUND_R;
  float stand = MOUND_H * max(0.0, 1.0 - toCenter * toCenter);
  vec3 pitcherFoot = vec3(uPitcherX, stand, uPitcherZ);
  if (billboardHit(dir, pitcherFoot, t, local) && t < best) {
    if (pitcherShape(local, albedo) > 0.5) {
      best = t;
      color = personColor(albedo, t);
      // 조명 반대편에서 들어오는 가장자리 빛
      vec3 ignored;
      float rim = 1.0 - pitcherShape(local + vec2(0.02, 0.02), ignored);
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
