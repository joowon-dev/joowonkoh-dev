import { describe, it, expect, afterEach } from "vitest";
import { cloudflareEnv, readEnv } from "./cloudflareEnv";

const REQUEST_CONTEXT = Symbol.for("__cloudflare-request-context__");
const holder = globalThis as unknown as Record<symbol, unknown>;

function withCloudflareContext(env: Record<string, string | undefined>) {
  holder[REQUEST_CONTEXT] = { env };
}

afterEach(() => {
  delete holder[REQUEST_CONTEXT];
});

describe("cloudflareEnv", () => {
  it("컨텍스트가 없으면 undefined다 — 로컬 next dev가 이 상태다", () => {
    expect(cloudflareEnv()).toBeUndefined();
  });

  it("컨텍스트가 있으면 그 env를 준다", () => {
    withCloudflareContext({ KMA_SERVICE_KEY: "cf-key" });
    expect(cloudflareEnv()).toEqual({ KMA_SERVICE_KEY: "cf-key" });
  });
});

describe("readEnv", () => {
  it("Cloudflare 컨텍스트를 먼저 본다", () => {
    withCloudflareContext({ KMA_SERVICE_KEY: "cf-key" });
    expect(readEnv("KMA_SERVICE_KEY", { KMA_SERVICE_KEY: "local-key" })).toBe("cf-key");
  });

  it("컨텍스트가 없으면 넘겨준 쪽으로 물러난다 — 로컬 .env.local이 여기 온다", () => {
    expect(readEnv("KMA_SERVICE_KEY", { KMA_SERVICE_KEY: "local-key" })).toBe("local-key");
  });

  it("양쪽 다 없으면 undefined다", () => {
    expect(readEnv("KMA_SERVICE_KEY")).toBeUndefined();
    withCloudflareContext({});
    expect(readEnv("KMA_SERVICE_KEY", {})).toBeUndefined();
  });

  it("빈 문자열은 없는 것으로 본다", () => {
    withCloudflareContext({ KMA_SERVICE_KEY: "" });
    expect(readEnv("KMA_SERVICE_KEY", { KMA_SERVICE_KEY: "local-key" })).toBe("local-key");
  });

  it("컨텍스트에 다른 키만 있어도 헷갈리지 않는다", () => {
    withCloudflareContext({ OTHER: "x" });
    expect(readEnv("KMA_SERVICE_KEY", { KMA_SERVICE_KEY: "local-key" })).toBe("local-key");
  });
});
