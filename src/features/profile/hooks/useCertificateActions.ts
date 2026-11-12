import { useState } from 'react'
import type { ImageChange } from '../../../shared/types/imageChange'
import { CERTIFICATE_MAX_SIZE, resizeImage } from '../../../shared/utils/resizeImage'
import { useUid } from '../../auth/hooks/useUid'
import {
  deleteCertificate,
  deleteCertificateImage,
  newCertificateId,
  saveCertificate,
  uploadCertificateImage,
} from '../repository'
import type { Certificate, CertificateData } from '../types'

type TextFields = Omit<CertificateData, 'frontPath' | 'backPath'>

export function useCertificateActions() {
  const uid = useUid()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  /** Ny sti til et billede ud fra ændringen (upload, fjern eller behold). */
  async function applyImage(
    certId: string,
    side: 'front' | 'back',
    oldPath: string | null,
    change: ImageChange,
  ): Promise<string | null> {
    if (change === 'keep') return oldPath
    if (oldPath) await deleteCertificateImage(oldPath)
    if (change === 'remove') return null
    const image = await resizeImage(change, CERTIFICATE_MAX_SIZE, 0.88)
    return uploadCertificateImage(uid, certId, side, image)
  }

  /** Gemmer certifikatet med billeder. Returnerer true ved succes. */
  async function save(
    existing: Certificate | null,
    fields: TextFields,
    front: ImageChange,
    back: ImageChange,
  ): Promise<boolean> {
    setSaving(true)
    setError(false)
    try {
      const certId = existing?.id ?? newCertificateId(uid)
      const frontPath = await applyImage(certId, 'front', existing?.frontPath ?? null, front)
      const backPath = await applyImage(certId, 'back', existing?.backPath ?? null, back)
      await saveCertificate(uid, certId, { ...fields, frontPath, backPath }, existing === null)
      return true
    } catch {
      setError(true)
      return false
    } finally {
      setSaving(false)
    }
  }

  async function remove(certificate: Certificate): Promise<boolean> {
    setSaving(true)
    setError(false)
    try {
      await deleteCertificate(uid, certificate)
      return true
    } catch {
      setError(true)
      return false
    } finally {
      setSaving(false)
    }
  }

  return { save, remove, saving, error }
}
