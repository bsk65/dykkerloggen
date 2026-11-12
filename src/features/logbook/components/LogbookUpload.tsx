import { useRef, useState } from 'react'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/TextField'
import type { UploadProgress } from '../hooks/useLogbookActions'
import styles from './LogbookUpload.module.css'

type LogbookUploadProps = {
  onUpload: (files: File[], caption: string) => Promise<void>
  progress: UploadProgress | null
}

/**
 * Vælg et eller flere billeder. På Android viser vælgeren også Google Fotos,
 * så billeder kan hentes direkte derfra; på iPhone vælges fra Fotos.
 */
export function LogbookUpload({ onUpload, progress }: LogbookUploadProps) {
  const { t } = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  const [caption, setCaption] = useState('')

  return (
    <div className={styles.box}>
      <TextField
        label={t('logbook.captionLabel')}
        placeholder={t('logbook.captionPlaceholder')}
        value={caption}
        onChange={(e) => setCaption(e.target.value)}
      />
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        className={styles.hiddenInput}
        onChange={(e) => {
          const files = [...(e.target.files ?? [])]
          e.target.value = ''
          if (files.length > 0) void onUpload(files, caption.trim())
        }}
      />
      <Button type="button" disabled={progress !== null} onClick={() => inputRef.current?.click()}>
        {progress
          ? t('logbook.uploading', { done: progress.done, total: progress.total })
          : `📷 ${t('logbook.addImages')}`}
      </Button>
      <p className={styles.hint}>{t('logbook.uploadHint')}</p>
    </div>
  )
}
