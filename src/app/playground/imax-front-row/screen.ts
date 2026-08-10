/**
 * IMAX 스크린의 기하.
 *
 * 왜곡을 흉내내지 않는다. 실제 규격의 곡면 스크린을 3D 공간에 세워 두고
 * 1열 눈높이에서 투영하면, 사다리꼴 원근과 좌우 감김이 전부 결과로 따라 나온다.
 * 그래서 이 파일에는 "왜곡"이라는 개념 자체가 없다. 스크린이 실제로 놓인
 * 자리만 적혀 있다.
 *
 * 좌표계: X 오른쪽, Y 위, Z 관객 쪽. 원점은 스크린 중앙 하단 바로 아래 바닥.
 * 스크린 중앙은 Z=0 평면에 있고 관객은 Z 양수 쪽에 앉는다.
 */

export type Vec3 = readonly [number, number, number];

/** IMAX GT 규격에서 가져온 값. 단위는 미터 */
export const SCREEN = {
  /** 호를 따라 잰 폭 */
  width: 22,
  height: 16,
  /** 하단 모서리가 바닥에서 뜬 높이 */
  bottom: 1,
  /**
   * 수평 곡률 반경. 곡률 중심이 관객 쪽에 있어 좌우 끝이 관객을 감싼다.
   * 실제 GT 스크린보다 조금 완만하게 잡았다 — 규격대로 26m보다 조이면
   * 좌우 끝이 시선에서 90°에 붙어 투영이 발산한다.
   */
  radius: 26,
  /** 상단이 관객 쪽으로 기운 각도(라디안). 하단 모서리를 축으로 돈다 */
  tilt: (3 * Math.PI) / 180,
} as const;

/** IMAX 1.43:1 */
export const SCREEN_ASPECT = 1.43;

/**
 * 스크린 표면 위의 점.
 *
 * @param u 가로 0(왼쪽 끝) ~ 1(오른쪽 끝)
 * @param v 세로 0(아래) ~ 1(위)
 */
export function screenPoint(u: number, v: number): Vec3 {
  // 호 길이를 각도로. 중앙이 0
  const theta = ((u - 0.5) * SCREEN.width) / SCREEN.radius;
  const x = SCREEN.radius * Math.sin(theta);
  // 곡률 중심이 관객 쪽(Z 양수)이라 끝으로 갈수록 관객에게 다가온다
  const zCurve = SCREEN.radius * (1 - Math.cos(theta));

  // 하단 모서리를 축으로 기울인다. 위로 갈수록 관객 쪽으로 나온다
  const up = v * SCREEN.height;
  const y = SCREEN.bottom + up * Math.cos(SCREEN.tilt);
  const z = zCurve + up * Math.sin(SCREEN.tilt);

  return [x, y, z];
}

export interface ScreenMesh {
  /** 정점 위치 xyz, 3개씩 */
  positions: Float32Array<ArrayBuffer>;
  /** 정점 uv, 2개씩 */
  uvs: Float32Array<ArrayBuffer>;
  /** 삼각형 인덱스 */
  indices: Uint16Array<ArrayBuffer>;
  vertexCount: number;
}

/**
 * 곡면을 삼각형 격자로 쪼갠다.
 *
 * 격자가 촘촘해야 하는 이유는 곡률 때문만이 아니다. 1열에서는 스크린 아래쪽이
 * 코앞이고 위쪽이 멀어서 삼각형 하나가 화면에서 차지하는 크기 차이가 극단적이다.
 * 성기게 자르면 원근 보정이 삼각형 안에서 선형으로 뭉개져 텍스처가 접힌다.
 */
export function buildScreenMesh(cols = 64, rows = 48): ScreenMesh {
  const positions = new Float32Array((cols + 1) * (rows + 1) * 3);
  const uvs = new Float32Array((cols + 1) * (rows + 1) * 2);

  let p = 0;
  let t = 0;
  for (let row = 0; row <= rows; row++) {
    const v = row / rows;
    for (let col = 0; col <= cols; col++) {
      const u = col / cols;
      const [x, y, z] = screenPoint(u, v);
      positions[p++] = x;
      positions[p++] = y;
      positions[p++] = z;
      uvs[t++] = u;
      uvs[t++] = v;
    }
  }

  const indices = new Uint16Array(cols * rows * 6);
  let i = 0;
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      const a = row * (cols + 1) + col;
      const b = a + 1;
      const c = a + (cols + 1);
      const d = c + 1;
      indices[i++] = a;
      indices[i++] = c;
      indices[i++] = b;
      indices[i++] = b;
      indices[i++] = c;
      indices[i++] = d;
    }
  }

  return { positions, uvs, indices, vertexCount: indices.length };
}

export interface CropUv {
  /** uv에 곱할 배율 */
  scale: readonly [number, number];
  /** 곱한 뒤 더할 값 */
  offset: readonly [number, number];
}

/**
 * 웹캠 프레임을 1.43:1로 센터 크롭하는 UV 변환.
 *
 * 얼굴을 찾아 맞추지 않는다. 방 전체가 스크린에 걸리는 편이 밈에 더 맞고,
 * 얼굴 검출을 넣는 순간 모델 로딩과 실패 경로가 통째로 딸려 온다.
 *
 * `mirror`는 셀피 반전이다. 거울처럼 보이지 않으면 고개를 어느 쪽으로
 * 돌려야 할지 헷갈린다.
 */
export function cropUv(
  videoWidth: number,
  videoHeight: number,
  mirror = true,
): CropUv {
  // 영상이 아직 안 왔을 때 0으로 나누지 않는다
  if (videoWidth <= 0 || videoHeight <= 0) {
    return { scale: [mirror ? -1 : 1, 1], offset: [mirror ? 1 : 0, 0] };
  }

  const videoAspect = videoWidth / videoHeight;
  let sx = 1;
  let sy = 1;
  if (videoAspect > SCREEN_ASPECT) {
    // 영상이 더 넓다 — 좌우를 잘라낸다
    sx = SCREEN_ASPECT / videoAspect;
  } else {
    // 영상이 더 높다 — 위아래를 잘라낸다
    sy = videoAspect / SCREEN_ASPECT;
  }

  const ox = (1 - sx) / 2;
  const oy = (1 - sy) / 2;

  // v는 뒤집는다. 텍스처는 위에서 아래로 가고 스크린 v는 아래에서 위로 간다
  return mirror
    ? { scale: [-sx, -sy], offset: [ox + sx, oy + sy] }
    : { scale: [sx, -sy], offset: [ox, oy + sy] };
}
