import { useState } from 'react'
import type { ImageChange } from '../../../shared/types/imageChange'
import {
  LOGBOOK_MAX_SIZE,
  LOGBOOK_SMALL_SIZE,
  resizeImage,
  SITE_PHOTO_MAX_SIZE,
} from '../../../shared/utils/resizeImage'
import { step, toSaveFailure, type SaveFailure } from '../../../shared/utils/saveFailure'
import { useUid } from '../../auth/hooks/useUid'
import { formToDive, type DiveForm } from '../logic/diveForm'
import {
  createDive,
  deleteDive,
  deleteDiveImage,
  updateDive,
  uploadLogbookPage,
  uploadSitePhoto,
} from '../repository'
import type { Dive } from '../types'

/** Ændringer af dykkets to billeder i formularen. */
export type DiveImageChanges = { sitePhoto: ImageChange; logbookPage: ImageChange }

export function useSaveDive() {
  const uid = useUid()
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<SaveFailure | null>(null)

  async function saveSitePhoto(diveId: string, existing: Dive | null, change: ImageChange) {
    const oldPath = existing?.sitePhotoPath ?? null
    if (change instanceof File) {
      const image = await step('image', () => resizeImage(change, SITE_PHOTO_MAX_SIZE))
      const path = await step('upload', () => uploadSitePhoto(uid, diveId, image))
      updateDive(uid, diveId, { sitePhotoPath: path }).catch(() => undefined)
    } else if (change === 'remove') {
      updateDive(uid, diveId, { sitePhotoPath: null }).catch(() => undefined)
    }
    if (change !== 'keep' && oldPath) await deleteDiveImage(oldPath).catch(() => undefined)
  }

  async function saveLogbookPage(diveId: string, existing: Dive | null, change: ImageChange) {
    const oldPaths = [existing?.logbookPagePath, existing?.logbookPageSmallPath]
    if (change instanceof File) {
      const image = await step('image', () => resizeImage(change, LOGBOOK_MAX_SIZE, 0.9))
      const small = await step('image', () => resizeImage(change, LOGBOOK_SMALL_SIZE, 0.72))
      const { path, smallPath } = await step('upload', () =>
        uploadLogbookPage(uid, diveId, image, small),
      )
      updateDive(uid, diveId, {
        logbookPagePath: path,
        logbookPageSmallPath: smallPath,
      }).catch(() => undefined)
    } else if (change === 'remove') {
      updateDive(uid, diveId, {
        logbookPagePath: null,
        logbookPageSmallPath: null,
      }).catch(() => undefined)
    }
    if (change === 'keep') return
    for (const path of oldPaths) if (path) await deleteDiveImage(path).catch(() => undefined)
  }

  /** Gemmer dykket og returnerer dets id — eller null ved fejl. */
  async function save(
    form: DiveForm,
    existing: Dive | null,
    images: DiveImageChanges,
  ): Promise<string | null> {
    setSaving(true)
    setError(null)
    try {
      const data = formToDive(form)
      // Firestore-skrivningerne afventes ikke: de gemmes straks på enheden
      // og sendes, når der er forbindelse — så man kan logge et dyk ved
      // vandet uden dækning. (Kun billederne kræver forbindelse.)
      let diveId: string
      if (existing) {
        diveId = existing.id
        updateDive(uid, diveId, data).catch(() => undefined)
      } else {
        const created = createDive(uid, {
          ...data,
          sitePhotoPath: null,
          logbookPagePath: null,
          logbookPageSmallPath: null,
          source: 'app',
          ssiId: null,
        })
        diveId = created.id
        created.written.catch(() => undefined)
      }
      await saveSitePhoto(diveId, existing, images.sitePhoto)
      await saveLogbookPage(diveId, existing, images.logbookPage)
      return diveId
    } catch (err) {
      console.error('Dykket kunne ikke gemmes', err)
      setError(toSaveFailure(err))
      return null
    } finally {
      setSaving(false)
    }
  }

  async function remove(dive: Dive): Promise<boolean> {
    setSaving(true)
    setError(null)
    try {
      await deleteDive(uid, dive)
      return true
    } catch (err) {
      setError(toSaveFailure(err))
      return false
    } finally {
      setSaving(false)
    }
  }

  return { save, remove, saving, error }
}
