/**
 * 바삭 소리·앙 소리. 파일 없이 Web Audio 로 그때그때 만든다.
 * 브라우저는 누르기(클릭) 안에서 만든 AudioContext 만 소리를 내 주므로
 * `makeSound()` 는 반드시 버튼 핸들러 안에서 부른다.
 */
export interface Sound {
  /** 과자 씹는 소리. pan: -1(왼쪽) ~ 1(오른쪽) */
  crunch(pan: number): void;
  /** 입술 깨무는 소리 */
  bite(): void;
  /** 다 먹고 멈췄을 때 띵 */
  ding(): void;
}

const silent: Sound = { crunch() {}, bite() {}, ding() {} };

export function makeSound(enabled: boolean): Sound {
  if (!enabled || typeof window === "undefined") return silent;
  const Ctx =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctx) return silent;
  let ctx: AudioContext;
  try {
    ctx = new Ctx();
  } catch {
    return silent;
  }

  const noise = (seconds: number) => {
    const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * seconds), ctx.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 2;
    return buf;
  };
  const crunchBuf = noise(0.09);

  const out = (pan: number) => {
    const p = ctx.createStereoPanner?.();
    if (!p) return ctx.destination;
    p.pan.value = pan;
    p.connect(ctx.destination);
    return p;
  };

  return {
    crunch(pan) {
      const src = ctx.createBufferSource();
      src.buffer = crunchBuf;
      src.playbackRate.value = 0.8 + Math.random() * 0.5;
      const bp = ctx.createBiquadFilter();
      bp.type = "bandpass";
      bp.frequency.value = 2200 + Math.random() * 1800;
      bp.Q.value = 1.2;
      const g = ctx.createGain();
      g.gain.value = 0.35;
      src.connect(bp).connect(g).connect(out(pan * 0.7));
      src.start();
    },
    bite() {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.setValueAtTime(260, t);
      o.frequency.exponentialRampToValueAtTime(70, t + 0.18);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.25, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.22);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.25);
    },
    ding() {
      const t = ctx.currentTime;
      [880, 1320].forEach((f, i) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.value = f;
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t + i * 0.09);
        g.gain.exponentialRampToValueAtTime(0.18, t + i * 0.09 + 0.02);
        g.gain.exponentialRampToValueAtTime(0.0001, t + i * 0.09 + 0.5);
        o.connect(g).connect(ctx.destination);
        o.start(t + i * 0.09);
        o.stop(t + i * 0.09 + 0.55);
      });
    },
  };
}
