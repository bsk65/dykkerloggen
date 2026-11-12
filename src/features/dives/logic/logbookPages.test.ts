import { describe, expect, it } from 'vitest'
import { logbookPagePaths } from './logbookPages'
import { testDive } from './testDive'

describe('logbookPagePaths', () => {
  it('prefers the small version and skips dives without a page', () => {
    expect(
      logbookPagePaths([
        testDive({ logbookPagePath: 'a.jpg', logbookPageSmallPath: 'a-small.jpg' }),
        testDive({ logbookPagePath: 'b.jpg' }),
        testDive(),
      ]),
    ).toEqual(['a-small.jpg', 'b.jpg'])
  })
})
