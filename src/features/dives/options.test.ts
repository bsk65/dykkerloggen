import { describe, expect, it } from 'vitest'
import { texts } from '../../shared/i18n/texts'
import { OPTION_LISTS } from './options'

describe('option lists', () => {
  it('has a Danish and English text for every value', () => {
    const da = texts.options.da as Record<string, string>
    const en = texts.options.en as Record<string, string>
    for (const [list, values] of Object.entries(OPTION_LISTS)) {
      for (const value of values) {
        expect(da[`${list}_${value}`], `${list}_${value}`).toBeTruthy()
        expect(en[`${list}_${value}`], `${list}_${value}`).toBeTruthy()
      }
    }
  })

  it('lists salt water first', () => {
    expect(OPTION_LISTS.waterType[0]).toBe('salt')
  })
})
