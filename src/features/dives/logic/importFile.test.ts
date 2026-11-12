import { describe, expect, it } from 'vitest'
import {
  IMPORT_FORMAT,
  ImportFileError,
  normalizeImportedDive,
  onlyNewDives,
  parseImportFile,
} from './importFile'
import { testDive } from './testDive'

const ssiDive = {
  diveNumber: 38,
  date: '1992-01-19',
  siteName: 'Rødvig Flintovn',
  country: 'Danmark',
  lat: 55.2497,
  lng: 12.3766,
  purpose: 'fun',
  specialty: 'deco',
  entry: 'boat',
  waterBody: 'sea',
  waterType: 'salt',
  surface: 'moving',
  tankMaterial: 'steel',
  tankVolumeL: 15,
  startBar: 230,
  endBar: 50,
  diveTimeMin: 27,
  maxDepthM: 27,
  deco: true,
  buddies: ['Brian Rudolph (Jensen)'],
  rating: 3,
  comment: 'Deko. 3 meter 5 min',
  ssiId: '30371692',
}

describe('normalizeImportedDive', () => {
  it('keeps valid fields and fills the rest with defaults', () => {
    const dive = normalizeImportedDive(ssiDive)
    expect(dive).toMatchObject({ ...ssiDive, diveKind: 'scuba', source: 'ssi' })
    expect(dive?.avgDepthM).toBeNull()
    expect(dive?.nitrox).toBe(false)
    expect(dive?.sitePhotoPath).toBeNull()
  })

  it('drops unknown option values and bad numbers', () => {
    const dive = normalizeImportedDive({ ...ssiDive, entry: 'Båddyk', maxDepthM: '27' })
    expect(dive?.entry).toBeNull()
    expect(dive?.maxDepthM).toBeNull()
  })

  it('rejects dives without a valid date or site', () => {
    expect(normalizeImportedDive({ ...ssiDive, date: '19. jan 1992' })).toBeNull()
    expect(normalizeImportedDive({ ...ssiDive, siteName: ' ' })).toBeNull()
    expect(normalizeImportedDive('x')).toBeNull()
  })
})

describe('parseImportFile', () => {
  it('reads a valid file and skips invalid dives', () => {
    const text = JSON.stringify({ format: IMPORT_FORMAT, version: 1, dives: [ssiDive, {}] })
    expect(parseImportFile(text)).toHaveLength(1)
  })

  it('throws on other files', () => {
    expect(() => parseImportFile('not json')).toThrow(ImportFileError)
    expect(() => parseImportFile('{"dives":[]}')).toThrow(ImportFileError)
  })
})

describe('onlyNewDives', () => {
  it('skips dives whose SSI id is already imported', () => {
    const a = normalizeImportedDive(ssiDive)!
    const b = normalizeImportedDive({ ...ssiDive, ssiId: '2' })!
    expect(onlyNewDives([a, b], [testDive({ ssiId: '30371692' })])).toEqual([b])
  })
})
