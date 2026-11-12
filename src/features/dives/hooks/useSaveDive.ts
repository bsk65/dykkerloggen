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
import { logbookItemsChanged, removedLogbookImages, type LogbookItem } from '../logic/logbookPages'
import {
  createDive,
  deleteDive,
  deleteDiveImage,
  setLogbookImages,
  updateDive,
  uploadLogbookPage,
  uploadSitePhoto,
} from '../repository'
import type { Dive, LogbookImage } from '../types'

/** Dykkets billeder i formularen: billedet fra stedet og listen af logbogs-/stempelbilleder. */
export type DiveImageChanges = { sitePhoto: ImageChange; logbook: LogbookItem[] }

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

  async function saveLogbookImages(diveId: string, existing: Dive | null, items: LogbookItem[]) {
    const saved = existing?.logbookImages ?? []
    if (!logbookItemsChanged(saved, items)) return
    const uploaded: LogbookImage[] = []
    const result: LogbookImage[] = []
    try {
      for (const item of items) {
        if (item.kind === 'saved') {
          result.push(item.image)
          continue
        }
        const image = await step('image', () => resizeImage(item.file, LOGBOOK_MAX_SIZE, 0.9))
        const small = await step('image', () => resizeImage(item.file, LOGBOOK_SMALL_SIZE, 0.72))
        const stored = await step('upload', () => uploadLogbookPage(uid, diveId, image, small))
        uploaded.push(stored)
        result.push(stored)
      }
    } catch (err) {
      // Ryd op i de billeder, der nåede op, før fejlen — de bliver ikke brugt.
      for (const img of uploaded) {
        await deleteDiveImage(img.path).catch(() => undefined)
        await deleteDiveImage(img.smallPath).catch(() => undefined)
      }
      throw err
    }
    setLogbookImages(uid, diveId, result).catch(() => undefined)
    for (const img of removedLogbookImages(saved, items)) {
      for (const path of new Set([img.path, img.smallPath])) {
        await deleteDiveImage(path).catch(() => undefined)
      }
    }
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
          logbookImages: [],
          source: 'app',
          ssiId: null,
        })
        diveId = created.id
        created.written.catch(() => undefined)
      }
      await saveSitePhoto(diveId, existing, images.sitePhoto)
      await saveLogbookImages(diveId, existing, images.logbook)
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
