import { describe, expect, it } from 'vitest'
import { fillParams, localeFor } from './translate'
import { texts } from './texts'
import { translate } from './translator'

describe('fillParams', () => {
  it('fills in named placeholders', () => {
    expect(fillParams('Slet {name}? ({n})', { name: 'Paris', n: 2 })).toBe('Slet Paris? (2)')
  })

  it('leaves unknown placeholders alone', () => {
    expect(fillParams('Hej {name}', {})).toBe('Hej {name}')
  })
})

describe('translate', () => {
  it('looks up the key in the chosen language', () => {
    expect(translate('da', 'common.save')).toBe('Gem')
    expect(translate('en', 'common.save')).toBe('Save')
  })
})

describe('localeFor', () => {
  it('maps language to a locale', () => {
    expect(localeFor('da')).toBe('da-DK')
    expect(localeFor('en')).toBe('en-GB')
  })
})

describe('texts', () => {
  const areas = Object.entries(texts) as [
    string,
    { da: Record<string, string>; en: Record<string, string> },
  ][]

  it('has no empty translations', () => {
    for (const [, area] of areas) {
      for (const value of [...Object.values(area.da), ...Object.values(area.en)]) {
        expect(value.trim()).not.toBe('')
      }
    }
  })

  it('uses the same placeholders in both languages', () => {
    const names = (s: string) => (s.match(/\{\w+\}/g) ?? []).sort().join()
    for (const [areaName, area] of areas) {
      for (const key of Object.keys(area.da)) {
        expect(names(area.en[key]), `${areaName}.${key}`).toBe(names(area.da[key]))
      }
    }
  })
})
