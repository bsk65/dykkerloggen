import type { Lang } from './translate'
import { translate } from './translator'

/** Sprogvalget gemmes kun på denne enhed (ikke i Firestore). */
const STORAGE_KEY = 'dykkerloggen_lang'

function readStoredLang(): Lang {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'en' ? 'en' : 'da'
  } catch {
    return 'da'
  }
}

let currentLang: Lang = readStoredLang()
const listeners = new Set<() => void>()

export function getLang(): Lang {
  return currentLang
}

export function setLang(lang: Lang): void {
  currentLang = lang
  try {
    localStorage.setItem(STORAGE_KEY, lang)
  } catch {
    // Privat vindue o.l. — sproget gælder så kun, indtil appen lukkes.
  }
  applyLangToDocument(lang)
  listeners.forEach((listener) => listener())
}

export function subscribeToLang(listener: () => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** Sætter <html lang> og titel ved opstart, så de passer til det gemte valg. */
export function applyStoredLang(): void {
  applyLangToDocument(currentLang)
}

/** <html lang> og fanens titel . */
function applyLangToDocument(lang: Lang): void {
  document.documentElement.lang = lang
  document.title = translate(lang, 'common.appName')
}
