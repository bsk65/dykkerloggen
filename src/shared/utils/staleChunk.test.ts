import { describe, expect, it } from 'vitest'
import { isStaleChunkError } from './staleChunk'

describe('isStaleChunkError', () => {
  it('recognises the Chrome message', () => {
    const error = new TypeError(
      'Failed to fetch dynamically imported module: https://x.web.app/assets/TripDetailPage-CFS_tr4y.js',
    )
    expect(isStaleChunkError(error)).toBe(true)
  })

  it('recognises the Safari and Firefox messages', () => {
    expect(isStaleChunkError(new TypeError('Importing a module script failed.'))).toBe(true)
    expect(isStaleChunkError(new TypeError('error loading dynamically imported module'))).toBe(true)
  })

  it('ignores unrelated errors', () => {
    expect(isStaleChunkError(new Error('Missing or insufficient permissions.'))).toBe(false)
    expect(isStaleChunkError(undefined)).toBe(false)
  })
})
