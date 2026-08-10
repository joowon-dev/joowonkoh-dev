"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameHelp from "../_shared/GameHelp";
import { GAME_HELP } from "../_shared/helpContent";
import { useFullscreen } from "../_shared/useFullscreen";
import { idleSway, spillColor, type Rgb } from "./ambience";
import {
  WebGLUnsupportedError,
  createRenderer,
  type Renderer,
  type Source,
} from "./renderer";
import { BASE_LOOK, VIEW, clampLook, type Look } from "./seat";

type Phase = "ready" | "starting" | "running" | "denied" | "unsupported" | "failed";
/** 스크린에 무엇을 걸고 있는지 */
type Mode = "camera" | "photo";

/** 스크린 스필 색을 뽑을 때 쓰는 축소 크기. 이보다 크게 볼 이유가 없다 */
const SAMPLE = 8;
/** 몇 프레임에 한 번 평균색을 다시 잴지. 벽 밝기는 급하게 안 변한다 */
const SAMPLE_EVERY = 6;
/** 드래그가 시선에 반영되는 속도. 1에 가까울수록 뻣뻣하다 */
const EASE = 0.12;
/** 첫 프레임을 이만큼 기다려 본다 */
const FIRST_FRAME_TIMEOUT = 8000;
/** 사진 오류 문구가 떠 있는 시간 */
const TOAST_MS = 4000;

/**
 * 카메라에서 첫 프레임이 올 때까지 기다린다.
 *
 * `play()`가 끝나기를 기다리는 것만으로는 부족하다. 권한은 났는데 프레임이
 * 한 장도 안 오는 경우가 실제로 있다 — 다른 앱이 카메라를 물고 있거나,
 * 신호 없는 가상 카메라이거나, 탭이 뒤로 밀려 스트림이 멈춘 경우다.
 * 그러면 화면은 «상영 준비 중…»에 영영 멈추고 빠져나갈 방법이 없다.
 */
function waitForFirstFrame(video: HTMLVideoElement, timeoutMs: number): Promise<boolean> {
  if (video.readyState >= video.HAVE_CURRENT_DATA) return Promise.resolve(true);
  return new Promise((resolve) => {
    const finish = (ok: boolean) => {
      clearTimeout(timer);
      video.removeEventListener("loadeddata", onData);
      resolve(ok);
    };
    const onData = () => finish(true);
    const timer = setTimeout(() => finish(false), timeoutMs);
    video.addEventListener("loadeddata", onData);
  });
}

/** 끌어다 놓거나 붙여넣은 것 중에서 그림 하나를 골라낸다 */
function pickImage(files: FileList | null | undefined): File | null {
  if (!files) return null;
  return Array.from(files).find((f) => f.type.startsWith("image/")) ?? null;
}

export default function ImaxFrontRow() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [mode, setMode] = useState<Mode | null>(null);
  const [turned, setTurned] = useState(false);
  const [tilting, setTilting] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const rafRef = useRef<number | null>(null);
  const fs = useFullscreen(stageRef);

  /** 스크린에 걸 그림을 매 프레임 집어오는 함수. 모드가 바뀌면 이것만 갈아끼운다 */
  const sourceRef = useRef<(() => Source | null) | null>(null);
  const photoRef = useRef<ImageBitmap | null>(null);
  const photoRevisionRef = useRef(0);

  /** 드래그·기울기가 만든 목표 시선 */
  const targetRef = useRef<Look>({ ...BASE_LOOK });
  /** 실제로 그리는 시선. 목표를 부드럽게 따라간다 */
  const lookRef = useRef<Look>({ ...BASE_LOOK });
  const dragRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const spillRef = useRef<Rgb>([0.02, 0.02, 0.025]);
  const sampledRef = useRef(Number.NaN);
  const samplerRef = useRef<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null>(
    null,
  );

  const releasePhoto = useCallback(() => {
    photoRef.current?.close();
    photoRef.current = null;
  }, []);

  const releaseCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) videoRef.current.srcObject = null;
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    rendererRef.current?.dispose();
    rendererRef.current = null;
    releaseCamera();
    releasePhoto();
    sourceRef.current = null;
    samplerRef.current = null;
    sampledRef.current = Number.NaN;
    targetRef.current = { ...BASE_LOOK };
    lookRef.current = { ...BASE_LOOK };
    setTurned(false);
    setMode(null);
  }, [releaseCamera, releasePhoto]);

  // 페이지를 떠나면 카메라와 사진을 확실히 놓아준다
  useEffect(() => stop, [stop]);

  // 오류 문구는 스스로 사라진다. 상영 중에 닫기 버튼을 누르게 하고 싶지 않다
  useEffect(() => {
    if (!photoError) return;
    const id = setTimeout(() => setPhotoError(null), TOAST_MS);
    return () => clearTimeout(id);
  }, [photoError]);

  /**
   * 스크린 평균색. 8×8로 줄여 받는다.
   * 실패하면 이전 값을 그대로 쓴다 — 벽 색이 조금 늦게 따라오는 것보다
   * 루프가 멈추는 쪽이 훨씬 나쁘다.
   */
  const sampleSpill = useCallback((element: CanvasImageSource) => {
    let sampler = samplerRef.current;
    if (!sampler) {
      const canvas = document.createElement("canvas");
      canvas.width = SAMPLE;
      canvas.height = SAMPLE;
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      if (!ctx) return;
      sampler = { canvas, ctx };
      samplerRef.current = sampler;
    }
    try {
      sampler.ctx.drawImage(element, 0, 0, SAMPLE, SAMPLE);
      const { data } = sampler.ctx.getImageData(0, 0, SAMPLE, SAMPLE);
      let r = 0;
      let g = 0;
      let b = 0;
      for (let i = 0; i < data.length; i += 4) {
        r += data[i];
        g += data[i + 1];
        b += data[i + 2];
      }
      const n = (data.length / 4) * 255;
      spillRef.current = spillColor([r / n, g / n, b / n]);
    } catch {
      // 프레임이 아직 없을 때 드물게 던진다. 다음 차례에 다시 잰다
    }
  }, []);

  // ── 스크린에 걸 그림 ─────────────────────────────────────────

  const cameraSource = useCallback((): Source | null => {
    const v = videoRef.current;
    if (!v || v.readyState < v.HAVE_CURRENT_DATA || !v.videoWidth) return null;
    return {
      element: v,
      width: v.videoWidth,
      height: v.videoHeight,
      // 재생 위치가 곧 «몇 번째 그림인지»다
      revision: v.currentTime,
      mirror: true,
    };
  }, []);

  const photoSource = useCallback((): Source | null => {
    const img = photoRef.current;
    if (!img?.width) return null;
    return {
      element: img,
      width: img.width,
      height: img.height,
      revision: photoRevisionRef.current,
      // 사진은 뒤집지 않는다. 거울로 만들면 글자가 죄다 뒤집힌다
      mirror: false,
    };
  }, []);

  /** 렌더러를 세우고 루프를 돈다. 카메라든 사진이든 여기서 만난다 */
  const run = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) {
      setPhase("failed");
      return false;
    }
    try {
      rendererRef.current = createRenderer(canvas);
    } catch (error) {
      stop();
      // WebGL이 없는 것과 우리가 못 만든 것은 사용자가 할 수 있는 일이 다르다
      setPhase(error instanceof WebGLUnsupportedError ? "unsupported" : "failed");
      return false;
    }
    setPhase("running");

    const began = performance.now();
    let frames = 0;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const renderer = rendererRef.current;
      if (!renderer) return;

      const time = (performance.now() - began) / 1000;
      const source = sourceRef.current?.() ?? null;

      // 그림이 바뀌었을 때만 벽 색을 다시 잰다. 사진이면 사실상 한 번이다
      if (source && frames % SAMPLE_EVERY === 0 && source.revision !== sampledRef.current) {
        sampledRef.current = source.revision;
        sampleSpill(source.element);
      }
      frames++;

      // 목표 시선을 부드럽게 따라간다. 여기에 몸 흔들림을 더한다
      const target = targetRef.current;
      const look = lookRef.current;
      look.yaw += (target.yaw - look.yaw) * EASE;
      look.pitch += (target.pitch - look.pitch) * EASE;
      const sway = idleSway(time);

      renderer.frame({
        source,
        look: clampLook({ yaw: look.yaw + sway.yaw, pitch: look.pitch + sway.pitch }),
        time,
        spill: spillRef.current,
      });
    };
    loop();
    return true;
  }, [sampleSpill, stop]);

  const startCamera = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPhase("unsupported");
      return;
    }

    setPhase("starting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        // 스크린이 22m다. 들어오는 그림이 거칠면 그게 그대로 확대된다
        video: { width: { ideal: 1280 }, height: { ideal: 720 }, facingMode: "user" },
        audio: false,
      });
    } catch {
      setPhase("denied");
      return;
    }
    streamRef.current = stream;

    const video = videoRef.current;
    if (!video) {
      stream.getTracks().forEach((t) => t.stop());
      setPhase("failed");
      return;
    }
    video.srcObject = stream;
    void video.play().catch(() => {});
    if (!(await waitForFirstFrame(video, FIRST_FRAME_TIMEOUT))) {
      stop();
      setPhase("failed");
      return;
    }

    releasePhoto();
    sourceRef.current = cameraSource;
    setMode("camera");
    if (!run()) return;
  }, [cameraSource, releasePhoto, run, stop]);

  /**
   * 사진을 스크린에 건다.
   *
   * 상영 중이면 렌더러를 그대로 두고 그림만 갈아끼운다. 껐다 켜면 화면이
   * 한 번 검게 끊기는데, 사진을 바꿔 보는 건 연달아 하는 일이라 그게 거슬린다.
   */
  const showPhoto = useCallback(
    async (file: File) => {
      if (!file.type.startsWith("image/")) {
        setPhotoError("그림 파일만 걸 수 있어요");
        return;
      }

      /*
       * `<img>` + object URL 대신 createImageBitmap을 쓴다.
       *
       * 화면에 붙지 않은 img의 decode()는 탭이 뒤에 있으면 영영 끝나지 않는다.
       * 브라우저가 «어차피 안 그릴 그림»의 디코딩을 미루기 때문인데, 그러면
       * 사진을 놓고 탭을 옮긴 사이에 아무 일도 안 일어난 채로 멈춘다.
       * createImageBitmap은 파일에서 바로, 가시성과 무관하게 디코딩하고
       * 돌려줄 URL도 남기지 않는다.
       */
      let bitmap: ImageBitmap;
      try {
        bitmap = await createImageBitmap(file);
      } catch {
        setPhotoError("이 사진은 읽지 못했어요. 다른 파일로 해 주세요");
        return;
      }

      // 카메라를 쓰고 있었다면 여기서 놓아준다. 안 쓸 카메라를 켜 두지 않는다
      releaseCamera();
      releasePhoto();
      photoRef.current = bitmap;
      photoRevisionRef.current += 1;
      sourceRef.current = photoSource;
      sampledRef.current = Number.NaN;
      setMode("photo");
      setPhotoError(null);

      if (!rendererRef.current) run();
    },
    [photoSource, releaseCamera, releasePhoto, run],
  );

  const openPicker = () => fileRef.current?.click();

  // 붙여넣기로도 걸 수 있다. 방금 만든 이미지를 파일로 저장했다 고르는 건 번거롭다
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      const file = pickImage(e.clipboardData?.files);
      if (file) void showPhoto(file);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, [showPhoto]);

  // ── 고개 돌리기 ──────────────────────────────────────────────

  const onPointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (phase !== "running") return;
    dragRef.current = { id: e.pointerId, x: e.clientX, y: e.clientY };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const drag = dragRef.current;
    if (!drag || drag.id !== e.pointerId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    // 화면 폭을 다 훑으면 좌우 한계까지 간다. 화면이 좁아도 같은 만큼 돈다
    const dx = ((e.clientX - drag.x) / rect.width) * VIEW.yawLimit * 2;
    const dy = ((e.clientY - drag.y) / rect.height) * (VIEW.pitchMax - VIEW.pitchMin);
    drag.x = e.clientX;
    drag.y = e.clientY;

    // 끄는 방향과 반대로 돈다. 화면을 손으로 밀어 옮기는 감각이다
    targetRef.current = clampLook({
      yaw: targetRef.current.yaw - dx,
      pitch: targetRef.current.pitch + dy,
    });
    setTurned(true);
  };

  const endDrag = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (dragRef.current?.id !== e.pointerId) return;
    dragRef.current = null;
  };

  const recenter = () => {
    targetRef.current = { ...BASE_LOOK };
    setTurned(false);
  };

  /**
   * 기울여서 보기.
   *
   * iOS는 사용자가 버튼을 누른 그 순간에만 권한을 물어볼 수 있어서, 자동으로
   * 켜지 않고 버튼으로 둔다. 안드로이드는 그냥 붙는다.
   */
  const toggleTilt = useCallback(async () => {
    if (tilting) {
      setTilting(false);
      return;
    }
    const anyEvent = DeviceOrientationEvent as unknown as {
      requestPermission?: () => Promise<PermissionState>;
    };
    if (typeof anyEvent.requestPermission === "function") {
      const granted = await anyEvent.requestPermission().catch(() => "denied");
      if (granted !== "granted") return;
    }
    setTilting(true);
  }, [tilting]);

  useEffect(() => {
    if (!tilting || phase !== "running") return;
    let base: { beta: number; gamma: number } | null = null;
    const onOrientation = (e: DeviceOrientationEvent) => {
      if (e.beta === null || e.gamma === null) return;
      // 처음 잡힌 자세를 정면으로 삼는다. 기기를 어떻게 들고 있든 거기서 시작한다
      base ??= { beta: e.beta, gamma: e.gamma };
      targetRef.current = clampLook({
        yaw: BASE_LOOK.yaw + ((e.gamma - base.gamma) * Math.PI) / 180,
        pitch: BASE_LOOK.pitch - ((e.beta - base.beta) * Math.PI) / 180,
      });
    };
    window.addEventListener("deviceorientation", onOrientation);
    return () => window.removeEventListener("deviceorientation", onOrientation);
  }, [tilting, phase]);

  const running = phase === "running";
  const failed = phase === "denied" || phase === "unsupported" || phase === "failed";
  const hasTilt = typeof window !== "undefined" && "DeviceOrientationEvent" in window;

  return (
    /*
     * 사이트 레이아웃 안에 갇히면 이 페이지가 성립하지 않는다. 상영관은 시야를
     * 다 먹어야 하는데, 본문 폭에 맞춘 상자 안에 들어가는 순간 그냥 «작은 화면에
     * 담긴 큰 화면»이 된다. 타자 농구·구슬 폭포와 같은 z-40으로 헤더 위에 올린다.
     */
    <div
      ref={stageRef}
      className="fixed inset-0 z-40 overflow-hidden bg-black select-none"
      style={{ colorScheme: "dark" }}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={(e) => {
        // 자식 위로 지나갈 때마다 깜빡이지 않게, 무대 밖으로 나갔을 때만 끈다
        if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setDragging(false);
      }}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        const file = pickImage(e.dataTransfer?.files);
        if (file) void showPhoto(file);
        else setPhotoError("그림 파일만 걸 수 있어요");
      }}
    >
      <canvas
        ref={canvasRef}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        onDoubleClick={recenter}
        className={`absolute inset-0 h-full w-full touch-none ${
          running ? "cursor-grab active:cursor-grabbing" : ""
        }`}
      />

      {/* 그리기용이라 화면에 띄우지 않는다 */}
      <video ref={videoRef} playsInline muted className="pointer-events-none absolute h-px w-px opacity-0" />

      <input
        ref={fileRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => {
          const file = pickImage(e.target.files);
          if (file) void showPhoto(file);
          // 같은 파일을 다시 골라도 change가 오도록 비운다
          e.target.value = "";
        }}
      />

      {/* 도움말은 왼쪽에 둔다. 오른쪽 위는 상영 중 조작 버튼 자리다 */}
      <GameHelp help={GAME_HELP["imax-front-row"]} className="absolute top-3 left-3" />

      {!running && !failed && (
        // 상영 전 화면. 불 꺼진 상영관에 제목만 떠 있는 상태다
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center px-6 text-center">
          <p className="text-[11px] font-medium tracking-[0.45em] text-white/35">FRONT ROW</p>
          {/* 두 줄로 고정한다. 폭에 따라 끊기는 자리가 달라지면 제목이 흔들린다 */}
          <h1 className="mt-4 font-display text-4xl leading-[1.15] font-bold tracking-tight text-white sm:text-6xl">
            IMAX 1열에서
            <br />
            내얼굴 보기
          </h1>

          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => void startCamera()}
              disabled={phase === "starting"}
              className="spring-transition rounded-full bg-white px-7 py-3.5 text-sm font-semibold text-black hover:scale-[1.03] active:scale-[0.97] disabled:opacity-50"
            >
              {phase === "starting" ? "상영 준비 중…" : "카메라로 보기"}
            </button>
            <button
              onClick={openPicker}
              className="spring-transition rounded-full border border-white/25 px-7 py-3.5 text-sm font-semibold text-white/80 hover:border-white/50 hover:text-white active:scale-[0.97]"
            >
              사진으로 보기
            </button>
          </div>

          <p className="mt-5 text-xs text-white/30">사진은 끌어다 놓거나 붙여넣어도 됩니다</p>
          <p className="mt-2 text-xs text-white/25">
            카메라도 사진도 이 브라우저 안에서만 처리합니다 · 저장·전송 없음
          </p>
        </div>
      )}

      {running && (
        <>
          <p className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-3 text-center text-xs text-white/25">
            끌어서 고개 돌리기 · 브라우저 밖으로 나가지 않습니다
          </p>
          <div className="absolute top-3 right-3 z-30 flex flex-wrap justify-end gap-2">
            {turned && (
              <button
                onClick={recenter}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/20 hover:text-white"
              >
                정면으로
              </button>
            )}
            <button
              onClick={openPicker}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/45 transition hover:bg-white/20 hover:text-white"
            >
              {mode === "photo" ? "사진 바꾸기" : "사진 걸기"}
            </button>
            {mode === "photo" && (
              <button
                onClick={() => void startCamera()}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/45 transition hover:bg-white/20 hover:text-white"
              >
                카메라로
              </button>
            )}
            {hasTilt && (
              <button
                onClick={toggleTilt}
                aria-pressed={tilting}
                className={`rounded-full px-3 py-1.5 text-xs transition hover:bg-white/20 hover:text-white ${
                  tilting ? "bg-white/25 text-white" : "bg-white/10 text-white/45"
                }`}
              >
                기울여 보기
              </button>
            )}
            {fs.isSupported && (
              <button
                onClick={fs.toggle}
                className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/45 transition hover:bg-white/20 hover:text-white"
              >
                {fs.isFullscreen ? "창으로" : "전체화면"}
              </button>
            )}
            <button
              onClick={() => {
                stop();
                setPhase("ready");
                void fs.exit();
              }}
              className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/45 transition hover:bg-white/20 hover:text-white"
            >
              끝내기
            </button>
          </div>
        </>
      )}

      {dragging && (
        <div className="pointer-events-none absolute inset-6 z-40 flex items-center justify-center rounded-3xl border-2 border-dashed border-white/40 bg-black/40">
          <p className="font-display text-lg font-bold text-white">여기에 놓으면 스크린에 걸립니다</p>
        </div>
      )}

      {photoError && (
        <div className="pointer-events-none absolute inset-x-0 bottom-14 z-40 flex justify-center px-6">
          <p className="animate-fade-in-up rounded-full bg-white/15 px-4 py-2 text-xs text-white">
            {photoError}
          </p>
        </div>
      )}

      {failed && (
        <div className="absolute inset-0 z-40 flex items-center justify-center p-6">
          <div className="animate-fade-in-up max-w-xs rounded-2xl bg-card-bg p-6 text-center shadow-ambient">
            <div className="text-3xl">{phase === "denied" ? "📷" : "🎞️"}</div>
            <h2 className="mt-3 font-display text-lg font-bold">
              {phase === "denied"
                ? "카메라가 필요해요"
                : phase === "unsupported"
                  ? "이 브라우저로는 못 틀어요"
                  : "상영을 시작하지 못했어요"}
            </h2>
            <p className="mt-2 text-sm text-text-secondary">
              {phase === "denied"
                ? "브라우저 설정에서 카메라를 허용해 주세요. 카메라 없이 사진만 걸어도 됩니다."
                : phase === "unsupported"
                  ? "카메라 또는 WebGL을 쓸 수 없는 브라우저입니다. 다른 브라우저에서 열어 주세요."
                  : "카메라는 열렸는데 화면이 오지 않았어요. 다른 앱이 카메라를 쓰고 있지 않은지 확인한 뒤 다시 시도해 주세요."}
            </p>
            <div className="mt-5 flex flex-col gap-2">
              <button
                onClick={() => {
                  setPhase("ready");
                  if (phase !== "unsupported") void startCamera();
                }}
                className="spring-transition w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] active:scale-[0.98]"
              >
                {phase === "unsupported" ? "돌아가기" : "다시 시도"}
              </button>
              {phase !== "unsupported" && (
                <button
                  onClick={() => {
                    setPhase("ready");
                    openPicker();
                  }}
                  className="w-full rounded-full border border-border px-4 py-2 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
                >
                  사진으로 보기
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
