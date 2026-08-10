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

/**
 * 이 브라우저에 WebGL2가 아예 없을 때만 던진다.
 *
 * 셰이더가 안 만들어지는 것과 구분하려고 따로 뒀다. 둘을 뭉뚱그리면
 * 우리 쪽 실수까지 «지원하지 않는 브라우저»로 안내하게 되는데, 그러면
 * 다시 시도할 방법이 없는 막다른 화면이 된다. 실제로 그렇게 막혔던 적이 있다.
 */
export class WebGLUnsupportedError extends Error {
  constructor() {
    super("WebGL2를 쓸 수 없습니다");
    this.name = "WebGLUnsupportedError";
  }
}

export function createRenderer(canvas: HTMLCanvasElement): Renderer {
  const gl = canvas.getContext("webgl2", {
    alpha: false,
    antialias: true,
    // 어두운 화면이라 노트북에서 굳이 외장 GPU를 깨울 이유가 없다
    powerPreference: "default",
    desynchronized: true,
  });
  if (!gl) throw new WebGLUnsupportedError();

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
    /*
     * 컨텍스트 자체는 건드리지 않는다.
     *
     * 여기서 WEBGL_lose_context로 컨텍스트를 죽였더니, «끝내기» 뒤에 다시
     * «상영 시작»을 누르면 지원하지 않는 브라우저라고 떴다. 한 캔버스는
     * 컨텍스트를 하나만 갖고, 잃은 컨텍스트는 getContext를 다시 불러도
     * 그대로 돌아온다. 죽은 컨텍스트 위에서 셰이더를 만들려니 실패했던 것이다.
     *
     * 쌓일 걱정을 해서 넣었던 줄인데 전제가 틀렸다. 캔버스가 늘 같은 DOM
     * 노드라 컨텍스트는 애초에 하나뿐이고, 페이지를 떠나면 캔버스와 함께
     * 회수된다. 여기서는 이번 상영이 만든 자원만 반납하면 된다.
     */

    /*
     * 마지막 프레임은 지운다.
     *
     * 그리기를 멈추는 것과 그려둔 것을 치우는 것은 다른 일이다. rAF만 끊으면
     * 마지막 한 장이 캔버스에 그대로 남아서, «끝내기»를 눌러도 제목 화면이
     * 정지된 얼굴 위에 겹쳐 뜬다. 백업 저장소 크기를 다시 잡으면 투명하게
     * 비워지고, 그 밑의 검은 상영관이 드러난다. 다음 상영 때 resizeCanvas가
     * 제 크기로 되돌린다.
     */
    canvas.width = 1;
    canvas.height = 1;
  };

  return { frame, dispose };
}
