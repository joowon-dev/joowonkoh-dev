"use client";

import { useCallback, useEffect, useRef } from "react";
import { drawSkinSample, readPalette, type Palette } from "./render";
import { SKINS, type SkinId } from "./skins";

/** 미리보기 캔버스의 CSS 높이(px). 토끼 귀와 몸 두께가 들어갈 만큼만 준다. */
const PREVIEW_HEIGHT = 72;

function SkinSample({ skin }: { skin: SkinId }) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const paletteRef = useRef<Palette | null>(null);

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const rect = canvas.getBoundingClientRect();
    const w = Math.round(rect.width);
    const h = Math.round(rect.height);
    if (w === 0 || h === 0) return;
    if (canvas.width !== w * dpr || canvas.height !== h * dpr) {
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    }
    if (!paletteRef.current) paletteRef.current = readPalette(canvas);

    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    drawSkinSample(ctx, { w, h }, paletteRef.current, skin, "나");
  }, [skin]);

  // 카드 폭은 화면 폭에 따라 바뀌므로 리사이즈마다 다시 그린다.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    draw();
    const ro = new ResizeObserver(() => draw());
    ro.observe(canvas);
    return () => ro.disconnect();
  }, [draw]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="block w-full"
      style={{ height: PREVIEW_HEIGHT }}
    />
  );
}

interface SkinPickerProps {
  value: SkinId;
  onChange: (skin: SkinId) => void;
}

export default function SkinPicker({ value, onChange }: SkinPickerProps) {
  return (
    <fieldset className="mt-8">
      <legend className="text-xs font-medium text-text-muted">판 위에 쏟아질 것</legend>
      <div className="mt-2 grid gap-2 sm:grid-cols-2">
        {SKINS.map((skin) => {
          const selected = skin.id === value;
          return (
            <label
              key={skin.id}
              className={`cursor-pointer rounded-2xl border p-3 transition ${
                selected
                  ? "border-accent bg-accent-soft shadow-ambient"
                  : "border-border bg-card-bg hover:border-accent/40"
              }`}
            >
              <input
                type="radio"
                name="skin"
                value={skin.id}
                checked={selected}
                onChange={() => onChange(skin.id)}
                className="sr-only"
              />
              <SkinSample skin={skin.id} />
              <span
                className={`mt-1 block text-sm font-semibold ${
                  selected ? "text-accent" : "text-text-primary"
                }`}
              >
                {skin.label}
              </span>
              <span className="mt-0.5 block text-[11px] leading-snug text-text-muted">
                {skin.description}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
