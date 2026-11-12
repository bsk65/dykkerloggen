import type { Dive } from '../types'

/** "19. jan. 1992 kl. 12.35" — datoen tolkes som lokal dato (ingen tidszone-forskydning). */
export function formatDiveDate(dive: Pick<Dive, 'date' | 'entryTime'>, locale: string): string {
  const [y, m, d] = dive.date.split('-').map(Number)
  if (!y || !m || !d) return dive.date
  const date = new Date(y, m - 1, d).toLocaleDateString(locale, {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
  return dive.entryTime ? `${date} ${dive.entryTime}` : date
}
