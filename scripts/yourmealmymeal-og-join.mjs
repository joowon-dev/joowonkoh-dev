/**
 * 네밥내밥 초대 링크(/yourmealmymeal/join) 미리보기 그림을 만든다.
 *
 *   node scripts/yourmealmymeal-og-join.mjs
 *
 * 베이지 종이 위에 별·밥그릇·숟가락·달·반짝이를 펜으로 끄적이고, 가운데에 초대 페이지와 같은
 * 라임색 웃는 얼굴을 둔다. 글자는 넣지 않는다 — 제목은 카톡·문자 미리보기가 그림 아래에 따로 적는다.
 * 사이트에는 next/og 가 없어서 SVG 를 sharp(next 가 함께 설치)로 PNG 로 굽고 public/ 에 둔다.
 */
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/yourmealmymeal/og-join-v2.png");

const INK = "#1A1A1A";
const pen = (w = 5) => `fill="none" stroke="${INK}" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round"`;

/** 다섯 뿔 별. 꼭짓점을 조금씩 흔들어 손으로 그린 티를 낸다. */
function star(cx, cy, r, rot, fill) {
  const pts = [];
  for (let i = 0; i < 10; i++) {
    const a = ((rot + i * 36 - 90) * Math.PI) / 180;
    const rr = (i % 2 ? r * 0.46 : r) * (1 + (((i * 7) % 5) - 2) * 0.025);
    pts.push(`${(cx + rr * Math.cos(a)).toFixed(1)},${(cy + rr * Math.sin(a)).toFixed(1)}`);
  }
  return `<polygon points="${pts.join(" ")}" fill="${fill}" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>`;
}

/** 네 뿔 반짝이. */
function sparkle(cx, cy, r) {
  const k = r * 0.22;
  return `<path d="M${cx} ${cy - r}Q${cx + k} ${cy - k} ${cx + r} ${cy}Q${cx + k} ${cy + k} ${cx} ${cy + r}Q${cx - k} ${cy + k} ${cx - r} ${cy}Q${cx - k} ${cy - k} ${cx} ${cy - r}Z" ${pen(4.5)}/>`;
}

/** 김이 오르는 밥그릇. */
function bowl(x, y, s, rot) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M-38 -6C-34 -30 -16 -36 -4 -30C4 -40 24 -38 30 -24C38 -22 42 -14 40 -6Z" fill="#FFFFFF" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M-50 -6H50C48 22 28 40 0 40C-28 40 -48 22 -50 -6Z" fill="#FFB4A8" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
    <path d="M-16 40V48H16V40" ${pen()}/>
    <path d="M-12 -50C-18 -58 -6 -64 -12 -72" ${pen(4)}/>
    <path d="M10 -48C4 -56 16 -62 10 -70" ${pen(4)}/>
  </g>`;
}

/** 숟가락. */
function spoon(x, y, s, rot) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <ellipse cx="0" cy="-34" rx="17" ry="24" fill="#D8F6FB" stroke="${INK}" stroke-width="5"/>
    <path d="M0 -10C-2 14 -3 34 -1 58" ${pen(9)}/>
  </g>`;
}

/** 초승달. */
function moon(x, y, s, rot) {
  return `<g transform="translate(${x} ${y}) rotate(${rot}) scale(${s})">
    <path d="M10 -40C-16 -38 -36 -16 -34 10C-32 34 -8 48 16 42C-6 36 -18 14 -14 -8C-10 -26 0 -36 10 -40Z" fill="#FFE27A" stroke="${INK}" stroke-width="5" stroke-linejoin="round"/>
  </g>`;
}

/** 초대 페이지(InviteCode.tsx)의 Smiley 와 같은 선. viewBox 200 기준. */
function smiley(cx, cy, size) {
  const s = size / 200;
  return `<g transform="translate(${cx - size / 2} ${cy - size / 2}) scale(${s})">
    <path d="M101 14C152 12 189 52 187 102C185 151 148 189 98 187C48 185 12 149 14 99C16 50 51 16 101 14Z" fill="#E8FF52" stroke="${INK}" stroke-width="7" stroke-linejoin="round"/>
    <ellipse cx="52" cy="122" rx="14" ry="8" fill="#FFB4A8" opacity="0.7"/>
    <ellipse cx="150" cy="122" rx="14" ry="8" fill="#FFB4A8" opacity="0.7"/>
    <path d="M74 70C73 79 74 89 76 97" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <path d="M127 69C128 78 127 88 125 96" fill="none" stroke="${INK}" stroke-width="10" stroke-linecap="round"/>
    <path d="M64 124C78 147 120 152 138 122" fill="none" stroke="${INK}" stroke-width="8" stroke-linecap="round"/>
  </g>`;
}

const dot = (x, y, r = 5) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${INK}"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <rect width="1200" height="630" fill="#F2EDE3"/>

  ${bowl(190, 170, 1.25, -8)}
  ${spoon(1030, 420, 1.3, 28)}
  ${moon(1010, 140, 1.3, 12)}
  ${bowl(1090, 560, 0.75, 10)}
  ${spoon(150, 470, 1.05, -32)}

  ${star(390, 90, 34, 8, "#FFE27A")}
  ${star(830, 540, 30, -12, "#FFE27A")}
  ${star(70, 330, 24, 20, "#D8F6FB")}
  ${star(880, 95, 22, -6, "#FFB4A8")}
  ${star(340, 560, 22, 14, "#D8F6FB")}

  ${sparkle(800, 210, 24)}
  ${sparkle(420, 410, 18)}
  ${sparkle(1140, 300, 20)}
  ${sparkle(560, 70, 16)}
  ${sparkle(270, 330, 14)}

  ${dot(470, 160)} ${dot(730, 480, 4)} ${dot(960, 270, 4)} ${dot(250, 600, 4)} ${dot(640, 590, 5)} ${dot(60, 90, 4)}

  ${smiley(600, 315, 330)}
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);
console.log(`→ ${path.relative(ROOT, OUT)}`);
