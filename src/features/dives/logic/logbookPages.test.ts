import { describe, expect, it } from 'vitest'
import {
  logbookItemsChanged,
  logbookPagePaths,
  readLogbookImages,
  removedLogbookImages,
  savedLogbookItems,
  type LogbookItem,
} from './logbookPages'
import { testDive } from './testDive'

const a = { path: 'a.jpg', smallPath: 'a-small.jpg' }
const b = { path: 'b.jpg', smallPath: 'b-small.jpg' }
const file = new File(['x'], 'ny.jpg', { type: 'image/jpeg' })

describe('readLogbookImages', () => {
  it('reads the list', () => {
    expect(readLogbookImages({ logbookImages: [a, { path: 1 }, null] })).toEqual([a])
  })

  it('reads the single image of older dives', () => {
    expect(
      readLogbookImages({ logbookPagePath: 'a.jpg', logbookPageSmallPath: 'a-small.jpg' }),
    ).toEqual([a])
    expect(readLogbookImages({ logbookPagePath: 'c.jpg', logbookPageSmallPath: null })).toEqual([
      { path: 'c.jpg', smallPath: 'c.jpg' },
    ])
  })

  it('is empty without images', () => {
    expect(readLogbookImages({})).toEqual([])
    expect(readLogbookImages({ logbookPagePath: null })).toEqual([])
  })
})

describe('logbookPagePaths', () => {
  it('returns the small version of every image', () => {
    expect(logbookPagePaths([testDive({ logbookImages: [a, b] }), testDive()])).toEqual([
      'a-small.jpg',
      'b-small.jpg',
    ])
  })
})

describe('logbook items', () => {
  it('detects no change', () => {
    expect(logbookItemsChanged([a, b], savedLogbookItems([a, b]))).toBe(false)
  })

  it('detects added, removed and reordered images', () => {
    const added: LogbookItem[] = [...savedLogbookItems([a]), { kind: 'new', key: 'n', file }]
    expect(logbookItemsChanged([a], added)).toBe(true)
    expect(logbookItemsChanged([a, b], savedLogbookItems([a]))).toBe(true)
    expect(logbookItemsChanged([a, b], savedLogbookItems([b, a]))).toBe(true)
  })

  it('finds the images that were removed', () => {
    expect(removedLogbookImages([a, b], savedLogbookItems([b]))).toEqual([a])
    expect(removedLogbookImages([a], [{ kind: 'new', key: 'n', file }])).toEqual([a])
  })
})
