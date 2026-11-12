import { useEffect } from 'react'
import { useStorageUrl } from '../hooks/useStorageUrl'
import { useT } from '../i18n/useT'
import styles from './ImageViewer.module.css'

type ImageViewerProps = {
  title: string
  /** Billedet i fuld størrelse */
  storagePath: string
  /** Lille version — vises straks og også uden dækning */
  previewPath?: string | null
  onClose: () => void
}

/** Et billede i fuld skærm. Et tryk på billedet åbner det i fuld opløsning, så man kan zoome. */
export function ImageViewer({ title, storagePath, previewPath, onClose }: ImageViewerProps) {
  const { t } = useT()
  const url = useStorageUrl(storagePath, previewPath)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label={title}>
      <div className={styles.topBar}>
        <span>{title}</span>
        <button
          type="button"
          className={styles.iconButton}
          onClick={onClose}
          aria-label={t('common.close')}
        >
          ✕
        </button>
      </div>
      <div className={styles.imageArea}>
        {url && (
          <a href={url} target="_blank" rel="noopener" className={styles.imageLink}>
            <img className={styles.image} src={url} alt={title} />
          </a>
        )}
      </div>
      <p className={styles.zoomHint}>{t('common.zoomHint')}</p>
    </div>
  )
}
