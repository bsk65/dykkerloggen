import { describe, expect, it } from 'vitest'
import { ImageDecodeError } from './decodeImage'
import { step, toSaveFailure } from './saveFailure'

async function failure(run: () => Promise<unknown>) {
  try {
    await run()
  } catch (error) {
    return toSaveFailure(error)
  }
  throw new Error('expected a failure')
}

describe('step / toSaveFailure', () => {
  it('tags the error with the step and keeps the Firebase code', async () => {
    const result = await failure(() =>
      step('upload', () => Promise.reject({ code: 'storage/unauthorized' })),
    )
    expect(result).toEqual({ kind: 'upload', detail: 'storage/unauthorized' })
  })

  it('reports unreadable images as image errors whatever the step', async () => {
    const result = await failure(() =>
      step('upload', () => Promise.reject(new ImageDecodeError('Billedet kunne ikke læses'))),
    )
    expect(result.kind).toBe('image')
  })

  it('keeps the innermost step when steps are nested', async () => {
    const result = await failure(() =>
      step('save', () => step('upload', () => Promise.reject(new Error('net')))),
    )
    expect(result).toEqual({ kind: 'upload', detail: 'net' })
  })

  it('treats untagged errors as save errors', () => {
    expect(toSaveFailure(new Error('x'))).toEqual({ kind: 'save', detail: 'x' })
  })
})
