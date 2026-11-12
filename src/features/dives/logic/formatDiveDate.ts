import { formatIsoDate } from '../../../shared/utils/dates'
import type { Dive } from '../types'

/** "19. jan. 1992 12:35" — dato og tidspunkt for dykket. */
export function formatDiveDate(dive: Pick<Dive, 'date' | 'entryTime'>, locale: string): string {
  const date = formatIsoDate(dive.date, locale)
  return dive.entryTime ? `${date} ${dive.entryTime}` : date
}
