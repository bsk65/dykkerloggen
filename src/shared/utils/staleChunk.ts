/**
 * Når en ny version deployes, får de lazy-loadede filer nye navne (hash), og
 * de gamle slettes. En fane/PWA med den gamle version åben fejler så, når den
 * prøver at hente f.eks. TripDetailPage. Løsningen er at genindlæse siden,
 * så den nye version hentes.
 */

const STALE_CHUNK_PATTERNS = [
  /Failed to fetch dynamically imported module/i, // Chrome
  /error loading dynamically imported module/i, // Firefox
  /Importing a module script failed/i, // Safari
  /Unable to preload CSS/i, // Vites egen preload-fejl
]

export function isStaleChunkError(error: unknown): boolean {
  const message = error instanceof Error ? error.message : String(error ?? '')
  return STALE_CHUNK_PATTERNS.some((pattern) => pattern.test(message))
}

const RELOAD_KEY = 'dykkerloggen:stale-chunk-reload'
const RELOAD_GUARD_MS = 10_000

/** Om reloadOnceForStaleChunk() vil genindlæse lige nu (ingen nylig genindlæsning). */
export function canReloadForStaleChunk(): boolean {
  try {
    return Date.now() - Number(sessionStorage.getItem(RELOAD_KEY) ?? 0) >= RELOAD_GUARD_MS
  } catch {
    return true
  }
}

/**
 * Genindlæser siden — men højst én gang pr. 10 sekunder, så en fil der
 * reelt mangler ikke giver en uendelig genindlæsnings-løkke. Returnerer false
 * hvis der ikke blev genindlæst.
 */
export function reloadOnceForStaleChunk(): boolean {
  if (!canReloadForStaleChunk()) return false
  try {
    sessionStorage.setItem(RELOAD_KEY, String(Date.now()))
  } catch {
    // sessionStorage utilgængelig (privat tilstand e.l.) — genindlæs alligevel.
  }
  window.location.reload()
  return true
}
