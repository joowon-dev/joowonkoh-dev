"use client";

import { useCallback, useRef, useState } from "react";
import { computeRms, rmsToWind } from "./mic";

export type MicStatus =
  | "idle"
  | "requesting"
  | "ready"
  | "denied"
  | "unsupported";

export function useWindMic() {
  const [status, setStatus] = useState<MicStatus>("idle");
  const ctxRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const bufRef = useRef<Float32Array | null>(null);

  const start = useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia
    ) {
      setStatus("unsupported");
      return;
    }
    setStatus("requesting");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const ctx = new AudioContext();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      source.connect(analyser);
      streamRef.current = stream;
      ctxRef.current = ctx;
      analyserRef.current = analyser;
      bufRef.current = new Float32Array(analyser.fftSize);
      setStatus("ready");
    } catch {
      setStatus("denied");
    }
  }, []);

  const stop = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    ctxRef.current?.close().catch(() => {});
    streamRef.current = null;
    ctxRef.current = null;
    analyserRef.current = null;
    bufRef.current = null;
    setStatus("idle");
  }, []);

  const wind = useCallback(() => {
    const analyser = analyserRef.current;
    const buf = bufRef.current;
    if (!analyser || !buf) return 0;
    analyser.getFloatTimeDomainData(buf);
    return rmsToWind(computeRms(buf));
  }, []);

  return { status, wind, start, stop };
}
