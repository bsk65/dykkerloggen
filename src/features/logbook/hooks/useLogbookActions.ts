import { useState } from 'react'
import { LOGBOOK_MAX_SIZE, resizeImage } from '../../../shared/utils/resizeImage'
import { useUid } from '../../auth/hooks/useUid'
import { addLogbookScan, deleteLogbookScan, updateLogbookCaption } from '../repository'
import type { LogbookScan } from '../types'

export type UploadProgress = { done: number; total: number }

export function useLogbookActions() {
  const uid = useUid()
  const [progress, setProgress] = useState<UploadProgress | null>(null)
  const [error, setError] = useState(false)

  /**
   * Uploader billederne ét ad gangen i den rækkefølge, de er valgt (så
   * siderne kommer i orden). Fortsætter med resten, hvis ét fejler.
   */
  async function upload(files: File[], caption: string): Promise<void> {
    setError(false)
    setProgress({ done: 0, total: files.length })
    const start = Date.now()
    let failed = false
    for (const [index, file] of files.entries()) {
      try {
        const image = await resizeImage(file, LOGBOOK_MAX_SIZE, 0.9)
        await addLogbookScan(uid, image, caption, start + index)
      } catch {
        failed = true
      }
      setProgress({ done: index + 1, total: files.length })
    }
    setProgress(null)
    setError(failed)
  }

  async function saveCaption(scan: LogbookScan, caption: string): Promise<void> {
    try {
      await updateLogbookCaption(uid, scan.id, caption)
    } catch {
      setError(true)
    }
  }

  async function remove(scan: LogbookScan): Promise<boolean> {
    try {
      await deleteLogbookScan(uid, scan)
      return true
    } catch {
      setError(true)
      return false
    }
  }

  return { upload, saveCaption, remove, progress, error }
}
