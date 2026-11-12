import { describe, expect, it } from 'vitest'
import { GF_PRESETS, nitrogenForDive, startMinutes } from './nitrogen'
import { testDive } from './testDive'

const gf = GF_PRESETS.standard

function dive(id: string, date: string, entryTime: string | null, depth = 18, time = 45) {
  return testDive({ id, date, entryTime, maxDepthM: depth, diveTimeMin: time })
}

describe('startMinutes', () => {
  it('needs a time of day', () => {
    expect(startMinutes({ date: '2026-03-01', entryTime: null })).toBeNull()
    expect(
      startMinutes({ date: '2026-03-01', entryTime: '10:30' })! -
        startMinutes({ date: '2026-03-01', entryTime: '09:00' })!,
    ).toBe(90)
  })
})

describe('nitrogenForDive', () => {
  it('needs depth and time', () => {
    const d = testDive({ maxDepthM: null, diveTimeMin: 40 })
    expect(nitrogenForDive(d, [d], gf).status).toBe('missing')
  })

  it('skips freediving and rebreathers', () => {
    const d = testDive({ diveKind: 'freedive', maxDepthM: 10, diveTimeMin: 2 })
    expect(nitrogenForDive(d, [d], gf).status).toBe('unsupported')
  })

  it('a normal dive is within no-deco limits with margin', () => {
    const d = dive('a', '2026-03-01', '10:00', 18, 45)
    const r = nitrogenForDive(d, [d], gf)
    if (r.status !== 'ok') throw new Error(r.status)
    expect(r.bottomMin).toBeCloseTo(45 - 1 - 2 - 3, 5)
    expect(r.noDecoMin).toBeGreaterThan(0)
    expect(r.decoStops).toEqual([])
    expect(r.surfaceGf).toBeGreaterThan(0)
    expect(r.surfaceGf).toBeLessThan(85)
    expect(r.residualPercent).toBe(0)
    expect(r.noDecoMinFresh).toBe(r.noDecoMin)
    expect(r.previousDives).toBe(0)
  })

  it('residual nitrogen falls after the dive and reaches near-normal', () => {
    const d = dive('a', '2026-03-01', '10:00', 18, 45)
    const r = nitrogenForDive(d, [d], gf)
    if (r.status !== 'ok') throw new Error(r.status)
    const values = r.afterDive.map((p) => p.residualPercent)
    expect(r.afterDive.map((p) => p.hours)).toEqual([0, 1, 2, 4, 6, 12, 24])
    expect(values[0]).toBeGreaterThan(50)
    values.slice(1).forEach((v, i) => expect(v).toBeLessThan(values[i]))
    expect(r.nearNormalMin).not.toBeNull()
    expect(r.nearNormalMin!).toBeGreaterThan(4 * 60)
    expect(r.nearNormalMin!).toBeLessThan(24 * 60)
  })

  it('a deeper, longer dive takes longer to get back to normal', () => {
    const short = dive('a', '2026-03-01', '10:00', 12, 30)
    const long = dive('b', '2026-03-01', '10:00', 30, 50)
    const a = nitrogenForDive(short, [short], gf)
    const b = nitrogenForDive(long, [long], gf)
    if (a.status !== 'ok' || b.status !== 'ok') throw new Error()
    expect(b.nearNormalMin!).toBeGreaterThan(a.nearNormalMin!)
  })

  it('a long deep dive needs deco', () => {
    const d = dive('a', '2026-03-01', '10:00', 40, 45)
    const r = nitrogenForDive(d, [d], gf)
    if (r.status !== 'ok') throw new Error(r.status)
    expect(r.noDecoMin).toBe(0)
    expect(r.decoStops.length).toBeGreaterThan(0)
  })

  it('carries nitrogen over from an earlier dive the same day', () => {
    const first = dive('a', '2026-03-01', '09:00', 20, 35)
    const second = dive('b', '2026-03-01', '11:00', 20, 35)
    const alone = nitrogenForDive(second, [second], gf)
    const repeated = nitrogenForDive(second, [first, second], gf)
    if (alone.status !== 'ok' || repeated.status !== 'ok') throw new Error()
    expect(repeated.previousDives).toBe(1)
    expect(repeated.surfaceIntervalMin).toBe(85)
    expect(repeated.residualPercent).toBeGreaterThan(5)
    expect(repeated.noDecoMin).toBeLessThanOrEqual(alone.noDecoMin)
    expect(repeated.noDecoMinFresh).toBe(alone.noDecoMin)
    expect(repeated.surfaceGf).toBeGreaterThan(alone.surfaceGf)
  })

  it('ignores later dives and dives more than 48 hours earlier', () => {
    const old = dive('o', '2026-02-20', '09:00')
    const later = dive('l', '2026-03-01', '15:00')
    const d = dive('a', '2026-03-01', '10:00')
    const r = nitrogenForDive(d, [old, later, d], gf)
    if (r.status !== 'ok') throw new Error()
    expect(r.previousDives).toBe(0)
    expect(r.skippedDives).toBe(0)
  })

  it('reports nearby dives without a time of day', () => {
    const noTime = dive('n', '2026-03-01', null)
    const d = dive('a', '2026-03-01', '14:00')
    const r = nitrogenForDive(d, [noTime, d], gf)
    if (r.status !== 'ok') throw new Error()
    expect(r.previousDives).toBe(0)
    expect(r.skippedDives).toBe(1)
  })

  it('uses the nitrox mix', () => {
    const air = dive('a', '2026-03-01', '10:00', 28, 40)
    const ean = { ...air, nitrox: true, o2Percent: 32 }
    const rAir = nitrogenForDive(air, [air], gf)
    const rEan = nitrogenForDive(ean, [ean], gf)
    if (rAir.status !== 'ok' || rEan.status !== 'ok') throw new Error()
    expect(rEan.surfaceGf).toBeLessThan(rAir.surfaceGf)
  })
})
