import type { Dive } from '../types'

/** Et dykkersted samlet ud fra de dyk, der er logget dér. */
export type DiveSite = {
  key: string
  name: string
  country: string | null
  region: string | null
  lat: number | null
  lng: number | null
  waterBody: Dive['waterBody']
  waterType: Dive['waterType']
  entry: Dive['entry']
  /** Dykkene på stedet, nyeste først */
  dives: Dive[]
}

/** Samme navn (uden forskel på store/små bogstaver) = samme sted. */
export function siteKey(name: string): string {
  return name.trim().toLocaleLowerCase('da')
}

/** Nyeste først: dato, så tidspunkt, så dyknummer. */
export function compareDivesNewestFirst(a: Dive, b: Dive): number {
  const byDate = b.date.localeCompare(a.date)
  if (byDate !== 0) return byDate
  const byTime = (b.entryTime ?? '').localeCompare(a.entryTime ?? '')
  if (byTime !== 0) return byTime
  return (b.diveNumber ?? 0) - (a.diveNumber ?? 0)
}

/**
 * Grupperer dykkene pr. sted. Stedets oplysninger (position, vandtype osv.)
 * tages fra det nyeste dyk, der har dem — så en rettelse slår igennem.
 * Sorteret efter flest dyk.
 */
export function groupDivesBySite(dives: Dive[]): DiveSite[] {
  const sites = new Map<string, DiveSite>()
  for (const dive of [...dives].sort(compareDivesNewestFirst)) {
    if (!dive.siteName.trim()) continue
    const key = siteKey(dive.siteName)
    let site = sites.get(key)
    if (!site) {
      site = {
        key,
        name: dive.siteName.trim(),
        country: null,
        region: null,
        lat: null,
        lng: null,
        waterBody: null,
        waterType: null,
        entry: null,
        dives: [],
      }
      sites.set(key, site)
    }
    site.dives.push(dive)
    if (site.lat === null && dive.lat !== null && dive.lng !== null) {
      site.lat = dive.lat
      site.lng = dive.lng
    }
    site.country ??= dive.country
    site.region ??= dive.region
    site.waterBody ??= dive.waterBody
    site.waterType ??= dive.waterType
    site.entry ??= dive.entry
  }
  return [...sites.values()].sort(
    (a, b) => b.dives.length - a.dives.length || a.name.localeCompare(b.name),
  )
}

/** Næste dyknummer: én over det højeste hidtil (1, hvis der ingen dyk er). */
export function nextDiveNumber(dives: Pick<Dive, 'diveNumber'>[]): number {
  return dives.reduce((max, dive) => Math.max(max, dive.diveNumber ?? 0), 0) + 1
}
