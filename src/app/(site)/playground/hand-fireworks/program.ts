/**
 * 발사 프로그램 — 어떤 불꽃을 어떤 순서로 쏠지.
 *
 * 실제 불꽃놀이는 포탄을 순서대로 장전해 두고 그 순서로 쏜다. 여기서도 같다:
 * 한 칸이 한 발이고, 위에서부터 차례로 나가고, 끝나면 처음으로 돌아온다.
 *
 * **프로그램이 비어 있으면 무작위다.** 이것이 규칙을 하나 줄인다 —
 * «전부 지우기»와 «무작위로 돌려놓기»가 같은 동작이 되고, 처음 들어온 사람은
 * 아무것도 안 짜도 불꽃이 나간다.
 */

import { BURST_HUES, BURST_KINDS, type BurstKind, type Shot } from "./firework";

export type Program = Shot[];

/** 이보다 많이 담지 못한다. 넘으면 순서를 사람이 못 외우고, 화면에도 안 들어간다. */
export const MAX_SHOTS = 12;

/** 처음 들어온 사람이 보는 것. 비어 있으니 무작위로 나간다. */
export const EMPTY_PROGRAM: Program = [];

/**
 * 다음에 나갈 발과 그다음 커서.
 *
 * 커서를 밖에서 들고 있게 한 이유는 양손이 **하나의 커서를 나눠 쓰기** 때문이다.
 * 손마다 따로 세면 왼손이 1·3번, 오른손이 2·4번을 쏘게 되어 «짜 놓은 순서»가 깨진다.
 *
 * @returns shot이 null이면 프로그램이 비었다는 뜻 — 부르는 쪽이 무작위로 만든다.
 */
export function nextShot(program: Program, index: number): { shot: Shot | null; index: number } {
  if (program.length === 0) return { shot: null, index: 0 };
  // 저장값이 줄어들어 커서가 범위를 벗어나 있을 수 있다. 음수도 접어서 받는다.
  const i = ((Math.trunc(index) % program.length) + program.length) % program.length;
  return { shot: program[i], index: (i + 1) % program.length };
}

/** 지금 커서가 가리키는 칸. 화면에 «다음 발»로 띄운다. */
export function peekIndex(program: Program, index: number): number | null {
  if (program.length === 0) return null;
  return ((Math.trunc(index) % program.length) + program.length) % program.length;
}

const isKind = (v: unknown): v is BurstKind => BURST_KINDS.includes(v as BurstKind);

/** 색은 팔레트 밖 값이 와도 살린다 — 나중에 팔레트를 바꿔도 저장된 프로그램이 안 깨진다 */
function normalizeHue(v: unknown): number | null {
  if (typeof v !== "number" || !Number.isFinite(v)) return null;
  return ((v % 360) + 360) % 360;
}

/**
 * 저장값을 프로그램으로 되살린다.
 *
 * 저장된 것은 사람이 고친 적도, 옛 버전이 남긴 것일 수도 있다. 통째로 버리면
 * 짜 둔 공연이 한 번에 날아가므로, **살릴 수 있는 칸만 골라 남긴다.**
 */
export function sanitizeProgram(value: unknown): Program {
  if (!Array.isArray(value)) return EMPTY_PROGRAM;

  const out: Program = [];
  for (const item of value) {
    if (out.length >= MAX_SHOTS) break;
    if (!item || typeof item !== "object") continue;
    const { kind, hue } = item as Partial<Shot>;
    const h = normalizeHue(hue);
    if (!isKind(kind) || h === null) continue;
    out.push({ kind, hue: h });
  }
  return out;
}

/** 목록 맨 뒤에 한 발. 가득 찼으면 그대로 둔다. */
export function addShot(program: Program, shot: Shot): Program {
  if (program.length >= MAX_SHOTS) return program;
  return [...program, shot];
}

export function replaceShot(program: Program, index: number, shot: Shot): Program {
  if (index < 0 || index >= program.length) return program;
  return program.map((s, i) => (i === index ? shot : s));
}

export function removeShot(program: Program, index: number): Program {
  if (index < 0 || index >= program.length) return program;
  return program.filter((_, i) => i !== index);
}

/** 「+」로 새 칸을 만들 때 채워 넣을 값. 마지막 발 다음 색으로 넘어가 같은 색이 연달아 안 나온다. */
export function suggestShot(program: Program): Shot {
  const last = program[program.length - 1];
  if (!last) return { kind: "peony", hue: BURST_HUES[0] };
  const at = BURST_HUES.indexOf(last.hue);
  return { kind: last.kind, hue: BURST_HUES[(at + 1) % BURST_HUES.length] };
}
