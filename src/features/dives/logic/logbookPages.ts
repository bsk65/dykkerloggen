import type { Dive } from '../types'

/**
 * Stierne til logbogssiderne, der skal ligge på telefonen: den lille version,
 * eller den store, hvis der ikke er en lille.
 */
export function logbookPagePaths(dives: Dive[]): string[] {
  return dives
    .map((d) => d.logbookPageSmallPath ?? d.logbookPagePath)
    .filter((p): p is string => p !== null)
}
