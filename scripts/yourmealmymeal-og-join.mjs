/**
 * 네밥내밥 초대 링크(/yourmealmymeal/join) 미리보기 그림을 만든다.
 *
 *   node scripts/yourmealmymeal-og-join.mjs
 *
 * 앱의 새 디자인 시스템을 따른다 — 밝은 회색 바탕에 노른자·민트 빛이 옅게 번지고,
 * 왼쪽에 앱 아이콘(노른자 바탕의 빈 민트 급식판), 오른쪽에 "밥상에 초대받았어요".
 * 아이콘은 public/yourmealmymeal/icon.svg 를 그대로 끼워 넣는다 — 아이콘을 바꾸면 이것만 다시 돌리면 된다.
 * 사이트에는 next/og 가 없어서 SVG 를 sharp(next 가 함께 설치)로 PNG 로 굽고 public/ 에 둔다.
 *
 * 글꼴: 제목은 Apple SD Gothic Neo(맥 기본), 워드마크는 검은고딕(Black Han Sans)이 깔려 있어야 한다.
 * 그림을 바꾸면 파일 이름의 숫자를 올리고 join/page.tsx 의 주소도 바꾼다. 카톡은 같은 주소의 그림을 오래 붙들고 있다.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT = path.join(ROOT, "public/yourmealmymeal/og-join-v3.png");

const INK = "#2E1E14";
const SUB = "#6E5A48";
const MINT = "#3DB89A";
const BODY_FONT = "Apple SD Gothic Neo, Noto Sans KR, sans-serif";

/** 아이콘 SVG 의 속만 꺼낸다(1024 기준 좌표). */
const icon = readFileSync(path.join(ROOT, "public/yourmealmymeal/icon.svg"), "utf8")
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<!--[\s\S]*?-->/g, "");

const SIZE = 340;
const X = 120;
const Y = (630 - SIZE) / 2;
const R = SIZE * 0.225;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <radialGradient id="yolk" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#FFC531" stop-opacity="0.32"/>
      <stop offset="1" stop-color="#FFC531" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="mint" cx="0.5" cy="0.5" r="0.5">
      <stop offset="0" stop-color="#9FDCC2" stop-opacity="0.5"/>
      <stop offset="1" stop-color="#9FDCC2" stop-opacity="0"/>
    </radialGradient>
    <clipPath id="round"><rect width="1024" height="1024" rx="${(R * 1024) / SIZE}"/></clipPath>
    <filter id="lift" x="-30%" y="-30%" width="160%" height="170%">
      <feDropShadow dx="0" dy="22" stdDeviation="26" flood-color="#FFC531" flood-opacity="0.45"/>
    </filter>
  </defs>

  <rect width="1200" height="630" fill="#F4F4F4"/>
  <circle cx="230" cy="150" r="420" fill="url(#yolk)"/>
  <circle cx="1080" cy="560" r="460" fill="url(#mint)"/>

  <g filter="url(#lift)">
    <g transform="translate(${X} ${Y}) scale(${SIZE / 1024})" clip-path="url(#round)">${icon}</g>
  </g>

  <text x="540" y="238" font-family="Black Han Sans" font-size="46" fill="${MINT}">네밥내밥</text>
  <text x="536" y="332" font-family="${BODY_FONT}" font-weight="800" font-size="68" letter-spacing="-2" fill="${INK}">밥상에</text>
  <text x="536" y="414" font-family="${BODY_FONT}" font-weight="800" font-size="68" letter-spacing="-2" fill="${INK}">초대받았어요</text>
  <text x="540" y="470" font-family="${BODY_FONT}" font-weight="500" font-size="28" fill="${SUB}">가까운 친구끼리 끼니를 나누는 곳</text>
</svg>`;

await sharp(Buffer.from(svg)).png({ compressionLevel: 9 }).toFile(OUT);
console.log(`→ ${path.relative(ROOT, OUT)}`);
