import { useEffect, useState } from 'react'
import { useStorageUrl } from '../../../shared/hooks/useStorageUrl'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/TextField'
import type { LogbookScan } from '../types'
import styles from './LogbookViewer.module.css'

type LogbookViewerProps = {
  scan: LogbookScan
  position: { index: number; total: number }
  onClose: () => void
  onPrevious?: () => void
  onNext?: () => void
  onSaveCaption: (caption: string) => Promise<void>
  onDelete: () => Promise<void>
}

/** Ét logbogsbillede i fuld skærm, med bladring, billedtekst og sletning. */
export function LogbookViewer({
  scan,
  position,
  onClose,
  onPrevious,
  onNext,
  onSaveCaption,
  onDelete,
}: LogbookViewerProps) {
  const { t } = useT()
  // Den lille version vises straks (også uden dækning); den store hentes, hvis der er net.
  const url = useStorageUrl(scan.storagePath, scan.smallPath)
  const [caption, setCaption] = useState(scan.caption)
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Piletaster og Escape på computer.
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
      if (e.key === 'ArrowLeft') onPrevious?.()
      if (e.key === 'ArrowRight') onNext?.()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose, onPrevious, onNext])

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.topBar}>
        <span>{t('logbook.position', { n: position.index + 1, total: position.total })}</span>
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
          // Åbner billedet i fuld opløsning i en ny fane — dér kan man zoome frit.
          <a href={url} target="_blank" rel="noopener" className={styles.imageLink}>
            <img className={styles.image} src={url} alt={scan.caption} />
          </a>
        )}
        {onPrevious && (
          <button
            type="button"
            className={`${styles.nav} ${styles.prev}`}
            onClick={onPrevious}
            aria-label={t('logbook.previous')}
          >
            ‹
          </button>
        )}
        {onNext && (
          <button
            type="button"
            className={`${styles.nav} ${styles.next}`}
            onClick={onNext}
            aria-label={t('logbook.next')}
          >
            ›
          </button>
        )}
      </div>
      <div className={styles.bottomBar}>
        <p className={styles.zoomHint}>{t('logbook.zoomHint')}</p>
        <TextField
          label={t('logbook.captionLabel')}
          value={caption}
          onChange={(e) => setCaption(e.target.value)}
          onBlur={() => caption !== scan.caption && void onSaveCaption(caption.trim())}
        />
        {confirmDelete ? (
          <Button type="button" variant="danger" onClick={() => void onDelete()}>
            {t('logbook.confirmDelete')}
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={() => setConfirmDelete(true)}>
            {t('common.delete')}
          </Button>
        )}
      </div>
    </div>
  )
}
