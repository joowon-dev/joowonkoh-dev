import { generateKeyPairSync, verify } from "node:crypto";
import { describe, expect, it } from "vitest";
import { signServiceAccountJwt } from "./google";

const { privateKey, publicKey } = generateKeyPairSync("rsa", { modulusLength: 2048 });
const key = {
  client_email: "admin-metrics@example.iam.gserviceaccount.com",
  private_key: privateKey.export({ type: "pkcs8", format: "pem" }).toString(),
};

function decode(part: string) {
  return JSON.parse(Buffer.from(part, "base64url").toString("utf8"));
}

describe("signServiceAccountJwt", () => {
  it("Google 이 받는 RS256 JWT 를 만든다", async () => {
    const now = new Date("2026-10-01T00:00:00Z");
    const jwt = await signServiceAccountJwt(key, "scope-x", now);
    const [header, claims, signature] = jwt.split(".");

    expect(decode(header)).toEqual({ alg: "RS256", typ: "JWT" });
    expect(decode(claims)).toEqual({
      iss: key.client_email,
      scope: "scope-x",
      aud: "https://oauth2.googleapis.com/token",
      iat: 1790812800,
      exp: 1790812800 + 3600,
    });

    const ok = verify(
      "RSA-SHA256",
      Buffer.from(`${header}.${claims}`),
      publicKey,
      Buffer.from(signature, "base64url"),
    );
    expect(ok).toBe(true);
  });
});
