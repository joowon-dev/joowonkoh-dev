import { describe, expect, it } from "vitest";
import type { View } from "./camera";
import { TILE_ATTRIBUTION, tileUrl, visibleTiles } from "./tiles";

const VIEW: View = { centerLat: 37.5, centerLon: 127.0, zoom: 12 };
const SIZE = { w: 1080, h: 1080 };

describe("tileUrl", () => {
  it("z/x/y를 끼워 넣는다", () => {
    const url = tileUrl(12, 3494, 1585);
    expect(url).toContain("/12/3494/1585");
    expect(url).toMatch(/^https:\/\//);
  });

  it("2배 해상도 타일을 요청한다 — 1080p 영상에서 1배 타일은 뭉개진다", () => {
    expect(tileUrl(12, 1, 1)).toContain("@2x");
  });
});

describe("visibleTiles", () => {
  it("화면을 덮을 만큼 준다", () => {
    const tiles = visibleTiles(VIEW, SIZE);
    expect(tiles.length).toBeGreaterThan(0);
    expect(tiles.length).toBeLessThan(200); // 폭주하지 않는다
  });

  it("정수 줌 레벨을 쓴다 — 타일 서버는 소수 z를 모른다", () => {
    const tiles = visibleTiles({ ...VIEW, zoom: 12.7 }, SIZE);
    expect(tiles.every((t) => Number.isInteger(t.z))).toBe(true);
  });

  it("타일 좌표가 그 줌의 범위 안에 든다", () => {
    const tiles = visibleTiles(VIEW, SIZE);
    for (const t of tiles) {
      const max = 2 ** t.z;
      expect(t.x).toBeGreaterThanOrEqual(0);
      expect(t.x).toBeLessThan(max);
      expect(t.y).toBeGreaterThanOrEqual(0);
      expect(t.y).toBeLessThan(max);
    }
  });

  it("화면이 커지면 타일이 늘어난다", () => {
    const small = visibleTiles(VIEW, { w: 480, h: 480 });
    const big = visibleTiles(VIEW, { w: 1920, h: 1080 });
    expect(big.length).toBeGreaterThan(small.length);
  });

  it("중복 타일을 주지 않는다", () => {
    const tiles = visibleTiles(VIEW, SIZE);
    const keys = new Set(tiles.map((t) => `${t.z}/${t.x}/${t.y}`));
    expect(keys.size).toBe(tiles.length);
  });
});

describe("저작권 표기", () => {
  it("타일 출처를 담고 있다", () => {
    expect(TILE_ATTRIBUTION).toContain("OpenStreetMap");
    expect(TILE_ATTRIBUTION).toContain("CARTO");
  });
});
