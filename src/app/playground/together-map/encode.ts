export interface VideoFormat {
  /** 로그·테스트용 식별자. 화면에는 i18n 문구를 쓴다. */
  label: string;
  shape: "square" | "portrait" | "landscape";
  w: number;
  h: number;
}

/**
 * 레퍼런스와 같은 다섯 가지. 변은 모두 짝수여야 한다 — 홀수를 거부하는 인코더가 있다.
 *
 * label은 화면에 쓰지 않는다. SetupPanel이 i18n의 sizeSquare/sizePortrait/
 * sizeLandscape와 아래 치수를 합쳐 만든다. 여기 label은 로그와 테스트용이다.
 */
export const SIZES: VideoFormat[] = [
  { label: "square-480", shape: "square", w: 480, h: 480 },
  { label: "square-720", shape: "square", w: 720, h: 720 },
  { label: "square-1080", shape: "square", w: 1080, h: 1080 },
  { label: "portrait-1080", shape: "portrait", w: 1080, h: 1920 },
  { label: "landscape-1080", shape: "landscape", w: 1920, h: 1080 },
];

export const DURATIONS = [10, 15, 20, 30, 45, 60] as const;

export const FPS = 30;

/**
 * 쓸 수 있는 코덱을 고른다.
 *
 * mp4를 먼저 본다. webm은 카카오톡이나 인스타에 그냥 안 올라가는 경우가 많아서,
 * «영상을 만들었는데 공유가 안 된다»가 되기 쉽다. 사파리는 mp4만 되고
 * 크롬은 판마다 다르므로 런타임에 물어봐야 한다.
 */
export function pickMimeType(isSupported: (type: string) => boolean): {
  mimeType: string;
  ext: "mp4" | "webm";
} {
  const candidates: { type: string; ext: "mp4" | "webm" }[] = [
    { type: "video/mp4;codecs=avc1.42E01E", ext: "mp4" },
    { type: "video/mp4", ext: "mp4" },
    { type: "video/webm;codecs=vp9", ext: "webm" },
    { type: "video/webm;codecs=vp8", ext: "webm" },
    { type: "video/webm", ext: "webm" },
  ];

  for (const c of candidates) {
    if (isSupported(c.type)) return { mimeType: c.type, ext: c.ext };
  }
  // 아무것도 못 고르면 빈 문자열로 브라우저 기본 코덱에 맡긴다
  return { mimeType: "", ext: "webm" };
}

/**
 * 캔버스를 실시간으로 녹화한다.
 *
 * 프레임을 하나씩 만들어 붙이는 방식(WebCodecs)이 화질과 정확도 면에서 낫지만
 * 지원이 고르지 않고 코드가 몇 배로 길어진다. MediaRecorder는 어디서나 돌고,
 * 이 도구가 그리는 그림은 초당 30장으로 충분하다.
 *
 * 호출하는 쪽에서 재생을 seconds 안에 끝내야 한다 — 여기서는 시간만 잰다.
 */
export function recordCanvas(
  canvas: HTMLCanvasElement,
  seconds: number,
  onProgress: (ratio: number) => void,
  signal: AbortSignal,
): Promise<{ blob: Blob; ext: "mp4" | "webm" }> {
  return new Promise((resolve, reject) => {
    const { mimeType, ext } = pickMimeType((type) => MediaRecorder.isTypeSupported(type));
    const stream = canvas.captureStream(FPS);
    const recorder = new MediaRecorder(stream, mimeType ? { mimeType } : undefined);
    const chunks: BlobPart[] = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };
    recorder.onstop = () => {
      window.clearInterval(timer);
      stream.getTracks().forEach((track) => track.stop());
      if (signal.aborted) {
        reject(new DOMException("취소했습니다", "AbortError"));
        return;
      }
      resolve({ blob: new Blob(chunks, { type: mimeType || "video/webm" }), ext });
    };
    recorder.onerror = () => {
      window.clearInterval(timer);
      reject(new Error("영상을 만들지 못했습니다."));
    };

    const startedAt = performance.now();
    const timer = window.setInterval(() => {
      const ratio = (performance.now() - startedAt) / (seconds * 1000);
      onProgress(Math.min(1, ratio));
      if (ratio >= 1 && recorder.state === "recording") recorder.stop();
    }, 100);

    signal.addEventListener("abort", () => {
      if (recorder.state === "recording") recorder.stop();
    });

    recorder.start();
  });
}
