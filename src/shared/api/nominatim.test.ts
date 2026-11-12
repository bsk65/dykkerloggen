import { describe, expect, it } from 'vitest'
import { mapReverseResult } from './nominatim'

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

  it('handles an empty answer (open sea)', () => {
    expect(mapReverseResult({})).toEqual({ placeName: null, country: null, region: null })
  })
})
