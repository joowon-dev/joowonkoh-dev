"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FaceDetector } from "@mediapipe/tasks-vision";
import Eyes, { LEVEL_LABELS } from "./Eyes";
import { CameraPermissionGate } from "./CameraPermissionGate";
import { SENSITIVITY_RANGE, useSettings } from "./useSettings";
import { useFullscreen } from "../_shared/useFullscreen";
import {
  createTracker,
  targetTrack,
  trackGaze,
  CENTER_GAZE,
  selfTrack,
  stepTracker,
  type Box,
  type Gaze,
} from "./detect";
import { createGlareState, stepGlare, type GlareLevel } from "./state";

/** 검출 루프 주기(ms). 10fps — 60fps로 돌릴 이유가 없고 노트북 팬만 돈다. */
const DETECT_INTERVAL = 100;
const VIDEO_WIDTH = 640;
const VIDEO_HEIGHT = 480;

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

export default function GlareGame() {
  const { settings, update } = useSettings();
  const [phase, setPhase] = useState<Phase>("ready");
  const [level, setLevel] = useState<GlareLevel>("idle");
  /** 화면에 보여주는 숫자. 이 앱이 다루는 정보가 이게 전부라는 걸 그대로 드러낸다. */
  const [faceCount, setFaceCount] = useState(0);
  const [selfLocked, setSelfLocked] = useState(false);
  const [gaze, setGaze] = useState<Gaze>(CENTER_GAZE);

  const stageRef = useRef<HTMLDivElement | null>(null);
  const fs = useFullscreen(stageRef);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectorRef = useRef<FaceDetector | null>(null);
  const rafRef = useRef<number | null>(null);
  const trackerRef = useRef(createTracker());
  const glareRef = useRef(createGlareState());
  // 민감도가 바뀔 때마다 루프를 다시 만들지 않으려고 ref로 읽는다
  const sensitivityRef = useRef(settings.sensitivity);
  sensitivityRef.current = settings.sensitivity;
  const soloRef = useRef(settings.soloGlare);
  soloRef.current = settings.soloGlare;

  const stop = useCallback(() => {
    if (rafRef.current !== null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
    detectorRef.current?.close();
    detectorRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    trackerRef.current = createTracker();
    glareRef.current = createGlareState();
    restoreConsole?.();
    setLevel("idle");
    setFaceCount(0);
    setSelfLocked(false);
    setGaze(CENTER_GAZE);
  }, []);

  // 탭을 닫거나 다른 페이지로 가면 카메라를 확실히 끈다
  useEffect(() => stop, [stop]);

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

    let detector: FaceDetector;
    try {
      muteWasmNotice();
      // 여기서 처음으로 wasm을 받는다. 페이지를 열기만 한 사람은 한 바이트도 안 받는다.
      const { FaceDetector: FD, FilesetResolver } = await import("@mediapipe/tasks-vision");
      const fileset = await FilesetResolver.forVisionTasks("/mediapipe");
      detector = await FD.createFromOptions(fileset, {
        baseOptions: { modelAssetPath: "/mediapipe/blaze_face_short_range.tflite" },
        runningMode: "VIDEO",
      });
    } catch {
      stop();
      setPhase("failed");
      return;
    }
    detectorRef.current = detector;
    setPhase("running");

    let last = 0;
    const loop = () => {
      rafRef.current = requestAnimationFrame(loop);

      const now = performance.now();
      if (now - last < DETECT_INTERVAL) return;
      last = now;

      const v = videoRef.current;
      const d = detectorRef.current;
      if (!v || !d || v.readyState < 2 || v.videoWidth === 0) return;

      const result = d.detectForVideo(v, now);
      const boxes: Box[] = [];
      for (const det of result.detections) {
        const b = det.boundingBox;
        if (!b) continue;
        // 검출 결과는 픽셀이다. 정규화해서 넘겨야 해상도와 무관하게 임계값이 통한다.
        boxes.push({
          x: b.originX / v.videoWidth,
          y: b.originY / v.videoHeight,
          w: b.width / v.videoWidth,
          h: b.height / v.videoHeight,
        });
      }

      const tracker = stepTracker(trackerRef.current, boxes);
      trackerRef.current = tracker;

      const me = selfTrack(tracker);
      const target = targetTrack(tracker, soloRef.current);
      const next = stepGlare(glareRef.current, target?.box.h ?? null, sensitivityRef.current);
      glareRef.current = next;

      setFaceCount(boxes.length);
      setSelfLocked(me !== null);
      setLevel((prev) => (prev === next.level ? prev : next.level));
      setGaze((prev) => trackGaze(prev, target));
    };
    loop();
  }, [stop]);

  const running = phase === "running";

  return (
    <div className="mx-auto max-w-2xl px-5 py-10">
      <header className="text-center">
        <h1 className="font-display text-2xl font-bold sm:text-3xl">개바리 째려보기</h1>
        <p className="mt-2 text-sm text-text-secondary">
          내 얼굴 말고 다른 얼굴이 웹캠에 잡히면 개바리가 그쪽을 째려봅니다.
        </p>
      </header>

      {/* 전체화면으로 들어가는 것은 이 상자다. 보조 모니터에 이것만 띄워 둔다. */}
      <div
        ref={stageRef}
        className={`group relative overflow-hidden bg-black ${
          fs.isFullscreen ? "" : "mt-8 rounded-3xl"
        }`}
      >
        <div
          className={`flex items-center justify-center ${
            fs.isFullscreen ? "h-screen w-screen" : "aspect-[3/2] p-8"
          }`}
        >
          <Eyes
            level={level}
            gaze={gaze}
            className={fs.isFullscreen ? "w-[68vw] max-w-5xl" : "w-full max-w-md"}
          />
        </div>

        {/*
          비디오는 검출용이라 미리보기를 껐어도 DOM에는 있어야 프레임이 나온다.
          전체화면 요소 안에 둬야 전체화면에서도 보인다 — 바깥에 두면 화면에서 사라진다.
          좌우를 뒤집어 거울처럼 보여준다.
        */}
        <video
          ref={videoRef}
          playsInline
          muted
          className={
            settings.showPreview && running
              ? `absolute bottom-10 left-4 -scale-x-100 rounded-xl border border-white/15 shadow-lg ${
                  fs.isFullscreen ? "w-72" : "w-32 sm:w-40"
                }`
              : "pointer-events-none absolute h-px w-px opacity-0"
          }
        />

        {/* 이 문구는 어떤 상태에서도 사라지지 않는다. 숨길 이유가 없는 물건이라는 걸 화면이 직접 말한다. */}
        <p className="absolute inset-x-0 bottom-0 px-4 py-2 text-center text-xs text-white/35">
          얼굴 개수만 셉니다 · 저장·전송·녹화 없음
        </p>

        {fs.isSupported && (
          // 검은 화면을 해치지 않게 평소엔 흐리게 두고, 가져다 대면 드러난다
          <button
            onClick={fs.toggle}
            aria-label={fs.isFullscreen ? "전체화면 끝내기" : "전체화면으로 보기"}
            className="absolute right-3 top-3 rounded-full bg-white/10 px-3 py-1.5 text-xs text-white/50 opacity-40 transition hover:bg-white/20 hover:text-white hover:opacity-100 focus-visible:opacity-100 group-hover:opacity-100"
          >
            {fs.isFullscreen ? "나가기" : "전체화면"}
          </button>
        )}

        {(phase === "denied" || phase === "unsupported") && (
          <CameraPermissionGate
            status={phase}
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
            {phase === "starting" ? "카메라 여는 중…" : "개바리 켜기"}
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
            얼굴 검출기를 불러오지 못했어요. 새로고침한 뒤 다시 시도해 주세요.
          </p>
        )}
      </div>

      {running && (
        <dl className="mt-6 grid grid-cols-3 gap-3 text-center">
          <Stat label="잡힌 얼굴" value={`${faceCount}`} />
          <Stat label="내 자리" value={selfLocked ? "잡힘" : "찾는 중"} />
          <Stat label="눈빛" value={LEVEL_LABELS[level]} />
        </dl>
      )}

      <div className="mt-6 rounded-2xl border border-border bg-card-bg p-5">
        <label className="block text-sm font-semibold">민감도</label>
        <p className="mt-1 text-xs text-text-muted">
          올리면 더 멀리서부터 째려봅니다. 낮추면 코앞에 와야 반응해요.
        </p>
        <input
          type="range"
          min={SENSITIVITY_RANGE.min}
          max={SENSITIVITY_RANGE.max}
          step={SENSITIVITY_RANGE.step}
          value={settings.sensitivity}
          onChange={(e) => update({ sensitivity: Number(e.target.value) })}
          className="mt-3 w-full accent-accent"
        />
        <div className="mt-1 flex justify-between text-xs text-text-muted">
          <span>둔감</span>
          <span>{settings.sensitivity.toFixed(1)}</span>
          <span>예민</span>
        </div>

        <label className="mt-5 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.showPreview}
            onChange={(e) => update({ showPreview: e.target.checked })}
            className="accent-accent"
          />
          웹캠 화면 같이 보기
        </label>

        <label className="mt-3 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={settings.soloGlare}
            onChange={(e) => update({ soloGlare: e.target.checked })}
            className="accent-accent"
          />
          얼굴이 하나여도 째려보기
        </label>
        <p className="mt-1 pl-6 text-xs text-text-muted">
          혼자 시험해 볼 때 켜세요. 끄면 원래대로, 얼굴이 2개 이상 잡혀야 반응합니다.
        </p>
      </div>

      <div className="mt-6 rounded-2xl border border-border bg-card-bg p-5 text-sm text-text-secondary">
        <p className="font-semibold text-text-primary">별도 창으로 띄워 보조 모니터에 두세요</p>
        <p className="mt-1">
          같은 창의 다른 탭으로 두면 브라우저가 백그라운드 탭의 프레임 처리를 초당 1회로
          줄여버려서 감지가 멈춥니다.
        </p>
        <p className="mt-3 font-semibold text-text-primary">어떻게 알아보나요</p>
        <p className="mt-1">
          누가 누구인지는 판정하지 않습니다. 얼굴이 2개 이상 잡히면 나 말고 누가 온 것이고,
          그중 화면에서 가장 크게 잡힌 얼굴이 가장 가까이 온 사람입니다. 내 자리는 3초 넘게
          계속 잡힌 얼굴로 잡습니다. 얼굴이 하나뿐일 때 반응할지는 위 설정에서 정합니다.
        </p>
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
