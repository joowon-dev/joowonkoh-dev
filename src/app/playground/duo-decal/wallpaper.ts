/**
 * 처음 켰을 때 화면에 깔리는 배경. 애플 배경화면을 가져다 쓰지 않고 비슷한 사막 노을을 SVG 로 그렸다.
 * 데칼코마니가 바로 보이도록 일부러 좌우가 다르다 — 왼쪽에 높은 봉우리, 오른쪽에 해.
 */
const SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1400 1000">
<defs>
<linearGradient id="s" x1="0" y1="0" x2="0" y2="1">
<stop offset="0" stop-color="#6f8fb6"/><stop offset=".45" stop-color="#b9b3ad"/><stop offset=".62" stop-color="#e8cfae"/>
</linearGradient>
<linearGradient id="m" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#6d6052"/><stop offset="1" stop-color="#3f362f"/></linearGradient>
<linearGradient id="d1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#d9c2a2"/><stop offset="1" stop-color="#b49a7a"/></linearGradient>
<linearGradient id="d2" x1="1" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#efdcc0"/><stop offset="1" stop-color="#cdb391"/></linearGradient>
<radialGradient id="sun" cx="1080" cy="420" r="240" gradientUnits="userSpaceOnUse">
<stop offset="0" stop-color="#fff4dc"/><stop offset=".25" stop-color="#ffe2b0" stop-opacity=".8"/><stop offset="1" stop-color="#ffe2b0" stop-opacity="0"/>
</radialGradient>
</defs>
<rect width="1400" height="1000" fill="url(#s)"/>
<circle cx="1080" cy="420" r="240" fill="url(#sun)"/>
<path d="M0 560 L120 430 L190 470 L300 300 L380 390 L450 350 L560 470 L660 440 L760 520 L900 480 L1020 540 L1160 500 L1280 545 L1400 520 L1400 700 L0 700 Z" fill="url(#m)" opacity=".92"/>
<path d="M0 600 C220 520 420 640 640 600 C860 560 1100 640 1400 590 L1400 1000 L0 1000 Z" fill="url(#d1)"/>
<path d="M0 760 C300 640 560 700 780 720 C1000 740 1180 660 1400 700 L1400 1000 L0 1000 Z" fill="url(#d2)"/>
<path d="M0 900 C260 820 520 860 760 880 C980 900 1200 860 1400 880 L1400 1000 L0 1000 Z" fill="#f3e6d2"/>
</svg>`;

export const DEFAULT_WALLPAPER = `data:image/svg+xml;charset=utf-8,${encodeURIComponent(SVG)}`;
