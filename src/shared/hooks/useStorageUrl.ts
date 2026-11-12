import { useEffect, useState } from 'react'
import { getStorageUrl } from '../api/storage'

/** Adresse til en fil i Storage — null indtil den er fundet, eller hvis det fejler. */
export function useStorageUrl(storagePath: string | null): string | null {
  const [loaded, setLoaded] = useState<{ path: string; url: string } | null>(null)

  useEffect(() => {
    if (!storagePath) return
    let cancelled = false
    getStorageUrl(storagePath)
      .then((url) => {
        if (!cancelled) setLoaded({ path: storagePath, url })
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [storagePath])

  // En URL hentet til en tidligere sti må ikke vises for den nye.
  return storagePath && loaded?.path === storagePath ? loaded.url : null
}
