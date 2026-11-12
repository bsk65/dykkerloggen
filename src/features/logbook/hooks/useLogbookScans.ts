import { useEffect, useState } from 'react'
import { useUid } from '../../auth/hooks/useUid'
import { subscribeToLogbookScans } from '../repository'
import type { LogbookScan } from '../types'

export function useLogbookScans() {
  const uid = useUid()
  const [scans, setScans] = useState<LogbookScan[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(
    () =>
      subscribeToLogbookScans(
        uid,
        (next) => {
          setScans(next)
          setError(false)
        },
        () => setError(true),
      ),
    [uid],
  )

  return { scans, loading: scans === null && !error, error }
}
