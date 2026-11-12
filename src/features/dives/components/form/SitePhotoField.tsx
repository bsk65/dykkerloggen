import { useRef } from 'react'
import { useObjectUrl } from '../../../../shared/hooks/useObjectUrl'
import { useStorageUrl } from '../../../../shared/hooks/useStorageUrl'
import { useT } from '../../../../shared/i18n/useT'
import { Button } from '../../../../shared/ui/Button'
import type { SitePhotoChange } from '../../hooks/useSaveDive'
import styles from './SitePhotoField.module.css'

type SitePhotoFieldProps = {
  existingPath: string | null
  change: SitePhotoChange
  onChange: (change: SitePhotoChange) => void
}

/**
 * Ét billede fra dykkerstedet. Vælges fra telefonen — på Android kan man i
 * vælgeren også hente direkte fra Google Fotos. Billedet kopieres til appen.
 */
export function SitePhotoField({ existingPath, change, onChange }: SitePhotoFieldProps) {
  const { t } = useT()
  const inputRef = useRef<HTMLInputElement>(null)
  const newFile = change instanceof File ? change : null
  const previewUrl = useObjectUrl(newFile)
  const existingUrl = useStorageUrl(change === 'keep' ? existingPath : null)
  const shownUrl = previewUrl ?? existingUrl
  const hasPhoto = newFile !== null || (change === 'keep' && existingPath !== null)

  return (
    <div className={styles.field}>
      <span className={styles.label}>{t('dives.sitePhoto')}</span>
      {shownUrl && <img className={styles.preview} src={shownUrl} alt={t('dives.sitePhoto')} />}
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
          {hasPhoto ? t('dives.replacePhoto') : t('dives.choosePhoto')}
        </Button>
        {hasPhoto && (
          <Button type="button" variant="secondary" onClick={() => onChange('remove')}>
            {t('dives.removePhoto')}
          </Button>
        )}
      </div>
    </div>
  )
}
