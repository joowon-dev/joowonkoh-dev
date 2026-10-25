"use client";

import { useEffect, useRef, useState } from "react";

import { angleFor, drawDecal, isShut, OPEN_RATIO, otherSide, type Side } from "./fold";
import { DEFAULT_WALLPAPER } from "./wallpaper";

type Finish = "night" | "star";

/** 올린 사진을 화면 전체에 깔지, 한쪽 칸에만 넣을지. */
type Fill = "full" | "half";

const FILLS: { id: Fill; name: string }[] = [
  { id: "full", name: "화면 전체" },
  { id: "half", name: "한쪽만" },
];

const FINISHES: { id: Finish; name: string; swatch: string }[] = [
  { id: "night", name: "나이트 스카이", swatch: "linear-gradient(135deg, #4a4d57, #1f2026)" },
  { id: "star", name: "스타 화이트", swatch: "linear-gradient(135deg, #fbfaf7, #d9d4ca)" },
];

const SIDE_KO: Record<Side, string> = { left: "왼쪽", right: "오른쪽" };

const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - (-2 * t + 2) ** 3 / 2);

/**
 * 화면 한 칸. 펼친 화면 전체(가로 W) 크기의 층을 반 칸 폭으로 잘라 보여 준다.
 * 왼쪽 반은 층의 0~W/2, 오른쪽 반은 W/2~W 를 보인다 — 그래서 시계·홈 막대가 접는 선을 넘어 이어진다.
 *
 * 올린 사진은 `photoSide` 반 칸에만 들어간다(층이 아니라 칸에 맞춰 채운다). 반대쪽은 비어 있다가
 * 찍히면 같은 사진을 뒤집어 채운다 — 두 칸이 폭이 같아 접는 선에서 거울상이 딱 맞는다.
 */
function Half({
  side,
  src,
  photoSide,
  mirrored,
  wet,
  showClock,
}: {
  side: Side;
  src: string;
  /** 사진이 들어간 쪽. null 이면 기본 배경화면이 화면 전체에 깔린다. */
  photoSide: Side | null;
  mirrored: boolean;
  wet: number;
  showClock: boolean;
}) {
  const style = mirrored
    ? { transform: "scaleX(-1)", filter: wet > 0.01 ? `blur(${wet * 6}px) saturate(${1 + wet * 0.5})` : undefined }
    : undefined;
  const photo = (
    // eslint-disable-next-line @next/next/no-img-element -- 올린 사진(blob:)을 그대로 띄운다
    <img src={src} alt="" draggable={false} className="duo-photo" style={style} />
  );
  return (
    <div className={`duo-screen duo-screen-${side}`}>
      {photoSide &&
        (side === photoSide || mirrored ? (
          photo
        ) : (
          <div className="duo-paper">
            <span>여기에 찍혀요</span>
          </div>
        ))}
      <div className="duo-layer">
        {!photoSide && photo}
        {showClock && (
          <div className="duo-lock">
            <p className="duo-lock-date">4월 1일 수요일</p>
            <p className="duo-lock-time">9:41</p>
          </div>
        )}
        <span className="duo-wifi" aria-hidden />
        <span className="duo-chip duo-chip-torch" aria-hidden />
        <span className="duo-chip duo-chip-cam" aria-hidden />
        <span className="duo-home" aria-hidden />
        <span className="duo-udc" aria-hidden />
      </div>
    </div>
  );
}

function CircleIcon({ glyph }: { glyph: "plus" | "fold" | "swap" | "reset" | "down" }) {
  return (
    <svg viewBox="0 0 24 24" className="duo-pill-icon" aria-hidden>
      <circle cx="12" cy="12" r="10.5" fill="none" stroke="currentColor" strokeWidth="1.5" />
      {glyph === "plus" && <path d="M12 7v10M7 12h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />}
      {glyph === "fold" && (
        <path d="M7 8l5 4-5 4M17 8l-5 4 5 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {glyph === "swap" && (
        <path d="M7 10h10l-3-3M17 14H7l3 3" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {glyph === "reset" && (
        <path d="M8.2 9.2A5 5 0 1 1 7 12.5M8 6v3.4h3.4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
      {glyph === "down" && (
        <path d="M12 7v9M8 12.5l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  );
}

export default function DuoStudio() {
  const [open, setOpenRaw] = useState(100);
  const [src, setSrc] = useState(DEFAULT_WALLPAPER);
  const [printed, setPrinted] = useState(false);
  const [source, setSource] = useState<Side>("right");
  const [finish, setFinish] = useState<Finish>("night");
  const [fill, setFillRaw] = useState<Fill>("half");
  const [dragOver, setDragOver] = useState(false);

  const raf = useRef(0);
  const openRef = useRef(100);
  const fileRef = useRef<HTMLInputElement>(null);
  const blobUrl = useRef<string | null>(null);

  useEffect(
    () => () => {
      cancelAnimationFrame(raf.current);
      if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    },
    [],
  );

  /** 펼친 정도를 바꾼다. 끝까지 닫히는 순간 찍는다 — 화면이 맞닿아 있을 때라 바뀌는 게 안 보인다. */
  const setOpen = (v: number) => {
    openRef.current = v;
    setOpenRaw(v);
    if (isShut(v)) setPrinted(true);
  };

  const tween = (to: number, ms: number) =>
    new Promise<void>((done) => {
      cancelAnimationFrame(raf.current);
      const from = openRef.current;
      const t0 = performance.now();
      const step = (now: number) => {
        const t = Math.min(1, (now - t0) / ms);
        setOpen(from + (to - from) * ease(t));
        if (t < 1) raf.current = requestAnimationFrame(step);
        else done();
      };
      raf.current = requestAnimationFrame(step);
    });

  const foldAndOpen = async () => {
    await tween(0, 900);
    await new Promise((r) => setTimeout(r, 180));
    await tween(100, 1200);
  };

  const loadFile = (file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return;
    if (blobUrl.current) URL.revokeObjectURL(blobUrl.current);
    const url = URL.createObjectURL(file);
    blobUrl.current = url;
    setSrc(url);
    setPrinted(false);
    if (openRef.current < 100) void tween(100, 700);
  };

  const setFill = (f: Fill) => {
    setFillRaw(f);
    setPrinted(false);
    if (openRef.current < 100) void tween(100, 700);
  };

  /** 한쪽에만 넣었으면 사진만 반대쪽 칸으로 옮기고, 화면 전체면 반대쪽에서 찍어 보인다. */
  const swapSide = () => {
    setSource((s) => otherSide(s));
    setPrinted(false);
    if (src === DEFAULT_WALLPAPER || fill === "full") void foldAndOpen();
    else if (openRef.current < 100) void tween(100, 700);
  };

  const reset = () => {
    setPrinted(false);
    if (openRef.current < 100) void tween(100, 700);
  };

  const save = () => {
    const img = new Image();
    img.onload = () => {
      // SVG 기본 배경은 크기가 viewBox 라 작다 — 결과는 늘 같은 해상도로 뽑는다.
      const w = 2800;
      const h = Math.round(w / OPEN_RATIO);
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;
      drawDecal(ctx, img, w, h, printed, source, halfMode);
      canvas.toBlob((blob) => {
        if (!blob) return;
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = "duo-decalcomania.png";
        a.click();
        setTimeout(() => URL.revokeObjectURL(a.href), 1000);
      }, "image/png");
    };
    img.src = src;
  };

  const angle = angleFor(open);
  const t = angle / 180;
  const rad = (angle * Math.PI) / 180;
  const target = otherSide(source);
  const isDefault = src === DEFAULT_WALLPAPER;
  // 기본 배경화면은 늘 화면 전체에 깐다 — 한쪽 칸은 올린 사진에만 쓴다.
  const halfMode = !isDefault && fill === "half";
  const photoSide = halfMode ? source : null;
  // 찍히는 쪽은 막 떼어 냈을 때 번져 있다가 펼칠수록 마른다.
  const wet = printed ? t : 0;

  const lead = printed
    ? `찍혔어요. ${SIDE_KO[source]} 화면이 ${SIDE_KO[target]}에 거울처럼 옮겨 갔습니다.`
    : halfMode
      ? `사진은 ${SIDE_KO[source]}에만 들어갔어요. 끝까지 접었다 펴면 비어 있는 ${SIDE_KO[target]}에 찍혀 나옵니다.`
      : `사진을 올리고 끝까지 접었다 펴 보세요. ${SIDE_KO[source]} 화면이 ${SIDE_KO[target]}에 그대로 찍혀 나옵니다.`;

  return (
    <div className="duo-card">
      <div className="duo-controls">
        <div className="duo-box">
          <p className="duo-box-lead" aria-live="polite">
            <strong>데칼코마니.</strong> {lead}
          </p>
          <div className="duo-seg" role="radiogroup" aria-label="사진 넣는 곳">
            {FILLS.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={fill === f.id}
                className="duo-seg-item"
                onClick={() => setFill(f.id)}
              >
                {f.name}
              </button>
            ))}
          </div>
          <label htmlFor="duo-fold" className="duo-box-hint">
            아래를 드래그해서 접고 펼쳐보기
          </label>
          <input
            id="duo-fold"
            type="range"
            min={0}
            max={100}
            step={0.5}
            value={open}
            onPointerDown={() => cancelAnimationFrame(raf.current)}
            onChange={(e) => setOpen(Number(e.target.value))}
            className="duo-range"
            style={{ "--p": `${open}%` } as React.CSSProperties}
          />
        </div>

        <ul className="duo-pills">
          <li>
            <button type="button" className="duo-pill" onClick={() => fileRef.current?.click()}>
              <CircleIcon glyph="plus" />
              사진 올리기
            </button>
          </li>
          <li>
            <button type="button" className="duo-pill" onClick={() => void foldAndOpen()}>
              <CircleIcon glyph="fold" />
              접었다 펴기
            </button>
          </li>
          <li>
            <button type="button" className="duo-pill" onClick={swapSide}>
              <CircleIcon glyph="swap" />
              {halfMode ? `사진을 ${SIDE_KO[target]}으로` : `${SIDE_KO[target]}으로 찍기`}
            </button>
          </li>
          <li>
            <button type="button" className="duo-pill" onClick={reset} disabled={!printed}>
              <CircleIcon glyph="reset" />
              원래대로
            </button>
          </li>
          <li>
            <button type="button" className="duo-pill" onClick={save}>
              <CircleIcon glyph="down" />
              저장하기
            </button>
          </li>
        </ul>
        {/* 위쪽 내비와 아래 가격 알약의 「사진 올리기」도 label 로 이 칸을 연다 */}
        <input
          ref={fileRef}
          id="duo-file"
          type="file"
          accept="image/*"
          hidden
          onChange={(e) => {
            loadFile(e.target.files?.[0]);
            e.target.value = "";
          }}
        />
      </div>

      <div className="duo-viewer">
        <div
          className={`duo-stage${dragOver ? " is-drop" : ""}`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            loadFile(e.dataTransfer.files[0]);
          }}
        >
          <div
            className={`duo-device duo-${finish}`}
            style={{ transform: `translateX(calc(var(--dw) / -4 * ${t}))` }}
            role="img"
            aria-label={`iPhone Duo 모양 기기, ${Math.round(open)}% 펼침`}
          >
            <div className="duo-panel duo-panel-right">
              <span className="duo-btn duo-btn-a" aria-hidden />
              <span className="duo-btn duo-btn-b" aria-hidden />
              <Half side="right" src={src} photoSide={photoSide} mirrored={printed && target === "right"} wet={wet} showClock={isDefault} />
            </div>

            <div className="duo-panel duo-panel-left" style={{ transform: `rotateY(${angle}deg)` }}>
              <div className="duo-face duo-front">
                <Half side="left" src={src} photoSide={photoSide} mirrored={printed && target === "left"} wet={wet} showClock={isDefault} />
                <span className="duo-shade" style={{ opacity: Math.sin(Math.min(rad, Math.PI / 2)) * 0.55 }} />
              </div>
              <div className="duo-face duo-back">
                <div className="duo-outer">
                  {/* eslint-disable-next-line @next/next/no-img-element -- 바깥 화면 배경도 같은 사진 */}
                  <img src={src} alt="" draggable={false} className="duo-photo" />
                  <div className="duo-lock">
                    <p className="duo-lock-date">4월 1일 수요일</p>
                    <p className="duo-lock-time">9:41</p>
                  </div>
                  <span className="duo-chip duo-chip-torch" aria-hidden />
                  <span className="duo-chip duo-chip-cam" aria-hidden />
                  <span className="duo-home" aria-hidden />
                  <span className="duo-punch" aria-hidden />
                </div>
                <span className="duo-shade" style={{ opacity: angle > 90 ? Math.sin(rad) * 0.5 : 0.5 }} />
              </div>
            </div>
          </div>
          {/* 닫힌 기기도 가운데로 옮겨 오므로 그림자는 폭만 줄인다 */}
          <div className="duo-floor" style={{ transform: `scaleX(${1 - t * 0.5})` }} />
        </div>

        <div className="duo-finish">
          <p className="duo-finish-name">{FINISHES.find((f) => f.id === finish)?.name}</p>
          <div className="duo-swatches" role="radiogroup" aria-label="마감">
            {FINISHES.map((f) => (
              <button
                key={f.id}
                type="button"
                role="radio"
                aria-checked={finish === f.id}
                aria-label={f.name}
                className="duo-swatch"
                onClick={() => setFinish(f.id)}
              >
                <span style={{ background: f.swatch }} />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
