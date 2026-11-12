import { useEffect, useState } from 'react'
import { offlineFileUrl } from '../api/offlineFiles'
import { getStorageUrl } from '../api/storage'

/**
 * Adresse til et billede i Storage — null, indtil det er fundet.
 *
 * Rækkefølge: en kopi på telefonen bruges først (virker uden dækning). Er
 * `previewPath` angivet (en lille version), vises den straks, og den store
 * version hentes bagefter, hvis der er forbindelse — så man altid ser noget,
 * også ude på et dykkersted uden net.
 */
export function useStorageUrl(
  storagePath: string | null,
  previewPath?: string | null,
): string | null {
  const key = `${storagePath ?? ''}|${previewPath ?? ''}`
  const [loaded, setLoaded] = useState<{ key: string; url: string; full: boolean } | null>(null)

  useEffect(() => {
    if (!storagePath) return
    let cancelled = false
    let shownFull = false
    // Lokale blob-adresser frigives, når effekten ryddes op — derfor må en
    // tidligere kørsels adresse aldrig genbruges; hver kørsel sætter sin egen.
    const blobUrls: string[] = []

    function show(url: string, full: boolean, isBlob: boolean) {
      if (isBlob) blobUrls.push(url)
      if (cancelled || (shownFull && !full)) return
      shownFull ||= full
      setLoaded({ key, url, full })
    }

    async function load() {
      const offlineFull = await offlineFileUrl(storagePath!).catch(() => null)
      if (offlineFull) return show(offlineFull, true, true)

      if (previewPath && previewPath !== storagePath) {
        const offlinePreview = await offlineFileUrl(previewPath).catch(() => null)
        if (offlinePreview) show(offlinePreview, false, true)
      }

      if (!navigator.onLine) return
      const url = await getStorageUrl(storagePath!).catch(() => null)
      if (url) show(url, true, false)
    }

    void load()
    return () => {
      cancelled = true
      blobUrls.forEach((url) => URL.revokeObjectURL(url))
    }
  }, [key, storagePath, previewPath])

  // En URL hentet til et tidligere billede må ikke vises for det nye.
  return storagePath && loaded?.key === key ? loaded.url : null
}
