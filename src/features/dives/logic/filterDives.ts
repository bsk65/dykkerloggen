import type { Dive } from '../types'

/**
 * Fritekst-søgning i sted, land, område, makkere, kommentar og dyknummer.
 * Alle ord skal findes (rækkefølgen er ligegyldig).
 */
export function filterDives(dives: Dive[], query: string): Dive[] {
  const words = query.toLocaleLowerCase('da').split(/\s+/).filter(Boolean)
  if (words.length === 0) return dives
  return dives.filter((dive) => {
    const haystack = [
      dive.siteName,
      dive.country,
      dive.region,
      dive.comment,
      dive.center,
      dive.instructor,
      ...dive.buddies,
      dive.diveNumber !== null ? `#${dive.diveNumber}` : null,
      dive.date,
    ]
      .filter(Boolean)
      .join(' ')
      .toLocaleLowerCase('da')
    return words.every((word) => haystack.includes(word))
  })
}
