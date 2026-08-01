export const WIND_THRESHOLD = 0.08;
const WIND_CEIL = 0.6; // 이 RMS에서 바람 최대치

export function computeRms(samples: Float32Array): number {
  if (samples.length === 0) return 0;
  let sum = 0;
  for (let i = 0; i < samples.length; i++) sum += samples[i] * samples[i];
  return Math.sqrt(sum / samples.length);
}

export function rmsToWind(rms: number): number {
  if (rms <= WIND_THRESHOLD) return 0;
  const norm = (rms - WIND_THRESHOLD) / (WIND_CEIL - WIND_THRESHOLD);
  return Math.max(0, Math.min(1, norm));
}
