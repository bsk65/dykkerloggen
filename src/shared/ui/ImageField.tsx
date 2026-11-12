import { useRef } from 'react'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { useStorageUrl } from '../hooks/useStorageUrl'
import { useT } from '../i18n/useT'
import type { ImageChange } from '../types/imageChange'
import { Button } from './Button'
import styles from './ImageField.module.css'

type ImageFieldProps = {
  label: string
  /** Kort forklaring under overskriften */
  hint?: string
  existingPath: string | null
  change: ImageChange
  onChange: (change: ImageChange) => void
}

/**
 * Ét billede med forhåndsvisning. Vælges fra telefonen — på Android kan man
 * i vælgeren også hente direkte fra Google Fotos. Billedet kopieres til appen.
 */
export function ImageField({ label, hint, existingPath, change, onChange }: ImageFieldProps) {
  const { t } = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  const newFile = change instanceof File ? change : null
  const previewUrl = useObjectUrl(newFile)
  const existingUrl = useStorageUrl(change === 'keep' ? existingPath : null)
  const shownUrl = previewUrl ?? existingUrl
  const hasImage = newFile !== null || (change === 'keep' && existingPath !== null)

  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}</span>
      {hint && <span className={styles.hint}>{hint}</span>}
      {shownUrl && <img className={styles.preview} src={shownUrl} alt={label} />}
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className={styles.hiddenInput}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) onChange(file)
          e.target.value = ''
        }}
      />
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          {hasImage ? t('common.replaceImage') : t('common.chooseImage')}
        </Button>
        {hasImage && (
          <Button type="button" variant="secondary" onClick={() => onChange('remove')}>
            {t('common.removeImage')}
          </Button>
        )}
      </div>
    </div>
  )
}
