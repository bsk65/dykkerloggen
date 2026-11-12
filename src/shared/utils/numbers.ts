/**
 * Læser et tal fra et tekstfelt. Accepterer dansk decimalkomma ("12,5").
 * Tomt eller ugyldigt felt giver null.
 */
export function parseNumber(text: string): number | null {
  const trimmed = text.trim().replace(',', '.')
  if (trimmed === '') return null
  const value = Number(trimmed)
  return Number.isFinite(value) ? value : null
}

/** Tal til et tekstfelt — null bliver til tomt felt. */
export function numberToText(value: number | null): string {
  return value === null ? '' : String(value)
}

/** Formatterer et tal med højst `decimals` decimaler på det valgte sprog. */
export function formatNumber(value: number, locale: string, decimals = 1): string {
  return value.toLocaleString(locale, { maximumFractionDigits: decimals })
}
