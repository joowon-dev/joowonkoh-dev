"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HandLandmarker } from "@mediapipe/tasks-vision";
import GameHelp from "../_shared/GameHelp";
import { GAME_HELP } from "../_shared/helpContent";
import { CameraPermissionGate } from "../_shared/CameraPermissionGate";
import { useFullscreen } from "../_shared/useFullscreen";
import { powerFromHeight, stepHands, type HandObservation, type HandState } from "./gesture";
import { createWorld, launchShell, stepWorld, type World } from "./firework";
import { drawHands, drawWorld } from "./render";
import { coverRect, toWorld } from "./viewport";

/**
 * 손 모델은 7.5MB라 저장소에 안 넣고 구글이 올려둔 것을 받는다.
 * wasm 런타임(/mediapipe)은 빌드 때 복사한 우리 것을 쓴다 — 그쪽은 22MB라 매번
 * 외부에서 받게 두면 첫 로딩이 훨씬 느려진다.
 */
const MODEL_URL =
  "https://storage.googleapis.com/mediapipe-models/hand_landmarker/hand_landmarker/float16/1/hand_landmarker.task";

/** 검출 주기(ms). 22fps 정도 — 그리기는 매 프레임 돌고 이건 따로 돈다 */
const DETECT_INTERVAL = 45;
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;
const VIDEO_ASPECT = VIDEO_WIDTH / VIDEO_HEIGHT;
/** 탭이 뒤로 갔다 오면 dt가 몇 초씩 뛴다. 그대로 적분하면 불꽃이 순간이동한다. */
const MAX_DT = 0.05;

/**
 * MediaPipe wasm이 첫 추론 때 stderr로 찍는 정보 로그. 오류가 아닌데 Next 개발
 * 오버레이가 stderr를 전부 에러로 띄워서 화면을 덮는다. 이 한 줄만 걸러낸다.
 */
const WASM_NOTICE = /XNNPACK delegate/;
let restoreConsole: (() => void) | null = null;

function muteWasmNotice() {
  if (restoreConsole) return;
  const original = console.error;
  console.error = (...args: unknown[]) => {
    if (typeof args[0] === "string" && WASM_NOTICE.test(args[0])) return;
    original(...args);
  };
  restoreConsole = () => {
    console.error = original;
    restoreConsole = null;
  };
}

type Phase = "ready" | "starting" | "running" | "denied" | "unsupported" | "failed";

/**
 * 왼손과 오른손을 프레임 사이에 이어 붙일 이름.
 * 드물게 두 손이 같은 라벨로 나오는데, 그때 이름이 겹치면 한쪽 상태가 다른 쪽을
 * 덮어써서 «쥠→폄»이 엉킨다. 겹치면 순번을 붙여 갈라 둔다.
 */
function handKey(label: string, used: Set<string>): string {
  let key = label;
  let n = 2;
  while (used.has(key)) key = `${label}-${n++}`;
  used.add(key);
  return key;
}

export default function HandFireworks() {
  const [phase, setPhase] = useState<Phase>("ready");
  const [handCount, setHandCount] = useState(0);
  const [bursts, setBursts] = useState(0);
  const [everLaunched, setEverLaunched] = useState(false);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const fs = useFullscreen(stageRef);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const landmarkerRef = useRef<HandLandmarker | null>(null);
  const rafRef = useRef<number | null>(null);
  const worldRef = useRef<World>(createWorld());
  const handsRef = useRef<HandState[]>([]);
  /** 무대의 CSS 픽셀 크기. ResizeObserver가 채운다 */
  const sizeRef = useRef({ w: 0, h: 0 });
  /** 다음 프레임에 쏠 것들. **세계 좌표**로 넣는다 */
  const pendingRef = useRef<{ x: number; y: number; power: number }[]>([]);
  const lastFrameRef = useRef(0);
  const lastDetectRef = useRef(0);
  const lastStatsRef = useRef(0);

  // 무대 크기가 바뀌면 캔버스 픽셀 수를 다시 잡는다. CSS로만 늘리면 뿌옇게 나온다.
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;
    const observer = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      sizeRef.current = { w: width, h: height };
      const canvas = canvasRef.current;
      if (!canvas) return;
      const dpr = Math.min(2, window.devicePixelRatio || 1);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.getContext("2d")?.setTransform(dpr, 0, 0, dpr, 0, 0);
    });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    landmarkerRef.current?.close();
    landmarkerRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    worldRef.current = createWorld();
    handsRef.current = [];
    pendingRef.current = [];
    restoreConsole?.();
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext("2d");
    if (canvas && ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHandCount(0);
    setBursts(0);
  }, []);

  // 다른 페이지로 가면 카메라를 확실히 끈다
  useEffect(() => stop, [stop]);

  /**
   * F로 전체화면을 여닫는다. 불꽃을 쏘는 동안 손은 카메라 앞에 있어서,
   * 마우스로 구석의 버튼을 찾아가는 게 이 페이지에서는 유독 번거롭다.
   * 나가는 건 Esc — 브라우저가 알아서 처리한다.
   */
  const toggleFullscreen = fs.toggle;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "f" && e.key !== "F") return;
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      e.preventDefault();
      toggleFullscreen();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleFullscreen]);

  /**
   * 한 프레임. 카메라가 켜져 있든 아니든 같은 함수가 돈다 — 검출만 조건부고
   * 물리와 그리기는 늘 같다. 루프를 둘로 나누면 같은 코드가 두 벌 생긴다.
   */
  const tick = useCallback((now: number) => {
    const dt = Math.min(MAX_DT, (now - lastFrameRef.current) / 1000);
    lastFrameRef.current = now;

    const ctx = canvasRef.current?.getContext("2d");
    const { w, h } = sizeRef.current;
    const lm = landmarkerRef.current;

    // 무대 크기를 아직 모르면 이번 프레임은 건너뛴다. 기다리는 발사는 큐에 남는다.
    if (ctx && h > 0) {
      const rect = coverRect(w, h, VIDEO_ASPECT);
      const v = videoRef.current;

      if (lm && v && v.readyState >= 2 && v.videoWidth > 0 && now - lastDetectRef.current >= DETECT_INTERVAL) {
        const result = lm.detectForVideo(v, now);
        const used = new Set<string>();
        const observed: HandObservation[] = result.landmarks.map((landmarks, i) => ({
          key: handKey(result.handedness[i]?.[0]?.categoryName ?? "Hand", used),
          landmarks,
        }));

        const step = stepHands(handsRef.current, observed, now - lastDetectRef.current);
        lastDetectRef.current = now;
        handsRef.current = step.hands;
        // 손 좌표는 영상 프레임 기준이라 여기서 무대 좌표로 옮겨 큐에 넣는다
        for (const l of step.launches) {
          pendingRef.current.push({ ...toWorld(l, rect, h), power: l.power });
        }
      }

      let world = worldRef.current;
      if (pendingRef.current.length > 0) {
        world = {
          ...world,
          shells: [
            ...world.shells,
            ...pendingRef.current.map((l) => launchShell(l, l.power, Math.random)),
          ],
        };
        pendingRef.current = [];
      }

      world = stepWorld(world, dt, Math.random);
      worldRef.current = world;

      drawWorld(ctx, world, { w, h }, now / 1000);
      if (lm) drawHands(ctx, handsRef.current, rect, true);

      // 숫자는 초당 다섯 번만 갱신한다. 매 프레임 setState 하면 60fps로 리렌더된다.
      if (now - lastStatsRef.current > 200) {
        lastStatsRef.current = now;
        setHandCount(handsRef.current.length);
        setBursts(world.bursts);
        if (world.bursts > 0) setEverLaunched(true);
      }
    }

    // 카메라가 꺼진 채 탭으로만 놀았다면, 다 사그라든 뒤 루프를 놓아준다.
    // 빈 캔버스를 60fps로 지우고 있을 이유가 없다.
    const world = worldRef.current;
    if (!lm && world.shells.length === 0 && world.particles.length === 0 && pendingRef.current.length === 0) {
      rafRef.current = null;
      return;
    }
    rafRef.current = requestAnimationFrame(tick);
  }, []);

  const ensureLoop = useCallback(() => {
    if (rafRef.current !== null) return;
    lastFrameRef.current = performance.now();
    rafRef.current = requestAnimationFrame(tick);
  }, [tick]);

  /** 손이 안 잡히거나 카메라를 안 켰을 때도 놀 수 있게, 누른 자리에서 쏜다 */
  const launchAt = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const stage = stageRef.current;
      if (!stage) return;
      const box = stage.getBoundingClientRect();
      if (box.height <= 0) return;
      // 눌린 자리는 이미 무대 위 좌표다. 화면 높이를 1로 두는 세계 좌표로만 옮긴다.
      const y = (e.clientY - box.top) / box.height;
      pendingRef.current.push({ x: (e.clientX - box.left) / box.height, y, power: powerFromHeight(y) });
      ensureLoop();
    },
    [ensureLoop],
  );

  const start = useCallback(async () => {
    if (typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      setPhase("unsupported");
      return;
    }

    setPhase("starting");
    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { width: VIDEO_WIDTH, height: VIDEO_HEIGHT, facingMode: "user" },
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
    await video.play().catch(() => {});

    let landmarker: HandLandmarker;
    try {
      muteWasmNotice();
      // 여기서 처음으로 wasm과 모델을 받는다. 페이지를 열기만 한 사람은 한 바이트도 안 받는다.
      const { HandLandmarker: HL, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks("/mediapipe");
      landmarker = await HL.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: MODEL_URL },
        runningMode: "VIDEO",
        numHands: 2,
        // 기본값(0.5)이면 배경에서 손처럼 생긴 것이 잡혀 혼자 불꽃이 나간다
        minHandDetectionConfidence: 0.6,
        minTrackingConfidence: 0.6,
      });
    } catch {
      stop();
      setPhase("failed");
      return;
    }
    landmarkerRef.current = landmarker;
    lastDetectRef.current = performance.now();
    setPhase("running");
    ensureLoop();
  }, [ensureLoop, stop]);

  const running = phase === "running";

  return (
    // 바깥 레이아웃이 위에 py-16을 두는데, 이 페이지는 무대가 주인공이라
    // 그만큼 비워두면 첫 화면에서 불꽃이 접힌다. 음수 여백으로 끌어올린다.
    <div className="mx-auto -mt-8 max-w-2xl px-5 pb-10">
      {/* 제목 왼쪽, 도움말 오른쪽. 도움말 패널은 절대 위치라 열어도 무대를 밀지 않고 덮는다. */}
      <header className="relative flex min-h-9 items-center justify-between">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">불꽃놀이</h1>
        {/*
          폭을 패널 크기로 고정한다. 안 그러면 닫혔을 때는 버튼 크기, 열리면
          패널 크기가 되어서 오른쪽에 붙은 버튼이 왼쪽으로 튄다.
          버튼은 그 안에서 오른쪽 끝에 붙여 둔다.
        */}
        <GameHelp
          help={GAME_HELP["hand-fireworks"]}
          className="absolute right-0 top-0 w-[min(20rem,calc(100vw-2.5rem))] [&>summary]:ml-auto"
        />
      </header>

      <div
        ref={stageRef}
        onPointerDown={launchAt}
        className={`group relative touch-none overflow-hidden bg-[#05060f] ${
          fs.isFullscreen ? "h-screen w-screen" : "mt-5 aspect-[3/2] rounded-3xl"
        }`}
      >
        {/* 거울처럼 뒤집는다. 랜드마크 좌표도 gesture.ts에서 같이 뒤집는다. */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={`absolute inset-0 h-full w-full -scale-x-100 object-cover transition-opacity duration-700 ${
            running ? "opacity-100" : "opacity-0"
          }`}
        />
        {/*
          밤하늘. 영상을 그냥 깔면 형광등 켠 방이 배경이라 불꽃이 안 보인다.
          위쪽을 더 어둡게 눌러 하늘처럼 만들고, 아래는 사람이 보일 만큼만 남긴다.
        */}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#05060f]/95 via-[#080b1c]/80 to-[#0b1026]/60" />

        <canvas ref={canvasRef} className="pointer-events-none absolute inset-0 h-full w-full" />

        {!running && phase !== "starting" && (
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-2 text-center">
            <p className="font-display text-lg font-bold text-white/85">✋ 손으로 쏘는 불꽃놀이</p>
            <p className="text-sm text-white/45">
              아래에서 카메라를 켜거나, 여기를 눌러도 한 발 나갑니다
            </p>
            <p className="text-xs text-white/30">F를 누르면 전체화면</p>
          </div>
        )}

        {running && handCount === 0 && (
          <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center text-sm text-white/55">
            손을 카메라에 보여 주세요
          </p>
        )}
        {running && handCount > 0 && !everLaunched && (
          <p className="pointer-events-none absolute inset-x-0 top-1/2 text-center text-sm text-white/70">
            주먹을 꽉 쥐었다가, 활짝 펴 보세요
          </p>
        )}

        <p className="pointer-events-none absolute inset-x-0 bottom-0 px-4 py-2 text-center text-xs text-white/30">
          손 모양만 봅니다 · 저장·전송·녹화 없음
        </p>

        {fs.isSupported && (
          // 째려보기와 달리 여기서는 흐리게 두지 않는다. 저 뒤는 밤하늘이라
          // 가릴 것이 없고, 이 페이지는 전체화면으로 보라고 만든 것이다.
          <button
            onClick={fs.toggle}
            onPointerDown={(e) => e.stopPropagation()}
            aria-label={`${fs.isFullscreen ? "전체화면 끝내기" : "전체화면으로 보기"} (단축키 F)`}
            title="단축키 F"
            className="absolute right-3 top-3 rounded-full bg-white/15 px-3 py-1.5 text-xs font-medium text-white/85 backdrop-blur-sm transition hover:bg-white/30 hover:text-white"
          >
            {fs.isFullscreen ? "나가기 (F)" : "전체화면 (F)"}
          </button>
        )}

        {(phase === "denied" || phase === "unsupported") && (
          <CameraPermissionGate
            status={phase}
            note="웹캠에 잡힌 손 모양만 봅니다."
            onRetry={() => {
              setPhase("ready");
              void start();
            }}
          />
        )}
      </div>

      <div className="mt-6">
        {!running ? (
          <button
            onClick={() => void start()}
            disabled={phase === "starting"}
            className="w-full rounded-full bg-accent px-5 py-3 text-sm font-semibold text-white spring-transition hover:scale-[1.01] active:scale-[0.99] disabled:opacity-60"
          >
            {phase === "starting" ? "카메라와 손 모델 여는 중…" : "카메라 켜고 손으로 쏘기"}
          </button>
        ) : (
          <button
            onClick={() => {
              stop();
              setPhase("ready");
            }}
            className="w-full rounded-full border border-border px-5 py-3 text-sm font-semibold spring-transition hover:scale-[1.01] active:scale-[0.99]"
          >
            끄기
          </button>
        )}

        {phase === "failed" && (
          <p className="mt-3 text-center text-sm text-text-secondary">
            손 검출기를 불러오지 못했어요. 인터넷 연결을 확인하고 새로고침한 뒤 다시 시도해 주세요.
          </p>
        )}
      </div>

      {running && (
        <dl className="mt-6 grid grid-cols-2 gap-3 text-center">
          <Stat label="잡힌 손" value={`${handCount}개`} />
          <Stat label="터뜨린 불꽃" value={`${bursts}발`} />
        </dl>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card-bg p-5 text-sm text-text-secondary">
        <p className="font-semibold text-text-primary">잘 안 나갈 때</p>
        <p className="mt-1">
          손바닥이 카메라를 정면으로 보게 하세요. 손날을 보이면 손가락이 겹쳐 보여서 편 손인지
          쥔 손인지 구분이 안 됩니다. 주먹은 «꽉», 펴는 건 «활짝» — 중간에서 어정쩡하게 멈추면
          일부러 안 나가게 해 뒀습니다.
        </p>
        <p className="mt-3 font-semibold text-text-primary">손을 높이 들수록 높이 터집니다</p>
        <p className="mt-1">
          발사 세기는 손의 높이에서 가져옵니다. 화면 위쪽에서 펴면 세게, 아래쪽에서 펴면
          약하게 올라가고, 불꽃은 항상 정점에서 터집니다.
        </p>
        <p className="mt-3 font-semibold text-text-primary">전체화면으로 보세요</p>
        <p className="mt-1">
          무대 오른쪽 위 버튼이나 <kbd className="rounded border border-border px-1">F</kbd> 키로
          전체화면이 됩니다. 나갈 때는 <kbd className="rounded border border-border px-1">Esc</kbd>.
          잘려 나가는 화면 비율은 알아서 맞추니 손과 불꽃이 어긋나지 않습니다.
        </p>

        <p className="mt-3 font-semibold text-text-primary">카메라 없이도 됩니다</p>
        <p className="mt-1">화면 아무 데나 누르면 그 자리에서 한 발 올라갑니다.</p>
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-border bg-card-bg py-3">
      <dt className="text-xs text-text-muted">{label}</dt>
      <dd className="mt-1 text-sm font-semibold">{value}</dd>
    </div>
  );
}
