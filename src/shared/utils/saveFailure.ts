import { ImageDecodeError } from './decodeImage'

/**
 * Hvor en gemning gik galt — så brugeren får en besked, der kan bruges:
 * billedet kunne ikke læses, billedet kunne ikke sendes, eller selve posten
 * kunne ikke gemmes.
 */
export type SaveFailureKind = 'image' | 'upload' | 'save'
export type SaveFailure = { kind: SaveFailureKind; detail: string }

class SaveStepError extends Error {
  readonly kind: SaveFailureKind

  constructor(kind: SaveFailureKind, original: unknown) {
    super(describe(original))
    this.kind = kind
  }
}

/** Kort teknisk beskrivelse (Firebase-fejlkode eller fejltekst). */
function describe(error: unknown): string {
  if (typeof error === 'object' && error !== null) {
    const { code, message } = error as { code?: unknown; message?: unknown }
    if (typeof code === 'string') return code
    if (typeof message === 'string') return message
  }
  return String(error)
}

/** Kører ét trin og mærker en fejl med, hvilket trin den kom fra. */
export async function step<T>(kind: SaveFailureKind, run: () => Promise<T>): Promise<T> {
  try {
    return await run()
  } catch (error) {
    if (error instanceof SaveStepError) throw error
    throw new SaveStepError(error instanceof ImageDecodeError ? 'image' : kind, error)
  }
}

export function toSaveFailure(error: unknown): SaveFailure {
  if (error instanceof SaveStepError) return { kind: error.kind, detail: error.message }
  return { kind: error instanceof ImageDecodeError ? 'image' : 'save', detail: describe(error) }
}
