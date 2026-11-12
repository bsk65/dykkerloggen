import { useEffect, useMemo, useState } from 'react'
import { useUid } from '../../auth/hooks/useUid'
import { compareDivesNewestFirst } from '../logic/diveSites'
import { subscribeToDives } from '../repository'
import type { Dive } from '../types'

/** Alle brugerens dyk, nyeste først. Opdateres live. */
export function useDives() {
  const uid = useUid()
  const [dives, setDives] = useState<Dive[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(
    () =>
      subscribeToDives(
        uid,
        (next) => {
          setDives(next)
          setError(false)
        },
        () => setError(true),
      ),
    [uid],
  )

  const sorted = useMemo(() => (dives ? [...dives].sort(compareDivesNewestFirst) : null), [dives])
  return { dives: sorted, loading: dives === null && !error, error }
}
