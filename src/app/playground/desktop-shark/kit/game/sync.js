// 서버에 무엇을 보낼지 정하는 순수 모듈. **네트워크는 모른다** — src/net/ranking.js 가 한다.
//
// 상어가 보내는 것은 「한 번 먹었다」뿐이라, 야구처럼 타구를 줄 세울 필요가 없다.
// **밀린 것은 숫자 하나로 충분하다.** 단계는 안 보낸다 — 서버가 매긴다.
// 클라이언트가 계산한 단계를 받아 적으면 앱을 뜯은 사람이 6단계를 적어 넣는다.

/** 서버가 한 번에 받아 주는 최대치. `feed_shark` 의 p_count 상한과 같아야 한다. */
export const MAX_BATCH = 20

/**
 * 밀린 채로 들고 있을 수 있는 최대치. 오래 오프라인이어도 숫자가 부풀지 않게 막는다.
 * 넘으면 **거기서 멈춘다** — 랭킹이 조금 덜 오르는 쪽이, 한꺼번에 수천을 올려
 * 서버에서 거절당하는 쪽보다 낫다.
 */
export const MAX_PENDING = 500

/** 한 번 먹었다. */
export function enqueueFeed(pending, count = 1) {
  return Math.min(MAX_PENDING, pending + count)
}

/** 이번에 보낼 개수. 보낼 것이 없으면 0. */
export function nextBatch(pending) {
  return Math.min(MAX_BATCH, Math.max(0, pending))
}

/** 보냈다. 줄에서 뺀다. */
export function dropBatch(pending, sent) {
  return Math.max(0, pending - sent)
}

// MARK: 신분 — 몰래 야구와 **같은 계정**이다

const SECRET_ALPHABET = 'abcdefghijkmnpqrstuvwxyz23456789'
const SECRET_LEN = 24

/**
 * 기기의 비밀 문자열. 이것과 id 한 쌍이 신분이고, 둘을 이어 붙인 것이 「복구 코드」다.
 * randomBytes 는 길이만큼의 0..255 배열을 주는 함수 — 브라우저는 crypto 가 준다.
 */
export function newSecret(randomBytes) {
  const bytes = randomBytes(SECRET_LEN)
  let out = ''
  for (let i = 0; i < SECRET_LEN; i += 1) {
    out += SECRET_ALPHABET[bytes[i] % SECRET_ALPHABET.length]
  }
  return out
}

/** 이름을 안 정했을 때 쓰는 이름. 짧을수록 랭킹에서 읽기 쉽다. */
export function defaultNickname(randomBytes) {
  const bytes = randomBytes(2)
  const number = ((bytes[0] << 8) | bytes[1]) % 10000
  return `상어${String(number).padStart(4, '0')}`
}

/** 사람이 옮겨 적을 한 줄. **몰래 야구의 코드를 그대로 넣으면 같은 계정이 된다.** */
export function recoveryCode(playerId, secret) {
  if (!playerId || !secret) return ''
  return `${playerId}.${secret}`
}

/** 복구 코드를 도로 가른다. 모양이 안 맞으면 null — 오타를 조용히 받아들이면 안 된다. */
export function parseRecoveryCode(text) {
  const trimmed = String(text ?? '').trim()
  const dot = trimmed.indexOf('.')
  if (dot < 0) return null

  const playerId = trimmed.slice(0, dot)
  const secret = trimmed.slice(dot + 1)
  const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  if (!uuid.test(playerId) || secret.length < 16) return null

  return { playerId, secret }
}

/**
 * 화면에 쓸 누적 먹이 수.
 *
 * **오프라인에서 키운 것을 잃지 않는다.** 서버 값을 그대로 받아 적으면, 비행기에서
 * 서른 번 먹인 사람이 인터넷에 붙는 순간 서른이 사라진다. 큰 쪽을 쓴다.
 */
export function mergeEaten(local, server) {
  return Math.max(local ?? 0, server ?? 0)
}
