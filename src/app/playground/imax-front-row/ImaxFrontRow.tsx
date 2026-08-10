"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import GameHelp from "../_shared/GameHelp";
import { GAME_HELP } from "../_shared/helpContent";
import { useFullscreen } from "../_shared/useFullscreen";
import { idleSway, spillColor, type Rgb } from "./ambience";
import { createRenderer, type Renderer } from "./renderer";
import { BASE_LOOK, VIEW, clampLook, type Look } from "./seat";

type Phase = "ready" | "starting" | "running" | "denied" | "unsupported" | "failed";

/** 스크린 스필 색을 뽑을 때 쓰는 축소 크기. 이보다 크게 볼 이유가 없다 */
const SAMPLE = 8;
/** 몇 프레임에 한 번 평균색을 다시 잴지. 벽 밝기는 급하게 안 변한다 */
const SAMPLE_EVERY = 6;
/** 드래그가 시선에 반영되는 속도. 1에 가까울수록 뻣뻣하다 */
const EASE = 0.12;

export default function ImaxFrontRow() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [turned, setTurned] = useState(false);
  const [tilting, setTilting] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rendererRef = useRef<Renderer | null>(null);
  const rafRef = useRef<number | null>(null);
  const fs = useFullscreen(stageRef);

  /** 드래그·기울기가 만든 목표 시선 */
  const targetRef = useRef<Look>({ ...BASE_LOOK });
  /** 실제로 그리는 시선. 목표를 부드럽게 따라간다 */
  const lookRef = useRef<Look>({ ...BASE_LOOK });
  const dragRef = useRef<{ id: number; x: number; y: number } | null>(null);
  const spillRef = useRef<Rgb>([0.02, 0.02, 0.025]);
  const samplerRef = useRef<{ canvas: HTMLCanvasElement; ctx: CanvasRenderingContext2D } | null>(
    null,
  );

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    rendererRef.current?.dispose();
    rendererRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    samplerRef.current = null;
    targetRef.current = { ...BASE_LOOK };
    lookRef.current = { ...BASE_LOOK };
    setTurned(false);
  }, []);

  // 페이지를 떠나면 카메라를 확실히 끈다
  useEffect(() => stop, [stop]);

  /**
   * 스크린 평균색. 8×8로 줄여 받는다.
   * 실패하면 이전 값을 그대로 쓴다 — 벽 색이 조금 늦게 따라오는 것보다
   * 루프가 멈추는 쪽이 훨씬 나쁘다.
   */
  const sampleSpill = useCallback((video: HTMLVideoElement) => {
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
      sampler.ctx.drawImage(video, 0, 0, SAMPLE, SAMPLE);
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

  const start = useCallback(async () => {
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
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      stream.getTracks().forEach((t) => t.stop());
      setPhase("failed");
      return;
    }
    video.srcObject = stream;
    await video.play().catch(() => {});

    try {
      rendererRef.current = createRenderer(canvas);
    } catch {
      stop();
      setPhase("unsupported");
      return;
    }
    setPhase("running");

    const began = performance.now();
    let frames = 0;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);
      const renderer = rendererRef.current;
      if (!renderer) return;

      const time = (performance.now() - began) / 1000;
      if (frames++ % SAMPLE_EVERY === 0 && video.readyState >= 2) sampleSpill(video);

      // 목표 시선을 부드럽게 따라간다. 여기에 몸 흔들림을 더한다
      const target = targetRef.current;
      const look = lookRef.current;
      look.yaw += (target.yaw - look.yaw) * EASE;
      look.pitch += (target.pitch - look.pitch) * EASE;
      const sway = idleSway(time);

      renderer.frame({
        video,
        look: clampLook({ yaw: look.yaw + sway.yaw, pitch: look.pitch + sway.pitch }),
        time,
        spill: spillRef.current,
      });
    };
    loop();
  }, [sampleSpill, stop]);

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
    const next = clampLook({
      yaw: targetRef.current.yaw - dx,
      pitch: targetRef.current.pitch + dy,
    });
    targetRef.current = next;
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
  const hasTilt = typeof window !== "undefined" && "DeviceOrientationEvent" in window;

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">아이맥스 1열</h1>
        <p className="mt-2 text-sm text-text-secondary">
          내 웹캠 화면을 22미터 아이맥스 스크린에 걸고, 1열에서 올려다봅니다.
        </p>
      </header>

      <GameHelp help={GAME_HELP["imax-front-row"]} className="relative mt-6" />

      <div
        ref={stageRef}
        className={`group relative overflow-hidden bg-black ${
          fs.isFullscreen ? "" : "mt-8 rounded-3xl"
        }`}
      >
        <canvas
          ref={canvasRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          onDoubleClick={recenter}
          className={`block w-full touch-none ${
            fs.isFullscreen ? "h-screen" : "aspect-[3/2]"
          } ${running ? "cursor-grab active:cursor-grabbing" : ""}`}
        />

        {/* 그리기용이라 화면에 띄우지 않는다. 전체화면 요소 안에 둬야 프레임이 계속 온다 */}
        <video ref={videoRef} playsInline muted className="pointer-events-none absolute h-px w-px opacity-0" />

        {running && (
          <>
            <p className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-2 text-center text-xs text-white/30">
              끌어서 고개 돌리기 · 브라우저 밖으로 나가지 않습니다
            </p>
            <div className="absolute right-3 top-3 flex gap-2">
              {turned && (
                <button
                  onClick={recenter}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/60 transition hover:bg-white/20 hover:text-white"
                >
                  정면으로
                </button>
              )}
              {hasTilt && (
                <button
                  onClick={toggleTilt}
                  aria-pressed={tilting}
                  className={`rounded-full px-3 py-1.5 text-xs transition hover:bg-white/20 hover:text-white ${
                    tilting ? "bg-white/25 text-white" : "bg-white/10 text-white/50 opacity-40 group-hover:opacity-100"
                  }`}
                >
                  기울여 보기
                </button>
              )}
              {fs.isSupported && (
                <button
                  onClick={fs.toggle}
                  aria-label={fs.isFullscreen ? "전체화면 끝내기" : "전체화면으로 보기"}
                  className="rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/50 opacity-40 transition hover:bg-white/20 hover:text-white hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
                >
                  {fs.isFullscreen ? "나가기" : "전체화면"}
                </button>
              )}
            </div>
          </>
        )}

        {(phase === "denied" || phase === "unsupported" || phase === "failed") && (
          <div className="absolute inset-0 z-20 flex items-center justify-center bg-black/40 p-6">
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
                  ? "스크린에 걸 그림이 웹캠뿐입니다. 브라우저 설정에서 카메라를 허용한 뒤 다시 시도해 주세요."
                  : phase === "unsupported"
                    ? "카메라 또는 WebGL을 쓸 수 없는 브라우저입니다. 다른 브라우저에서 열어 주세요."
                    : "잠시 뒤 다시 시도해 주세요."}
              </p>
              {phase !== "unsupported" && (
                <button
                  onClick={() => {
                    setPhase("ready");
                    void start();
                  }}
                  className="spring-transition mt-5 w-full rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white hover:scale-[1.02] active:scale-[0.98]"
                >
                  다시 시도
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="mt-6 text-center">
        {!running ? (
          <button
            onClick={() => void start()}
            disabled={phase === "starting"}
            className="spring-transition rounded-full bg-accent px-6 py-3 text-sm font-semibold text-white hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
          >
            {phase === "starting" ? "상영 준비 중…" : "상영 시작"}
          </button>
        ) : (
          <button
            onClick={() => {
              stop();
              setPhase("ready");
            }}
            className="rounded-full border border-border px-6 py-3 text-sm font-semibold text-text-secondary transition hover:text-text-primary"
          >
            상영 끝내기
          </button>
        )}
        <p className="mt-3 text-xs text-text-secondary">
          영상은 이 브라우저 안에서만 처리합니다. 어디로도 보내지 않고 저장하지 않습니다.
        </p>
      </div>
    </div>
  );
}
