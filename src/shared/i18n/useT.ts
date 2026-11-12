import { useSyncExternalStore } from 'react'
import { getLang, subscribeToLang } from './lang'
import { localeFor } from './translate'
import { translatorFor } from './translator'

/**
 * Sprog, oversæt-funktion og locale til datoformatering. Komponenten
 * gentegnes, når sproget skiftes.
 */
export function useT() {
  const lang = useSyncExternalStore(subscribeToLang, getLang)
  return { t: translatorFor(lang), lang, locale: localeFor(lang) }
}
