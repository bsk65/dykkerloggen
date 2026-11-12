import { useEffect, useState } from 'react'
import { useUid } from '../../auth/hooks/useUid'
import { saveProfile, subscribeToProfile } from '../repository'
import type { Profile } from '../types'

export function useProfile() {
  const uid = useUid()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [error, setError] = useState(false)

  useEffect(
    () =>
      subscribeToProfile(
        uid,
        (next) => {
          setProfile(next)
          setError(false)
        },
        () => setError(true),
      ),
    [uid],
  )

  function save(next: Profile) {
    // Gemmes straks på telefonen og sendes, når der er forbindelse.
    saveProfile(uid, next).catch(() => setError(true))
  }

  return { profile, error, save }
}
