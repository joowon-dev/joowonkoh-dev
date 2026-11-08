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
  /** 가까워졌을 때 두근(두 번 쿵쿵) */
  heartbeat(): void;
  /** 3·2·1 삑, 시작은 높게 */
  beep(go?: boolean): void;
  /** 둘 다 버티다 이마 쿵 */
  bonk(): void;
  /** 상대가 멈췄을 때 톡 */
  tick(): void;
}

const silent: Sound = { crunch() {}, bite() {}, ding() {}, heartbeat() {}, beep() {}, bonk() {}, tick() {} };

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
    heartbeat() {
      const t = ctx.currentTime;
      [0, 0.17].forEach((d, i) => {
        const o = ctx.createOscillator();
        o.type = "sine";
        o.frequency.setValueAtTime(i ? 58 : 66, t + d);
        o.frequency.exponentialRampToValueAtTime(40, t + d + 0.12);
        const g = ctx.createGain();
        g.gain.setValueAtTime(0.0001, t + d);
        g.gain.exponentialRampToValueAtTime(i ? 0.35 : 0.5, t + d + 0.015);
        g.gain.exponentialRampToValueAtTime(0.0001, t + d + 0.16);
        o.connect(g).connect(ctx.destination);
        o.start(t + d);
        o.stop(t + d + 0.18);
      });
    },
    beep(go = false) {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "triangle";
      o.frequency.value = go ? 1046 : 523;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.0001, t);
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.01);
      g.gain.exponentialRampToValueAtTime(0.0001, t + (go ? 0.45 : 0.18));
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.5);
    },
    bonk() {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "sine";
      o.frequency.setValueAtTime(180, t);
      o.frequency.exponentialRampToValueAtTime(45, t + 0.3);
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.6, t);
      g.gain.exponentialRampToValueAtTime(0.001, t + 0.35);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.4);
      const src = ctx.createBufferSource();
      src.buffer = crunchBuf;
      src.playbackRate.value = 0.4;
      src.connect(ctx.destination);
      src.start(t);
    },
    tick() {
      const t = ctx.currentTime;
      const o = ctx.createOscillator();
      o.type = "square";
      o.frequency.value = 1500;
      const g = ctx.createGain();
      g.gain.setValueAtTime(0.08, t);
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06);
      o.connect(g).connect(ctx.destination);
      o.start(t);
      o.stop(t + 0.08);
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
