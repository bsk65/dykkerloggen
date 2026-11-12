import type { TextParams } from './translate'
import { translate, type TextKey } from './translator'

/** En besked til brugeren som tekst-nøgle — oversættes først, når den vises. */
export type Message = { key: TextKey; params?: TextParams }

/**
 * En fejl, hvis besked skal vises til brugeren. Bærer tekst-nøglen, så den
 * kan vises på det valgte sprog; `message` er den danske tekst (til log og tests).
 */
export class TextError extends Error {
  readonly key: TextKey
  readonly params?: TextParams

  constructor(key: TextKey, params?: TextParams, options?: ErrorOptions) {
    super(translate('da', key, params), options)
    this.name = 'TextError'
    this.key = key
    this.params = params
  }
}

/** Beskeden fra en TextError — ellers den generelle `fallback`. */
export function errorMessage(err: unknown, fallback: TextKey): Message {
  return err instanceof TextError ? { key: err.key, params: err.params } : { key: fallback }
}
