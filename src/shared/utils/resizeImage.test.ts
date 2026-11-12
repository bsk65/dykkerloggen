import { describe, expect, it } from 'vitest'
import { fitWithin } from './resizeImage'

describe('fitWithin', () => {
  it('scales the longest side down to the limit', () => {
    expect(fitWithin(4000, 3000, 2000)).toEqual({ width: 2000, height: 1500 })
    expect(fitWithin(3000, 4000, 2000)).toEqual({ width: 1500, height: 2000 })
  })

  it('never enlarges', () => {
    expect(fitWithin(800, 600, 2000)).toEqual({ width: 800, height: 600 })
  })
})
