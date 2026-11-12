import { describe, expect, it } from 'vitest'
import { groupDivesBySite } from '../../dives/logic/diveSites'
import { testDive } from '../../dives/logic/testDive'
import { centerOf, sitesToGeoJson } from './sitesGeoJson'

describe('sitesToGeoJson', () => {
  it('includes only sites with a position, with dive counts', () => {
    const sites = groupDivesBySite([
      testDive({ id: 'a', siteName: 'Kikhavn', lat: 56.1, lng: 11.9 }),
      testDive({ id: 'b', siteName: 'Kikhavn', lat: 56.1, lng: 11.9 }),
      testDive({ id: 'c', siteName: 'Ukendt' }),
    ])
    const geo = sitesToGeoJson(sites)
    expect(geo.features).toHaveLength(1)
    expect(geo.features[0].geometry.coordinates).toEqual([11.9, 56.1])
    expect(geo.features[0].properties.count).toBe(2)
  })
})

describe('centerOf', () => {
  it('averages the points, or null when empty', () => {
    const sites = groupDivesBySite([
      testDive({ id: 'a', siteName: 'A', lat: 10, lng: 0 }),
      testDive({ id: 'b', siteName: 'B', lat: 20, lng: 10 }),
    ])
    expect(centerOf(sitesToGeoJson(sites))).toEqual([5, 15])
    expect(centerOf(sitesToGeoJson([]))).toBeNull()
  })
})
