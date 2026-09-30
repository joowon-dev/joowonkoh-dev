/**
 * 서비스 계정 JSON 키로 Google 액세스 토큰을 받는다.
 *
 * google-auth-library 는 Node 전용 API에 기대고 있어 Edge Function에서 무겁다.
 * 필요한 건 RS256 JWT 하나를 서명해 토큰으로 바꾸는 것뿐이라 WebCrypto로 직접 한다.
 * WebCrypto는 Deno와 Node 양쪽에 있으므로 테스트도 그대로 돈다.
 */

export type ServiceAccountKey = {
  client_email: string;
  private_key: string;
};

const TOKEN_URL = "https://oauth2.googleapis.com/token";

export async function signServiceAccountJwt(
  key: ServiceAccountKey,
  scope: string,
  now: Date,
): Promise<string> {
  const iat = Math.floor(now.getTime() / 1000);
  const header = { alg: "RS256", typ: "JWT" };
  const claims = {
    iss: key.client_email,
    scope,
    aud: TOKEN_URL,
    iat,
    exp: iat + 3600,
  };

  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`;

  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    pemToDer(key.private_key),
    { name: "RSASSA-PKCS1-v1_5", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "RSASSA-PKCS1-v1_5",
    cryptoKey,
    new TextEncoder().encode(unsigned),
  );

  return `${unsigned}.${base64url(new Uint8Array(signature))}`;
}

export async function fetchAccessToken(
  key: ServiceAccountKey,
  scope: string,
): Promise<string> {
  const assertion = await signServiceAccountJwt(key, scope, new Date());
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion,
    }),
  });

  const body = await res.json();
  if (!res.ok || typeof body.access_token !== "string") {
    throw new Error(`Google 토큰 발급 실패 (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

/**
 * OAuth 리프레시 토큰으로 액세스 토큰을 받는다. AdMob API 는 서비스 계정을
 * 받지 않아서 주원 계정으로 한 번 동의해 받은 리프레시 토큰을 쓴다.
 * OAuth 앱이 "프로덕션" 상태라 토큰은 만료되지 않는다(테스트 상태면 7일).
 */
export async function refreshAccessToken(creds: {
  clientId: string;
  clientSecret: string;
  refreshToken: string;
}): Promise<string> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "content-type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: creds.clientId,
      client_secret: creds.clientSecret,
      refresh_token: creds.refreshToken,
    }),
  });

  const body = await res.json();
  if (!res.ok || typeof body.access_token !== "string") {
    // invalid_grant = 토큰이 취소됐거나 만료됐다. 다시 동의받아야 한다.
    throw new Error(`Google 토큰 갱신 실패 (${res.status}): ${JSON.stringify(body)}`);
  }
  return body.access_token;
}

function pemToDer(pem: string): ArrayBuffer {
  const b64 = pem
    .replace(/-----(BEGIN|END) PRIVATE KEY-----/g, "")
    .replace(/\s+/g, "");
  const bytes = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));
  return bytes.buffer;
}

function base64url(input: string | Uint8Array): string {
  const bytes =
    typeof input === "string" ? new TextEncoder().encode(input) : input;
  let binary = "";
  for (const b of bytes) binary += String.fromCharCode(b);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
