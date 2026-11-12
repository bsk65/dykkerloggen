import { useEffect, useState } from 'react'
import { useUid } from '../../auth/hooks/useUid'
import { subscribeToDiveProfile } from '../repository'
import type { Dive, DiveProfile } from '../types'

/** Dykkets profil fra dykkercomputeren — null, hvis dykket ikke har en (eller den ikke er hentet endnu). */
export function useDiveProfile(dive: Pick<Dive, 'id' | 'profile'>): DiveProfile | null {
  const uid = useUid()
  const hasProfile = dive.profile !== null
  const [state, setState] = useState<{ id: string; profile: DiveProfile | null } | null>(null)

  useEffect(() => {
    if (!hasProfile) return
    return subscribeToDiveProfile(
      uid,
      dive.id,
      (profile) => setState({ id: dive.id, profile }),
      () => setState({ id: dive.id, profile: null }),
    )
  }, [uid, dive.id, hasProfile])

  return hasProfile && state?.id === dive.id ? state.profile : null
}
