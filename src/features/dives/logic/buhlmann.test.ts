import { describe, expect, it } from 'vitest'
import {
  AIR_N2,
  BAR_PER_M,
  SURFACE_BAR,
  canSurface,
  decoAscent,
  noDecoMinutes,
  saturationPercent,
  segment,
  surfaceTissues,
} from './buhlmann'

const salt = BAR_PER_M.salt
const raw = { low: 1, high: 1 }

describe('segment', () => {
  it('approaches the inspired pressure after a long time', () => {
    const t = segment(surfaceTissues(), 10, 10, 10_000, AIR_N2, salt)
    const inspired = (SURFACE_BAR + 10 * salt - 0.0627) * AIR_N2
    for (const p of t) expect(p).toBeCloseTo(inspired, 3)
  })

  it('fast tissues load faster than slow ones', () => {
    const t = segment(surfaceTissues(), 30, 30, 10, AIR_N2, salt)
    expect(t[0]).toBeGreaterThan(t[15])
  })

  it('a ramp gives the same as many small steps', () => {
    const ramp = segment(surfaceTissues(), 0, 30, 3, AIR_N2, salt)
    let steps = surfaceTissues()
    for (let i = 0; i < 300; i++) {
      const d = (i / 300) * 30
      steps = segment(steps, d, d + 0.1, 0.01, AIR_N2, salt)
    }
    ramp.forEach((p, i) => expect(p).toBeCloseTo(steps[i], 4))
  })
})

describe('no-deco limits (ZHL-16C, GF 100/100, air)', () => {
  // Kendte størrelsesordener for ren Bühlmann ZHL-16C.
  it.each([
    [18, 45, 65],
    [30, 12, 22],
    [40, 6, 12],
  ])('%i m gives between %i and %i min', (depth, min, max) => {
    const ndl = noDecoMinutes(surfaceTissues(), depth, AIR_N2, salt, raw)
    expect(ndl).toBeGreaterThanOrEqual(min)
    expect(ndl).toBeLessThanOrEqual(max)
  })

  it('lower gradient factors are more conservative', () => {
    const strict = noDecoMinutes(surfaceTissues(), 30, AIR_N2, salt, { low: 0.3, high: 0.7 })
    const loose = noDecoMinutes(surfaceTissues(), 30, AIR_N2, salt, raw)
    expect(strict).toBeLessThan(loose)
  })

  it('nitrox gives longer limits than air', () => {
    const air = noDecoMinutes(surfaceTissues(), 30, AIR_N2, salt, raw)
    const ean32 = noDecoMinutes(surfaceTissues(), 30, 0.68, salt, raw)
    expect(ean32).toBeGreaterThan(air)
  })
})

describe('decoAscent', () => {
  const gf = { low: 0.4, high: 0.85 }
  const loaded = segment(surfaceTissues(), 40, 40, 30, AIR_N2, salt)

  it('needs stops after 30 min at 40 m', () => {
    expect(canSurface(loaded, gf)).toBe(false)
    const { stops, tissues } = decoAscent(loaded, 40, AIR_N2, salt, gf)
    expect(stops.length).toBeGreaterThan(0)
    expect(stops.every((s) => s.depthM % 3 === 0 && s.minutes > 0)).toBe(true)
    // Stoppene går opad, og man ender inden for GF high.
    expect(stops.map((s) => s.depthM)).toEqual(
      [...stops.map((s) => s.depthM)].sort((a, b) => b - a),
    )
    expect(Math.max(...saturationPercent(tissues, SURFACE_BAR))).toBeLessThanOrEqual(85.5)
  })
})

describe('saturationPercent', () => {
  it('is 0 for a diver who has been ashore', () => {
    expect(Math.max(...saturationPercent(surfaceTissues(), SURFACE_BAR))).toBe(0)
  })
})
