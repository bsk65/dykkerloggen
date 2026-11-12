import { describe, expect, it } from 'vitest'
import { diveToForm, emptyDiveForm, formToDive, parseBuddies, todayIso } from './diveForm'

describe('emptyDiveForm', () => {
  it('defaults to salt water, scuba, air and the next dive number', () => {
    const form = emptyDiveForm(39, new Date(2026, 10, 12, 9, 5))
    expect(form.waterType).toBe('salt')
    expect(form.diveKind).toBe('scuba')
    expect(form.o2Percent).toBe('21')
    expect(form.diveNumber).toBe('39')
    expect(form.date).toBe('2026-11-12')
    expect(form.entryTime).toBe('09:05')
  })
})

describe('todayIso', () => {
  it('pads month and day', () => {
    expect(todayIso(new Date(2026, 0, 3))).toBe('2026-01-03')
  })
})

describe('parseBuddies', () => {
  it('splits on comma, semicolon and newline', () => {
    expect(parseBuddies('Anna, Bo;Carl\n  ')).toEqual(['Anna', 'Bo', 'Carl'])
  })
})

describe('formToDive', () => {
  it('parses numbers with decimal comma and empty fields as null', () => {
    const form = { ...emptyDiveForm(1), maxDepthM: '12,5', avgDepthM: '', siteName: ' Kikhavn ' }
    const dive = formToDive(form)
    expect(dive.maxDepthM).toBe(12.5)
    expect(dive.avgDepthM).toBeNull()
    expect(dive.siteName).toBe('Kikhavn')
  })

  it('drops deco gas fields when it was not a deco dive', () => {
    const form = { ...emptyDiveForm(1), deco: false, decoGasUsed: true, decoStartBar: '200' }
    const dive = formToDive(form)
    expect(dive.decoGasUsed).toBe(false)
    expect(dive.decoStartBar).toBeNull()
  })

  it('stores 21 % oxygen when nitrox is off', () => {
    const form = { ...emptyDiveForm(1), nitrox: false, o2Percent: '32' }
    expect(formToDive(form).o2Percent).toBe(21)
  })

  it('round-trips through diveToForm', () => {
    const form = {
      ...emptyDiveForm(7, new Date(2026, 5, 1, 10, 0)),
      siteName: 'Rødvig Flintovn',
      buddies: 'Brian, Per',
      maxDepthM: '27',
      tankVolumeL: '15',
      startBar: '230',
      endBar: '50',
    }
    const dive = { ...formToDive(form), sitePhotoPath: null, source: 'app' as const, ssiId: null }
    expect(diveToForm(dive)).toEqual(form)
  })
})
