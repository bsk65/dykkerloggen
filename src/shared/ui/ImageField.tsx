import { useRef, useState } from 'react'
import { loadImageBlob } from '../api/offlineFiles'
import { useObjectUrl } from '../hooks/useObjectUrl'
import { useStorageUrl } from '../hooks/useStorageUrl'
import { useT } from '../i18n/useT'
import type { ImageChange } from '../types/imageChange'
import { rotateImage } from '../utils/rotateImage'
import { Button } from './Button'
import styles from './ImageField.module.css'

type ImageFieldProps = {
  label: string
  /** Kort forklaring under overskriften */
  hint?: string
  /** Det gemte billede, der vises som forhåndsvisning */
  existingPath: string | null
  /**
   * Det gemte billede i fuld størrelse, hvis forhåndsvisningen er en lille
   * version — så et drejet billede ikke mister opløsning.
   */
  existingFullPath?: string | null
  change: ImageChange
  onChange: (change: ImageChange) => void
}

/** Det gemte billede som blob — fuld størrelse, hvis den kan hentes, ellers forhåndsvisningen. */
async function loadExisting(fullPath: string | null, previewPath: string): Promise<Blob> {
  if (fullPath && fullPath !== previewPath) {
    try {
      return await loadImageBlob(fullPath)
    } catch {
      // Uden dækning: drej den lille version i stedet.
    }
  }
  return loadImageBlob(previewPath)
}

/**
 * Ét billede med forhåndsvisning. Vælges fra telefonen — på Android kan man
 * i vælgeren også hente direkte fra Google Fotos. Billedet kopieres til appen.
 * ↺/↻ drejer et billede, der er taget på højkant (gemmes ved Gem).
 */
export function ImageField({
  label,
  hint,
  existingPath,
  existingFullPath = null,
  change,
  onChange,
}: ImageFieldProps) {
  const { t } = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  const [rotating, setRotating] = useState(false)
  const newFile = change instanceof File ? change : null
  const previewUrl = useObjectUrl(newFile)
  const existingUrl = useStorageUrl(change === 'keep' ? existingPath : null)
  const shownUrl = previewUrl ?? existingUrl
  const hasImage = newFile !== null || (change === 'keep' && existingPath !== null)

  async function rotate(direction: 'clockwise' | 'counterclockwise') {
    setRotating(true)
    try {
      const source =
        newFile ?? (existingPath && (await loadExisting(existingFullPath, existingPath)))
      if (!source) return
      const rotated = await rotateImage(source, direction)
      onChange(new File([rotated], 'drejet.jpg', { type: 'image/jpeg' }))
    } catch {
      // Billedet kunne ikke hentes (ingen dækning) — det forbliver som det var.
    } finally {
      setRotating(false)
    }
  }

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
        {hasImage &&
          (['counterclockwise', 'clockwise'] as const).map((direction) => (
            <Button
              key={direction}
              type="button"
              variant="secondary"
              className={styles.rotate}
              onClick={() => void rotate(direction)}
              disabled={rotating}
              aria-label={t(direction === 'clockwise' ? 'common.rotateRight' : 'common.rotateLeft')}
              title={t(direction === 'clockwise' ? 'common.rotateRight' : 'common.rotateLeft')}
            >
              {direction === 'clockwise' ? '↻' : '↺'}
            </Button>
          ))}
        {hasImage && (
          <Button type="button" variant="secondary" onClick={() => onChange('remove')}>
            {t('common.removeImage')}
          </Button>
        )}
      </div>
    </div>
  )
}
