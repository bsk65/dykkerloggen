import { useState } from 'react'
import { deleteStorageFile } from '../../../shared/api/storage'
import { resizeImage, SITE_PHOTO_MAX_SIZE } from '../../../shared/utils/resizeImage'
import { useUid } from '../../auth/hooks/useUid'
import { formToDive, type DiveForm } from '../logic/diveForm'
import { createDive, deleteDive, updateDive, uploadSitePhoto } from '../repository'
import type { Dive } from '../types'

/**
 * Hvad der skal ske med billedet fra dykkerstedet ved gem:
 * 'keep' = uændret, 'remove' = slet det, en fil = erstat med den nye.
 */
export type SitePhotoChange = 'keep' | 'remove' | File

export function useSaveDive() {
  const uid = useUid()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(false)

  /** Gemmer dykket og returnerer dets id — eller null ved fejl. */
  async function save(
    form: DiveForm,
    existing: Dive | null,
    photo: SitePhotoChange,
  ): Promise<string | null> {
    setSaving(true)
    setError(false)
    try {
      const data = formToDive(form)
      // Firestore-skrivningerne afventes ikke: de gemmes straks på enheden
      // og sendes, når der er forbindelse — så man kan logge et dyk ved
      // vandet uden dækning. (Kun billedet kræver forbindelse.)
      let diveId: string
      if (existing) {
        diveId = existing.id
        updateDive(uid, diveId, data).catch(() => undefined)
      } else {
        const created = createDive(uid, {
          ...data,
          sitePhotoPath: null,
          source: 'app',
          ssiId: null,
        })
        diveId = created.id
        created.written.catch(() => undefined)
      }

      const oldPath = existing?.sitePhotoPath ?? null
      if (photo instanceof File) {
        const image = await resizeImage(photo, SITE_PHOTO_MAX_SIZE)
        const path = await uploadSitePhoto(uid, diveId, image)
        updateDive(uid, diveId, { sitePhotoPath: path }).catch(() => undefined)
        if (oldPath) await deleteStorageFile(oldPath)
      } else if (photo === 'remove' && oldPath) {
        updateDive(uid, diveId, { sitePhotoPath: null }).catch(() => undefined)
        await deleteStorageFile(oldPath)
      }
      return diveId
    } catch {
      setError(true)
      return null
    } finally {
      setSaving(false)
    }
  }

  async function remove(dive: Dive): Promise<boolean> {
    setSaving(true)
    setError(false)
    try {
      await deleteDive(uid, dive)
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
