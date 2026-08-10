/**
 * 셰이더 원본.
 *
 * 패스가 둘뿐이다. 상영관을 그리는 전체화면 사각형 하나, 스크린 격자 하나.
 * 필름 그레인과 비네트는 별도 합성 패스를 두지 않고 두 셰이더가 같은
 * `filmGrade`를 마지막에 부른다. 화면의 각 픽셀은 깊이 테스트를 거쳐 둘 중
 * 한쪽만 쓰므로, 결과는 합성 패스를 둔 것과 같으면서 프레임버퍼가 필요 없다.
 */

/** 두 셰이더가 공유하는 마무리 처리 */
const FILM = /* glsl */ `
float hash21(vec2 p) {
  return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453123);
}

float luma(vec3 c) { return dot(c, vec3(0.2126, 0.7152, 0.0722)); }

vec3 filmGrade(vec3 color, vec2 frag, vec2 resolution, float time) {
  vec2 uv = frag / resolution;
  // 비네트. 1열에서는 시야 가장자리가 상영관 어둠에 먹힌다
  float r = length((uv - 0.5) * vec2(1.1, 1.0)) * 1.45;
  color *= clamp(1.0 - 0.5 * pow(r, 2.3), 0.0, 1.0);

  // 그레인. 어두운 데서 더 도드라지는 게 실제 필름이다
  float g = hash21(frag + fract(time) * 431.0) - 0.5;
  color += g * 0.045 * (0.35 + 0.65 * (1.0 - luma(color)));

  // 완전한 검정으로 떨어뜨리지 않는다. 상영관 바닥도 아주 조금은 뜬다
  return max(color, vec3(0.004, 0.004, 0.006));
}
`;

export const ROOM_VERTEX = /* glsl */ `#version 300 es
precision highp float;
in vec2 aPos;
out vec2 vNdc;
void main() {
  vNdc = aPos;
  // z를 w와 같게 두어 깊이 1(가장 먼 곳)에 놓는다. 스크린이 늘 앞에 온다
  gl_Position = vec4(aPos, 1.0, 1.0);
}
`;

export const ROOM_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vNdc;
out vec4 outColor;

uniform vec3 uRight;
uniform vec3 uUp;
uniform vec3 uForward;
uniform vec3 uEye;
uniform float uTanHalfFov;
uniform float uAspect;
uniform vec2 uResolution;
uniform float uTime;
/** 스크린 빛이 상영관에 번지는 색 */
uniform vec3 uSpill;
uniform vec3 uScreenCenter;

${FILM}

/** 상영관 크기. 스크린 뒤쪽 벽이 z 최소, 관객 뒤가 z 최대 */
const vec3 ROOM_MIN = vec3(-14.0, 0.0, -1.0);
const vec3 ROOM_MAX = vec3(14.0, 19.0, 14.0);

/*
 * EXIT 등은 스크린 옆 벽에 붙어 있다. 눈보다 뒤(z가 큰 쪽)에 두면 고개를
 * 끝까지 돌려도 시야에 안 들어와서, 앞쪽 벽면에 붙였다. 정면에서는 안 보이고
 * 고개를 돌려야 나온다 — 실제로도 그렇다.
 */
const vec3 EXIT_A = vec3(-13.5, 2.4, 2.5);
const vec3 EXIT_B = vec3(13.5, 2.4, 2.5);

void main() {
  vec3 dir = normalize(
    uForward + uRight * (vNdc.x * uTanHalfFov * uAspect) + uUp * (vNdc.y * uTanHalfFov)
  );

  // 눈은 상영관 안에 있다. 상자 안쪽 면 중 가장 먼저 닿는 곳을 찾는다
  vec3 inv = 1.0 / dir;
  vec3 bound = mix(ROOM_MIN, ROOM_MAX, step(0.0, dir));
  vec3 t = (bound - uEye) * inv;
  float hit = min(min(t.x, t.y), t.z);
  vec3 p = uEye + dir * hit;

  vec3 normal = vec3(0.0);
  vec3 base;
  if (hit == t.y) {
    if (dir.y < 0.0) {
      normal = vec3(0.0, 1.0, 0.0);
      // 바닥 카펫. 결이 아주 거칠게 보이도록 저주파 얼룩만
      float speck = hash21(floor(p.xz * 14.0));
      base = vec3(0.055, 0.050, 0.056) * (0.85 + 0.2 * speck);
    } else {
      normal = vec3(0.0, -1.0, 0.0);
      base = vec3(0.055, 0.055, 0.070);
    }
  } else if (hit == t.x) {
    normal = vec3(dir.x < 0.0 ? 1.0 : -1.0, 0.0, 0.0);
    // 측벽 흡음 패널. 세로로 1.2m마다 골이 진다
    float rib = smoothstep(0.35, 0.5, abs(fract(p.z / 1.2) - 0.5));
    base = mix(vec3(0.052, 0.049, 0.062), vec3(0.076, 0.072, 0.088), rib);
  } else {
    normal = vec3(0.0, 0.0, dir.z < 0.0 ? 1.0 : -1.0);
    if (dir.z < 0.0 && p.y < 1.15) {
      // 스크린 아래 스피커 그릴. 1열에서 실제로 이게 눈앞에 있다
      float slat = smoothstep(0.3, 0.5, abs(fract(p.y * 26.0) - 0.5));
      base = mix(vec3(0.035, 0.035, 0.042), vec3(0.16, 0.155, 0.17), slat);
    } else {
      // 스크린을 두르는 검은 마스킹. 여기만은 계속 어둡다 —
      // 스크린 경계가 흐려지면 그림이 허공에 떠 있는 것처럼 보인다
      base = vec3(0.022, 0.022, 0.028);
    }
  }

  // 유일한 광원은 스크린이다
  vec3 toScreen = uScreenCenter - p;
  float dist = length(toScreen);
  float facing = max(dot(normal, toScreen / dist), 0.0);
  float fall = 1.0 / (1.0 + 0.012 * dist * dist);
  vec3 color = base * (0.5 + 11.0 * facing * fall) * (uSpill * 7.0 + 0.10);

  // EXIT 등. 점 하나와 옅은 무리
  vec3 exitGlow = vec3(0.0);
  vec3 ea = normalize(EXIT_A - uEye);
  vec3 eb = normalize(EXIT_B - uEye);
  float da = max(dot(dir, ea), 0.0);
  float db = max(dot(dir, eb), 0.0);
  exitGlow += vec3(0.10, 0.85, 0.35) * (pow(da, 9000.0) * 0.9 + pow(da, 260.0) * 0.05);
  exitGlow += vec3(0.10, 0.85, 0.35) * (pow(db, 9000.0) * 0.9 + pow(db, 260.0) * 0.05);
  color += exitGlow;

  outColor = vec4(filmGrade(color, gl_FragCoord.xy, uResolution, uTime), 1.0);
}
`;

export const SCREEN_VERTEX = /* glsl */ `#version 300 es
precision highp float;
in vec3 aPos;
in vec2 aUv;

uniform mat4 uViewProj;
uniform mat4 uModel;
uniform vec4 uCrop;
uniform vec3 uEye;
/** x: 스크린 폭, y: 곡률 반경, z: 기울기 */
uniform vec3 uGeo;

out vec2 vUv;
out vec2 vScreenUv;
out float vFacing;

void main() {
  vec4 world = uModel * vec4(aPos, 1.0);
  gl_Position = uViewProj * world;

  vUv = aUv * uCrop.xy + uCrop.zw;
  vScreenUv = aUv;

  // 곡면의 법선. 관객 쪽을 본다
  float theta = (aUv.x - 0.5) * uGeo.x / uGeo.y;
  vec3 n = vec3(-sin(theta), -cos(theta) * sin(uGeo.z), cos(theta) * cos(uGeo.z));
  vFacing = max(dot(normalize(uEye - world.xyz), n), 0.0);
}
`;

export const SCREEN_FRAGMENT = /* glsl */ `#version 300 es
precision highp float;
in vec2 vUv;
in vec2 vScreenUv;
in float vFacing;
out vec4 outColor;

uniform sampler2D uVideo;
uniform float uFlicker;
uniform vec2 uResolution;
uniform float uTime;

${FILM}

void main() {
  vec3 color = texture(uVideo, vUv).rgb;

  // 램프 밝기 흔들림
  color *= uFlicker;

  /*
   * 은막은 방향성이 있다. 정면으로 마주 보는 부분이 가장 밝고, 비스듬히
   * 보이는 좌우 끝은 어두워진다. 1열에서 스크린 양끝이 어둡게 죽는 게
   * 실제로 보이는 현상이고, 이게 없으면 화면이 평평한 사진처럼 보인다.
   */
  color *= mix(0.68, 1.0, pow(vFacing, 0.6));

  // 스크린 가장자리 마스킹에 닿는 부분이 아주 살짝 떨어진다
  vec2 edge = smoothstep(0.0, 0.012, vScreenUv) * smoothstep(0.0, 0.012, 1.0 - vScreenUv);
  color *= 0.35 + 0.65 * edge.x * edge.y;

  outColor = vec4(filmGrade(color, gl_FragCoord.xy, uResolution, uTime), 1.0);
}
`;
