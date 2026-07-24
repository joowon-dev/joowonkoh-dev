"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  launch,
  step,
  isLanded,
  distanceMeters,
  type PlaneState,
  type LaunchParams,
} from "./physics";

export function usePlanePhysics(getWind: () => number) {
  const [state, setState] = useState<PlaneState | null>(null);
  const [distance, setDistance] = useState(0);
  const [running, setRunning] = useState(false);
  const rafRef = useRef<number | null>(null);
  const lastRef = useRef<number>(0);
  const stateRef = useRef<PlaneState | null>(null);
  const loopRef = useRef<(t: number) => void>(() => {});

  const stop = useCallback(() => {
    if (rafRef.current != null) cancelAnimationFrame(rafRef.current);
    rafRef.current = null;
  }, []);

  const loop = useCallback(
    (t: number) => {
      const prev = stateRef.current;
      if (!prev) return;
      const dt = Math.min(0.032, (t - lastRef.current) / 1000 || 0.016);
      lastRef.current = t;
      const next = step(prev, getWind(), dt);
      stateRef.current = next;
      setState(next);
      setDistance(distanceMeters(next));
      if (isLanded(next)) {
        setRunning(false);
        stop();
        return;
      }
      rafRef.current = requestAnimationFrame((t2) => loopRef.current(t2));
    },
    [getWind, stop],
  );

  useEffect(() => {
    loopRef.current = loop;
  }, [loop]);

  const launchPlane = useCallback(
    (p: LaunchParams) => {
      const s0 = launch(p);
      stateRef.current = s0;
      setState(s0);
      setDistance(0);
      setRunning(true);
      lastRef.current = 0;
      stop();
      rafRef.current = requestAnimationFrame((t) => {
        lastRef.current = t;
        rafRef.current = requestAnimationFrame((t2) => loopRef.current(t2));
      });
    },
    [stop],
  );

  const reset = useCallback(() => {
    stop();
    stateRef.current = null;
    setState(null);
    setDistance(0);
    setRunning(false);
  }, [stop]);

  return { state, distance, running, launchPlane, reset };
}
