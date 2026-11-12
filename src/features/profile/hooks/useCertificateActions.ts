import { useState } from 'react'
import type { ImageChange } from '../../../shared/types/imageChange'
import { CERTIFICATE_MAX_SIZE, resizeImage } from '../../../shared/utils/resizeImage'
import { step, toSaveFailure, type SaveFailure } from '../../../shared/utils/saveFailure'
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
  const [error, setError] = useState<SaveFailure | null>(null)

  /** Ny sti til et billede ud fra ændringen (upload, fjern eller behold). */
  async function applyImage(
    certId: string,
    side: 'front' | 'back',
    oldPath: string | null,
    change: ImageChange,
  ): Promise<string | null> {
    if (change === 'keep') return oldPath
    // Det nye billede gemmes, før det gamle slettes — så intet går tabt, hvis det fejler.
    const newPath =
      change === 'remove'
        ? null
        : await step('upload', async () =>
            uploadCertificateImage(
              uid,
              certId,
              side,
              await step('image', () => resizeImage(change, CERTIFICATE_MAX_SIZE, 0.88)),
            ),
          )
    if (oldPath) await deleteCertificateImage(oldPath).catch(() => undefined)
    return newPath
  }

  /** Gemmer certifikatet med billeder. Returnerer true ved succes. */
  async function save(
    existing: Certificate | null,
    fields: TextFields,
    front: ImageChange,
    back: ImageChange,
  ): Promise<boolean> {
    setSaving(true)
    setError(null)
    try {
      const certId = existing?.id ?? newCertificateId(uid)
      const frontPath = await applyImage(certId, 'front', existing?.frontPath ?? null, front)
      const backPath = await applyImage(certId, 'back', existing?.backPath ?? null, back)
      await step('save', () =>
        saveCertificate(uid, certId, { ...fields, frontPath, backPath }, existing === null),
      )
      return true
    } catch (err) {
      console.error('Certifikatet kunne ikke gemmes', err)
      setError(toSaveFailure(err))
      return false
    } finally {
      setSaving(false)
    }
  }

  async function remove(certificate: Certificate): Promise<boolean> {
    setSaving(true)
    setError(null)
    try {
      await deleteCertificate(uid, certificate)
      return true
    } catch (err) {
      console.error('Certifikatet kunne ikke gemmes', err)
      setError(toSaveFailure(err))
      return false
    } finally {
      setSaving(false)
    }
  }

  return { save, remove, saving, error }
}
