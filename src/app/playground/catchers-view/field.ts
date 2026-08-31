/**
 * 구장 치수와 사람들이 서 있는 자리.
 *
 * 셰이더 안에 숫자를 박아 두면 "베이스가 정말 27.43m인가"를 확인할 방법이
 * 눈밖에 없다. 그리는 코드는 시험할 수 없어도 **어디에 그리는지**는 시험할 수
 * 있으므로, 좌표를 여기로 빼고 셰이더에는 유니폼으로 넘긴다.
 *
 * 좌표계는 flight.ts와 같다 — 원점은 홈플레이트 앞 모서리의 지면,
 * `+z`는 마운드 쪽, `+x`는 포수가 볼 때 오른쪽(= 1루 쪽).
 */

import { RUBBER_Z, type Vec3 } from "./flight";

/** 베이스 간 거리. 90피트 */
export const BASE_DISTANCE = 27.43;
/** 홈플레이트 뾰족한 꼭짓점. 다이아몬드는 여기서부터 잰다 */
export const HOME_APEX_Z = -0.43;
/** 홈 주변 흙 원 */
export const HOME_CIRCLE = 4.0;
/** 베이스 하나 주변 흙 원 */
export const BASE_CIRCLE = 3.9;
/** 베이스패스 흙 띠의 반폭 */
export const PATH_HALF_WIDTH = 0.95;
/** 베이스 한 변. 15인치 */
export const BASE_SIZE = 0.381;

export const MOUND_RADIUS = 2.74;
/** 마운드가 그라운드보다 솟은 높이. 10인치 */
export const MOUND_HEIGHT = 0.254;
export const MOUND_CENTER: Vec3 = { x: 0, y: 0, z: RUBBER_Z };
/** 투구판. 24 × 6인치 */
export const RUBBER_WIDTH = 0.61;
export const RUBBER_DEPTH = 0.152;

/**
 * 외야 담장까지의 거리.
 *
 * 실제 구장은 가운데가 멀고(120m대) 폴대 쪽이 가깝지만(100m 안팎), 여기서는
 * 하나의 원기둥으로 둔다. 원기둥이면 담장 윗변이 시야를 가로지르는 수평선으로
 * 곧게 남는데, 평면으로 세우면 가장자리로 갈수록 멀어져 윗변이 아래로
 * 처지는 — 실제와 반대인 — 그림이 나온다.
 */
export const FENCE_RADIUS = 118;
export const FENCE_HEIGHT = 3.6;
/** 관중석 꼭대기 */
export const STAND_HEIGHT = 27;
/** 조명탑이 서 있는 거리와 높이 */
export const TOWER_RADIUS = 142;
export const TOWER_HEIGHT = 44;

/** 파울라인은 홈 꼭짓점에서 좌우 45°로 뻗는다 */
export const FOUL_ANGLE = Math.PI / 4;

export interface Spot {
  /** 화면에 안 띄우지만 코드를 읽을 때 필요하다 */
  name: string;
  x: number;
  z: number;
}

/** 홈 꼭짓점에서 잰 거리와 방위각(0 = 중견수 쪽, +가 1루 쪽)으로 자리를 잡는다 */
export function spotAt(name: string, distance: number, degrees: number): Spot {
  const a = (degrees * Math.PI) / 180;
  return {
    name,
    x: distance * Math.sin(a),
    z: HOME_APEX_Z + distance * Math.cos(a),
  };
}

export const BASES: Spot[] = [
  spotAt("1루", BASE_DISTANCE, 45),
  spotAt("2루", BASE_DISTANCE * Math.SQRT2, 0),
  spotAt("3루", BASE_DISTANCE, -45),
];

/**
 * 수비 위치. 실제 정위치에서 가져왔다.
 *
 * 투수는 여기 없다 — 마운드 위에서 와인드업까지 하므로 따로 그린다.
 */
export const FIELDERS: Spot[] = [
  spotAt("1루수", 31, 40),
  spotAt("2루수", 36, 22),
  spotAt("유격수", 37, -18),
  spotAt("3루수", 30, -41),
  spotAt("우익수", 80, 30),
  spotAt("중견수", 92, 0),
  spotAt("좌익수", 80, -30),
];

/** 홈 꼭짓점에서의 거리 */
export function distanceFromHome(spot: Spot): number {
  return Math.hypot(spot.x, spot.z - HOME_APEX_Z);
}

/** 파울라인 안쪽인가 */
export function isFair(spot: Spot): boolean {
  return spot.z - HOME_APEX_Z >= Math.abs(spot.x);
}

/**
 * 셰이더로 넘길 납작한 배열. `vec3[]` 유니폼 하나로 야수를 한 루프에 그린다 —
 * 사람마다 유니폼을 따로 두면 일곱 벌이 된다.
 *
 * z 성분은 안 쓰지만 `vec3` 정렬에 맞춘다.
 */
export function fielderUniform(): Float32Array {
  const data = new Float32Array(FIELDERS.length * 3);
  FIELDERS.forEach((spot, i) => {
    data[i * 3] = spot.x;
    data[i * 3 + 1] = spot.z;
    data[i * 3 + 2] = 0;
  });
  return data;
}
