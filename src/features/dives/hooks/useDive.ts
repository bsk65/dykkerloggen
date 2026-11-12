import { useEffect, useState } from 'react'
import { useUid } from '../../auth/hooks/useUid'
import { subscribeToDive } from '../repository'
import type { Dive } from '../types'

type DiveState =
  | { status: 'loading' }
  | { status: 'missing' }
  | { status: 'error' }
  | { status: 'ready'; dive: Dive }

/** Ét dyk, opdateret live. */
export function useDive(diveId: string | undefined): DiveState {
  const uid = useUid()
  const [state, setState] = useState<{ id: string; value: DiveState } | null>(null)

  useEffect(() => {
    if (!diveId) return
    return subscribeToDive(
      uid,
      diveId,
      (dive) =>
        setState({ id: diveId, value: dive ? { status: 'ready', dive } : { status: 'missing' } }),
      () => setState({ id: diveId, value: { status: 'error' } }),
    )
  }, [uid, diveId])

  if (!diveId) return { status: 'missing' }
  return state?.id === diveId ? state.value : { status: 'loading' }
}
