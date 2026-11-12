import type { Dive } from '../types'
import { calculateAirConsumption } from './airConsumption'
import { groupDivesBySite } from './diveSites'

export type DiveStats = {
  diveCount: number
  totalMinutes: number
  deepestM: number | null
  longestMin: number | null
  siteCount: number
  countryCount: number
  /** Gennemsnitligt luftforbrug (L/min ved overfladen) over dyk med nok data */
  avgSacLPerMin: number | null
  /** Antal dyk, gennemsnittet bygger på */
  sacDiveCount: number
}

function maxOrNull(values: (number | null)[]): number | null {
  const present = values.filter((v): v is number => v !== null)
  return present.length > 0 ? Math.max(...present) : null
}

/**
 * Samlet statistik for logbogen. Luftforbrugs-gennemsnittet bruger kun dyk
 * med gennemsnitsdybde — dyk, hvor kun maks. dybde kendes, ville trække
 * tallet kunstigt ned.
 */
export function calculateDiveStats(dives: Dive[]): DiveStats {
  const sacs = dives
    .map((dive) => calculateAirConsumption(dive))
    .filter((sac) => sac !== null && !sac.usedMaxDepth)
    .map((sac) => sac!.sacLPerMin)

  const countries = new Set(
    dives.map((d) => d.country?.trim().toLocaleLowerCase('da')).filter(Boolean),
  )

  return {
    diveCount: dives.length,
    totalMinutes: dives.reduce((sum, d) => sum + (d.diveTimeMin ?? 0), 0),
    deepestM: maxOrNull(dives.map((d) => d.maxDepthM)),
    longestMin: maxOrNull(dives.map((d) => d.diveTimeMin)),
    siteCount: groupDivesBySite(dives).length,
    countryCount: countries.size,
    avgSacLPerMin: sacs.length > 0 ? sacs.reduce((a, b) => a + b, 0) / sacs.length : null,
    sacDiveCount: sacs.length,
  }
}
