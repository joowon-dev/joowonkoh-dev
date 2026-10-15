/**
 * 네밥내밥 링크 미리보기 그림(OG)을 만든다 — 소개(og-main)와 초대(og-join) 두 장.
 *
 *   node scripts/yourmealmymeal-og.mjs
 *
 * 앱의 로그인 화면과 같은 결: 연회색 바탕(#F4F4F4)에 옅은 수저·밥그릇·별, 왼쪽에 앱 아이콘
 * (흰 바탕의 빈 민트 식판), 오른쪽에 굵은 시스템 글꼴의 제목과 회색 부제.
 * 아이콘은 public/yourmealmymeal/icon.svg 를 그대로 끼워 넣는다 — 아이콘을 바꾸면 이것만 다시 돌리면 된다.
 * 사이트에는 next/og 가 없어서 SVG 를 sharp(next 가 함께 설치)로 굽고 public/ 에 둔다.
 *
 * 글꼴: Apple SD Gothic Neo(맥 기본). 그림을 바꾸면 파일 이름의 숫자를 올리고 page.tsx·layout.tsx·join/page.tsx 의
 * 주소도 바꾼다. 카톡은 같은 주소의 그림을 오래 붙들고 있다.
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import sharp from "sharp";

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");

const BG = "#F4F4F4";
const INK = "#2E1E14";
const SUB = "#6E5A48";
const MINT = "#3DB89A";
const YOLK = "#FFC531";
const TOMATO = "#E8452F";
const FONT = "Apple SD Gothic Neo, Noto Sans KR, sans-serif";

/** 아이콘 SVG 의 속만 꺼낸다(1024 기준 좌표). */
const icon = readFileSync(path.join(ROOT, "public/yourmealmymeal/icon.svg"), "utf8")
  .replace(/^[\s\S]*?<svg[^>]*>/, "")
  .replace(/<\/svg>\s*$/, "")
  .replace(/<!--[\s\S]*?-->/g, "");

/** 앱의 Motif 와 같은 수저 그림(속만 칠한다). */
const MOTIF = {
  spoon: { w: 40, h: 96, d: '<ellipse cx="20" cy="23" rx="16.5" ry="21.5"/><rect x="13.5" y="38" width="13" height="58" rx="6.5"/>' },
  fork: {
    w: 40,
    h: 96,
    d: '<rect x="3.5" y="5" width="9.5" height="31" rx="4.75"/><rect x="15.25" y="5" width="9.5" height="31" rx="4.75"/><rect x="27" y="5" width="9.5" height="31" rx="4.75"/><rect x="5" y="27" width="30" height="19" rx="9.5"/><rect x="13.5" y="40" width="13" height="56" rx="6.5"/>',
  },
  bowl: { w: 60, h: 42, d: '<path d="M3 15h54c0 14.9-12.1 27-27 27S3 29.9 3 15z"/><rect x="0" y="8" width="60" height="9" rx="4.5"/>' },
  star: { w: 40, h: 36, d: '<path d="M20 0c1.9 12.6 5.5 16.2 18 18-12.5 1.8-16.1 5.4-18 18-1.9-12.6-5.5-16.2-18-18 12.5-1.8 16.1-5.4 18-18z"/>' },
};

function motif(kind, x, y, height, color, rotate = 0) {
  const m = MOTIF[kind];
  const s = height / m.h;
  return `<g transform="translate(${x} ${y}) rotate(${rotate}) scale(${s}) translate(${-m.w / 2} ${-m.h / 2})" fill="${color}" fill-opacity="0.18">${m.d}</g>`;
}

const SCATTER = [
  motif("spoon", 70, 90, 120, TOMATO, -24),
  motif("fork", 135, 80, 120, YOLK, 18),
  motif("bowl", 1110, 120, 70, MINT, 8),
  motif("star", 1010, 70, 30, YOLK),
  motif("bowl", 640, 560, 56, TOMATO, -10),
  motif("spoon", 1130, 520, 104, MINT, 30),
  motif("star", 560, 70, 22, MINT),
].join("");

const ICON_SIZE = 330;
const IX = 110;
const IY = (630 - ICON_SIZE) / 2;
const R = ICON_SIZE * 0.225;

function card({ title, sub, small }) {
  return `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <clipPath id="ic"><rect x="${IX}" y="${IY}" width="${ICON_SIZE}" height="${ICON_SIZE}" rx="${R}"/></clipPath>
    <filter id="sh" x="-20%" y="-20%" width="140%" height="150%"><feDropShadow dx="0" dy="14" stdDeviation="18" flood-color="#3B2416" flood-opacity="0.12"/></filter>
  </defs>
  <rect width="1200" height="630" fill="${BG}"/>
  ${SCATTER}
  <rect x="${IX}" y="${IY}" width="${ICON_SIZE}" height="${ICON_SIZE}" rx="${R}" fill="#FFFFFF" filter="url(#sh)"/>
  <g clip-path="url(#ic)"><g transform="translate(${IX} ${IY}) scale(${ICON_SIZE / 1024})">${icon}</g></g>
  <text x="530" y="270" font-family="${FONT}" font-weight="800" font-size="78" fill="${INK}" letter-spacing="-2">${title}</text>
  <text x="532" y="345" font-family="${FONT}" font-weight="600" font-size="38" fill="${SUB}">${sub}</text>
  <text x="532" y="405" font-family="${FONT}" font-weight="500" font-size="30" fill="${SUB}" fill-opacity="0.8">${small}</text>
</svg>`;
}

const jobs = [
  {
    out: "public/yourmealmymeal/og-main-v2.jpg",
    svg: card({ title: "네밥내밥", sub: "“오늘 뭐 먹었어?”", small: "밥 사진 한 장으로 오늘의 식판을 나눠요" }),
    format: (img) => img.jpeg({ quality: 88 }),
  },
  {
    out: "public/yourmealmymeal/og-join-v4.png",
    svg: card({ title: "밥상에 초대받았어요", sub: "네밥내밥", small: "가까운 사람끼리 끼니를 나누는 곳" }),
    format: (img) => img.png(),
  },
];

for (const job of jobs) {
  await job.format(sharp(Buffer.from(job.svg))).toFile(path.join(ROOT, job.out));
  console.log("만들었어요:", job.out);
}
