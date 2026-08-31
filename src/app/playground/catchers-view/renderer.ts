/**
 * 그리는 순서를 쥐고 있는 곳. 계산은 전부 다른 모듈에서 끝나 있고
 * 여기서는 유니폼을 채워 넣고 세 번 그리기만 한다.
 *
 *   1. 배경  — 하늘·잔디·흙·투수 실루엣
 *   2. 궤적선 — 지난 공들이 남긴 자국, 그리고 스트라이크존
 *   3. 공     — 마지막에 그려 무엇에도 가리지 않게
 */

import { link, makeBuffer, resizeCanvas } from "./gl";
import { BALL_FRAGMENT, LINE_FRAGMENT, LINE_VERTEX, QUAD_VERTEX, SCENE_FRAGMENT } from "./shaders";
import { BALL_RADIUS, type Vec3 } from "./flight";
import type { Camera } from "./camera";
import { buildRibbons } from "./ribbon";
import { seamMap } from "./seam";
import { BASES, fielderUniform } from "./field";

/** 조명은 포수 쪽 위에서 온다. 날아오는 면이 밝아야 실밥이 보인다 */
const LIGHT: Vec3 = { x: -0.35, y: 0.85, z: -0.4 };

export interface TrailLayer {
  points: readonly Vec3[];
  color: [number, number, number];
  opacity: number;
  width: number;
  fade?: (progress: number) => number;
}

export interface Scene {
  camera: Camera;
  /** 0 밤 → 1 낮. 토글이 이 값을 애니메이션한다 */
  daylight: number;
  /** 마운드 위 실루엣 */
  pitcher: { x: number; z: number; handSign: 1 | -1; armPhase: number };
  /** 날고 있는 공. 없으면 안 그린다 */
  ball: { center: Vec3; toBody: Float32Array; fade: number } | null;
  trails: TrailLayer[];
}

export interface Renderer {
  draw(scene: Scene): void;
  dispose(): void;
}

/**
 * 축-각도 회전을 «월드 법선 → 공 몸통 좌표» 3×3 행렬로 만든다.
 * 셰이더가 이걸로 법선을 되돌려 실밥 지도를 읽는다.
 */
export function toBodyMatrix(axis: Vec3, angle: number): Float32Array {
  const l = Math.hypot(axis.x, axis.y, axis.z) || 1;
  const x = axis.x / l;
  const y = axis.y / l;
  const z = axis.z / l;
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  const k = 1 - c;

  // 로드리게스 회전 행렬 R을 행 우선으로 적는다. WebGL의 mat3는 열 우선으로
  // 읽으므로, 이 배열을 그대로 넘기면 저쪽에서 Rᵀ — 즉 역회전 — 이 된다.
  // 우리에게 필요한 게 «월드 → 몸통»이라 전치를 따로 하지 않는다.
  return new Float32Array([
    c + x * x * k, x * y * k - z * s, x * z * k + y * s,
    y * x * k + z * s, c + y * y * k, y * z * k - x * s,
    z * x * k - y * s, z * y * k + x * s, c + z * z * k,
  ]);
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const context = canvas.getContext("webgl2", { antialias: true, alpha: false });
  if (!context) throw new Error("이 브라우저에서는 WebGL2를 쓸 수 없습니다");
  // 아래 클로저들이 나중에 불리므로, 좁혀진 타입을 이름에 못 박아 둔다
  const gl: WebGL2RenderingContext = context;

  const scene = link(gl, QUAD_VERTEX, SCENE_FRAGMENT);
  const ball = link(gl, QUAD_VERTEX, BALL_FRAGMENT);
  const lines = link(gl, LINE_VERTEX, LINE_FRAGMENT);

  const quad = makeBuffer(
    gl,
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]), // 화면을 덮는 큰 삼각형 하나
  );

  const ribbonPositions = gl.createBuffer()!;
  const ribbonAlphas = gl.createBuffer()!;

  // 실밥 지도는 시작할 때 한 번 만든다
  const map = seamMap();
  const seamTexture = gl.createTexture()!;
  gl.bindTexture(gl.TEXTURE_2D, seamTexture);
  gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
  gl.texImage2D(
    gl.TEXTURE_2D, 0, gl.R8, map.width, map.height, 0, gl.RED, gl.UNSIGNED_BYTE, map.data,
  );
  // 경도는 이어 붙고 위도는 극에서 끝난다
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.REPEAT);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);

  // 구장 좌표는 한 번도 안 바뀌므로 링크 직후에 한 번만 넣는다
  const bases = new Float32Array(BASES.flatMap((b) => [b.x, b.z, 0]));
  gl.useProgram(scene.program);
  gl.uniform3fv(scene.uniform("uBases"), bases);
  gl.uniform3fv(scene.uniform("uFielders"), fielderUniform());

  gl.enable(gl.BLEND);
  gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

  function bindQuad(program: WebGLProgram) {
    const location = gl.getAttribLocation(program, "aPos");
    gl.bindBuffer(gl.ARRAY_BUFFER, quad);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, 2, gl.FLOAT, false, 0, 0);
  }

  /** 카메라는 세 패스가 똑같이 쓴다. 하나라도 어긋나면 공이 배경에서 뜬다 */
  function setCamera(program: ReturnType<typeof link>, camera: Camera) {
    gl.uniform3f(program.uniform("uEye"), camera.eye.x, camera.eye.y, camera.eye.z);
    gl.uniform3f(
      program.uniform("uForward"), camera.forward.x, camera.forward.y, camera.forward.z,
    );
    gl.uniform3f(program.uniform("uRight"), camera.right.x, camera.right.y, camera.right.z);
    gl.uniform3f(program.uniform("uUp"), camera.up.x, camera.up.y, camera.up.z);
    gl.uniform1f(program.uniform("uTanHalfFov"), camera.tanHalfFov);
    gl.uniform1f(program.uniform("uAspect"), camera.aspect);
  }

  function draw(state: Scene) {
    resizeCanvas(canvas);
    gl.viewport(0, 0, canvas.width, canvas.height);

    // 1. 배경
    gl.useProgram(scene.program);
    bindQuad(scene.program);
    setCamera(scene, state.camera);
    gl.uniform1f(scene.uniform("uPitcherX"), state.pitcher.x);
    gl.uniform1f(scene.uniform("uPitcherZ"), state.pitcher.z);
    gl.uniform1f(scene.uniform("uHand"), state.pitcher.handSign);
    gl.uniform1f(scene.uniform("uArmPhase"), state.pitcher.armPhase);
    gl.uniform1f(scene.uniform("uDaylight"), state.daylight);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // 2. 궤적선
    gl.useProgram(lines.program);
    const positionLocation = gl.getAttribLocation(lines.program, "aPos");
    const alphaLocation = gl.getAttribLocation(lines.program, "aAlpha");
    for (const layer of state.trails) {
      gl.uniform3f(lines.uniform("uColor"), layer.color[0], layer.color[1], layer.color[2]);
      gl.uniform1f(lines.uniform("uOpacity"), layer.opacity);

      for (const ribbon of buildRibbons(state.camera, layer.points, {
        width: layer.width,
        fade: layer.fade,
      })) {
        gl.bindBuffer(gl.ARRAY_BUFFER, ribbonPositions);
        gl.bufferData(gl.ARRAY_BUFFER, ribbon.positions, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, ribbonAlphas);
        gl.bufferData(gl.ARRAY_BUFFER, ribbon.alphas, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(alphaLocation);
        gl.vertexAttribPointer(alphaLocation, 1, gl.FLOAT, false, 0, 0);

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, ribbon.count);
      }
    }

    // 3. 공
    if (state.ball) {
      gl.useProgram(ball.program);
      bindQuad(ball.program);
      setCamera(ball, state.camera);
      gl.uniform3f(
        ball.uniform("uCenter"),
        state.ball.center.x, state.ball.center.y, state.ball.center.z,
      );
      gl.uniform1f(ball.uniform("uRadius"), BALL_RADIUS);
      gl.uniformMatrix3fv(ball.uniform("uToBody"), false, state.ball.toBody);
      gl.uniform3f(ball.uniform("uLight"), LIGHT.x, LIGHT.y, LIGHT.z);
      gl.uniform1f(ball.uniform("uFade"), state.ball.fade);
      gl.uniform1f(ball.uniform("uDaylight"), state.daylight);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, seamTexture);
      gl.uniform1i(ball.uniform("uSeam"), 0);
      gl.drawArrays(gl.TRIANGLES, 0, 3);
    }
  }

  function dispose() {
    gl.deleteProgram(scene.program);
    gl.deleteProgram(ball.program);
    gl.deleteProgram(lines.program);
    gl.deleteBuffer(quad);
    gl.deleteBuffer(ribbonPositions);
    gl.deleteBuffer(ribbonAlphas);
    gl.deleteTexture(seamTexture);
  }

  return { draw, dispose };
}
