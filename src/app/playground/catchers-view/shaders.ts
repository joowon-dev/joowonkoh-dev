/**
 * 셰이더 셋.
 *
 * 화면을 덮는 사각형 하나에 프래그먼트에서 광선을 쏘는 방식으로 통일했다.
 * 구장 모델도 공 메시도 만들지 않는다 — 그릴 게 땅 평면, 사람 실루엣 한 장,
 * 구 하나뿐이라 정점 버퍼를 만드는 쪽이 오히려 일이 많다.
 *
 * 공을 구체로 «푸는» 이유는 따로 있다. 폴리곤 구를 쓰면 공이 화면을 채우는
 * 마지막 3m — 이 페이지에서 제일 중요한 프레임 — 에서 각이 진다.
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
}`;

/**
 * 배경. 하늘·잔디·흙·홈플레이트·투수 실루엣을 한 번에 그린다.
 *
 * 야간 경기로 잡았다. 조명 아래 어두운 배경이라야 흰 공이 도드라지고,
 * 배경을 예쁘게 만들려는 유혹도 같이 사라진다.
 */
export const SCENE_FRAGMENT = `#version 300 es
precision highp float;
in vec2 vNdc;
out vec4 outColor;
${RAY}
${NOISE}

uniform float uPitcherX;
uniform float uPitcherZ;
uniform float uHand;      // 우투 +1, 좌투 -1
uniform float uArmPhase;  // 0 와인드업 시작 → 1 릴리스

const vec3 GRASS_A = vec3(0.115, 0.235, 0.125);
const vec3 GRASS_B = vec3(0.090, 0.195, 0.105);
const vec3 DIRT    = vec3(0.330, 0.215, 0.150);
const vec3 CHALK   = vec3(0.850, 0.860, 0.845);
const vec3 NIGHT   = vec3(0.035, 0.045, 0.075);
const vec3 STANDS  = vec3(0.055, 0.060, 0.085);

float sdSegment(vec2 p, vec2 a, vec2 b, float r) {
  vec2 pa = p - a;
  vec2 ba = b - a;
  float h = clamp(dot(pa, ba) / dot(ba, ba), 0.0, 1.0);
  return length(pa - ba * h) - r;
}

vec3 sky(vec3 dir) {
  // 지평선 바로 위는 관중석, 그 위는 조명에 뜬 밤하늘
  float up = clamp(dir.y * 6.0, 0.0, 1.0);
  vec3 c = mix(STANDS, NIGHT, up);
  // 조명탑이 만드는 옅은 헤일로
  c += vec3(0.06, 0.06, 0.05) * pow(clamp(1.0 - abs(dir.y) * 3.0, 0.0, 1.0), 3.0);
  return c;
}

vec3 ground(vec3 p) {
  vec2 q = p.xz;
  float toHome = length(q);
  float toMound = length(q - vec2(0.0, 18.44));

  // 잔디 깎은 줄무늬
  float stripe = step(0.5, fract(p.z / 5.5));
  vec3 c = mix(GRASS_A, GRASS_B, stripe);

  // 마운드와 홈 주변 흙
  float dirtMask = max(
    1.0 - smoothstep(2.5, 2.9, toMound),
    1.0 - smoothstep(3.9, 4.4, toHome)
  );
  c = mix(c, DIRT, dirtMask);

  // 타석 흰 선
  float boxX = min(abs(abs(p.x) - 0.33), abs(abs(p.x) - 1.25));
  float boxZ = min(abs(p.z + 1.05), abs(p.z - 0.83));
  bool inBoxX = abs(p.x) > 0.30 && abs(p.x) < 1.28;
  bool inBoxZ = p.z > -1.08 && p.z < 0.86;
  float line = 0.0;
  if (inBoxZ && boxX < 0.03) line = 1.0;
  if (inBoxX && boxZ < 0.03) line = 1.0;
  c = mix(c, CHALK, line * 0.8);

  // 홈플레이트 — 포수 쪽으로 뾰족한 오각형. 넓은 모서리가 투수를 향한다
  if (p.z > -0.43 && p.z < 0.0) {
    float halfWidth = p.z > -0.216 ? 0.216 : p.z + 0.43;
    if (abs(p.x) < halfWidth) c = vec3(0.88, 0.89, 0.86);
  }

  // 흙과 잔디의 얼룩
  c *= 0.88 + 0.24 * hash(floor(q * 24.0));

  // 멀수록 밤에 잠긴다
  float fog = 1.0 - exp(-length(p - uEye) * 0.016);
  return mix(c, STANDS, clamp(fog, 0.0, 0.92));
}

/** 마운드 위 투수. 세로 좌표는 마운드 꼭대기(0.25m)에서 잰다 */
float pitcherMask(vec2 local) {
  vec2 p = vec2(local.x * uHand, local.y);

  // 던지는 팔은 뒤에서 앞으로 넘어온다
  float a = uArmPhase;
  vec2 hand = mix(vec2(-0.55, 1.05), vec2(0.42, 1.62), smoothstep(0.0, 1.0, a));

  float d = 1e9;
  d = min(d, sdSegment(p, vec2(-0.16, 0.0), vec2(0.0, 0.82), 0.085));  // 뒷다리
  d = min(d, sdSegment(p, vec2(0.30, 0.02), vec2(0.03, 0.84), 0.085)); // 앞다리
  d = min(d, sdSegment(p, vec2(0.0, 0.80), vec2(0.05, 1.44), 0.155));  // 몸통
  d = min(d, length(p - vec2(0.07, 1.63)) - 0.125);                    // 머리
  d = min(d, sdSegment(p, vec2(0.05, 1.40), hand, 0.062));             // 던지는 팔
  d = min(d, sdSegment(p, vec2(0.03, 1.36), vec2(-0.34, 1.20), 0.07)); // 글러브 팔

  return 1.0 - smoothstep(-0.012, 0.012, d);
}

void main() {
  vec3 dir = rayDir(vNdc);
  vec3 color = sky(dir);
  float nearest = 1e9;

  if (dir.y < -1e-5) {
    float t = -uEye.y / dir.y;
    if (t > 0.0) {
      nearest = t;
      color = ground(uEye + dir * t);
    }
  }

  // 외야 담장과 관중석. 실제 평면으로 세워야 지평선이 제자리에 생긴다 —
  // 하늘만 깔면 마운드 위쪽이 통째로 검은 벽이 된다
  if (dir.z > 1e-5) {
    float t = (120.0 - uEye.z) / dir.z;
    vec3 p = uEye + dir * t;
    if (t > 0.0 && t < nearest && p.y > 0.0 && p.y < 30.0) {
      nearest = t;
      if (p.y < 3.6) {
        color = vec3(0.048, 0.098, 0.068);  // 담장
      } else {
        // 좌석 줄과 드문드문 앉은 사람
        // 관중석은 배경이다. 얼룩이 눈에 들어오는 순간 공에서 시선이 샌다
        vec3 seats = vec3(0.050, 0.054, 0.072);
        seats *= 0.86 + 0.18 * step(0.5, fract(p.y * 1.1));
        seats += vec3(0.022) * step(0.975, hash(floor(vec2(p.x * 1.4, p.y * 1.1))));
        color = seats;
      }
    }
  }

  if (dir.z > 1e-5) {
    float t = (uPitcherZ - uEye.z) / dir.z;
    if (t > 0.0 && t < nearest) {
      vec3 p = uEye + dir * t;
      float mask = pitcherMask(vec2(p.x - uPitcherX, p.y - 0.25));
      // 실루엣은 유니폼 색을 주지 않는다. 공이 주인공이라야 한다
      color = mix(color, vec3(0.045, 0.050, 0.070), mask);
      // 조명 반대편에서 들어오는 가장자리 빛
      float rim = mask * (1.0 - pitcherMask(vec2(p.x - uPitcherX - 0.02, p.y - 0.27)));
      color += vec3(0.16, 0.17, 0.20) * rim;
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
  vec3 color = base * (0.32 + 0.80 * lambert) + vec3(0.10, 0.12, 0.16) * rim;

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
