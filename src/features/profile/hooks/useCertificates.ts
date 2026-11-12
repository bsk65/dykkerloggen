import { useEffect, useMemo, useState } from 'react'
import { useUid } from '../../auth/hooks/useUid'
import { sortCertificates } from '../logic/certificates'
import { subscribeToCertificates } from '../repository'
import type { Certificate } from '../types'

/** Brugerens certifikater, nyeste først. */
export function useCertificates() {
  const uid = useUid()
  const [certificates, setCertificates] = useState<Certificate[] | null>(null)
  const [error, setError] = useState(false)

  useEffect(
    () =>
      subscribeToCertificates(
        uid,
        (next) => {
          setCertificates(next)
          setError(false)
        },
        () => setError(true),
      ),
    [uid],
  )

  const sorted = useMemo(
    () => (certificates ? sortCertificates(certificates) : null),
    [certificates],
  )
  return { certificates: sorted, loading: certificates === null && !error, error }
}
