import { describe, expect, it } from 'vitest'
import { mapReverseResult, mapSearchResults } from './nominatim'

describe('mapReverseResult', () => {
  it('prefers the most specific place name and the municipality', () => {
    expect(
      mapReverseResult({
        address: {
          beach: 'Kikhavn Strand',
          village: 'Kikhavn',
          municipality: 'Halsnæs Kommune',
          state: 'Region Hovedstaden',
          country: 'Danmark',
        },
      }),
    ).toEqual({ placeName: 'Kikhavn Strand', country: 'Danmark', region: 'Halsnæs Kommune' })
  })

  it('does not suggest the country itself as a site name', () => {
    expect(mapReverseResult({ name: 'Danmark', address: { country: 'Danmark' } }).placeName).toBe(
      null,
    )
  })

  it('handles an empty answer (open sea)', () => {
    expect(mapReverseResult({})).toEqual({ placeName: null, country: null, region: null })
  })
})

describe('mapSearchResults', () => {
  it('splits name and short detail and converts the bounding box to west, south, east, north', () => {
    expect(
      mapSearchResults([
        {
          lat: '-8.34',
          lon: '115.09',
          name: 'Bali',
          display_name: 'Bali, Indonesien',
          boundingbox: ['-8.85', '-8.06', '114.43', '115.71'],
        },
      ]),
    ).toEqual([
      {
        name: 'Bali',
        detail: 'Indonesien',
        lat: -8.34,
        lng: 115.09,
        bounds: [114.43, -8.85, 115.71, -8.06],
      },
    ])
  })

  it('uses the first part of the address when there is no name, and no box when it is missing', () => {
    const [hit] = mapSearchResults([
      {
        lat: '56',
        lon: '12',
        display_name: 'Hornbæk, Helsingør Kommune, Region Hovedstaden, 3100, Danmark',
      },
    ])
    expect(hit.name).toBe('Hornbæk')
    expect(hit.detail).toBe('Helsingør Kommune, Region Hovedstaden, Danmark')
    expect(hit.bounds).toBeNull()
  })
})
