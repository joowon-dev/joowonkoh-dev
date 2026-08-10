import { describe, expect, it } from "vitest";
import { screenPoint, SCREEN, buildScreenMesh } from "./screen";
import {
  BASE_LOOK,
  EYE,
  VIEW,
  azimuthTo,
  clampLook,
  elevationTo,
  lookDirection,
  toNdc,
  transformPoint,
  viewProjection,
} from "./seat";

const deg = (rad: number) => (rad * 180) / Math.PI;

/**
 * 이 파일이 지키는 것은 "코드가 돈다"가 아니라 "이게 1열이 맞다"이다.
 * 좌석 수치를 누가 편하게 고쳐놓으면 왜곡이 사라지고 그냥 평범한 화면이 되는데,
 * 그건 눈으로 보기 전엔 티가 안 난다.
 */
describe("1열인지", () => {
  it("스크린 꼭대기를 보려면 65°보다 더 젖혀야 한다", () => {
    const top = screenPoint(0.5, 1);
    expect(deg(elevationTo(top))).toBeGreaterThan(65);
  });

  it("스크린 아래 모서리는 눈높이보다 낮다", () => {
    const bottom = screenPoint(0.5, 0);
    expect(deg(elevationTo(bottom))).toBeLessThan(0);
  });

  it("스크린 좌우 끝은 가로 화각 밖으로 넘친다", () => {
    // 16:9에서의 반쪽 가로 화각
    const halfH = Math.atan(Math.tan(VIEW.fovY / 2) * (16 / 9));
    const edge = azimuthTo(screenPoint(1, 0.5));
    expect(edge).toBeGreaterThan(halfH);
  });

  it("눈은 스크린 앞에 있다", () => {
    expect(EYE[2]).toBeGreaterThan(screenPoint(0.5, 0.5)[2]);
  });
});

describe("스크린 기하", () => {
  it("좌우 끝이 중앙보다 관객 쪽으로 나와 있다", () => {
    const center = screenPoint(0.5, 0);
    const left = screenPoint(0, 0);
    const right = screenPoint(1, 0);
    expect(left[2]).toBeGreaterThan(center[2]);
    expect(right[2]).toBeGreaterThan(center[2]);
    expect(left[2]).toBeCloseTo(right[2], 6);
  });

  it("위로 갈수록 관객 쪽으로 기운다", () => {
    expect(screenPoint(0.5, 1)[2]).toBeGreaterThan(screenPoint(0.5, 0)[2]);
  });

  it("곡률 중심에 앉으면 스크린 어느 지점이든 거리가 같다", () => {
    /*
     * IMAX가 스크린을 휘는 이유가 이것이다. 반경 R짜리 원통은 곡률 중심에
     * 앉은 사람에게 모든 지점이 R만큼 떨어져 보인다. 그래서 SCREEN.radius는
     * 임의로 고른 «휜 정도»가 아니라 기준 좌석까지의 거리다.
     */
    const center: [number, number, number] = [0, SCREEN.bottom, SCREEN.radius];
    for (let u = 0; u <= 1; u += 0.1) {
      const p = screenPoint(u, 0);
      const d = Math.hypot(p[0] - center[0], p[1] - center[1], p[2] - center[2]);
      expect(d).toBeCloseTo(SCREEN.radius, 6);
    }
  });

  it("호 길이가 규격 폭과 맞는다", () => {
    let length = 0;
    let prev = screenPoint(0, 0);
    for (let i = 1; i <= 2000; i++) {
      const p = screenPoint(i / 2000, 0);
      length += Math.hypot(p[0] - prev[0], p[2] - prev[2]);
      prev = p;
    }
    expect(length).toBeCloseTo(SCREEN.width, 2);
  });

  it("메시 인덱스가 정점 범위를 안 벗어난다", () => {
    const mesh = buildScreenMesh(8, 6);
    const vertices = mesh.positions.length / 3;
    expect(Math.max(...mesh.indices)).toBe(vertices - 1);
    expect(mesh.vertexCount).toBe(8 * 6 * 6);
  });
});

describe("투영", () => {
  const vp = viewProjection(16 / 9, BASE_LOOK);

  it("스크린의 모든 점이 카메라 앞에 있다", () => {
    // w가 0을 스치면 투영이 발산해 화면이 찢어진다. 곡률·기울기를 조이다
    // 좌우 끝이 90°에 붙는 순간 이게 터진다
    for (let u = 0; u <= 1; u += 0.05) {
      for (let v = 0; v <= 1; v += 0.05) {
        const clip = transformPoint(vp, screenPoint(u, v));
        expect(clip[3]).toBeGreaterThan(0.5);
      }
    }
  });

  it("아래가 위보다 넓게 퍼진다", () => {
    const widthAt = (v: number) => {
      const l = toNdc(transformPoint(vp, screenPoint(0, v)));
      const r = toNdc(transformPoint(vp, screenPoint(1, v)));
      if (!l || !r) throw new Error("카메라 뒤");
      return r[0] - l[0];
    };
    // 코앞인 아래쪽이 훨씬 크게 벌어져야 사다리꼴이 된다
    expect(widthAt(0)).toBeGreaterThan(widthAt(1) * 3);
  });

  it("아래 모서리가 위 모서리보다 화면에서 아래에 찍힌다", () => {
    const bottom = toNdc(transformPoint(vp, screenPoint(0.5, 0)));
    const top = toNdc(transformPoint(vp, screenPoint(0.5, 1)));
    expect(bottom![1]).toBeLessThan(top![1]);
  });

  it("스크린이 위아래로 프레임을 넘친다", () => {
    /*
     * 스크린 전체가 프레임 안에 들어오면 1열이 아니다. 그건 큰 화면을 멀리서
     * 보는 그림이고, 1열의 정체는 «한눈에 안 들어온다»는 것이다. 화각을
     * 넓히다 보면 다 보이게 되는데, 그 순간 이 페이지의 이유가 사라진다.
     */
    const bottom = toNdc(transformPoint(vp, screenPoint(0.5, 0)))!;
    const top = toNdc(transformPoint(vp, screenPoint(0.5, 1)))!;
    expect(bottom[1]).toBeLessThan(-1);
    expect(top[1]).toBeGreaterThan(1);
  });

  it("화면 한복판은 늘 스크린이다", () => {
    // 넘치게 만들다가 조준이 어긋나면 정면에 벽이 걸린다
    const middle = [0.5, 0.35, 0.65].map((v) => toNdc(transformPoint(vp, screenPoint(0.5, v)))!);
    expect(middle.some((p) => Math.abs(p[1]) < 0.5)).toBe(true);
  });

  it("카메라 뒤에 있는 점은 좌표를 내지 않는다", () => {
    expect(toNdc([1, 1, 1, 0])).toBeNull();
    expect(toNdc([1, 1, 1, -2])).toBeNull();
  });
});

describe("고개 돌리기", () => {
  it("정면일 때 스크린 쪽(-Z)을 본다", () => {
    const [x, y, z] = lookDirection({ yaw: 0, pitch: 0 });
    expect(x).toBeCloseTo(0);
    expect(y).toBeCloseTo(0);
    expect(z).toBeCloseTo(-1);
  });

  it("yaw가 양수면 오른쪽을 본다", () => {
    expect(lookDirection({ yaw: 0.3, pitch: 0 })[0]).toBeGreaterThan(0);
  });

  it("pitch가 양수면 위를 본다", () => {
    expect(lookDirection({ yaw: 0, pitch: 0.3 })[1]).toBeGreaterThan(0);
  });

  it("한계를 넘겨도 클램프된다", () => {
    const wild = clampLook({ yaw: 99, pitch: -99 });
    expect(wild.yaw).toBe(VIEW.yawLimit);
    expect(wild.pitch).toBe(VIEW.pitchMin);
  });

  it("한계 안의 시선은 건드리지 않는다", () => {
    expect(clampLook(BASE_LOOK)).toEqual(BASE_LOOK);
  });

  it("고개를 최대로 돌려도 스크린이 화면에서 완전히 사라지진 않는다", () => {
    // 다 돌렸더니 검은 벽만 남으면 뭘 하는 페이지인지 알 수 없게 된다
    const vp = viewProjection(16 / 9, clampLook({ yaw: VIEW.yawLimit, pitch: VIEW.pitchMax }));
    const anyVisible = [0, 0.25, 0.5, 0.75, 1].some((u) =>
      [0, 0.5, 1].some((v) => {
        const ndc = toNdc(transformPoint(vp, screenPoint(u, v)));
        return ndc !== null && Math.abs(ndc[0]) < 1 && Math.abs(ndc[1]) < 1;
      }),
    );
    expect(anyVisible).toBe(true);
  });
});
