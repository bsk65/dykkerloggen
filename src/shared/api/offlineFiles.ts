import { getStorageUrl } from './storage'

/**
 * Kopier af billeder på telefonen (certifikater og små logbogssider), så de
 * kan vises uden dækning — f.eks. på en dykkerbåd. Ligger i browserens Cache
 * Storage; nøglen er filens storagePath (download-URL'en kræver forbindelse
 * at slå op).
 */
const CACHE_NAME = 'dykkerloggen-offline-billeder'

function cacheKey(storagePath: string): string {
  return `/offline-billeder/${encodeURIComponent(storagePath)}`
}

function cacheAvailable(): boolean {
  return typeof caches !== 'undefined'
}

/** Gemmer et billede, man allerede har i hånden (lige uploadet) — ingen ekstra download. */
export async function saveBlobOffline(storagePath: string, blob: Blob): Promise<void> {
  if (!cacheAvailable()) return
  const cache = await caches.open(CACHE_NAME)
  await cache.put(
    cacheKey(storagePath),
    new Response(blob, { headers: { 'Content-Type': blob.type || 'image/jpeg' } }),
  )
}

/** Henter filen og gemmer en kopi — gør intet, hvis den allerede er gemt. */
export async function saveFileOffline(storagePath: string): Promise<void> {
  if (!cacheAvailable()) return
  const cache = await caches.open(CACHE_NAME)
  if (await cache.match(cacheKey(storagePath))) return
  const response = await fetch(await getStorageUrl(storagePath))
  if (!response.ok) throw new Error(`Kunne ikke hente ${storagePath}`)
  await cache.put(cacheKey(storagePath), response)
}

export async function isFileOffline(storagePath: string): Promise<boolean> {
  if (!cacheAvailable()) return false
  const cache = await caches.open(CACHE_NAME)
  return (await cache.match(cacheKey(storagePath))) !== undefined
}

/** Den gemte kopi som lokal blob-URL — null, hvis den ikke er gemt. */
export async function offlineFileUrl(storagePath: string): Promise<string | null> {
  if (!cacheAvailable()) return null
  const cache = await caches.open(CACHE_NAME)
  const response = await cache.match(cacheKey(storagePath))
  return response ? URL.createObjectURL(await response.blob()) : null
}

/** Fjerner kopien (når billedet er slettet). */
export async function removeOfflineFile(storagePath: string): Promise<void> {
  if (!cacheAvailable()) return
  const cache = await caches.open(CACHE_NAME)
  await cache.delete(cacheKey(storagePath))
}

/**
 * Beder browseren om ikke at rydde appens gemte data, når telefonen mangler
 * plads. Uden det kan offline-kopierne i princippet forsvinde. Installeret
 * som app på hjemmeskærmen gives tilladelsen normalt uden at spørge.
 */
export async function requestPersistentStorage(): Promise<void> {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) {
      await navigator.storage.persist()
    }
  } catch {
    // Ikke understøttet — kopierne gemmes stadig, bare uden garanti.
  }
}
