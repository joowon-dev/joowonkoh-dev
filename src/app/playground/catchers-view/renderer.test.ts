import { describe, expect, it } from "vitest";
import { toBodyMatrix } from "./renderer";
import type { Vec3 } from "./flight";

/** 셰이더가 `uToBody * n`으로 하는 것과 같은 곱셈 (열 우선 mat3) */
function apply(m: Float32Array, v: Vec3): Vec3 {
  return {
    x: m[0] * v.x + m[3] * v.y + m[6] * v.z,
    y: m[1] * v.x + m[4] * v.y + m[7] * v.z,
    z: m[2] * v.x + m[5] * v.y + m[8] * v.z,
  };
}

describe("toBodyMatrix", () => {
  const axis: Vec3 = { x: 0, y: 1, z: 0 };

  it("회전이 없으면 항등행렬이다", () => {
    const m = toBodyMatrix(axis, 0);
    expect([...m]).toEqual([1, 0, 0, 0, 1, 0, 0, 0, 1]);
  });

  it("공을 돌린 만큼 법선을 되돌린다", () => {
    // 몸통의 +z를 보던 표면은 y축 90° 회전 뒤 세계의 +x에 가 있다.
    // 그 표면의 실밥을 찾으려면 +x를 다시 +z로 되돌려야 한다
    const m = toBodyMatrix(axis, Math.PI / 2);
    const back = apply(m, { x: 1, y: 0, z: 0 });
    expect(back.x).toBeCloseTo(0, 6);
    expect(back.y).toBeCloseTo(0, 6);
    expect(back.z).toBeCloseTo(1, 6);
  });

  it("회전축 위의 방향은 그대로다", () => {
    const m = toBodyMatrix({ x: 0.3, y: 0.5, z: -0.8 }, 1.1);
    const a = { x: 0.3, y: 0.5, z: -0.8 };
    const l = Math.hypot(a.x, a.y, a.z);
    const unit = { x: a.x / l, y: a.y / l, z: a.z / l };
    const out = apply(m, unit);
    expect(out.x).toBeCloseTo(unit.x, 6);
    expect(out.y).toBeCloseTo(unit.y, 6);
    expect(out.z).toBeCloseTo(unit.z, 6);
  });

  it("길이를 바꾸지 않는다", () => {
    const m = toBodyMatrix({ x: 1, y: 2, z: 3 }, 2.4);
    const out = apply(m, { x: 0.6, y: -0.8, z: 0 });
    expect(Math.hypot(out.x, out.y, out.z)).toBeCloseTo(1, 6);
  });

  it("정규화되지 않은 축도 받는다", () => {
    const unit = toBodyMatrix({ x: 0, y: 1, z: 0 }, 0.7);
    const long = toBodyMatrix({ x: 0, y: 9, z: 0 }, 0.7);
    for (let i = 0; i < 9; i++) expect(long[i]).toBeCloseTo(unit[i], 6);
  });

  it("반대로 돌리면 되돌아온다", () => {
    const forward = toBodyMatrix(axis, 0.9);
    const backward = toBodyMatrix(axis, -0.9);
    const n: Vec3 = { x: 0.5, y: 0.2, z: -0.84 };
    const round = apply(backward, apply(forward, n));
    expect(round.x).toBeCloseTo(n.x, 6);
    expect(round.z).toBeCloseTo(n.z, 6);
  });
});
