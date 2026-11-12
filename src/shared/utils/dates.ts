/**
 * "19. jan. 1992" fra en ÅÅÅÅ-MM-DD-dato. Datoen tolkes som lokal dato, så
 * den ikke forskydes en dag af tidszonen.
 */
export function formatIsoDate(isoDate: string, locale: string): string {
  const [y, m, d] = isoDate.split('-').map(Number)
  if (!y || !m || !d) return isoDate
  return new Date(y, m - 1, d).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}
