// 그리기 전부. 게임 상태를 받아 캔버스에 옮긴다 — 규칙은 여기 없다.
//
// **레티나 배율을 지우지 않는다.** 불꽃놀이에서 draw() 가 setTransform 으로 배율을
// 되돌려 화면 왼쪽 위 1/4 에만 그려지던 버그가 초록 테스트를 뚫고 살아남았다.
// 여기서는 배율을 app.js 가 한 번만 걸고, 이 파일은 절대 setTransform 을 부르지 않는다.
//
// 좌표는 정규 좌표(화면 짧은 변 = 1)로 들어와서 `scale` 로 픽셀이 된다.

import {
  RIPPLE_ALPHA, WAKE_ALPHA, WAKE_LIFE, WAKE_SPREAD, WAKE_WIDTH,
} from '../game/constants.js'
import { foodAlpha } from '../game/food.js'
import { detailOf } from '../game/growth.js'
import { speciesOf } from '../game/species.js'

/** 상어는 검은 실루엣이다. 색을 주면 그림이 되고, 그림이 되면 무섭지 않다. */
const INK = '0, 8, 14'

/**
 * 실루엣을 두르는 밝은 테두리.
 *
 * **어두운 바탕화면에서는 검은 실루엣이 안 보인다.** 알파를 아무리 올려도 검정 위의
 * 검정이다. 테두리를 두르면 밝은 배경에서는 몸이, 어두운 배경에서는 테두리가 상어를
 * 보여 준다. 두 배경 모두에서 읽히는 유일한 방법이고, 물속에서 빛을 받은 등처럼도 보인다.
 */
export const RIM = '214, 238, 252'

/** 테두리의 최소 굵기(px). 아기상어에서도 선이 사라지지 않게. */
const RIM_MIN_PX = 1.1

/** 입선. 이빨이 이 선 위에 앉아야 해서 한 곳에 적어 두고 둘이 같이 본다. */
const MOUTH = { x0: 0.468, y0: 0.012, x1: 0.288, y1: 0.060 }

function mouthLineY(x) {
  const t = (MOUTH.x0 - x) / (MOUTH.x0 - MOUTH.x1)
  return MOUTH.y0 + (MOUTH.y1 - MOUTH.y0) * t
}

/**
 * 한 프레임.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} view { width, height, scale } — CSS 픽셀 기준
 * @param {object} snap engine.snapshot()
 * @param {object} extras { ripples, wake }
 */
export function draw(ctx, view, snap, extras = {}) {
  ctx.clearRect(0, 0, view.width, view.height)

  drawRipples(ctx, view, extras.ripples ?? [])
  drawFood(ctx, view, snap.food)

  // **언제나 그린다.** 「안 보이는 상태」가 없어졌다(MIN_ALPHA) — 여기에 문턱을
  // 두면 그 문턱이 곧 상어가 사라지는 조건이 된다.
  drawWake(ctx, view, snap, extras.wake ?? [])
  drawShark(ctx, view, snap)
}

// MARK: 상어

/**
 * 몸의 윤곽. 길이를 1 로 본 국소 좌표이고, 코가 +x 쪽이다.
 * 위쪽(-y)이 등, 아래쪽(+y)이 배.
 *
 * **종마다 이 한 벌을 비율로 늘이고 줄인다.** 여섯 벌을 따로 그려 두면 한 종만
 * 고쳐도 나머지가 어긋난다.
 */
function bodyOutline(detail, species) {
  const d = species.depth
  const n = species.snout
  const t = species.tail

  const points = [
    { x: 0.50, y: 0.000 },                        // 코끝
    { x: 0.50 - 0.10 * n, y: -0.055 * d },
    { x: 0.50 - 0.26 * n, y: -0.098 * d },
    { x: 0.05, y: -0.115 * d },
    { x: -0.14, y: -0.100 * d },
    { x: -0.30, y: -0.065 * d },
    { x: -0.38, y: -0.040 * d },
    // 꼬리 — 위 갈래가 길다. 상어의 꼬리는 좌우가 다르다.
    //
    // **위 갈래는 점 두 개로 그린다.** 한 점으로 뾰족하게 두면 중점 곡선 보간이
    // 이웃 점 쪽으로 반쯤 끌어당겨서, 환도상어의 긴 꼬리가 백상아리와 똑같아진다.
    { x: -0.41 - 0.04 * t, y: -0.110 * t },
    { x: -0.44 - 0.08 * t, y: -0.250 * t },
    { x: -0.44, y: -0.070 },
    { x: -0.42, y: 0.000 },
    { x: -0.44, y: 0.060 },
    { x: -0.46 - 0.04 * t, y: 0.150 * (0.6 + 0.4 * t) },
    { x: -0.38, y: 0.035 },
    { x: -0.30, y: 0.060 * d },
    { x: -0.14, y: 0.095 * d },
    { x: 0.05, y: 0.105 * d },
    { x: 0.50 - 0.26 * n, y: 0.088 * d },
    { x: 0.50 - 0.10 * n, y: 0.048 * d },
  ]
  if (!detail.tailFin) return points.filter((p) => p.x > -0.42)
  return points
}

/**
 * 귀상어의 망치 머리 — 코앞에 **모서리가 선 판**이 가로로 붙어 있다.
 *
 * 둥글게 그리면 혹이 달린 상어가 된다. 곧은 변으로 그려야 망치로 읽힌다.
 */
function hammerHead(species) {
  const x = 0.50 - 0.10 * species.snout
  return [
    { x: x - 0.01, y: -0.090 },
    { x: x + 0.09, y: -0.150 },
    { x: x + 0.13, y: -0.125 },
    { x: x + 0.13, y: 0.125 },
    { x: x + 0.09, y: 0.150 },
    { x: x - 0.01, y: 0.090 },
  ]
}

/** 톱상어의 코 — 길게 뻗고 양옆에 이가 났다. */
function sawSnout(species) {
  const base = 0.50 - 0.10 * species.snout
  const tip = base + 0.34
  const points = [{ x: base, y: -0.030 }, { x: tip, y: -0.012 }, { x: tip, y: 0.012 }, { x: base, y: 0.030 }]
  // 톱니는 따로 조각으로 얹는다.
  const teeth = []
  for (let i = 0; i < 6; i += 1) {
    const x = base + 0.05 + i * 0.048
    teeth.push([{ x, y: -0.016 }, { x: x + 0.012, y: -0.052 }, { x: x + 0.024, y: -0.016 }])
    teeth.push([{ x: x + 0.012, y: 0.016 }, { x: x + 0.024, y: 0.052 }, { x: x + 0.036, y: 0.016 }])
  }
  return [points, ...teeth]
}

/**
 * 지느러미들. 각각 닫힌 삼각형이고 **밑동 두 점이 몸통 윤곽 안쪽에 있다** —
 * 밖에 두면 몸에서 떨어져 알처럼 떠 있는다. 처음에 그렇게 그려 놓고 한참 못 알아봤다.
 */
function fins(detail, species) {
  const list = []
  const h = species.dorsal
  const d = species.depth
  if (detail.dorsalFin) {
    // 등지느러미 — 이것이 수면을 가른다. 뒤로 눕고 뒷변이 오목하다.
    list.push([{ x: 0.12, y: -0.080 * d }, { x: 0.02, y: -0.320 * h }, { x: -0.10, y: -0.060 * d }])
  }
  if (detail.secondDorsal) {
    list.push([{ x: -0.20, y: -0.060 * d }, { x: -0.26, y: -0.145 * h }, { x: -0.31, y: -0.040 * d }])
  }
  if (detail.pectoralFins) {
    // 가슴지느러미 — 낫처럼 길고 뒤로 눕는다.
    list.push([{ x: 0.20, y: 0.040 }, { x: 0.02, y: 0.250 }, { x: 0.07, y: 0.080 }])
    // 반대쪽은 몸 너머라 짧게 보인다 — 옆에서 본 그림이다. **같은 쪽으로 눕혀야** 한다.
    // 각도가 엇갈리면 둘이 번개 모양으로 엉켜 상어가 아니라 도형이 된다.
    list.push([{ x: 0.21, y: 0.020 }, { x: 0.10, y: 0.135 }, { x: 0.14, y: 0.050 }])
  }
  if (detail.tailFin) {
    // 배지느러미
    list.push([{ x: -0.11, y: 0.060 }, { x: -0.19, y: 0.180 }, { x: -0.23, y: 0.050 }])
  }
  return list
}

/**
 * 헤엄치는 물결. 꼬리로 갈수록 크게 흔들린다 — 코는 안 흔들린다.
 * 이 한 줄이 없으면 상어가 아니라 화살표가 미끄러진다.
 */
function bend(point, phase, amount) {
  const fromNose = 0.5 - point.x           // 0(코) .. 1(꼬리)
  const weight = fromNose * fromNose
  return { x: point.x, y: point.y + Math.sin(phase - fromNose * 4.2) * amount * weight }
}

function drawShark(ctx, view, snap) {
  const { swimmer, length, alpha } = snap
  const size = length * view.scale

  // **위상과 폭은 엔진이 쌓아서 준다.** 여기서 시간 × 빠르기로 구하면 속력이 바뀔 때
  // 꼬리가 순간이동한다(constants.js 의 「꼬리」 참고).
  const phase = snap.tailPhase
  const amount = snap.tailSwing

  ctx.save()
  ctx.translate(swimmer.x * view.scale, swimmer.y * view.scale)
  ctx.rotate(swimmer.heading)
  ctx.scale(size, size)
  drawSharkBody(ctx, snap.species, snap.stage, alpha, phase, amount, size)
  ctx.restore()
}

/**
 * 길이 1 로 정규화된 상어 한 마리. 옮기고 돌리고 키우는 것은 부르는 쪽이 한다.
 *
 * **도감도 이 함수를 쓴다.** 도감의 그림과 화면의 상어가 다르면 도감이 아니다.
 */
export function drawSharkBody(
  ctx, speciesKey, stage, alpha, phase = 0, amount = 0, sizePx = 200, options = {},
) {
  const detail = detailOf(stage)
  const species = speciesOf(speciesKey)

  // 바탕화면 위에서는 어두운 몸 + 밝은 테두리다(배경이 밝을 수도 어두울 수도 있으니까).
  // **패널 안은 배경이 늘 어두우므로 밝게 채운다** — 거기서 테두리만 두르면 속이 빈
  // 윤곽선으로 보인다. 부르는 쪽이 자기 배경을 안다.
  const ink = options.ink ?? INK
  const rimmed = options.rim !== false

  // **몸통과 지느러미를 한 path 에 담아 한 번만 칠한다.**
  // 따로 칠하면 겹치는 자리에서 반투명이 두 번 쌓여 지느러미 밑동에 이음매가 비친다.
  // nonzero 감김 규칙이 겹친 부분을 하나로 메워서 그 자국이 사라진다.
  ctx.beginPath()
  addSmooth(ctx, bodyOutline(detail, species).map((p) => bend(p, phase, amount)))
  // 지느러미는 **곡선으로 잇지 않는다.** 삼각형을 중점 곡선으로 그리면 알처럼 뭉개진다.
  for (const fin of fins(detail, species)) {
    addSharp(ctx, fin.map((p) => bend(p, phase, amount)))
  }
  // 종마다 붙는 것. 머리와 코는 안 흔들린다 — bend 의 무게가 0 이라 그대로 둬도 같다.
  if (species.extras.includes('hammer')) addSharp(ctx, hammerHead(species))
  if (species.extras.includes('saw')) {
    for (const piece of sawSnout(species)) addSharp(ctx, piece)
  }
  // 테두리는 **바깥 윤곽에만** 남아야 한다.
  //
  // 그냥 stroke 하면 지느러미 조각들의 선이 몸 안쪽에도 그려져서 철사 모형이 된다.
  // 두껍게 긋고 → 몸 안쪽을 지우고 → 몸을 칠하면, 안쪽 절반과 내부 선이 함께
  // 사라지고 바깥 절반만 남는다.
  if (rimmed) {
    ctx.lineJoin = 'round'
    ctx.lineWidth = Math.max(RIM_MIN_PX / sizePx, 0.010) * 2
    ctx.strokeStyle = `rgba(${RIM}, ${Math.min(1, alpha * 1.6)})`
    ctx.stroke()

    ctx.globalCompositeOperation = 'destination-out'
    ctx.fill()
    ctx.globalCompositeOperation = 'source-over'
  }

  ctx.fillStyle = `rgba(${ink}, ${alpha})`
  ctx.fill()

  // 아래는 전부 실루엣을 **파내는** 것이다. 검은 덩어리에 구멍이 나야 얼굴이 생긴다.
  ctx.globalCompositeOperation = 'destination-out'
  ctx.lineCap = 'round'

  // 눈 — 귀상어는 머리 끝에 달려 있다.
  const eyeX = species.extras.includes('hammer') ? 0.50 - 0.10 * species.snout + 0.095 : 0.325
  ctx.beginPath()
  const eyeY = species.extras.includes('hammer') ? -0.118 : -0.042 * species.depth
  ctx.arc(eyeX, eyeY, 0.020, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(0,0,0,1)'
  ctx.fill()

  // 입 — 상어의 인상은 거의 이 한 줄에서 나온다. 코 밑에서 비스듬히 뒤로 째진다.
  // 입도 코 길이를 따라 앞뒤로 움직인다.
  const shift = (0.50 - 0.10 * species.snout) - 0.40
  ctx.beginPath()
  ctx.moveTo(MOUTH.x0 + shift, MOUTH.y0)
  ctx.lineTo(MOUTH.x1 + shift, MOUTH.y1)
  ctx.lineWidth = 0.012
  ctx.strokeStyle = 'rgba(0,0,0,1)'
  ctx.stroke()

  if (detail.gills) {
    // 완전히 파내면 흰 막대가 된다. 반만 파내서 자국처럼 남긴다.
    ctx.strokeStyle = 'rgba(0,0,0,0.40)'
    ctx.lineWidth = 0.007
    for (let i = 0; i < 4; i += 1) {
      const x = 0.145 - i * 0.030
      ctx.beginPath()
      ctx.moveTo(x, -0.035)
      ctx.lineTo(x - 0.008, 0.022)
      ctx.stroke()
    }
  }
  if (detail.scars) {
    // 옆구리에만 짧게. 등을 가로지르면 지느러미를 자르는 것처럼 보인다.
    ctx.strokeStyle = 'rgba(0,0,0,0.45)'
    ctx.lineWidth = 0.009
    ctx.beginPath()
    ctx.moveTo(-0.145, -0.010)
    ctx.lineTo(-0.105, 0.010)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(-0.120, 0.035)
    ctx.lineTo(-0.090, 0.050)
    ctx.stroke()
  }

  ctx.globalCompositeOperation = 'source-over'

  if (detail.teeth) {
    // 이빨은 파내지 않고 흰 톱니로 얹는다. 실루엣에서 유일하게 검지 않은 곳이다.
    // **입선 위에 앉혀야 한다** — 아래로 내리면 턱 밖으로 삐져나와 뼈처럼 보인다.
    ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`
    ctx.beginPath()
    for (let i = 0; i < 4; i += 1) {
      const x = 0.440 + shift - i * 0.036
      const y = mouthLineY(x - shift)
      ctx.moveTo(x, y - 0.004)
      ctx.lineTo(x - 0.026, y + 0.002)
      ctx.lineTo(x - 0.013, y + 0.022)
    }
    ctx.fill()
  }
}

/**
 * 조각들이 **같은 방향으로 감기게** 맞춘다.
 *
 * nonzero 감김 규칙은 겹친 자리의 감김 수를 더한다 — 방향이 반대인 두 조각이 겹치면
 * +1 과 -1 이 0 이 되어 **구멍이 뚫린다.** 가슴지느러미 둘이 정확히 그랬다.
 * 부호가 음수면 점 순서를 뒤집어 전부 같은 부호로 만든다.
 */
function sameWinding(points) {
  let area = 0
  for (let i = 0; i < points.length; i += 1) {
    const a = points[i]
    const b = points[(i + 1) % points.length]
    area += a.x * b.y - b.x * a.y
  }
  return area < 0 ? [...points].reverse() : points
}

/** 지금 path 에 곧은 조각을 더한다. 지느러미는 끝이 뾰족해야 한다. */
function addSharp(ctx, raw) {
  const points = sameWinding(raw)
  ctx.moveTo(points[0].x, points[0].y)
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i].x, points[i].y)
  ctx.closePath()
}

/** 지금 path 에 부드러운 조각을 더한다 — 중점을 지나는 2차 곡선. 꺾인 데가 없어야 물고기다. */
function addSmooth(ctx, raw) {
  const points = sameWinding(raw)
  const n = points.length
  ctx.moveTo((points[0].x + points[n - 1].x) / 2, (points[0].y + points[n - 1].y) / 2)
  for (let i = 0; i < n; i += 1) {
    const current = points[i]
    const next = points[(i + 1) % n]
    ctx.quadraticCurveTo(current.x, current.y, (current.x + next.x) / 2, (current.y + next.y) / 2)
  }
  ctx.closePath()
}

// MARK: 물살

/**
 * 지느러미가 지나간 자리. 「수면을 가른다」가 이것 하나로 보인다 —
 * 상어 자체는 흐릿해도 물살이 지나가면 뭔가 지나갔다는 것을 안다.
 */
function drawWake(ctx, view, snap, all) {
  // 몸통에 깔린 자국은 버린다. 상어가 반투명이라 몸 밑을 지나는 선이 비쳐서
  // 옆구리에 흐린 얼룩이 생긴다 — 꼬리 뒤에서부터만 그린다.
  const clear = snap.length * 0.6
  const wake = all.filter((w) => Math.hypot(w.x - snap.swimmer.x, w.y - snap.swimmer.y) > clear)
  if (wake.length < 2) return

  ctx.save()
  ctx.lineCap = 'round'
  for (let i = 1; i < wake.length; i += 1) {
    const a = wake[i - 1]
    const b = wake[i]
    // 오래된 쪽이 흐리고 넓다 — 퍼지면서 사라진다.
    const life = 1 - b.age / WAKE_LIFE
    if (life <= 0) continue
    const spread = (1 - life) * WAKE_SPREAD * snap.length * view.scale

    // **아주 연하다.** 물자국이 상어보다 눈에 띄면 화면에 흰 줄이 그어진 것으로 보인다.
    ctx.strokeStyle = `rgba(255, 255, 255, ${life * snap.alpha * WAKE_ALPHA})`
    ctx.lineWidth = Math.max(0.5, life * WAKE_WIDTH * snap.length * view.scale)

    for (const side of [-1, 1]) {
      ctx.beginPath()
      ctx.moveTo(a.x * view.scale + Math.sin(a.heading) * -side * spread,
                 a.y * view.scale + Math.cos(a.heading) * side * spread)
      ctx.lineTo(b.x * view.scale + Math.sin(b.heading) * -side * spread,
                 b.y * view.scale + Math.cos(b.heading) * side * spread)
      ctx.stroke()
    }
  }
  ctx.restore()
}

/** 먹은 자리에 퍼지는 동심원. */
function drawRipples(ctx, view, ripples) {
  for (const r of ripples) {
    const life = 1 - r.age / r.duration
    if (life <= 0) continue
    const radius = (1 - life) * r.maxRadius * view.scale
    ctx.beginPath()
    ctx.arc(r.x * view.scale, r.y * view.scale, radius, 0, Math.PI * 2)
    ctx.strokeStyle = `rgba(255, 255, 255, ${life * RIPPLE_ALPHA})`
    // 동심원의 굵기도 그 물결의 크기를 따라간다 — 상어 크기에서 온 값이다.
    ctx.lineWidth = Math.max(0.5, life * r.maxRadius * 0.06 * view.scale)
    ctx.stroke()
  }
}

// MARK: 밥

function drawFood(ctx, view, food) {
  for (const f of food) {
    const alpha = foodAlpha(f)
    if (alpha <= 0) continue

    // 가라앉으며 좌우로 흔들린다. id 로 위상을 갈라 여러 개가 같이 안 흔들린다.
    const wobble = Math.sin(f.age * 3 + f.id) * 0.004
    const x = (f.x + wobble) * view.scale
    const y = f.y * view.scale
    // 클릭으로 준 큰 밥과 타자로 떨어진 작은 밥. 눈으로 구별돼야 한다 —
    // 상어가 큰 것부터 노리는 이유가 화면에 보여야 한다.
    const r = (f.radius ?? 0.007) * view.scale

    // **거의 안 보인다.** 밥은 일하는 화면 위에 늘 떠 있는 것이라, 보이는 순간
    // 거슬린다. 상어가 그쪽으로 헤엄쳐 오는 것으로 「저기에 밥이 있다」를 안다.
    ctx.beginPath()
    ctx.arc(x, y, r * 2.2, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 240, 190, ${alpha * 0.05})`
    ctx.fill()

    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fillStyle = `rgba(255, 232, 170, ${alpha * 0.30})`
    ctx.fill()

    // 큰 밥에만 심지 하나 — 작게 줄어도 두 종류가 구별된다.
    if (f.kind === 'big') {
      ctx.beginPath()
      ctx.arc(x - r * 0.3, y - r * 0.3, r * 0.34, 0, Math.PI * 2)
      ctx.fillStyle = `rgba(255, 252, 235, ${alpha * 0.34})`
      ctx.fill()
    }
  }
}
