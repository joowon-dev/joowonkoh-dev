/**
 * WebGL2 얇은 래퍼. 셰이더를 붙이고 유니폼 위치를 캐시하는 것까지만 한다.
 * 라이브러리를 넣지 않은 이유는 이 페이지가 그리는 게 사각형 두 개와
 * 격자 하나뿐이라서다.
 */

export function compile(gl: WebGL2RenderingContext, type: number, source: string): WebGLShader {
  const shader = gl.createShader(type);
  if (!shader) throw new Error("셰이더를 만들 수 없습니다");
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`셰이더 컴파일 실패: ${log}`);
  }
  return shader;
}

export interface Program {
  program: WebGLProgram;
  uniform(name: string): WebGLUniformLocation | null;
}

export function link(gl: WebGL2RenderingContext, vertex: string, fragment: string): Program {
  const vs = compile(gl, gl.VERTEX_SHADER, vertex);
  const fs = compile(gl, gl.FRAGMENT_SHADER, fragment);
  const program = gl.createProgram();
  if (!program) throw new Error("프로그램을 만들 수 없습니다");
  gl.attachShader(program, vs);
  gl.attachShader(program, fs);
  gl.linkProgram(program);
  gl.deleteShader(vs);
  gl.deleteShader(fs);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    const log = gl.getProgramInfoLog(program);
    gl.deleteProgram(program);
    throw new Error(`프로그램 링크 실패: ${log}`);
  }

  const cache = new Map<string, WebGLUniformLocation | null>();
  return {
    program,
    uniform(name) {
      if (!cache.has(name)) cache.set(name, gl.getUniformLocation(program, name));
      return cache.get(name) ?? null;
    },
  };
}

/**
 * 매 프레임 영상을 올릴 텍스처.
 *
 * 밉맵을 안 만들고 CLAMP_TO_EDGE로 고정한다. 1열에서는 스크린 아래쪽이 코앞이라
 * 확대되기만 하고 축소될 일이 없어서 밉맵은 매 프레임 낭비다.
 */
export function createVideoTexture(gl: WebGL2RenderingContext): WebGLTexture {
  const tex = gl.createTexture();
  if (!tex) throw new Error("텍스처를 만들 수 없습니다");
  gl.bindTexture(gl.TEXTURE_2D, tex);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  // 영상이 오기 전에 그려도 검게 나오도록 1픽셀을 깔아둔다
  gl.texImage2D(
    gl.TEXTURE_2D,
    0,
    gl.RGBA,
    1,
    1,
    0,
    gl.RGBA,
    gl.UNSIGNED_BYTE,
    new Uint8Array([0, 0, 0, 255]),
  );
  return tex;
}

export function makeBuffer(
  gl: WebGL2RenderingContext,
  target: number,
  data: BufferSource,
): WebGLBuffer {
  const buffer = gl.createBuffer();
  if (!buffer) throw new Error("버퍼를 만들 수 없습니다");
  gl.bindBuffer(target, buffer);
  gl.bufferData(target, data, gl.STATIC_DRAW);
  return buffer;
}

/**
 * 캔버스 픽셀 크기를 표시 크기에 맞춘다.
 * 고해상도 화면에서 device pixel ratio를 2로 묶는다 — 3까지 올리면 픽셀 수가
 * 두 배 늘어나는데 어두운 상영관이라 눈에 보이는 차이는 거의 없다.
 */
export function resizeCanvas(canvas: HTMLCanvasElement): boolean {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const width = Math.max(1, Math.round(canvas.clientWidth * dpr));
  const height = Math.max(1, Math.round(canvas.clientHeight * dpr));
  if (canvas.width === width && canvas.height === height) return false;
  canvas.width = width;
  canvas.height = height;
  return true;
}
