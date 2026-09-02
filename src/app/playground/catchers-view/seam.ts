/**
 * 야구공 실밥 지도.
 *
 * 실밥을 프래그먼트 셰이더에서 매번 곡선까지 거리로 풀면, 공이 화면을 채우는
 * 마지막 순간에 픽셀 하나당 수백 번씩 돌게 된다. 그 순간이 이 페이지에서 제일
 * 중요한 프레임인데 거기서 끊기면 만든 의미가 없다.
 *
 * 그래서 시작할 때 한 번 «구 표면의 각 방향이 실밥에서 얼마나 가까운가»를
 * 그려 두고, 셰이더는 텍스처를 한 번 읽기만 한다. 이미지 파일을 받아오지
 * 않으므로 네트워크에 의존하지도 않는다.
 */

/** 실밥 곡선. 테니스공/야구공 실밥의 표준 매개변수 표현 */
export function seamPoint(t: number): [number, number, number] {
  const x = 0.7 * Math.cos(t) + 0.3 * Math.cos(3 * t);
  const y = 0.7 * Math.sin(t) - 0.3 * Math.sin(3 * t);
  const z = 0.6 * Math.sin(2 * t);
  const l = Math.hypot(x, y, z);
  return [x / l, y / l, z / l];
}

/** 실밥 굵기(rad). 실제 공에서 눈에 보이는 정도 */
const SEAM_WIDTH = 0.085;
/** 곡선을 이만큼 쪼개 최단거리를 잰다 */
const CURVE_SAMPLES = 256;

export interface SeamMap {
  width: number;
  height: number;
  /** 0 = 실밥에서 멂, 255 = 실밥 한가운데 */
  data: Uint8Array;
}

/**
 * 정거원통 도법으로 편 실밥 지도.
 *
 * u는 경도(0~2π), v는 위도(위쪽이 +y). 셰이더에서 공 표면 법선을 몸통
 * 좌표로 되돌린 뒤 같은 방식으로 읽는다.
 */
export function seamMap(width = 192, height = 96): SeamMap {
  const curve: [number, number, number][] = [];
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    curve.push(seamPoint((i / CURVE_SAMPLES) * Math.PI * 2));
  }

  const data = new Uint8Array(width * height);
  for (let j = 0; j < height; j++) {
    // 텍셀 중심으로 잡는다. 가장자리를 쓰면 극에서 한 줄이 뭉갠다
    const polar = ((j + 0.5) / height) * Math.PI;
    const sinPolar = Math.sin(polar);
    const ny = Math.cos(polar);

    for (let i = 0; i < width; i++) {
      const azimuth = ((i + 0.5) / width) * Math.PI * 2;
      const nx = sinPolar * Math.cos(azimuth);
      const nz = sinPolar * Math.sin(azimuth);

      let best = 4;
      for (const [cx, cy, cz] of curve) {
        const d = (nx - cx) ** 2 + (ny - cy) ** 2 + (nz - cz) ** 2;
        if (d < best) best = d;
      }
      // 현의 길이를 각거리로 되돌린다
      const angle = 2 * Math.asin(Math.min(1, Math.sqrt(best) / 2));
      const strength = 1 - Math.min(1, angle / SEAM_WIDTH);
      data[j * width + i] = Math.round(strength * 255);
    }
  }

  return { width, height, data };
}

/** 시험과 디버깅용 — 지도를 안 만들고 방향 하나만 재 본다 */
export function seamStrengthAt(nx: number, ny: number, nz: number): number {
  let best = 4;
  for (let i = 0; i < CURVE_SAMPLES; i++) {
    const [cx, cy, cz] = seamPoint((i / CURVE_SAMPLES) * Math.PI * 2);
    const d = (nx - cx) ** 2 + (ny - cy) ** 2 + (nz - cz) ** 2;
    if (d < best) best = d;
  }
  const angle = 2 * Math.asin(Math.min(1, Math.sqrt(best) / 2));
  return 1 - Math.min(1, angle / SEAM_WIDTH);
}
