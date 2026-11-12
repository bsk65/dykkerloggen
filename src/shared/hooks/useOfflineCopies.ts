import { useCallback, useEffect, useState } from 'react'
import { isFileOffline, saveFileOffline } from '../api/offlineFiles'

export type OfflineStatus = {
  /** Hvor mange af billederne der ligger på telefonen */
  saved: number
  total: number
  syncing: boolean
  /** Henter de manglende nu (kræver forbindelse) */
  syncNow: () => void
}

/** Henter manglende kopier (hvis online) og returnerer, hvor mange der nu ligger på telefonen. */
async function ensureOffline(paths: string[], download: boolean): Promise<number> {
  let saved = 0
  for (const path of paths) {
    try {
      if (download && navigator.onLine) await saveFileOffline(path)
      if (await isFileOffline(path)) saved++
    } catch {
      // Hentes næste gang — tælles bare ikke som gemt.
    }
  }
  return saved
}

/**
 * Sørger for, at billederne ligger på telefonen: manglende kopier hentes
 * automatisk, når siden åbnes med forbindelse, og ellers med syncNow().
 */
export function useOfflineCopies(storagePaths: string[]): OfflineStatus {
  const pathsKey = [...storagePaths].sort().join('|')
  const [state, setState] = useState<{ key: string; saved: number } | null>(null)
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    let cancelled = false
    void ensureOffline(pathsKey ? pathsKey.split('|') : [], true).then((saved) => {
      if (!cancelled) setState({ key: pathsKey, saved })
    })
    return () => {
      cancelled = true
    }
  }, [pathsKey])

  const syncNow = useCallback(() => {
    setSyncing(true)
    void ensureOffline(pathsKey ? pathsKey.split('|') : [], true).then((saved) => {
      setState({ key: pathsKey, saved })
      setSyncing(false)
    })
  }, [pathsKey])

  return {
    saved: state?.key === pathsKey ? state.saved : 0,
    total: pathsKey ? pathsKey.split('|').length : 0,
    syncing,
    syncNow,
  }
}
