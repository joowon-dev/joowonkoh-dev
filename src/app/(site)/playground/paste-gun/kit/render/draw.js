// 총 그림. 게임 규칙을 모른다 — 「어떤 총인지」와 「방금 쐈는지」만 받는다.
//
// 총은 100×44 칸 안에 오른쪽을 보고 그려져 있다. 조각마다 재질이 있다 —
// 쇠(steel)·어두운 수지(dark)·나무(wood)·황동(brass). 재질마다 위에서 아래로 어두워지는
// 색을 입혀서, 다각형 몇 개뿐이어도 납작한 그림자 인형이 아니라 물건으로 보인다.
//
// **순수 검정을 칠하지 않는다.** 윈도우 셸이 검정을 컬러 키로 뚫는다.

const OUTLINE = '#12151b'

/** 재질: [윗색, 아랫색]. */
const TONES = {
  steel: ['#d3dae3', '#6c7788'],
  dark: ['#5a6474', '#2a303a'],
  wood: ['#d39256', '#8a5228'],
  brass: ['#f6d27a', '#a87a22'],
}

/**
 * 각 총.
 *   parts   몸을 이루는 조각 { tone, points }
 *   lines   조각 위에 긋는 선 { points, width, color } — 방아쇠울, 홈, 빛 받는 모서리
 *   muzzle  총구 자리,  port  탄피가 튀어나오는 자리
 */
const SEAM = 'rgba(18, 21, 27, 0.55)'
const SHINE = 'rgba(255, 255, 255, 0.6)'

/** x0 부터 step 간격으로 n 개의 세로 홈. */
const grooves = (x0, n, step, y0, y1) => Array.from({ length: n }, (_, i) => (
  { points: [[x0 + i * step, y0], [x0 + i * step, y1]], width: 0.7, color: SEAM }
))

export const GUN_SHAPES = {
  pistol: {
    parts: [
      { tone: 'dark', points: [[31, 23], [47, 23], [44, 41], [29, 41], [27, 38]] }, // 손잡이
      { tone: 'dark', points: [[30, 19], [76, 19], [76, 23.5], [49, 24.5], [30, 24.5]] }, // 틀
      { tone: 'steel', points: [[28, 10], [76, 10], [77, 12], [77, 20], [28, 20], [26, 17], [26, 12]] }, // 슬라이드
      { tone: 'dark', points: [[72, 8.3], [75, 8.3], [75, 10], [72, 10]] }, // 가늠쇠
    ],
    lines: [
      { points: [[47, 24.5], [49, 30.5], [58, 30.5], [61, 24]], width: 1.5, color: '#3a414d' }, // 방아쇠울
      { points: [[52, 24.5], [53, 28.5]], width: 1.3, color: '#3a414d' }, // 방아쇠
      ...grooves(30.5, 5, 2, 12.5, 18),
      { points: [[50, 12], [61, 12], [61, 15.5], [50, 15.5], [50, 12]], width: 0.8, color: SEAM }, // 탄피 배출구
      { points: [[32, 28], [43, 28]], width: 0.7, color: SEAM },
      { points: [[31.5, 32], [42.3, 32]], width: 0.7, color: SEAM },
      { points: [[31, 36], [41.6, 36]], width: 0.7, color: SEAM },
      { points: [[29, 11.2], [75, 11.2]], width: 0.7, color: SHINE },
    ],
    muzzle: [77, 15],
    port: [55, 10],
  },
  machinegun: {
    parts: [
      { tone: 'wood', points: [[0, 13], [16, 13], [16, 22], [6, 28], [0, 28]] }, // 개머리판
      { tone: 'dark', points: [[44, 22], [53, 22], [58, 38], [56, 42], [48, 42], [46, 37]] }, // 탄창
      { tone: 'wood', points: [[26, 22], [34, 22], [31, 36], [24, 36]] }, // 손잡이
      { tone: 'steel', points: [[84, 15.5], [96, 15.5], [96, 19], [84, 19]] }, // 총열
      { tone: 'dark', points: [[94, 14.5], [99, 14.5], [99, 20], [94, 20]] }, // 소염기
      { tone: 'wood', points: [[66, 13.5], [85, 13.5], [85, 21.5], [66, 21.5]] }, // 총열 덮개
      { tone: 'steel', points: [[16, 12], [66, 12], [67, 13], [67, 23], [16, 23]] }, // 몸통
      { tone: 'dark', points: [[80, 9], [83, 9], [83, 13.5], [80, 13.5]] }, // 가늠쇠
      { tone: 'dark', points: [[23, 9.5], [28, 9.5], [28, 12], [23, 12]] }, // 가늠자
    ],
    lines: [
      { points: [[34, 23], [36, 28.5], [43, 28.5], [44.5, 23]], width: 1.4, color: '#3a414d' },
      { points: [[38, 23], [39, 26.5]], width: 1.2, color: '#3a414d' },
      { points: [[38, 14.5], [50, 14.5], [50, 18], [38, 18], [38, 14.5]], width: 0.8, color: SEAM },
      ...grooves(70, 5, 3, 15.5, 19.5),
      { points: [[17, 13.2], [66, 13.2]], width: 0.7, color: SHINE },
    ],
    muzzle: [99, 17.2],
    port: [44, 12],
  },
  shotgun: {
    parts: [
      { tone: 'wood', points: [[0, 15], [23, 12], [23, 22], [12, 24], [0, 31]] }, // 개머리판
      { tone: 'dark', points: [[44, 16], [91, 16], [91, 19.8], [44, 19.8]] }, // 관 탄창
      { tone: 'steel', points: [[44, 11.5], [99, 11.5], [99, 15.2], [44, 15.2]] }, // 총열
      { tone: 'wood', points: [[56, 14.8], [77, 14.8], [77, 23], [56, 23]] }, // 펌프
      { tone: 'steel', points: [[22, 11], [45, 11], [45, 22], [22, 22]] }, // 몸통
      { tone: 'brass', points: [[95.5, 9.8], [98, 9.8], [98, 11.5], [95.5, 11.5]] }, // 가늠쇠 구슬
    ],
    lines: [
      { points: [[26, 22], [28, 27.5], [36, 27.5], [38, 22]], width: 1.4, color: '#3a414d' },
      { points: [[31, 22], [32, 25.5]], width: 1.2, color: '#3a414d' },
      ...grooves(59, 6, 3, 16.5, 21.5),
      { points: [[30, 13.5], [40, 13.5], [40, 16.5], [30, 16.5], [30, 13.5]], width: 0.8, color: SEAM },
      { points: [[45, 12.5], [98, 12.5]], width: 0.7, color: SHINE },
    ],
    muzzle: [99, 13.3],
    port: [35, 11],
  },
  sniper: {
    parts: [
      { tone: 'dark', points: [[0, 13], [19, 12], [19, 22], [9, 23], [0, 29]] }, // 개머리판
      { tone: 'dark', points: [[25, 21], [32, 21], [29, 33], [22, 33]] }, // 손잡이
      { tone: 'dark', points: [[37, 21], [45, 21], [45, 29], [37, 29]] }, // 탄창
      { tone: 'steel', points: [[54, 15], [92, 15], [92, 18], [54, 18]] }, // 총열
      { tone: 'dark', points: [[89, 14], [100, 14], [100, 19], [89, 19]] }, // 소음기
      { tone: 'steel', points: [[18, 12.5], [55, 12.5], [55, 21.5], [18, 21.5]] }, // 몸통
      { tone: 'dark', points: [[31, 8], [34, 8], [34, 12.5], [31, 12.5]] }, // 조준경 다리
      { tone: 'dark', points: [[44, 8], [47, 8], [47, 12.5], [44, 12.5]] },
      { tone: 'dark', points: [[23, 3.5], [30, 3.5], [32, 5], [46, 5], [48, 3], [57, 3], [57, 9.5], [48, 9.5], [46, 8], [32, 8], [30, 9], [23, 9]] }, // 조준경
    ],
    lines: [
      { points: [[74, 18], [69, 34]], width: 1.3, color: '#4a5260' }, // 양각대
      { points: [[76, 18], [80, 34]], width: 1.3, color: '#4a5260' },
      { points: [[32, 21.5], [33.5, 26], [36.5, 26]], width: 1.3, color: '#3a414d' },
      { points: [[56.4, 4], [56.4, 8.5]], width: 1.1, color: '#7fd0ff' }, // 렌즈
      { points: [[38, 14.5], [48, 14.5], [48, 17.5], [38, 17.5], [38, 14.5]], width: 0.8, color: SEAM },
      ...grooves(91.5, 3, 2.5, 15, 18),
      { points: [[19, 13.6], [54, 13.6]], width: 0.7, color: SHINE },
      { points: [[33, 5.8], [46, 5.8]], width: 0.6, color: 'rgba(255, 255, 255, 0.35)' },
    ],
    muzzle: [100, 16.5],
    port: [46, 12.5],
  },
}

function tracePart(ctx, points) {
  ctx.beginPath()
  points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
  ctx.closePath()
}

/** 총의 조각들을 한 경로로 올린다. */
export function traceGun(ctx, gun) {
  ctx.beginPath()
  for (const part of gun.parts) {
    part.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.closePath()
  }
}

/**
 * 총을 칠한다. 좌표는 100×44 칸 그대로다 — 크기와 자리는 부르는 쪽이 변환으로 정한다.
 *
 * halo 를 주면 그 색으로 바깥에 한 겹 더 두른다. 바탕화면 위에 뜨는 총은 밑이 밝을지
 * 어두울지 모르니 밝은 테를 두르고, 어두운 판 위의 HUD 총은 안 두른다.
 */
export function paintGun(ctx, gun, halo = null) {
  ctx.lineJoin = 'round'
  ctx.lineCap = 'round'

  if (halo) {
    traceGun(ctx, gun)
    ctx.lineWidth = 4.2
    ctx.strokeStyle = halo
    ctx.stroke()
  }
  // 어두운 윤곽을 먼저 두껍게 긋고 그 위를 조각으로 덮는다. 조각 사이의 선은 가려지고
  // 바깥 윤곽만 남는다.
  traceGun(ctx, gun)
  ctx.lineWidth = 2
  ctx.strokeStyle = OUTLINE
  ctx.stroke()
  for (const line of gun.lines) {
    if (line.width < 1.1) continue // 굵은 선(방아쇠울·양각대)은 몸 밖으로 나가므로 윤곽이 필요하다
    ctx.beginPath()
    line.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.lineWidth = line.width + 1.4
    ctx.stroke()
  }

  for (const part of gun.parts) {
    const ys = part.points.map((p) => p[1])
    const shade = ctx.createLinearGradient(0, Math.min(...ys), 0, Math.max(...ys))
    const [top, bottom] = TONES[part.tone]
    shade.addColorStop(0, top)
    shade.addColorStop(1, bottom)
    ctx.fillStyle = shade
    tracePart(ctx, part.points)
    ctx.fill()
  }

  for (const line of gun.lines) {
    ctx.beginPath()
    line.points.forEach(([x, y], i) => (i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y)))
    ctx.lineWidth = line.width
    ctx.strokeStyle = line.color
    ctx.stroke()
  }
}

/**
 * 총구 불꽃. kick 은 1(방금 쐈다)에서 0 으로 식는다. size 로 총마다 크기를 달리한다.
 * 세 겹이다: 퍼지는 빛, 주황 불꽃, 하얗게 탄 속.
 */
export function paintFlash(ctx, gun, kick, size = 1) {
  const [mx, my] = gun.muzzle
  const reach = (7 + kick * 13) * size

  const glow = ctx.createRadialGradient(mx + reach * 0.3, my, 0, mx + reach * 0.3, my, reach * 1.1)
  glow.addColorStop(0, `rgba(255, 190, 90, ${0.55 * kick})`)
  glow.addColorStop(1, 'rgba(255, 150, 60, 0)')
  ctx.fillStyle = glow
  ctx.beginPath()
  ctx.arc(mx + reach * 0.3, my, reach * 1.1, 0, Math.PI * 2)
  ctx.fill()

  const star = (length, width, color) => {
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.moveTo(mx, my - 1.2)
    ctx.lineTo(mx + length * 0.5, my - width)
    ctx.lineTo(mx + length * 0.48, my - width * 0.28)
    ctx.lineTo(mx + length, my)
    ctx.lineTo(mx + length * 0.48, my + width * 0.28)
    ctx.lineTo(mx + length * 0.5, my + width)
    ctx.lineTo(mx, my + 1.2)
    ctx.closePath()
    ctx.fill()
  }
  star(reach, reach * 0.5, `rgba(255, 150, 50, ${0.5 + kick * 0.5})`)
  star(reach * 0.62, reach * 0.26, `rgba(255, 246, 214, ${0.6 + kick * 0.4})`)
}

/** 탄피 하나. 가로로 누운 황동 원통이다. (0,0) 이 가운데. */
export function paintCasing(ctx, length = 9, width = 3.6) {
  const shade = ctx.createLinearGradient(0, -width / 2, 0, width / 2)
  shade.addColorStop(0, '#fbe3a0')
  shade.addColorStop(0.5, '#e0aa3e')
  shade.addColorStop(1, '#8f651a')
  ctx.fillStyle = shade
  ctx.fillRect(-length / 2, -width / 2, length, width)
  ctx.fillStyle = '#8f651a'
  ctx.fillRect(-length / 2, -width / 2, 1.4, width) // 테
}

/** 반동과 불꽃이 남는 시간(초). */
export const KICK_TIME = 0.16
/** 탄피가 날아가는 시간(초). */
export const CASING_TIME = 0.7

export function createGunView(canvas) {
  const ctx = canvas.getContext('2d')
  const width = canvas.width
  const height = canvas.height

  // 레티나에서 흐릿하지 않게 실제 픽셀로 키운다.
  const ratio = globalThis.devicePixelRatio || 1
  canvas.width = width * ratio
  canvas.height = height * ratio

  /** 방금 쏜 뒤 흐른 시간. 크면 가만히 있는 것이다. */
  let sinceShot = Infinity
  let casings = []
  let dirty = true

  const scale = 1.55
  const origin = [10, (height - 44 * scale) / 2 + 3]

  function fire(strength = 1) {
    sinceShot = 0
    // 탄피는 그림일 뿐이라 여기서는 난수를 써도 된다 — 규칙이 아니다.
    for (let i = 0; i < strength; i += 1) {
      casings.push({
        age: 0,
        vx: -30 - Math.random() * 40,
        vy: -120 - Math.random() * 50,
        spin: (Math.random() - 0.5) * 30,
      })
    }
    dirty = true
  }

  function update(dt) {
    if (sinceShot < KICK_TIME || casings.length > 0) dirty = true
    sinceShot += dt
    for (const casing of casings) casing.age += dt
    casings = casings.filter((casing) => casing.age < CASING_TIME)
  }

  function draw(gunName) {
    if (!dirty) return
    dirty = false

    const gun = GUN_SHAPES[gunName] || GUN_SHAPES.pistol
    const kick = sinceShot < KICK_TIME ? 1 - sinceShot / KICK_TIME : 0

    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.clearRect(0, 0, width, height)

    ctx.save()
    // 반동: 뒤로 밀리면서 총구가 살짝 들린다.
    ctx.translate(origin[0] - kick * 5, origin[1])
    ctx.rotate(-kick * 0.06)
    ctx.scale(scale, scale)
    paintGun(ctx, gun)
    if (kick > 0) paintFlash(ctx, gun, kick, 0.55)
    ctx.restore()

    // 탄피 — 총을 따라 흔들리지 않게 반동 밖에서 그린다.
    const [px, py] = gun.port
    for (const casing of casings) {
      const t = casing.age
      ctx.save()
      ctx.translate(origin[0] + px * scale + casing.vx * t, origin[1] + py * scale + casing.vy * t + 420 * t * t)
      ctx.rotate(casing.spin * t)
      ctx.globalAlpha = Math.min(1, (CASING_TIME - t) * 4)
      paintCasing(ctx, 8, 3.2)
      ctx.restore()
    }
  }

  return { fire, update, draw, invalidate: () => { dirty = true } }
}
