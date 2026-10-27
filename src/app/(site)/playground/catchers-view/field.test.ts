import { describe, expect, it } from "vitest";
import { RUBBER_Z } from "./flight";
import {
  BASES,
  BASE_DISTANCE,
  FENCE_CENTER,
  FENCE_CORNER,
  FENCE_HEIGHT,
  FIELDERS,
  FOUL_ANGLE,
  HOME_APEX_Z,
  MOUND_CENTER,
  MOUND_RADIUS,
  azimuthOf,
  distanceFromHome,
  fenceRadiusAt,
  fielderUniform,
  isFair,
  spotAt,
  type Spot,
} from "./field";

function between(a: Spot, b: Spot): number {
  return Math.hypot(a.x - b.x, a.z - b.z);
}

const [FIRST, SECOND, THIRD] = BASES;

describe("spotAt", () => {
  it("방위각 0은 중견수 쪽 정면이다", () => {
    const spot = spotAt("정면", 50, 0);
    expect(spot.x).toBeCloseTo(0, 9);
    expect(spot.z).toBeCloseTo(HOME_APEX_Z + 50, 9);
  });

  it("양의 방위각은 1루 쪽이다", () => {
    expect(spotAt("우", 50, 30).x).toBeGreaterThan(0);
    expect(spotAt("좌", 50, -30).x).toBeLessThan(0);
  });

  it("거리는 홈 꼭짓점에서 잰다", () => {
    for (const degrees of [-44, -12, 0, 17, 41]) {
      expect(distanceFromHome(spotAt("점", 63, degrees))).toBeCloseTo(63, 9);
    }
  });
});

describe("다이아몬드", () => {
  it("1루와 3루가 홈에서 27.43m다", () => {
    expect(distanceFromHome(FIRST)).toBeCloseTo(BASE_DISTANCE, 6);
    expect(distanceFromHome(THIRD)).toBeCloseTo(BASE_DISTANCE, 6);
  });

  it("2루는 홈에서 27.43m의 √2배다", () => {
    expect(distanceFromHome(SECOND)).toBeCloseTo(BASE_DISTANCE * Math.SQRT2, 6);
    expect(distanceFromHome(SECOND)).toBeCloseTo(38.79, 2);
  });

  it("이웃한 베이스끼리도 전부 27.43m다", () => {
    // 정사각형이 아니면 여기서 걸린다
    expect(between(FIRST, SECOND)).toBeCloseTo(BASE_DISTANCE, 6);
    expect(between(SECOND, THIRD)).toBeCloseTo(BASE_DISTANCE, 6);
  });

  it("1루는 포수가 볼 때 오른쪽, 3루는 왼쪽이다", () => {
    expect(FIRST.x).toBeGreaterThan(0);
    expect(THIRD.x).toBeLessThan(0);
    expect(SECOND.x).toBeCloseTo(0, 9);
  });

  it("1루와 3루가 좌우 대칭이다", () => {
    expect(FIRST.x).toBeCloseTo(-THIRD.x, 9);
    expect(FIRST.z).toBeCloseTo(THIRD.z, 9);
  });

  it("1루와 3루가 파울라인 위에 정확히 놓인다", () => {
    // 파울라인이 45°이므로 베이스는 그 선상에서 x와 z 변위가 같아야 한다
    expect(FOUL_ANGLE).toBeCloseTo(Math.PI / 4, 9);
    expect(FIRST.x).toBeCloseTo(FIRST.z - HOME_APEX_Z, 6);
    expect(-THIRD.x).toBeCloseTo(THIRD.z - HOME_APEX_Z, 6);
  });
});

describe("마운드", () => {
  it("투구판 위에 있다", () => {
    expect(MOUND_CENTER.z).toBe(RUBBER_Z);
    expect(MOUND_CENTER.x).toBe(0);
  });

  it("홈과 2루 사이에 있다", () => {
    expect(MOUND_CENTER.z).toBeGreaterThan(0);
    expect(MOUND_CENTER.z).toBeLessThan(SECOND.z);
  });

  it("2루 베이스를 덮지 않는다", () => {
    // 마운드 흙이 2루까지 이어지면 다이아몬드가 뭉개진다
    expect(SECOND.z - MOUND_CENTER.z).toBeGreaterThan(MOUND_RADIUS * 2);
  });
});

describe("수비 위치", () => {
  it("일곱 명이다 — 투수와 포수를 뺀 나머지", () => {
    expect(FIELDERS).toHaveLength(7);
  });

  it("전원이 파울라인 안쪽에 선다", () => {
    for (const fielder of FIELDERS) {
      expect(isFair(fielder), fielder.name).toBe(true);
    }
  });

  it("전원이 담장 안쪽에 선다", () => {
    // 폴대 쪽은 100m밖에 안 되므로 방위각마다 따로 재야 한다
    for (const fielder of FIELDERS) {
      const wall = fenceRadiusAt(azimuthOf(fielder));
      expect(distanceFromHome(fielder), fielder.name).toBeLessThan(wall);
    }
  });

  it("아무도 마운드를 밟고 있지 않다", () => {
    for (const fielder of FIELDERS) {
      const toMound = Math.hypot(fielder.x - MOUND_CENTER.x, fielder.z - MOUND_CENTER.z);
      expect(toMound, fielder.name).toBeGreaterThan(MOUND_RADIUS + 1);
    }
  });

  it("내야수 넷이 외야수 셋보다 앞에 있다", () => {
    const depth = (name: string) =>
      distanceFromHome(FIELDERS.find((f) => f.name === name)!);
    const infield = ["1루수", "2루수", "유격수", "3루수"].map(depth);
    const outfield = ["우익수", "중견수", "좌익수"].map(depth);
    expect(Math.max(...infield)).toBeLessThan(Math.min(...outfield));
  });

  it("좌우가 대칭에 가깝다", () => {
    // 한쪽으로 쏠려 있으면 화면이 기울어 보인다
    const right = FIELDERS.filter((f) => f.x > 1).length;
    const left = FIELDERS.filter((f) => f.x < -1).length;
    expect(Math.abs(right - left)).toBeLessThanOrEqual(1);
  });

  it("중견수는 가운데, 그리고 가장 깊다", () => {
    const center = FIELDERS.find((f) => f.name === "중견수")!;
    expect(center.x).toBeCloseTo(0, 9);
    for (const other of FIELDERS) {
      expect(distanceFromHome(other)).toBeLessThanOrEqual(distanceFromHome(center));
    }
  });
});

describe("isFair", () => {
  it("파울라인 위는 페어다", () => {
    expect(isFair({ name: "선상", x: 20, z: HOME_APEX_Z + 20 })).toBe(true);
  });

  it("라인 밖은 파울이다", () => {
    expect(isFair({ name: "밖", x: 21, z: HOME_APEX_Z + 20 })).toBe(false);
    expect(isFair({ name: "밖", x: -21, z: HOME_APEX_Z + 20 })).toBe(false);
  });

  it("포수 뒤는 파울이다", () => {
    expect(isFair({ name: "뒤", x: 0, z: -5 })).toBe(false);
  });
});

describe("fielderUniform", () => {
  it("사람마다 vec3 한 칸씩 차지한다", () => {
    const data = fielderUniform();
    expect(data).toHaveLength(FIELDERS.length * 3);
  });

  it("x와 z를 앞 두 칸에 담는다", () => {
    const data = fielderUniform();
    FIELDERS.forEach((spot, i) => {
      expect(data[i * 3]).toBeCloseTo(spot.x, 4);
      expect(data[i * 3 + 1]).toBeCloseTo(spot.z, 4);
    });
  });
});

describe("잠실 담장", () => {
  it("중앙이 125m, 폴대가 100m다", () => {
    expect(fenceRadiusAt(0)).toBeCloseTo(FENCE_CENTER, 9);
    expect(fenceRadiusAt(FOUL_ANGLE)).toBeCloseTo(FENCE_CORNER, 9);
    expect(fenceRadiusAt(-FOUL_ANGLE)).toBeCloseTo(FENCE_CORNER, 9);
  });

  it("좌우 대칭이고 중앙에서 멀어질수록 가까워진다", () => {
    let previous = fenceRadiusAt(0);
    for (let deg = 5; deg <= 45; deg += 5) {
      const a = (deg * Math.PI) / 180;
      const r = fenceRadiusAt(a);
      expect(r).toBeCloseTo(fenceRadiusAt(-a), 9);
      expect(r).toBeLessThan(previous);
      previous = r;
    }
  });

  it("좌중간이 알려진 잠실 수치 언저리에 온다", () => {
    // 좌중간·우중간은 공표된 실측을 못 찾아 선형으로 이었다. 그 결과가
    // 상식적인 범위를 벗어나면 보간을 다시 봐야 한다
    expect(fenceRadiusAt(FOUL_ANGLE / 2)).toBeGreaterThan(108);
    expect(fenceRadiusAt(FOUL_ANGLE / 2)).toBeLessThan(116);
  });

  it("파울라인 밖으로는 더 벌어지지 않는다", () => {
    expect(fenceRadiusAt(FOUL_ANGLE * 2)).toBeCloseTo(FENCE_CORNER, 9);
  });

  it("펜스가 사람보다 높다 — 넘어가는 게 홈런이어야 한다", () => {
    expect(FENCE_HEIGHT).toBeGreaterThan(1.9);
  });
});

describe("azimuthOf", () => {
  it("spotAt이 넣은 각을 그대로 돌려준다", () => {
    for (const degrees of [-44, -18, 0, 22, 40]) {
      const back = (azimuthOf(spotAt("점", 55, degrees)) * 180) / Math.PI;
      expect(back).toBeCloseTo(degrees, 6);
    }
  });
});
