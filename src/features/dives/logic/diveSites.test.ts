import { describe, expect, it } from 'vitest'
import { compareDivesNewestFirst, groupDivesBySite, nextDiveNumber } from './diveSites'
import { calculateDiveStats } from './diveStats'
import { testDive } from './testDive'

describe('groupDivesBySite', () => {
  it('groups by name regardless of case and takes position from the newest dive', () => {
    const sites = groupDivesBySite([
      testDive({ id: 'a', siteName: 'Kronborg', date: '1990-07-19', lat: 1, lng: 1 }),
      testDive({ id: 'b', siteName: 'kronborg ', date: '1991-11-09', lat: 2, lng: 2 }),
      testDive({ id: 'c', siteName: 'Kikhavn', date: '1991-11-24' }),
      testDive({ id: 'd', siteName: '  ' }),
    ])
    expect(sites.map((s) => s.name)).toEqual(['kronborg', 'Kikhavn'])
    expect(sites[0].dives.map((d) => d.id)).toEqual(['b', 'a'])
    expect(sites[0].lat).toBe(2)
    expect(sites[1].lat).toBeNull()
  })
})

describe('compareDivesNewestFirst', () => {
  it('sorts by date, then time', () => {
    const dives = [
      testDive({ id: 'old', date: '1990-01-01' }),
      testDive({ id: 'morning', date: '1991-10-13', entryTime: '09:00' }),
      testDive({ id: 'noon', date: '1991-10-13', entryTime: '11:45' }),
    ]
    expect(dives.sort(compareDivesNewestFirst).map((d) => d.id)).toEqual(['noon', 'morning', 'old'])
  })
})

describe('nextDiveNumber', () => {
  it('is one above the highest', () => {
    expect(nextDiveNumber([{ diveNumber: 3 }, { diveNumber: 38 }, { diveNumber: null }])).toBe(39)
    expect(nextDiveNumber([])).toBe(1)
  })
})

describe('calculateDiveStats', () => {
  it('sums time and averages consumption only over dives with average depth', () => {
    const stats = calculateDiveStats([
      testDive({
        siteName: 'A',
        country: 'Danmark',
        diveTimeMin: 45,
        maxDepthM: 18,
        avgDepthM: 10,
        tankVolumeL: 12,
        startBar: 200,
        endBar: 50,
      }),
      testDive({
        siteName: 'B',
        country: 'danmark',
        diveTimeMin: 30,
        maxDepthM: 27,
        tankVolumeL: 15,
        startBar: 230,
        endBar: 50,
      }),
    ])
    expect(stats.diveCount).toBe(2)
    expect(stats.totalMinutes).toBe(75)
    expect(stats.deepestM).toBe(27)
    expect(stats.siteCount).toBe(2)
    expect(stats.countryCount).toBe(1)
    expect(stats.avgSacLPerMin).toBeCloseTo(20)
    expect(stats.sacDiveCount).toBe(1)
  })
})
