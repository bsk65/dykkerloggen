import { fillParams, type Lang, type TextParams } from './translate'
import { texts } from './texts'

type Texts = typeof texts

/** Alle gyldige nøgler, f.eks. 'common.save' — en tastefejl er en typefejl. */
export type TextKey = {
  [Area in keyof Texts]: `${Area & string}.${keyof Texts[Area]['da'] & string}`
}[keyof Texts]

export type Translate = (key: TextKey, params?: TextParams) => string

export function translate(lang: Lang, key: TextKey, params?: TextParams): string {
  const dot = key.indexOf('.')
  const area = texts[key.slice(0, dot) as keyof Texts][lang] as Record<string, string>
  return fillParams(area[key.slice(dot + 1)] ?? key, params)
}

const translators: Record<Lang, Translate> = {
  da: (key, params) => translate('da', key, params),
  en: (key, params) => translate('en', key, params),
}

/**
 * Oversæt-funktion for et bestemt sprog — til rene funktioner og tests.
 * Samme funktion hver gang for samme sprog, så den trygt kan stå i en
 * useEffect-afhængighedsliste (effekten kører så igen ved sprogskift).
 */
export function translatorFor(lang: Lang): Translate {
  return translators[lang]
}
