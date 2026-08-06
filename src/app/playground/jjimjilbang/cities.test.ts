import { describe, it, expect } from "vitest";
import { nearestCity, DEFAULT_CITY } from "./cities";

describe("nearestCity", () => {
  it("도시 좌표를 그대로 주면 그 도시가 나온다", () => {
    expect(nearestCity(37.5665, 126.978).name).toBe("서울");
    expect(nearestCity(35.1796, 129.0756).name).toBe("부산");
  });

  it("근처 좌표도 가장 가까운 도시로 간다", () => {
    // 성남
    expect(nearestCity(37.42, 127.13).name).toBe("서울");
    // 울산
    expect(nearestCity(35.54, 129.31).name).toBe("부산");
  });

  it("목록에서 멀리 떨어진 좌표에도 답을 준다", () => {
    expect(nearestCity(0, 0)).toBeDefined();
  });
});

describe("DEFAULT_CITY", () => {
  it("서울이다", () => {
    expect(DEFAULT_CITY.name).toBe("서울");
  });
});
