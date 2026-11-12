// 붙여넣는 자리에 대고 쏘는 장면. 화면 전체를 덮는 캔버스에 그린다.
//
// 과녁(글자 커서 자리)을 받으면: 총이 그 옆으로 날아와 겨누고 → 총구가 번쩍하고 →
// **쏜 글자가 총구에서 튀어나와 과녁까지 날아가 꽂히고** → 불티가 튄다. 규칙은 모른다 — 「어떤 총으로 어디를 쐈다」만 받는다.
//
// **순수 검정을 칠하지 않는다**(윈도우 셸이 검정을 컬러 키로 뚫는다).
// 여기서 쓰는 난수는 그림일 뿐이다 — 규칙이 아니므로 Math.random 을 써도 된다.

import { GUN_SHAPES, paintCasing, paintFlash, paintGun } from './draw.js'

/** 바탕화면이 밝을지 어두울지 모른다. 총 바깥에 밝은 테를 한 겹 둘러 둔다. */
const HALO = 'rgba(238, 241, 245, 0.92)'
const HOT = '255, 214, 130'

/** 총마다 다른 것: 크기, 과녁과의 거리, 반동, 한 번에 나가는 탄 수와 퍼짐. */
const STYLE = {
  pistol: { scale: 1.5, gap: 96, kick: 1, pellets: 1, spread: 0, flash: 1 },
  machinegun: { scale: 1.7, gap: 120, kick: 0.7, pellets: 1, spread: 0.03, flash: 0.9 },
  shotgun: { scale: 1.8, gap: 120, kick: 1.8, pellets: 7, spread: 0.2, flash: 1.9 },
  sniper: { scale: 2.0, gap: 190, kick: 1.5, pellets: 1, spread: 0, flash: 1.3 },
}

/** 총이 과녁을 올려다보는 각도. */
const TILT = 0.42
/** 총이 나타나 자리를 잡는 시간. 이만큼 지나야 첫 발이 나간다 — 겨누는 것이 보여야 쏘는 것 같다. */
const DRAW_TIME = 0.09
/** 마지막 발 뒤에 총이 머무는 시간, 그리고 사라지는 시간. */
const LINGER = 0.55
const FADE = 0.22
const KICK_TIME = 0.18
/**
 * 글자가 총구에서 과녁까지 날아가는 시간. 눈이 글자를 알아볼 만큼은 길고, 「쐈다」가
 * 「날아갔다」로 느려지지 않을 만큼은 짧다.
 */
const FLIGHT = 0.1
/** 이미 나와 있는 총이 다음 과녁으로 돌아서는 시간. */
const TURN_TIME = 0.02
/** 글자가 실제로 찍힐 때의 크기와, 총구를 떠날 때의 크기(px). 날아가며 줄어든다. */
const LAND_SIZE = 14
const LAUNCH_SIZE = 30
const FONT = "-apple-system, 'Apple SD Gothic Neo', 'Malgun Gothic', 'Segoe UI', sans-serif"

const splitter = typeof Intl !== 'undefined' && Intl.Segmenter
  ? new Intl.Segmenter(undefined, { granularity: 'grapheme' }) : null
const graphemes = (text) => (splitter ? Array.from(splitter.segment(text), (s) => s.segment) : Array.from(text))

/** 안 보이는 글자는 보이는 것으로 바꿔 날린다. 빈칸이 날아가면 헛방처럼 보인다. */
function visible(char) {
  if (char === '\n' || char === '\r\n' || char === '\r') return '↵'
  if (char === '\t') return '⇥'
  if (char.trim() === '') return '·'
  return char
}

export function createFx(canvas) {
  const ctx = canvas.getContext('2d')
  let width = 0
  let height = 0
  let ratio = 1

  function resize() {
    ratio = globalThis.devicePixelRatio || 1
    width = canvas.clientWidth
    height = canvas.clientHeight
    canvas.width = Math.round(width * ratio)
    canvas.height = Math.round(height * ratio)
  }
  resize()
  globalThis.addEventListener('resize', resize)

  /** 지금 떠 있는 총. 없으면 null. */
  let gun = null
  /** 아직 안 나간 발 — 총이 자리를 잡으면 나간다. */
  let pending = []
  let tracers = []
  let sparks = []
  let rings = []
  let casings = []
  /** 총구에서 피어오르는 연기. */
  let puffs = []
  let cleared = true

  /** 과녁 옆에 총이 설 자리. 화면 가장자리에서는 반대편에 선다. */
  function pose(name, x, y) {
    const style = STYLE[name] || STYLE.pistol
    const mirror = x < 300 // 왼쪽 끝이면 오른쪽에서 쏜다
    const above = y > height - 150 // 바닥이면 위에서 내려 쏜다
    const angle = above ? TILT : -TILT
    const dirX = (mirror ? -1 : 1) * Math.cos(angle)
    const dirY = Math.sin(angle)
    return {
      name, style, mirror, angle, dirX, dirY,
      // 총구가 놓일 자리
      mx: x - dirX * style.gap,
      my: y - dirY * style.gap,
      tx: x,
      ty: y,
    }
  }

  /** 흐른 시간. 과녁이 얼마나 빨리 움직이는지 재는 데 쓴다. */
  let clock = 0
  /** 바로 앞 과녁과 그때의 시각, 그리고 과녁이 옆으로 가는 빠르기(px/초). */
  let lastAim = null
  let drift = 0

  /**
   * (x, y) 에 대고 text 를 쏜다. 화면 밖이면 아무것도 안 한다.
   *
   * predict 가 켜져 있으면 과녁을 **앞질러** 겨눈다. 기관총은 글자가 날아가는 동안에도 글이
   * 계속 찍혀서, 받은 자리에 그대로 쏘면 글자가 닿을 때쯤 줄 끝은 이미 서너 글자 앞에 가
   * 있다(띄워 보니 그랬다). 과녁이 가던 빠르기 × 날아가는 시간만큼 앞을 겨눈다.
   */
  function shoot(name, x, y, text = '', predict = false) {
    if (!(x >= 0 && y >= 0 && x <= width && y <= height)) return

    const since = lastAim ? clock - lastAim.time : Infinity
    if (lastAim && since > 0 && since < 0.25 && Math.abs(y - lastAim.y) < 3 && x >= lastAim.x) {
      const speed = (x - lastAim.x) / since
      drift += (Math.min(speed, 900) - drift) * 0.35 // 한 번 튄 값에 끌려가지 않게 조금씩 따라간다
    } else {
      drift = 0 // 줄이 바뀌었거나 한참 쉬었다. 가던 빠르기는 이제 뜻이 없다
    }
    lastAim = { x, y, time: clock }
    if (predict) x = Math.min(width, x + Math.min(90, drift * lead()))
    const next = pose(name, x, y)
    if (gun && gun.fade === 0) {
      // 이미 나와 있다. 새 과녁으로 미끄러져 가서 곧장 쏜다.
      Object.assign(gun, next, { x: gun.x, y: gun.y, idle: 0 })
      pending.push({ wait: TURN_TIME, text })
    } else {
      // 뒤쪽 아래에서 튀어나온다.
      gun = { ...next, x: next.mx - next.dirX * 70, y: next.my - next.dirY * 70 + 30, age: 0, idle: 0, kick: 0, fade: 0 }
      pending.push({ wait: DRAW_TIME, text })
    }
  }

  /** 총 좌표(100×44 칸)의 한 점이 화면 어디인가. 탄피가 나올 자리를 찾는 데 쓴다. */
  function toScreen(gx, gy) {
    const { style, angle, mirror } = gun
    const shape = GUN_SHAPES[gun.name] || GUN_SHAPES.pistol
    const lx = (gx - shape.muzzle[0]) * style.scale
    const ly = (gy - shape.muzzle[1]) * style.scale
    const rx = lx * Math.cos(angle) - ly * Math.sin(angle)
    const ry = lx * Math.sin(angle) + ly * Math.cos(angle)
    return [gun.x + (mirror ? -rx : rx), gun.y + ry]
  }

  /**
   * 지금 쏘라고 하면 글자가 과녁에 닿기까지 얼마나 걸리는가.
   * 바깥이 이만큼 기다렸다가 진짜 글자를 넣으면, 날아간 글자가 꽂히는 순간에 글이 찍힌다.
   */
  function lead() {
    return (gun && gun.fade === 0 ? TURN_TIME : DRAW_TIME) + FLIGHT
  }

  function release(text) {
    const { style, tx, ty } = gun
    gun.kick = 1
    gun.idle = 0

    // 저격총은 글 하나를 통째로 한 덩어리로 쏜다. 나머지는 글자 하나가 한 발이다.
    const chars = gun.name === 'sniper'
      ? [text.replace(/\s+/g, ' ').trim().slice(0, 16) + (text.trim().length > 16 ? '…' : '')]
      : graphemes(text).map(visible)
    if (chars.length === 0) chars.push('')

    let offset = 0
    chars.forEach((char) => {
      // 여러 글자(산탄)는 찍힐 자리 순서대로 옆으로 늘어서 꽂힌다. 가는 길은 제각각 휜다.
      const bend = chars.length > 1 ? (Math.random() - 0.5) * 2 * style.spread * style.gap * 2.2 : 0
      tracers.push({
        age: 0, char,
        fromX: gun.x, fromY: gun.y,
        toX: tx + offset, toY: ty,
        bend, heavy: gun.name === 'sniper' || gun.name === 'shotgun',
        quiet: chars.length > 1 && offset > 0, // 산탄은 불티를 첫 발에서만 크게 튀긴다
      })
      offset += LAND_SIZE * (char.charCodeAt(0) > 0x2e7f ? 0.95 : 0.58)
    })

    for (let i = 0; i < (gun.name === 'shotgun' ? 3 : 1); i += 1) {
      puffs.push({
        age: 0, x: gun.x, y: gun.y,
        vx: gun.dirX * (30 + Math.random() * 50) + (Math.random() - 0.5) * 30,
        vy: gun.dirY * 40 - 26 - Math.random() * 24,
        size: (5 + Math.random() * 4) * style.flash,
      })
    }

    const port = (GUN_SHAPES[gun.name] || GUN_SHAPES.pistol).port
    const [px, py] = toScreen(port[0], port[1])
    casings.push({
      age: 0, x: px, y: py,
      vx: -(gun.mirror ? -1 : 1) * (60 + Math.random() * 60),
      vy: -220 - Math.random() * 80,
      spin: (Math.random() - 0.5) * 34,
    })
  }

  function impact(x, y, heavy) {
    rings.push({ age: 0, x, y, size: heavy ? 1.7 : 1 })
    const count = heavy ? 14 : 8
    for (let i = 0; i < count; i += 1) {
      const angle = Math.random() * Math.PI * 2
      const speed = 120 + Math.random() * 260
      sparks.push({ age: 0, x, y, vx: Math.cos(angle) * speed, vy: Math.sin(angle) * speed - 60, life: 0.22 + Math.random() * 0.2 })
    }
  }

  function update(dt) {
    clock += dt
    if (gun) {
      gun.age += dt
      gun.idle += dt
      gun.kick = Math.max(0, gun.kick - dt / KICK_TIME)
      // 자리로 빠르게 끌려간다. 프레임 수와 상관없이 같은 빠르기다.
      const pull = 1 - Math.exp(-dt * 38)
      gun.x += (gun.mx - gun.x) * pull
      gun.y += (gun.my - gun.y) * pull

      for (const shot of pending) shot.wait -= dt
      while (pending.length > 0 && pending[0].wait <= 0) {
        release(pending.shift().text)
      }

      if (pending.length === 0 && gun.idle > LINGER) gun.fade += dt / FADE
      if (gun.fade >= 1) gun = null
    }

    for (const tracer of tracers) {
      tracer.age += dt
      if (tracer.age >= FLIGHT && !tracer.hit) {
        tracer.hit = true
        if (tracer.quiet) rings.push({ age: 0, x: tracer.toX, y: tracer.toY, size: 0.6 })
        else impact(tracer.toX, tracer.toY, tracer.heavy)
      }
    }
    tracers = tracers.filter((t) => t.age < FLIGHT + 0.07)

    for (const spark of sparks) {
      spark.age += dt
      spark.x += spark.vx * dt
      spark.y += spark.vy * dt
      spark.vx *= 1 - dt * 6
      spark.vy = spark.vy * (1 - dt * 6) + 500 * dt
    }
    sparks = sparks.filter((s) => s.age < s.life)

    for (const ring of rings) ring.age += dt
    rings = rings.filter((r) => r.age < 0.3)

    for (const casing of casings) {
      casing.age += dt
      casing.vy += 900 * dt
      casing.x += casing.vx * dt
      casing.y += casing.vy * dt
    }
    casings = casings.filter((c) => c.age < 0.8)

    for (const puff of puffs) {
      puff.age += dt
      puff.x += puff.vx * dt
      puff.y += puff.vy * dt
      puff.vx *= 1 - dt * 3
    }
    puffs = puffs.filter((p) => p.age < 0.5)
  }

  function drawGun() {
    const { style, angle, mirror, kick, name } = gun
    const shape = GUN_SHAPES[name] || GUN_SHAPES.pistol
    const appear = Math.min(1, gun.age / DRAW_TIME)

    ctx.save()
    ctx.globalAlpha = appear * (1 - Math.min(1, gun.fade))
    ctx.translate(gun.x, gun.y)
    if (mirror) ctx.scale(-1, 1)
    // 반동: 총구가 들리고 뒤로 밀린다.
    ctx.rotate(angle - kick * 0.1 * style.kick)
    ctx.scale(style.scale, style.scale)
    ctx.translate(-shape.muzzle[0] - kick * 5 * style.kick, -shape.muzzle[1])

    // 살짝 떠 있는 물건이다. 그림자는 테를 그릴 때 한 번만 떨군다.
    ctx.shadowColor = 'rgba(9, 11, 15, 0.4)'
    ctx.shadowBlur = 14
    ctx.shadowOffsetY = 5 * ratio
    paintGun(ctx, shape, HALO)
    ctx.shadowColor = 'transparent'
    paintGun(ctx, shape)

    if (kick > 0) paintFlash(ctx, shape, kick, style.flash)
    ctx.restore()
  }

  function draw() {
    const busy = gun || tracers.length || sparks.length || rings.length || casings.length || puffs.length
    if (!busy) {
      if (!cleared) {
        ctx.setTransform(1, 0, 0, 1, 0, 0)
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        cleared = true
      }
      return
    }
    cleared = false
    ctx.setTransform(ratio, 0, 0, ratio, 0, 0)
    ctx.clearRect(0, 0, width, height)

    // 저격총은 쏘기 전에 과녁을 가늠한다.
    if (gun && gun.name === 'sniper' && gun.fade === 0 && gun.idle < 0.3) {
      const fadeOut = 1 - gun.idle / 0.3
      ctx.strokeStyle = `rgba(255, 70, 60, ${0.75 * fadeOut})`
      ctx.lineWidth = 1
      ctx.beginPath()
      ctx.moveTo(gun.x, gun.y)
      ctx.lineTo(gun.tx, gun.ty)
      ctx.stroke()
      ctx.beginPath()
      ctx.arc(gun.tx, gun.ty, 13, 0, Math.PI * 2)
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        ctx.moveTo(gun.tx + dx * 7, gun.ty + dy * 7)
        ctx.lineTo(gun.tx + dx * 19, gun.ty + dy * 19)
      }
      ctx.stroke()
    }

    ctx.lineCap = 'round'
    ctx.lineJoin = 'round'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    for (const tracer of tracers) {
      const t = Math.min(1, tracer.age / FLIGHT)
      // 곧은 길에 옆으로 휘는 것을 얹는다(가운데에서 가장 크게).
      const place = (u) => {
        const x = tracer.fromX + (tracer.toX - tracer.fromX) * u
        const y = tracer.fromY + (tracer.toY - tracer.fromY) * u
        const length = Math.hypot(tracer.toX - tracer.fromX, tracer.toY - tracer.fromY) || 1
        const lift = Math.sin(Math.PI * u) * tracer.bend
        return [x - ((tracer.toY - tracer.fromY) / length) * lift, y + ((tracer.toX - tracer.fromX) / length) * lift]
      }
      const [x, y] = place(t)
      // 꽂힌 뒤에는 그 자리에서 식는다 — 밑에서 진짜 글자가 드러난다.
      const landed = tracer.age >= FLIGHT
      const alpha = landed ? Math.max(0, 1 - (tracer.age - FLIGHT) / 0.07) : 1

      if (!landed) {
        // 꼬리. 글자에서 멀어질수록 가늘고 옅다.
        const [bx, by] = place(Math.max(0, t - 0.42))
        const tail = ctx.createLinearGradient(bx, by, x, y)
        tail.addColorStop(0, `rgba(${HOT}, 0)`)
        tail.addColorStop(1, `rgba(${HOT}, 0.8)`)
        ctx.strokeStyle = tail
        ctx.lineWidth = tracer.heavy ? 4 : 2.6
        ctx.beginPath()
        ctx.moveTo(bx, by)
        ctx.lineTo(x, y)
        ctx.stroke()
      }

      if (tracer.char) {
        const size = LAUNCH_SIZE + (LAND_SIZE - LAUNCH_SIZE) * t * t
        ctx.font = `700 ${size}px ${FONT}`
        // 어두운 테두리 + 뜨거운 속. 밝은 바탕에서도 어두운 바탕에서도 읽힌다.
        ctx.lineWidth = Math.max(2, size * 0.16)
        ctx.strokeStyle = `rgba(27, 31, 39, ${0.9 * alpha})`
        ctx.strokeText(tracer.char, x, y)
        // 달궈진 쇠처럼 빛난다.
        ctx.shadowColor = `rgba(255, 140, 50, ${0.9 * alpha})`
        ctx.shadowBlur = size * 0.5
        ctx.fillStyle = `rgba(255, 238, 190, ${alpha})`
        ctx.fillText(tracer.char, x, y)
        ctx.shadowColor = 'transparent'
        ctx.shadowBlur = 0
      }
    }

    for (const ring of rings) {
      const t = ring.age / 0.3
      ctx.strokeStyle = `rgba(${HOT}, ${0.9 * (1 - t)})`
      ctx.lineWidth = 2.5 * (1 - t) + 0.5
      ctx.beginPath()
      ctx.arc(ring.x, ring.y, (5 + t * 24) * ring.size, 0, Math.PI * 2)
      ctx.stroke()
      if (t < 0.3) {
        ctx.fillStyle = `rgba(255, 244, 214, ${1 - t / 0.3})`
        ctx.beginPath()
        ctx.arc(ring.x, ring.y, 7 * ring.size, 0, Math.PI * 2)
        ctx.fill()
      }
    }

    for (const spark of sparks) {
      const t = spark.age / spark.life
      ctx.strokeStyle = `rgba(${HOT}, ${1 - t})`
      ctx.lineWidth = 1.6
      ctx.beginPath()
      ctx.moveTo(spark.x, spark.y)
      ctx.lineTo(spark.x - spark.vx * 0.025, spark.y - spark.vy * 0.025)
      ctx.stroke()
    }

    // 연기. 회색이다 — 검정은 윈도우에서 구멍이 된다.
    for (const puff of puffs) {
      const t = puff.age / 0.5
      const radius = puff.size * (1 + t * 2.2)
      const smoke = ctx.createRadialGradient(puff.x, puff.y, 0, puff.x, puff.y, radius)
      smoke.addColorStop(0, `rgba(226, 230, 236, ${0.34 * (1 - t)})`)
      smoke.addColorStop(1, 'rgba(226, 230, 236, 0)')
      ctx.fillStyle = smoke
      ctx.beginPath()
      ctx.arc(puff.x, puff.y, radius, 0, Math.PI * 2)
      ctx.fill()
    }

    if (gun) drawGun()

    for (const casing of casings) {
      ctx.save()
      ctx.translate(casing.x, casing.y)
      ctx.rotate(casing.spin * casing.age)
      ctx.globalAlpha = Math.min(1, (0.8 - casing.age) * 5)
      paintCasing(ctx, 11, 4.2)
      ctx.restore()
    }
  }

  return { shoot, update, draw, lead }
}
