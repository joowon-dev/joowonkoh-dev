/**
 * 보내는 사람이 적은 글을 링크 주소 뒤(#)에 싣는다. 서버도 저장도 없다 —
 * 링크가 곧 편지다. # 뒤는 서버로 가지 않으니 카톡 미리보기에도 안 새고,
 * 받는 사람이 상자를 열기 전까지 글이 어디에도 안 보인다.
 */

/** 상자 안에 들어가는 글의 최대 글자 수. 넘치면 글자가 흩어졌다 모일 자리가 모자란다. */
export const MAX_CHARS = 60;

const KEY = "m";

function toBase64Url(bytes: Uint8Array): string {
  let bin = "";
  for (const b of bytes) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

function fromBase64Url(s: string): Uint8Array {
  const b64 = s.replace(/-/g, "+").replace(/_/g, "/");
  const bin = atob(b64 + "=".repeat((4 - (b64.length % 4)) % 4));
  return Uint8Array.from(bin, (c) => c.charCodeAt(0));
}

/** 앞뒤 공백을 걷고, 빈 줄을 하나로 줄이고, 글자 수를 자른다. */
export function tidy(text: string): string {
  const lines = text
    .replace(/\r\n?/g, "\n")
    .split("\n")
    .map((l) => l.trim())
    .filter((l, i, all) => l !== "" || (i > 0 && all[i - 1] !== ""));
  return splitChars(lines.join("\n").trim()).slice(0, MAX_CHARS).join("");
}

/** 글자 하나하나로 쪼갠다. 이모지·합친 한글이 반쪽으로 갈라지지 않게 Segmenter 로. */
export function splitChars(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const seg = new Intl.Segmenter("ko", { granularity: "grapheme" });
    return Array.from(seg.segment(text), (s) => s.segment);
  }
  return Array.from(text);
}

/** "#m=…" 꼴의 해시를 만든다. */
export function encodeHash(text: string): string {
  return `#${KEY}=${toBase64Url(new TextEncoder().encode(tidy(text)))}`;
}

/** 해시에서 글을 꺼낸다. 없거나 깨졌으면 null — 그때는 쓰는 화면을 보여 준다. */
export function decodeHash(hash: string): string | null {
  const raw = new URLSearchParams(hash.replace(/^#/, "")).get(KEY);
  if (!raw) return null;
  try {
    const text = tidy(new TextDecoder("utf-8", { fatal: true }).decode(fromBase64Url(raw)));
    return text === "" ? null : text;
  } catch {
    return null;
  }
}
