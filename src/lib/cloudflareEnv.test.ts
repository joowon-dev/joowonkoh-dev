import { describe, it, expect, afterEach } from "vitest";
import { cloudflareEnv, readEnv, similarEnvNames } from "./cloudflareEnv";

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

describe("이름이 미묘하게 어긋난 경우", () => {
  it("이름 끝에 공백이 딸려 들어가도 찾는다", () => {
    withCloudflareContext({ "KMA_SERVICE_KEY ": "cf-key" });
    expect(readEnv("KMA_SERVICE_KEY")).toBe("cf-key");
  });

  it("대소문자가 달라도 찾는다", () => {
    withCloudflareContext({ Kma_Service_Key: "cf-key" });
    expect(readEnv("KMA_SERVICE_KEY")).toBe("cf-key");
  });

  it("정확히 일치하는 쪽을 먼저 쓴다", () => {
    withCloudflareContext({ KMA_SERVICE_KEY: "exact", "kma_service_key ": "loose" });
    expect(readEnv("KMA_SERVICE_KEY")).toBe("exact");
  });

  it("이름이 아예 다르면 못 찾는다 — 구제이지 추측이 아니다", () => {
    withCloudflareContext({ KMA_API_TOKEN: "다른 것" });
    expect(readEnv("KMA_SERVICE_KEY")).toBeUndefined();
  });
});

describe("similarEnvNames", () => {
  it("비슷한 이름만 추린다 — 다른 비밀 이름은 내보내지 않는다", () => {
    withCloudflareContext({
      KMA_SERVICE_KEY: "a",
      "KMA_SERVICE_KEY ": "b",
      SUPABASE_SERVICE_ROLE_KEY: "c",
    });
    const names = similarEnvNames("KMA_SERVICE_KEY");
    expect(names).toContain("KMA_SERVICE_KEY");
    expect(names).toContain("KMA_SERVICE_KEY ");
    expect(names).not.toContain("SUPABASE_SERVICE_ROLE_KEY");
  });

  it("컨텍스트가 없으면 빈 배열이다", () => {
    expect(similarEnvNames("KMA_SERVICE_KEY")).toEqual([]);
  });
});
