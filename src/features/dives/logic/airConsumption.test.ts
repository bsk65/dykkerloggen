import { describe, expect, it } from 'vitest'
import {
  ambientPressureBar,
  calculateAirConsumption,
  decoGasUsedL,
  minutesOfGas,
} from './airConsumption'

const base = {
  startBar: 200,
  endBar: 50,
  tankVolumeL: 12,
  diveTimeMin: 45,
  avgDepthM: 10,
  maxDepthM: 18,
}

describe('ambientPressureBar', () => {
  it('is 1 bar at the surface and 2 bar at 10 m', () => {
    expect(ambientPressureBar(0)).toBe(1)
    expect(ambientPressureBar(10)).toBe(2)
  })
})

describe('calculateAirConsumption', () => {
  it('computes gas used and surface consumption', () => {
    const result = calculateAirConsumption(base)
    expect(result?.gasUsedL).toBe(1800)
    // 1800 L / 45 min / 2 bar = 20 L/min
    expect(result?.sacLPerMin).toBeCloseTo(20)
    expect(result?.sacBarPerMin).toBeCloseTo(150 / 45 / 2)
    expect(result?.usedMaxDepth).toBe(false)
  })

  it('falls back to max depth when average depth is missing', () => {
    const result = calculateAirConsumption({ ...base, avgDepthM: null })
    expect(result?.usedMaxDepth).toBe(true)
    expect(result?.avgAmbientBar).toBeCloseTo(2.8)
  })

  it('returns null when data is missing or nonsensical', () => {
    expect(calculateAirConsumption({ ...base, endBar: null })).toBeNull()
    expect(calculateAirConsumption({ ...base, tankVolumeL: null })).toBeNull()
    expect(calculateAirConsumption({ ...base, avgDepthM: null, maxDepthM: null })).toBeNull()
    expect(calculateAirConsumption({ ...base, endBar: 210 })).toBeNull()
    expect(calculateAirConsumption({ ...base, diveTimeMin: 0 })).toBeNull()
  })
})

describe('decoGasUsedL', () => {
  it('computes deco gas used', () => {
    expect(
      decoGasUsedL({ decoGasUsed: true, decoStartBar: 200, decoEndBar: 150, decoTankVolumeL: 7 }),
    ).toBe(350)
  })

  it('is null when no deco gas was used', () => {
    expect(
      decoGasUsedL({ decoGasUsed: false, decoStartBar: 200, decoEndBar: 150, decoTankVolumeL: 7 }),
    ).toBeNull()
  })
})

describe('minutesOfGas', () => {
  it('computes how long a tank lasts at depth', () => {
    // (200-50) * 12 = 1800 L, at 20 L/min * 2 bar = 40 L/min -> 45 min
    expect(minutesOfGas(20, 12, 200, 50, 10)).toBeCloseTo(45)
  })
})
