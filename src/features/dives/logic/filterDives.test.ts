import { describe, expect, it } from 'vitest'
import { filterDives } from './filterDives'
import { testDive } from './testDive'

const dives = [
  testDive({ id: 'a', siteName: 'Hornbæk Rev', country: 'Danmark', buddies: ['Per Roholt'] }),
  testDive({ id: 'b', siteName: 'Spetsen Kullen', country: 'Sverige', diveNumber: 23 }),
]

describe('filterDives', () => {
  it('returns everything for an empty query', () => {
    expect(filterDives(dives, '  ')).toHaveLength(2)
  })

  it('matches all words in any field, case-insensitively', () => {
    expect(filterDives(dives, 'per hornbæk').map((d) => d.id)).toEqual(['a'])
    expect(filterDives(dives, 'SVERIGE').map((d) => d.id)).toEqual(['b'])
    expect(filterDives(dives, '#23').map((d) => d.id)).toEqual(['b'])
  })
})
