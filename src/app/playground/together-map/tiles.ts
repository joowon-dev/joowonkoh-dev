import { TILE_SIZE, type View } from "./camera";
import { projectMercator } from "./geo";
import type { Size } from "./render";

/**
 * CARTO의 밝은 무채색 지도. 궤적 색이 살아야 해서 배경이 조용한 것을 골랐다.
 * 컬러 지도를 깔면 두 사람의 선이 도로 색에 묻힌다.
 */
export const TILE_URL_TEMPLATE =
  "https://basemaps.cartocdn.com/light_all/{z}/{x}/{y}@2x.png";

/** 지도 위에 반드시 표시해야 한다. 타일 제공자의 이용 조건이다. */
export const TILE_ATTRIBUTION = "© OpenStreetMap contributors © CARTO";

export interface TileRef {
  z: number;
  x: number;
  y: number;
  /** 캔버스에 그릴 왼쪽 위 좌표. */
  screenX: number;
  screenY: number;
  /** 그릴 크기(px). 소수 줌을 정수 줌으로 맞추느라 256이 아닐 수 있다. */
  size: number;
}

export function tileUrl(z: number, x: number, y: number): string {
  return TILE_URL_TEMPLATE.replace("{z}", String(z))
    .replace("{x}", String(x))
    .replace("{y}", String(y));
}

/**
 * 지금 화면을 덮는 타일 목록.
 *
 * 시야의 줌은 소수인데 타일 서버는 정수 레벨만 안다. 반올림한 정수 레벨에서
 * 타일을 받아 와 소수 차이만큼 늘려 그린다. 내림이 아니라 반올림인 것은,
 * 내리면 항상 흐린 쪽으로 치우치기 때문이다.
 */
export function visibleTiles(view: View, size: Size): TileRef[] {
  const z = Math.max(0, Math.min(19, Math.round(view.zoom)));
  const scale = 2 ** (view.zoom - z);
  const drawSize = TILE_SIZE * scale;
  const worldTiles = 2 ** z;

  const center = projectMercator({ lat: view.centerLat, lon: view.centerLon });
  const centerTileX = center.x * worldTiles;
  const centerTileY = center.y * worldTiles;

  const halfW = size.w / 2 / drawSize;
  const halfH = size.h / 2 / drawSize;

  const minX = Math.floor(centerTileX - halfW);
  const maxX = Math.ceil(centerTileX + halfW);
  const minY = Math.floor(centerTileY - halfH);
  const maxY = Math.ceil(centerTileY + halfH);

  const tiles: TileRef[] = [];
  for (let x = minX; x <= maxX; x += 1) {
    for (let y = minY; y <= maxY; y += 1) {
      // 세로는 감싸지 않는다 — 극지방 바깥엔 타일이 없다
      if (y < 0 || y >= worldTiles) continue;
      // 가로는 감싼다 — 날짜변경선을 넘어가도 지도는 이어진다
      const wrappedX = ((x % worldTiles) + worldTiles) % worldTiles;

      tiles.push({
        z,
        x: wrappedX,
        y,
        screenX: (x - centerTileX) * drawSize + size.w / 2,
        screenY: (y - centerTileY) * drawSize + size.h / 2,
        size: drawSize,
      });
    }
  }

  return tiles;
}

/**
 * 받아 온 타일을 담아 둔다.
 *
 * crossOrigin을 반드시 anonymous로 둔다. 이걸 빠뜨리면 캔버스가 «오염»되어
 * captureStream이 통째로 막히고, 영상 저장이 아무 설명 없이 실패한다.
 */
export class TileCache {
  private images = new Map<string, HTMLImageElement>();
  private pending = new Set<string>();

  constructor(private onLoad: () => void) {}

  /** 이미 받아 둔 타일이면 준다. 없으면 받기 시작하고 null을 준다. */
  get(ref: TileRef): HTMLImageElement | null {
    const key = `${ref.z}/${ref.x}/${ref.y}`;
    const hit = this.images.get(key);
    if (hit) return hit;
    if (this.pending.has(key)) return null;

    this.pending.add(key);
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      this.images.set(key, img);
      this.pending.delete(key);
      this.onLoad();
    };
    img.onerror = () => {
      this.pending.delete(key);
    };
    img.src = tileUrl(ref.z, ref.x, ref.y);
    return null;
  }

  /** 아직 받는 중인 타일 수. 영상 만들기 전에 0이 되기를 기다린다. */
  get pendingCount(): number {
    return this.pending.size;
  }
}
