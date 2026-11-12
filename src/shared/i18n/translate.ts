export type Lang = 'da' | 'en'

export type TextParams = Record<string, string | number>

/** Et tekst-område: samme nøgler på dansk og engelsk (tjekkes af TypeScript). */
export function defineTexts<K extends string>(texts: {
  da: Record<K, string>
  en: Record<K, string>
}) {
  return texts
}

/** Indsætter {navn}-pladsholdere. Ukendte pladsholdere står urørt. */
export function fillParams(template: string, params?: TextParams): string {
  if (!params) return template
  return template.replace(/\{(\w+)\}/g, (match, name: string) =>
    name in params ? String(params[name]) : match,
  )
}

/** Sprogkode til Intl/toLocale…-formatering af datoer og tal. */
export function localeFor(lang: Lang): string {
  return lang === 'da' ? 'da-DK' : 'en-GB'
}
