/**
 * MediaPipe wasm 런타임을 node_modules에서 public/mediapipe/로 복사한다.
 *
 * 왜 스크립트인가: wasm 바이너리가 11MB짜리 두 개라 저장소에 커밋하면 히스토리가
 * 영구히 무거워진다. 빌드할 때마다 node_modules에서 복사하면 배포본에는 있고
 * git에는 없다. Cloudflare Pages도 빌드 전에 npm install을 하므로 그대로 동작한다.
 *
 * 모델(.tflite)은 node_modules에 없어서 예외적으로 커밋한다 — 224KB뿐이다.
 */
import { copyFileSync, existsSync, mkdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const src = join(root, "node_modules", "@mediapipe", "tasks-vision", "wasm");
const dest = join(root, "public", "mediapipe");

// SIMD판과 미지원 브라우저용 nosimd판. FilesetResolver가 둘 중 하나를 골라 받는다.
const FILES = [
  "vision_wasm_internal.js",
  "vision_wasm_internal.wasm",
  "vision_wasm_nosimd_internal.js",
  "vision_wasm_nosimd_internal.wasm",
];

if (!existsSync(src)) {
  console.error(`[copy-mediapipe] ${src} 없음 — @mediapipe/tasks-vision가 설치됐는지 확인하세요.`);
  process.exit(1);
}

mkdirSync(dest, { recursive: true });

let copied = 0;
for (const name of FILES) {
  const from = join(src, name);
  const to = join(dest, name);
  if (!existsSync(from)) {
    console.error(`[copy-mediapipe] ${name} 없음 — 패키지 버전이 바뀌었는지 확인하세요.`);
    process.exit(1);
  }
  // 크기와 수정 시각이 같으면 건너뛴다. 매 빌드마다 22MB를 다시 쓸 이유가 없다.
  if (existsSync(to)) {
    const a = statSync(from);
    const b = statSync(to);
    if (a.size === b.size && a.mtimeMs <= b.mtimeMs) continue;
  }
  copyFileSync(from, to);
  copied += 1;
}

console.log(`[copy-mediapipe] ${copied}/${FILES.length}개 복사 (나머지는 최신)`);
