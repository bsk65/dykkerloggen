import type { Dive, LogbookImage } from '../types'

/** Højst så mange dokumentationsbilleder pr. dyk. */
export const MAX_LOGBOOK_IMAGES = 8

/**
 * Ét billede i formularen: enten et gemt billede eller en ny fil, der skal
 * sendes op ved Gem. `key` holder React-listen stabil.
 */
export type LogbookItem =
  { kind: 'saved'; key: string; image: LogbookImage } | { kind: 'new'; key: string; file: File }

/**
 * Billederne fra et Firestore-dokument. Ældre dyk har ét billede i felterne
 * `logbookPagePath`/`logbookPageSmallPath` — de læses som en liste med ét billede.
 */
export function readLogbookImages(data: Record<string, unknown>): LogbookImage[] {
  if (Array.isArray(data.logbookImages)) {
    return data.logbookImages.filter(
      (img): img is LogbookImage =>
        typeof img === 'object' &&
        img !== null &&
        typeof (img as LogbookImage).path === 'string' &&
        typeof (img as LogbookImage).smallPath === 'string',
    )
  }
  const path = data.logbookPagePath
  if (typeof path !== 'string') return []
  const small = data.logbookPageSmallPath
  return [{ path, smallPath: typeof small === 'string' ? small : path }]
}

/** Stierne til den lille version af alle billeder — de skal ligge på telefonen. */
export function logbookPagePaths(dives: Dive[]): string[] {
  return dives.flatMap((d) => d.logbookImages.map((img) => img.smallPath))
}

/** Formularens udgangspunkt: de gemte billeder. */
export function savedLogbookItems(images: LogbookImage[]): LogbookItem[] {
  return images.map((image) => ({ kind: 'saved', key: image.path, image }))
}

/** Er listen ændret i forhold til de gemte billeder? */
export function logbookItemsChanged(saved: LogbookImage[], items: LogbookItem[]): boolean {
  if (saved.length !== items.length) return true
  return items.some((item, i) => item.kind !== 'saved' || item.image.path !== saved[i].path)
}

/** De gemte billeder, der ikke længere er med — de skal slettes efter Gem. */
export function removedLogbookImages(saved: LogbookImage[], items: LogbookItem[]): LogbookImage[] {
  const kept = new Set(items.flatMap((i) => (i.kind === 'saved' ? [i.image.path] : [])))
  return saved.filter((img) => !kept.has(img.path))
}
