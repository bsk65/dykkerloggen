import { describe, expect, it } from 'vitest'
import {
  axisMax,
  decoRanges,
  fastAscentRanges,
  lowestComputerNdl,
  nearestSample,
} from './profileAnalysis'
import type { DiveProfile } from '../types'

function profile(points: [number, number][], extra: Partial<DiveProfile> = {}): DiveProfile {
  const n = points.length
  return {
    t: points.map((p) => p[0]),
    d: points.map((p) => p[1]),
    temp: Array(n).fill(null),
    bar: Array(n).fill(null),
    ndl: Array(n).fill(null),
    stop: Array(n).fill(null),
    gas: [{ t: 0, o2: 21 }],
    ...extra,
  }
}

describe('fastAscentRanges', () => {
  it('finds a fast ascent but ignores a calm one', () => {
    // 10 s mellem målinger: ned til 20 m, rolig op 6 m/min, så hurtigt op 18 m/min.
    const pts: [number, number][] = [
      [0, 0],
      [60, 18],
      [120, 20],
      [180, 20],
      [240, 14],
      [300, 8],
      [310, 5],
      [320, 2],
      [330, 0],
    ]
    const r = fastAscentRanges(profile(pts))
    expect(r.length).toBe(1)
    expect(pts[r[0][0]][0]).toBeGreaterThanOrEqual(300)
  })

  it('is empty without ascents', () => {
    expect(
      fastAscentRanges(
        profile([
          [0, 0],
          [60, 10],
          [600, 10],
        ]),
      ),
    ).toEqual([])
  })
})

describe('decoRanges and lowestComputerNdl', () => {
  it('groups the samples with a required stop', () => {
    const p = profile(
      [
        [0, 0],
        [10, 20],
        [20, 20],
        [30, 15],
        [40, 5],
        [50, 0],
      ],
      { stop: [null, 3, 3, null, 3, null], ndl: [null, 99, 4, 0, 0, null] },
    )
    expect(decoRanges(p)).toEqual([
      [1, 2],
      [4, 4],
    ])
    expect(lowestComputerNdl(p)).toBe(0)
  })
})

describe('nearestSample and axisMax', () => {
  const p = profile([
    [0, 0],
    [10, 3],
    [20, 23],
    [2500, 0],
  ])
  it('finds the nearest sample', () => {
    expect(nearestSample(p, 14)).toBe(1)
    expect(nearestSample(p, 16)).toBe(2)
    expect(nearestSample(p, 99999)).toBe(3)
  })
  it('rounds the axes', () => {
    expect(axisMax(p)).toEqual({ depthM: 25, minutes: 50 })
  })
})
