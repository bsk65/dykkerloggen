import { describe, expect, it } from 'vitest'
import type { Certificate } from '../types'
import { certificateImagePaths, sortCertificates } from './certificates'

function cert(overrides: Partial<Certificate>): Certificate {
  return {
    id: 'c',
    title: 'Open Water Diver',
    organization: 'SSI',
    certDate: null,
    certNumber: null,
    instructor: null,
    frontPath: null,
    backPath: null,
    ...overrides,
  }
}

describe('sortCertificates', () => {
  it('puts the newest first and undated last', () => {
    const sorted = sortCertificates([
      cert({ id: 'old', certDate: '1989-05-01' }),
      cert({ id: 'none', certDate: null }),
      cert({ id: 'new', certDate: '1991-09-22' }),
    ])
    expect(sorted.map((c) => c.id)).toEqual(['new', 'old', 'none'])
  })
})

describe('certificateImagePaths', () => {
  it('lists front and back images that exist', () => {
    expect(
      certificateImagePaths([
        cert({ frontPath: 'a-front', backPath: 'a-back' }),
        cert({ frontPath: 'b-front' }),
      ]),
    ).toEqual(['a-front', 'a-back', 'b-front'])
  })
})
