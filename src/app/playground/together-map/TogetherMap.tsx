"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { boundsOf, DAMPING, fitView, padBounds, stepCamera, type View } from "./camera";
import { FPS, recordCanvas, SIZES } from "./encode";
import { DEFAULT_ACCURACY_LIMIT_M, filterPoints } from "./filter";
import type { LatLon } from "./geo";
import { resolveLang, t, type Lang, type Strings } from "./i18n";
import {
  DEFAULT_MEET_MIN_MS,
  DEFAULT_MEET_RADIUS_M,
  MAX_GAP_MS,
  findMeetings,
  overlapRange,
  type Meeting,
} from "./meet";
import MeetList from "./MeetList";
import { TimelineParseError, parseTimeline, type RawPoint } from "./parse";
import {
  currentPosition,
  drawFrame,
  meetingPulse,
  pulseMsFor,
  tailMsFor,
  tailSegments,
  type FrameState,
  type Size,
  type Track,
} from "./render";
import {
  computeNow,
  dateRangeBounds,
  paceMsPerFrame,
  shouldKeepWaitingForTiles,
  summaryOpacity,
} from "./playback";
import { buildSampleTimeline, SAMPLE_NAMES } from "./sample";
import SetupPanel, { type Settings } from "./SetupPanel";
import { buildSummary, type Summary } from "./summary";
import { TileCache, visibleTiles } from "./tiles";

type Stage = "pick" | "consent" | "setup" | "playing" | "recording" | "done";

/** 녹화 전 대기 중인 타일을 기다려 줄 최대 시간(ms). 6번 함정. */
const TILE_WAIT_MS = 3_000;

const DEFAULT_SETTINGS: Settings = {
  langPref: "system",
  useRawData: false,
  accuracyLimitM: DEFAULT_ACCURACY_LIMIT_M,
  outlier: "conservative",
  exactDates: false,
  startDate: "",
  endDate: "",
  videoTitle: "",
  durationSec: 10,
  camera: "steady",
  sizeIndex: 0,
  nameA: "",
  nameB: "",
  colorA: "#2f6feb",
  colorB: "#e0447c",
  meetRadiusM: DEFAULT_MEET_RADIUS_M,
  meetMinMinutes: DEFAULT_MEET_MIN_MS / 60_000,
  hideHome: true,
  hideHomeRadiusM: 300,
  showSummary: true,
};

const sleep = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

interface VideoResult {
  blob: Blob;
  ext: "mp4" | "webm";
}

/**
 * 지금 화면에 그려야 할 것들의 스냅샷.
 *
 * rAF 루프는 이 값을 매 프레임 최신 상태로 읽어야 하지만, 그렇다고 매 렌더마다
 * 루프를 새로 만들면(= effect 의존성에 이 값들을 그대로 넣으면) 설정 패널의
 * 키 입력 하나마다 루프가 취소되고 다시 시작된다. ref 하나에 몰아 두고 루프는
 * ref만 읽게 해서, React 렌더 빈도와 캔버스 그리기 빈도를 떼어 놓는다.
 */
interface LatestState {
  filteredA: RawPoint[] | null;
  filteredB: RawPoint[] | null;
  range: { from: number; to: number } | null;
  meetings: Meeting[];
  summary: Summary | null;
  settings: Settings;
  strings: Strings;
  lang: Lang;
  /** 여정 전체가 담기는 시야. 마무리에서 여기까지 물러난다. */
  wholeView: View | null;
  homeSpots: { lat: number; lon: number; radiusM: number }[] | null;
}

export default function TogetherMap() {
  const [stage, setStage] = useState<Stage>("pick");

  const [pointsA, setPointsA] = useState<RawPoint[] | null>(null);
  const [pointsB, setPointsB] = useState<RawPoint[] | null>(null);
  const [reading, setReading] = useState(false);
  const [readError, setReadError] = useState<string | null>(null);

  const [settings, setSettings] = useState<Settings>(DEFAULT_SETTINGS);

  // navigator는 첫 렌더(서버)에 없다. 첫 렌더는 서버·클라이언트 모두 "ko"로
  // 맞춰 두고, 마운트 뒤 effect에서만 실제 언어를 읽는다 — 안 그러면 하이드레이션
  // 경고가 난다. 5번 함정.
  const [lang, setLang] = useState<Lang>("ko");
  useEffect(() => {
    setLang(resolveLang(settings.langPref, navigator.languages));
  }, [settings.langPref]);
  const strings = useMemo(() => t(lang), [lang]);

  const [exportProgress, setExportProgress] = useState(0);
  // readError는 pick 단계에서만 보인다 — 녹화 실패를 거기 밀어 넣으면 사용자가
  // setup으로 돌아온 뒤 아무 설명도 못 본다. 그래서 따로 둔다.
  const [exportError, setExportError] = useState<string | null>(null);
  const [videoResult, setVideoResult] = useState<VideoResult | null>(null);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [canShareFile, setCanShareFile] = useState(false);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tileCacheRef = useRef<TileCache | null>(null);
  const needsDrawRef = useRef(true);
  const viewRef = useRef<View>({ centerLat: 0, centerLon: 0, zoom: 2 });
  /**
   * 카메라가 첫 자리를 잡았는가.
   *
   * steady/dynamic은 목표를 향해 조금씩만 다가간다(stepCamera). 그런데 시작 시야는
   * 위도 0, 경도 0 — 아프리카 앞바다다. 첫 프레임부터 damping을 걸면 영상이 대서양에서
   * 한국까지 훑어 오는 것으로 시작하고, 그동안 두 사람은 화면 밖에 있어 아무것도
   * 안 보인다. 그래서 첫 목표만은 damping 없이 그대로 앉힌다. 그 뒤부터가 부드럽게
   * 따라가는 구간이다.
   */
  const cameraSeededRef = useRef(false);
  const nowRef = useRef(0);
  const playStateRef = useRef<{ playing: boolean; startPerf: number }>({
    playing: false,
    startPerf: 0,
  });
  const abortRef = useRef<AbortController | null>(null);
  const latestRef = useRef<LatestState | null>(null);

  // 1단계 — 파일을 읽는다. 수백 MB짜리 파일일 수 있으므로 읽는 동안 버튼을 잠근다.
  async function handleFile(which: "a" | "b", file: File) {
    setReading(true);
    setReadError(null);
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      const points = parseTimeline(data);
      if (which === "a") setPointsA(points);
      else setPointsB(points);
    } catch (err) {
      // TimelineParseError의 메시지를 그대로 보여준다 — 형식과 스킵 개수가
      // 적혀 있는, 사용자가 얻을 수 있는 유일한 진단 정보다.
      if (err instanceof TimelineParseError) {
        setReadError(err.message);
      } else {
        const detail = err instanceof Error ? err.message : String(err);
        setReadError(`${strings.parseFailed} (${detail})`);
      }
    } finally {
      setReading(false);
    }
  }

  function loadSample() {
    setReading(true);
    setReadError(null);
    try {
      const a = parseTimeline(buildSampleTimeline("a", "android"));
      const b = parseTimeline(buildSampleTimeline("b", "ios"));
      setPointsA(a);
      setPointsB(b);
      setSettings((s) => ({ ...s, nameA: SAMPLE_NAMES.a, nameB: SAMPLE_NAMES.b }));
    } catch (err) {
      if (err instanceof TimelineParseError) {
        setReadError(err.message);
      } else {
        const detail = err instanceof Error ? err.message : String(err);
        setReadError(`${strings.parseFailed} (${detail})`);
      }
    } finally {
      setReading(false);
    }
  }

  // 두 파일이 다 준비되면 동의 화면으로 넘어간다.
  useEffect(() => {
    if (pointsA && pointsB && stage === "pick") setStage("consent");
  }, [pointsA, pointsB, stage]);

  // 동의 전에는 타일을 한 장도 요청하지 않는다 — TileCache는 여기서만 만든다.
  // 1번 함정.
  function handleConsent() {
    needsDrawRef.current = true;
    tileCacheRef.current = new TileCache(() => {
      // onLoad는 타일마다 한 번씩, 배치 없이 불린다. 여기서 setState를 하면
      // 타일 서른 장에 서른 번 리렌더가 일어난다. ref 플래그만 세우고,
      // 실제로 다시 그리는 것은 rAF 루프가 이 플래그를 읽고 처리한다. 2번 함정.
      needsDrawRef.current = true;
    });
    setStage("setup");
  }

  // 파싱 → 필터 → 검출. 필터링이 실제로 쓰는 설정 값들이 바뀔 때만 다시 계산한다.
  //
  // 의존성을 settings 객체 전체로 두면, 이름이나 제목 하나 타이핑할 때마다(그때마다
  // setSettings가 객체를 새로 만든다) 수백 MB짜리 트랙에 filterPoints부터
  // findMeetings까지 전부 다시 돈다 — 키 입력마다 눈에 보이는 멈춤이 생긴다.
  // 여기서 쓰는 값만 정확히 나열한다.
  const filteredA = useMemo(() => {
    if (!pointsA) return null;
    return applyFilters(pointsA, {
      useRawData: settings.useRawData,
      accuracyLimitM: settings.accuracyLimitM,
      outlier: settings.outlier,
      exactDates: settings.exactDates,
      startDate: settings.startDate,
      endDate: settings.endDate,
    });
  }, [
    pointsA,
    settings.useRawData,
    settings.accuracyLimitM,
    settings.outlier,
    settings.exactDates,
    settings.startDate,
    settings.endDate,
  ]);

  const filteredB = useMemo(() => {
    if (!pointsB) return null;
    return applyFilters(pointsB, {
      useRawData: settings.useRawData,
      accuracyLimitM: settings.accuracyLimitM,
      outlier: settings.outlier,
      exactDates: settings.exactDates,
      startDate: settings.startDate,
      endDate: settings.endDate,
    });
  }, [
    pointsB,
    settings.useRawData,
    settings.accuracyLimitM,
    settings.outlier,
    settings.exactDates,
    settings.startDate,
    settings.endDate,
  ]);

  const range = useMemo(() => {
    if (!filteredA || !filteredB) return null;
    return overlapRange(filteredA, filteredB);
  }, [filteredA, filteredB]);

  const meetings = useMemo(() => {
    if (!filteredA || !filteredB) return [];
    return findMeetings(filteredA, filteredB, {
      radiusM: settings.meetRadiusM,
      minDurationMs: settings.meetMinMinutes * 60_000,
    });
  }, [filteredA, filteredB, settings.meetRadiusM, settings.meetMinMinutes]);

  // 마무리 카드용 요약. 한 번만 계산해 둔다.
  const summary = useMemo(() => {
    if (!filteredA || !filteredB) return null;
    return buildSummary(filteredA, filteredB, meetings);
  }, [filteredA, filteredB, meetings]);

  const homeSpots = useMemo(() => {
    if (!settings.hideHome || !filteredA || !filteredB) return null;
    const spots: { lat: number; lon: number; radiusM: number }[] = [];
    if (filteredA[0]) spots.push({ lat: filteredA[0].lat, lon: filteredA[0].lon, radiusM: settings.hideHomeRadiusM });
    if (filteredB[0]) spots.push({ lat: filteredB[0].lat, lon: filteredB[0].lon, radiusM: settings.hideHomeRadiusM });
    return spots;
  }, [settings.hideHome, settings.hideHomeRadiusM, filteredA, filteredB]);

  // 기간이 정해지면 재생 시각을 그 시작점으로 되돌린다.
  useEffect(() => {
    if (range) nowRef.current = range.from;
  }, [range]);

  // fixed 카메라는 전체 기간의 fitView를 한 번만 구해서 고정한다.
  const fixedView = useMemo<View | null>(() => {
    if (!filteredA || !filteredB) return null;
    const bounds = boundsOf(
      [...filteredA, ...filteredB].map((p): LatLon => ({ lat: p.lat, lon: p.lon })),
    );
    if (!bounds) return null;
    const size = SIZES[settings.sizeIndex];
    return fitView(padBounds(bounds, 0.35), size.w, size.h, Math.round(size.w * 0.08));
  }, [filteredA, filteredB, settings.sizeIndex]);

  useEffect(() => {
    if (fixedView && settings.camera === "fixed") viewRef.current = fixedView;
    // 카메라 모드나 데이터가 바뀌면 다시 «자리를 잡아야» 한다. 아래 seeded 참조.
    cameraSeededRef.current = false;
  }, [fixedView, settings.camera]);

  // 매 렌더 뒤 최신 값을 ref에 채워 둔다. rAF 루프는 이것만 읽는다.
  //
  // needsDrawRef를 여기서도 세운다 — 이 ref는 "타일이 도착했다"만이 아니라
  // "다시 그려야 할 무언가가 바뀌었다"는 뜻이다(그래서 tileDirtyRef가 아니라
  // needsDrawRef라는 이름이다). 이걸 빼먹으면 setup 단계에서 크기·카메라·색·
  // 이름·제목·필터·언어를 바꿔도 캔버스가 안 움직인다 — 재생 중이 아니고 마침
  // 타일도 다 받아 둔 상태라면(정적인 대다수의 경우) 다시 그릴 이유가 하나도
  // 안 남기 때문이다. 타일이 계속 들어오는 동안에는 tileDirtyRef 쪽 신호에
  // 우연히 가려져서 "가끔은 되는" 것처럼 보였던 문제라, 렌더마다 무조건 세운다.
  useEffect(() => {
    needsDrawRef.current = true;
    latestRef.current = {
      filteredA,
      filteredB,
      range,
      meetings,
      summary,
      settings,
      strings,
      lang,
      wholeView: fixedView,
      homeSpots,
    };
  });

  // 재생/그리기 루프. 동의 이후 단계에서만 돈다 — 그 전에는 캔버스도 타일도 없다.
  useEffect(() => {
    if (stage === "pick" || stage === "consent") return;

    let raf = 0;
    const loop = () => {
      raf = requestAnimationFrame(loop);
      const state = latestRef.current;
      const canvas = canvasRef.current;
      const cache = tileCacheRef.current;
      if (!state || !canvas || !cache || !state.filteredA || !state.filteredB) return;

      let needsDraw = needsDrawRef.current;
      needsDrawRef.current = false;

      if (playStateRef.current.playing && state.range) {
        const elapsedSec = (performance.now() - playStateRef.current.startPerf) / 1000;
        nowRef.current = computeNow(elapsedSec, state.settings.durationSec, state.range);
        needsDraw = true;
        if (elapsedSec >= state.settings.durationSec) {
          playStateRef.current.playing = false;
          nowRef.current = state.range.to;
        }
      }

      if (!needsDraw) return;

      const size: Size = { w: SIZES[state.settings.sizeIndex].w, h: SIZES[state.settings.sizeIndex].h };

      // 압축률. 꼬리·링 길이와 카메라가 모두 같은 값을 봐야 서로 어긋나지 않는다.
      const pace = state.range
        ? paceMsPerFrame(state.range, state.settings.durationSec, FPS)
        : 0;

      const totalSpan = state.range ? Math.max(1, state.range.to - state.range.from) : 1;
      const ratio = state.range ? (nowRef.current - state.range.from) / totalSpan : 0;
      const opacity =
        state.settings.showSummary && state.summary
          ? summaryOpacity(ratio, state.settings.durationSec)
          : 0;

      // 카메라. fixed는 useEffect에서 이미 고정해 뒀으니 여기서는 건드리지 않는다.
      if (state.settings.camera !== "fixed") {
        if (opacity > 0 && state.wholeView) {
          // 마무리가 뜨기 시작하면 여정 전체가 담기는 시야로 물러난다. 카드가
          // 말하는 수치는 기간 전체인데 화면은 마지막 몇 시간만 비추고 있으면
          // 둘이 서로 다른 이야기를 한다.
          //
          // 여기서만 damping 대신 카드가 짙어지는 정도(opacity)를 그대로 쓴다.
          // 고정 damping으로 두면 재생이 끝나 프레임이 멈추는 순간 카메라도
          // 가던 길에 얼어붙는다 — 실제로 그렇게 해 봤더니 마지막 화면이 오산
          // 상공에 멈춰서, 정작 보여 주려던 궤적이 화면 위로 잘려 나갔다.
          // opacity는 끝에서 반드시 1이 되므로 이 방식은 목표에 정확히 닿는다.
          viewRef.current = stepCamera(viewRef.current, state.wholeView, opacity);
          cameraSeededRef.current = true;
        } else {
          const target = dynamicTarget(state, nowRef.current, size, pace);
          if (target) {
            viewRef.current = cameraSeededRef.current
              ? stepCamera(viewRef.current, target, DAMPING[state.settings.camera])
              : target;
            cameraSeededRef.current = true;
          }
        }
      }

      const tiles = visibleTiles(viewRef.current, size).flatMap((ref) => {
        const img = cache.get(ref);
        return img ? [{ image: img, x: ref.screenX, y: ref.screenY, size: ref.size }] : [];
      });

      const tracks: [Track, Track] = [
        {
          id: "a",
          name: state.settings.nameA || state.strings.personA,
          color: state.settings.colorA,
          points: state.filteredA,
        },
        {
          id: "b",
          name: state.settings.nameB || state.strings.personB,
          color: state.settings.colorB,
          points: state.filteredB,
        },
      ];

      const frame: FrameState = {
        size,
        view: viewRef.current,
        tracks,
        meetings: state.meetings,
        now: nowRef.current,
        tiles,
        meetCount: state.meetings.filter((m) => m.start <= nowRef.current).length,
        // 기본 제목을 얹지 않는다. 화면 위쪽은 날짜와 시각만 남기고, 제목은
        // 사용자가 «영상 제목»에 직접 적었을 때만 나온다.
        title: state.settings.videoTitle,
        hide: state.homeSpots,
        strings: state.strings,
        summary: opacity > 0 && state.summary ? { data: state.summary, opacity } : null,
        paceMsPerFrame: pace,
        lang: state.lang,
        progress: ratio,
      };

      if (canvas.width !== size.w || canvas.height !== size.h) {
        canvas.width = size.w;
        canvas.height = size.h;
      }
      const ctx = canvas.getContext("2d");
      if (ctx) drawFrame(ctx, frame);
    };

    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [stage]);

  function startPreview() {
    if (!range) return;
    playStateRef.current = { playing: true, startPerf: performance.now() };
    nowRef.current = range.from;
    // 첫 프레임부터 두 사람이 화면에 들어와 있어야 한다 — 시야를 다시 앉힌다.
    cameraSeededRef.current = false;
    setStage("playing");
  }

  // 재생이 자연스럽게 끝나면(녹화 중이 아닐 때) 설정 화면으로 되돌아온다.
  useEffect(() => {
    if (stage !== "playing") return;
    const id = window.setInterval(() => {
      if (!playStateRef.current.playing) setStage("setup");
    }, 150);
    return () => window.clearInterval(id);
  }, [stage]);

  async function startExport() {
    if (!range || !canvasRef.current) return;
    const controller = new AbortController();
    abortRef.current = controller;
    setExportProgress(0);
    setExportError(null);
    setStage("recording");

    // 타일이 아직 오는 중이면 최대 3초 기다린다 — 안 그러면 앞부분이 빈 지도로
    // 녹화된다. 6번 함정.
    const waitStart = performance.now();
    const cache = tileCacheRef.current;
    if (cache) {
      while (shouldKeepWaitingForTiles(cache.pendingCount, performance.now() - waitStart, TILE_WAIT_MS)) {
        if (controller.signal.aborted) break;
        await sleep(100);
      }
    }

    if (controller.signal.aborted) {
      abortRef.current = null;
      setStage("setup");
      return;
    }

    // 녹화 시작과 동시에 재생을 처음부터 다시 시작한다.
    playStateRef.current = { playing: true, startPerf: performance.now() };
    nowRef.current = range.from;
    // 첫 프레임부터 두 사람이 화면에 들어와 있어야 한다 — 시야를 다시 앉힌다.
    cameraSeededRef.current = false;

    try {
      const result = await recordCanvas(
        canvasRef.current,
        settings.durationSec,
        (r) => setExportProgress(r),
        controller.signal,
      );
      setVideoResult(result);
      setStage("done");
    } catch (err) {
      const isAbort = err instanceof DOMException && err.name === "AbortError";
      if (!isAbort) {
        const detail = err instanceof Error ? err.message : String(err);
        // readError가 아니라 exportError에 담는다 — readError는 pick 화면에서만
        // 그려지므로, 여기 넣으면 setup으로 돌아온 사용자에게 아무것도 안 보인다.
        setExportError(strings.exportFailed.replace("{n}", detail));
      }
      setStage("setup");
    } finally {
      playStateRef.current.playing = false;
      abortRef.current = null;
    }
  }

  function cancelExport() {
    abortRef.current?.abort();
  }

  // 녹화 도중 컴포넌트가 언마운트되면(예: 다른 페이지로 이동) 취소해 둔다.
  // 안 그러면 MediaRecorder와 captureStream이 떨어져 나간 캔버스를 향해
  // durationSec이 끝날 때까지 계속 돈다.
  useEffect(() => {
    return () => {
      abortRef.current?.abort();
    };
  }, []);

  // 만든 영상의 objectURL. 다시 만들 때마다 이전 것을 반드시 해제한다 —
  // 안 그러면 다시 만들 때마다 메모리가 쌓인다. 4번 함정.
  useEffect(() => {
    if (!videoResult) {
      setVideoUrl(null);
      return;
    }
    const url = URL.createObjectURL(videoResult.blob);
    setVideoUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [videoResult]);

  // 공유 가능 여부는 영상이 생긴 뒤에만 확인한다 — navigator.canShare 자체는
  // 첫 렌더 분기에 관여하지 않으므로(videoResult는 항상 null로 시작한다)
  // 하이드레이션과는 무관하지만, 그래도 부수효과이니 effect에 둔다.
  useEffect(() => {
    if (!videoResult || typeof navigator === "undefined" || !navigator.canShare) {
      setCanShareFile(false);
      return;
    }
    try {
      const file = new File([videoResult.blob], `together.${videoResult.ext}`, {
        type: videoResult.blob.type,
      });
      setCanShareFile(navigator.canShare({ files: [file] }));
    } catch {
      setCanShareFile(false);
    }
  }, [videoResult]);

  async function handleShare() {
    if (!videoResult) return;
    try {
      const file = new File([videoResult.blob], `together.${videoResult.ext}`, {
        type: videoResult.blob.type,
      });
      await navigator.share({ files: [file], title: settings.videoTitle || strings.title });
    } catch {
      // 사용자가 공유 시트를 취소했거나 실패했다 — 조용히 둔다.
    }
  }

  function resetToSetup() {
    setVideoResult(null);
    setStage("setup");
  }

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-8">
      <h1 className="text-2xl font-bold text-text-primary">{strings.title}</h1>
      <p className="mt-2 text-sm text-text-secondary">{strings.intro}</p>

      {stage === "pick" && (
        <PickStage
          strings={strings}
          reading={reading}
          error={readError}
          hasA={!!pointsA}
          hasB={!!pointsB}
          onFileA={(f) => handleFile("a", f)}
          onFileB={(f) => handleFile("b", f)}
          onSample={loadSample}
        />
      )}

      {stage === "consent" && <ConsentStage strings={strings} onAgree={handleConsent} />}

      {stage !== "pick" && stage !== "consent" && (
        <div className="mt-6">
          <div className="overflow-hidden rounded-2xl border border-border bg-card-bg">
            <canvas ref={canvasRef} className="block h-auto w-full" />
          </div>

          {stage === "setup" && (
            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={startPreview}
                disabled={!range}
                className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white spring-transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {strings.preview}
              </button>
              <button
                type="button"
                onClick={startExport}
                disabled={!range}
                className="rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent spring-transition disabled:cursor-not-allowed disabled:opacity-40"
              >
                {strings.createVideo}
              </button>
            </div>
          )}

          {stage === "setup" && exportError && (
            <p className="mt-3 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              {exportError}
            </p>
          )}

          {stage === "playing" && (
            <p className="mt-3 text-xs text-text-muted">{strings.preview}…</p>
          )}

          {stage === "recording" && (
            <div className="mt-4">
              <div className="h-2 w-full overflow-hidden rounded-full bg-accent-soft">
                <div
                  className="h-full rounded-full bg-accent spring-transition"
                  style={{ width: `${Math.round(exportProgress * 100)}%` }}
                />
              </div>
              <div className="mt-3 flex items-center gap-3">
                <p className="text-sm text-text-secondary">{strings.rendering}</p>
                <button
                  type="button"
                  onClick={cancelExport}
                  className="rounded-full border border-border px-3 py-1.5 text-xs font-medium text-text-secondary spring-transition hover:border-accent/40"
                >
                  {strings.cancelVideo}
                </button>
              </div>
            </div>
          )}

          {stage === "done" && videoResult && videoUrl && (
            <div className="mt-4">
              {videoResult.ext === "webm" && (
                <p className="mb-2 text-xs text-text-muted">{strings.webmFallback}</p>
              )}
              <video src={videoUrl} controls className="w-full rounded-2xl border border-border" />
              <div className="mt-3 flex flex-wrap gap-2">
                <a
                  href={videoUrl}
                  download={`${settings.videoTitle || "together"}.${videoResult.ext}`}
                  className="rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white spring-transition"
                >
                  {strings.downloadVideo}
                </a>
                {canShareFile && (
                  <button
                    type="button"
                    onClick={handleShare}
                    className="rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent spring-transition"
                  >
                    {strings.shareVideo}
                  </button>
                )}
                <button
                  type="button"
                  onClick={resetToSetup}
                  className="rounded-full border border-border px-4 py-2 text-sm font-medium text-text-secondary spring-transition hover:border-accent/40"
                >
                  {strings.startOver}
                </button>
              </div>
            </div>
          )}

          <MeetList meetings={meetings} lang={lang} strings={strings} />

          {stage === "setup" && (
            <SetupPanel
              settings={settings}
              strings={strings}
              onChange={(patch) => setSettings((s) => ({ ...s, ...patch }))}
            />
          )}
        </div>
      )}
    </div>
  );
}

interface FilterSettings {
  useRawData: boolean;
  accuracyLimitM: number;
  outlier: "conservative" | "off";
  exactDates: boolean;
  startDate: string;
  endDate: string;
}

/**
 * useRawData면 필터를 건너뛰고, 아니면 정확도·이상치 필터를 적용한 뒤 날짜 범위로 자른다.
 *
 * 인자를 Settings 전체가 아니라 필터링이 실제로 쓰는 여섯 필드만 받는 좁은
 * 타입으로 제한한다. 그래야 이 함수를 부르는 useMemo의 의존성 배열이 정확히
 * 이 필드들만 나열하고 있다는 것을, exhaustive-deps 린트가 이 함수 시그니처를
 * 보고 그대로 검증해 준다 — settings 전체를 받으면 린트가 "settings를 통째로
 * 넣으라"고 요구해서, 다시 객체 전체를 의존성에 넣는 원래 버그로 되돌아간다.
 */
function applyFilters(points: RawPoint[], settings: FilterSettings): RawPoint[] {
  const base = settings.useRawData
    ? points
    : filterPoints(points, { accuracyLimitM: settings.accuracyLimitM, outlier: settings.outlier });

  if (!settings.exactDates) return base;

  const bounds = dateRangeBounds(settings.startDate, settings.endDate);
  if (!bounds) return base;

  return base.filter((p) => p.t >= bounds.from && p.t <= bounds.to);
}

/**
 * steady/dynamic 카메라의 목표 시야. 현재 두 사람 위치와 최근 꼬리를 감싸는
 * 사각형에 여유를 두고 맞춘다. dynamic이고 지금 진행 중인 만남이 있으면
 * 줌을 조금 더 당긴다.
 */
function dynamicTarget(
  state: LatestState,
  now: number,
  size: Size,
  pace: number,
): View | null {
  if (!state.filteredA || !state.filteredB) return null;

  // 그리는 쪽과 같은 꼬리 길이를 봐야 한다. 다른 값을 쓰면 카메라가
  // 화면에 없는 궤적을 담으려고 엉뚱하게 물러선다.
  const tailMs = tailMsFor(pace);
  const segA = tailSegments(state.filteredA, now, tailMs, MAX_GAP_MS);
  const segB = tailSegments(state.filteredB, now, tailMs, MAX_GAP_MS);
  const pts: LatLon[] = [];
  for (const seg of segA) pts.push(...seg);
  for (const seg of segB) pts.push(...seg);

  const posA = currentPosition(state.filteredA, now);
  const posB = currentPosition(state.filteredB, now);
  if (posA) pts.push(posA);
  if (posB) pts.push(posB);

  const bounds = boundsOf(
    pts.length > 0
      ? pts
      : [...state.filteredA, ...state.filteredB].map((p): LatLon => ({ lat: p.lat, lon: p.lon })),
  );
  if (!bounds) return null;

  const view = fitView(padBounds(bounds, 0.35), size.w, size.h, Math.round(size.w * 0.08));

  if (state.settings.camera === "dynamic") {
    // 링이 보이는 동안 줌도 같이 당긴다. m.end로 재면 만남 한 건이 한 프레임보다
    // 짧아서 카메라가 거의 반응하지 않는다 — 링과 같은 창을 쓴다.
    const pulseMs = pulseMsFor(pace);
    const active = state.meetings.some((m) => meetingPulse(m, now, pulseMs) > 0);
    if (active) return { ...view, zoom: view.zoom + 0.8 };
  }

  return view;
}

function PickStage({
  strings,
  reading,
  error,
  hasA,
  hasB,
  onFileA,
  onFileB,
  onSample,
}: {
  strings: Strings;
  reading: boolean;
  error: string | null;
  hasA: boolean;
  hasB: boolean;
  onFileA: (file: File) => void;
  onFileB: (file: File) => void;
  onSample: () => void;
}) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card-bg p-5">
      <FilePicker id="fileA" label={strings.chooseA} done={hasA} disabled={reading} onFile={onFileA} />
      <FilePicker id="fileB" label={strings.chooseB} done={hasB} disabled={reading} onFile={onFileB} />

      <p className="mt-4 text-xs text-text-muted">{strings.privacyNote}</p>

      <button
        type="button"
        onClick={onSample}
        disabled={reading}
        className="mt-4 rounded-full border border-accent px-4 py-2 text-sm font-semibold text-accent spring-transition disabled:cursor-not-allowed disabled:opacity-40"
      >
        {strings.trySample}
      </button>

      {reading && <p className="mt-4 text-sm text-text-secondary">{strings.readingFile}</p>}
      {error && (
        <p className="mt-4 whitespace-pre-wrap rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
    </div>
  );
}

function FilePicker({
  id,
  label,
  done,
  disabled,
  onFile,
}: {
  id: string;
  label: string;
  done: boolean;
  disabled: boolean;
  onFile: (file: File) => void;
}) {
  return (
    <div className="mt-3">
      <label htmlFor={id} className="block text-sm text-text-primary">
        {label} {done ? "✓" : ""}
      </label>
      <input
        id={id}
        type="file"
        accept="application/json,.json"
        disabled={disabled}
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFile(file);
          e.target.value = "";
        }}
        className="mt-1.5 block w-full text-sm text-text-secondary disabled:cursor-not-allowed disabled:opacity-40"
      />
    </div>
  );
}

function ConsentStage({ strings, onAgree }: { strings: Strings; onAgree: () => void }) {
  return (
    <div className="mt-6 rounded-2xl border border-border bg-card-bg p-5">
      <h2 className="text-lg font-semibold text-text-primary">{strings.consentTitle}</h2>
      <p className="mt-2 text-sm text-text-secondary">{strings.consentBody}</p>
      <button
        type="button"
        onClick={onAgree}
        className="mt-4 rounded-full bg-accent px-4 py-2 text-sm font-semibold text-white spring-transition"
      >
        {strings.consentAgree}
      </button>
    </div>
  );
}
