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

/** 파울라인은 홈 꼭짓점에서 좌우 45°로 뻗는다 */
export const FOUL_ANGLE = Math.PI / 4;

/**
 * 잠실야구장 치수.
 *
 * 공개된 실측은 셋이다 — 좌우 폴대 100m, 중앙 125m, 외야 펜스 높이 2.6m.
 * 그 사이(좌중간·우중간)는 공표된 수치를 못 찾아서 방위각에 선형으로 잇는다.
 * 이러면 중간 지점이 112m쯤 되는데, 흔히 알려진 잠실 좌중간과 얼추 맞는다.
 *
 * 처음에는 반경 하나짜리 원기둥으로 뒀다. 그러면 담장 윗변이 화면을 가로지르는
 * 완전한 수평선이 되어 «벽»으로 보인다. 폴대 쪽이 25m 가까워지면 양 끝이
 * 올라오면서 그제야 구장이 나를 감싼 것처럼 보인다.
 */
export const FENCE_CORNER = 100;
export const FENCE_CENTER = 125;
export const FENCE_HEIGHT = 2.6;
/** 광선 반복의 첫 추정값이자 «가장 먼 담장» */
export const FENCE_RADIUS = FENCE_CENTER;
/** 펜스 앞 경고 트랙 폭 */
export const WARNING_TRACK = 4.6;
/** 외야 관중석 꼭대기. 잠실 외야는 단층이라 내야석보다 한참 낮다 */
export const STAND_HEIGHT = 15.5;
/** 조명탑이 서 있는 거리와 높이 */
export const TOWER_RADIUS = 150;
export const TOWER_HEIGHT = 46;

/** 파울폴(100m)에서 중앙(125m)까지, 방위각에 따라 멀어지는 담장 */
export function fenceRadiusAt(azimuth: number): number {
  const t = Math.min(1, Math.abs(azimuth) / FOUL_ANGLE);
  return FENCE_CENTER - (FENCE_CENTER - FENCE_CORNER) * t;
}

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

/** 홈 꼭짓점에서 본 방위각(rad). 0이 중견수 쪽, +가 1루 쪽 */
export function azimuthOf(spot: Spot): number {
  return Math.atan2(spot.x, spot.z - HOME_APEX_Z);
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
