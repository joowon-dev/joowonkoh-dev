#!/usr/bin/env node
// Google Search Console URL Inspection 자동화
//
// 사용법:
//   node scripts/gsc-inspect.mjs                  # 전체 URL 검사
//   node scripts/gsc-inspect.mjs --unindexed-only # 미색인 URL만 출력
//   node scripts/gsc-inspect.mjs --url <URL>      # 특정 URL 1개만
//
// 사전 준비: scripts/README.md 참조

import { readFile, writeFile, mkdir } from "node:fs/promises";
import { existsSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { createSign } from "node:crypto";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SITE_URL = "https://joowonkoh.com";
const SITEMAP_PATH = resolve(ROOT, "public/sitemap-0.xml");
const KEY_PATH = resolve(ROOT, "scripts/.gsc-key.json");
const OUT_DIR = resolve(ROOT, "scripts/.gsc-results");

const args = process.argv.slice(2);
const flag = (name) => args.includes(name);
const argVal = (name) => {
  const i = args.indexOf(name);
  return i >= 0 ? args[i + 1] : null;
};

async function loadServiceAccount() {
  if (!existsSync(KEY_PATH)) {
    console.error(`❌ 서비스 계정 키가 없습니다: ${KEY_PATH}`);
    console.error(`   scripts/README.md 를 참고해 생성하세요.`);
    process.exit(1);
  }
  return JSON.parse(await readFile(KEY_PATH, "utf8"));
}

function base64url(input) {
  return Buffer.from(input)
    .toString("base64")
    .replace(/=/g, "")
    .replace(/\+/g, "-")
    .replace(/\//g, "_");
}

async function getAccessToken(sa) {
  const now = Math.floor(Date.now() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claim = {
    iss: sa.client_email,
    scope: "https://www.googleapis.com/auth/webmasters.readonly",
    aud: "https://oauth2.googleapis.com/token",
    iat: now,
    exp: now + 3600,
  };
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claim))}`;
  const signer = createSign("RSA-SHA256");
  signer.update(unsigned);
  const signature = signer.sign(sa.private_key).toString("base64")
    .replace(/=/g, "").replace(/\+/g, "-").replace(/\//g, "_");
  const jwt = `${unsigned}.${signature}`;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!res.ok) {
    throw new Error(`토큰 요청 실패: ${res.status} ${await res.text()}`);
  }
  const json = await res.json();
  return json.access_token;
}

async function inspectUrl(token, url) {
  const res = await fetch(
    "https://searchconsole.googleapis.com/v1/urlInspection/index:inspect",
    {
      method: "POST",
      headers: {
        authorization: `Bearer ${token}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        inspectionUrl: url,
        siteUrl: SITE_URL,
      }),
    }
  );
  const body = await res.json();
  if (!res.ok) {
    return { url, error: body.error?.message || JSON.stringify(body) };
  }
  const r = body.inspectionResult?.indexStatusResult || {};
  return {
    url,
    verdict: r.verdict,              // PASS / NEUTRAL / FAIL
    coverageState: r.coverageState,  // 예: "Submitted and indexed"
    lastCrawlTime: r.lastCrawlTime,
    pageFetchState: r.pageFetchState,
    robotsTxtState: r.robotsTxtState,
    indexingState: r.indexingState,
  };
}

function parseSitemap(xml) {
  const urls = [];
  const re = /<loc>([^<]+)<\/loc>/g;
  let m;
  while ((m = re.exec(xml))) urls.push(m[1]);
  return urls;
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function main() {
  const sa = await loadServiceAccount();
  console.log(`🔑 서비스 계정: ${sa.client_email}`);

  const token = await getAccessToken(sa);
  console.log(`✅ 액세스 토큰 발급\n`);

  let urls;
  const single = argVal("--url");
  if (single) {
    urls = [single];
  } else {
    const xml = await readFile(SITEMAP_PATH, "utf8");
    urls = parseSitemap(xml);
  }
  console.log(`📋 검사할 URL: ${urls.length}개\n`);

  const results = [];
  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    process.stdout.write(`[${i + 1}/${urls.length}] ${url} ... `);
    try {
      const r = await inspectUrl(token, url);
      results.push(r);
      if (r.error) console.log(`❌ ${r.error}`);
      else console.log(`${r.verdict || "?"} / ${r.coverageState || "?"}`);
    } catch (e) {
      console.log(`💥 ${e.message}`);
      results.push({ url, error: e.message });
    }
    if (i < urls.length - 1) await sleep(1500); // 분당 600 제한 여유
  }

  // 결과 저장
  await mkdir(OUT_DIR, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const outFile = resolve(OUT_DIR, `inspect-${stamp}.json`);
  await writeFile(outFile, JSON.stringify(results, null, 2));

  // 요약 출력
  const passed = results.filter((r) => r.verdict === "PASS").length;
  const failed = results.filter((r) => r.verdict && r.verdict !== "PASS").length;
  const errors = results.filter((r) => r.error).length;

  console.log(`\n📊 요약`);
  console.log(`   ✅ PASS    : ${passed}`);
  console.log(`   ⚠️  비PASS  : ${failed}`);
  console.log(`   💥 에러    : ${errors}`);
  console.log(`   💾 저장    : ${outFile}`);

  if (flag("--unindexed-only") || failed > 0) {
    console.log(`\n🔎 색인 안 된 URL:`);
    for (const r of results) {
      if (r.verdict && r.verdict !== "PASS") {
        console.log(`   - ${r.url}`);
        console.log(`     └ ${r.coverageState || r.verdict}`);
      }
    }
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
