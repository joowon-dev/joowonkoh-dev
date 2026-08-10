/**
 * 그리는 쪽. React를 모르고, 웹캠 권한도 모른다. 매 프레임 상태를 받아
 * 캔버스에 한 장을 그리는 일만 한다.
 */

import { flicker, gateWeave, type Rgb } from "./ambience";
import { createVideoTexture, link, makeBuffer, resizeCanvas, type Program } from "./gl";
import { buildScreenMesh, cropUv, screenPoint, SCREEN } from "./screen";
import {
  EYE,
  VIEW,
  cameraBasis,
  screenModelMatrix,
  viewProjection,
  type Look,
} from "./seat";
import { ROOM_FRAGMENT, ROOM_VERTEX, SCREEN_FRAGMENT, SCREEN_VERTEX } from "./shaders";

export interface FrameState {
  video: HTMLVideoElement;
  look: Look;
  /** 초 단위 경과 시간 */
  time: number;
  /** 상영관에 번지는 색 */
  spill: Rgb;
}

export interface Renderer {
  frame(state: FrameState): void;
  dispose(): void;
}

const SCREEN_CENTER = screenPoint(0.5, 0.5);

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    // 어두운 화면이라 노트북에서 굳이 외장 GPU를 깨울 이유가 없다
    powerPreference: "default",
    desynchronized: true,
  });
  if (!gl) throw new Error("WebGL2를 쓸 수 없습니다");

  const room: Program = link(gl, ROOM_VERTEX, ROOM_FRAGMENT);
  const screen: Program = link(gl, SCREEN_VERTEX, SCREEN_FRAGMENT);

  // 전체화면 삼각형 두 장
  const quadVao = gl.createVertexArray()!;
  gl.bindVertexArray(quadVao);
  const quadBuffer = makeBuffer(
    gl,
    gl.ARRAY_BUFFER,
    new Float32Array([-1, -1, 3, -1, -1, 3]),
  );
  const roomPos = gl.getAttribLocation(room.program, "aPos");
  gl.enableVertexAttribArray(roomPos);
  gl.vertexAttribPointer(roomPos, 2, gl.FLOAT, false, 0, 0);

  // 곡면 스크린
  const mesh = buildScreenMesh();
  const meshVao = gl.createVertexArray()!;
  gl.bindVertexArray(meshVao);
  const posBuffer = makeBuffer(gl, gl.ARRAY_BUFFER, mesh.positions);
  const aPos = gl.getAttribLocation(screen.program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);
  const uvBuffer = makeBuffer(gl, gl.ARRAY_BUFFER, mesh.uvs);
  const aUv = gl.getAttribLocation(screen.program, "aUv");
  gl.enableVertexAttribArray(aUv);
  gl.vertexAttribPointer(aUv, 2, gl.FLOAT, false, 0, 0);
  const indexBuffer = makeBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, mesh.indices);
  gl.bindVertexArray(null);

  const texture = createVideoTexture(gl);

  gl.enable(gl.DEPTH_TEST);
  gl.depthFunc(gl.LEQUAL);
  gl.clearColor(0, 0, 0, 1);

  let lastVideoTime = -1;

  const frame = ({ video, look, time, spill }: FrameState) => {
    resizeCanvas(canvas);
    const aspect = canvas.width / canvas.height;
    gl.viewport(0, 0, canvas.width, canvas.height);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    const basis = cameraBasis(look);
    const lamp = flicker(time);

    // ── 상영관 ──
    gl.useProgram(room.program);
    gl.bindVertexArray(quadVao);
    gl.uniform3fv(room.uniform("uRight"), basis.right as unknown as number[]);
    gl.uniform3fv(room.uniform("uUp"), basis.up as unknown as number[]);
    gl.uniform3fv(room.uniform("uForward"), basis.forward as unknown as number[]);
    gl.uniform3fv(room.uniform("uEye"), EYE as unknown as number[]);
    gl.uniform1f(room.uniform("uTanHalfFov"), Math.tan(VIEW.fovY / 2));
    gl.uniform1f(room.uniform("uAspect"), aspect);
    gl.uniform2f(room.uniform("uResolution"), canvas.width, canvas.height);
    gl.uniform1f(room.uniform("uTime"), time);
    gl.uniform3f(
      room.uniform("uSpill"),
      spill[0] * lamp,
      spill[1] * lamp,
      spill[2] * lamp,
    );
    gl.uniform3fv(room.uniform("uScreenCenter"), SCREEN_CENTER as unknown as number[]);
    gl.drawArrays(gl.TRIANGLES, 0, 3);

    // ── 스크린 ──
    // 영상 프레임이 갱신됐을 때만 텍스처를 올린다. 웹캠은 30fps인데 렌더는
    // 60fps라, 매 프레임 올리면 절반은 같은 그림을 다시 올리는 셈이다
    if (video.readyState >= video.HAVE_CURRENT_DATA && video.currentTime !== lastVideoTime) {
      lastVideoTime = video.currentTime;
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, video);
    }

    const crop = cropUv(video.videoWidth, video.videoHeight);
    gl.useProgram(screen.program);
    gl.bindVertexArray(meshVao);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(screen.uniform("uVideo"), 0);
    gl.uniformMatrix4fv(screen.uniform("uViewProj"), false, viewProjection(aspect, look));
    gl.uniformMatrix4fv(screen.uniform("uModel"), false, screenModelMatrix(gateWeave(time)));
    gl.uniform4f(
      screen.uniform("uCrop"),
      crop.scale[0],
      crop.scale[1],
      crop.offset[0],
      crop.offset[1],
    );
    gl.uniform3fv(screen.uniform("uEye"), EYE as unknown as number[]);
    gl.uniform3f(screen.uniform("uGeo"), SCREEN.width, SCREEN.radius, SCREEN.tilt);
    gl.uniform1f(screen.uniform("uFlicker"), lamp);
    gl.uniform2f(screen.uniform("uResolution"), canvas.width, canvas.height);
    gl.uniform1f(screen.uniform("uTime"), time);
    gl.drawElements(gl.TRIANGLES, mesh.vertexCount, gl.UNSIGNED_SHORT, 0);

    gl.bindVertexArray(null);
  };

  const dispose = () => {
    gl.deleteTexture(texture);
    gl.deleteBuffer(quadBuffer);
    gl.deleteBuffer(posBuffer);
    gl.deleteBuffer(uvBuffer);
    gl.deleteBuffer(indexBuffer);
    gl.deleteVertexArray(quadVao);
    gl.deleteVertexArray(meshVao);
    gl.deleteProgram(room.program);
    gl.deleteProgram(screen.program);
    // 탭을 여러 번 오가면 컨텍스트가 쌓여 브라우저 한도에 걸린다
    gl.getExtension("WEBGL_lose_context")?.loseContext();
  };

  return { frame, dispose };
}
