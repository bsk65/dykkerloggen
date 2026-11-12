import { useState } from 'react'
import { useStorageUrl } from '../../../shared/hooks/useStorageUrl'
import { useT } from '../../../shared/i18n/useT'
import { ImageViewer } from '../../../shared/ui/ImageViewer'
import type { Dive } from '../types'
import styles from './LogbookPageCard.module.css'

/** Siden fra den gamle papir-logbog — dokumentation for dykket. Tryk for fuld skærm. */
export function LogbookPageCard({ dive }: { dive: Dive }) {
  const { t } = useT()
  const [open, setOpen] = useState(false)
  // Den lille version ligger på telefonen og kan vises uden dækning.
  const smallUrl = useStorageUrl(dive.logbookPageSmallPath ?? dive.logbookPagePath)
  if (!dive.logbookPagePath) return null

  return (
    <section className={styles.card}>
      <h2 className={styles.heading}>📖 {t('dives.logbookPage')}</h2>
      <button type="button" className={styles.thumbButton} onClick={() => setOpen(true)}>
        {smallUrl ? (
          <img className={styles.thumb} src={smallUrl} alt={t('dives.logbookPage')} />
        ) : (
          <span className={styles.placeholder}>{t('common.loading')}</span>
        )}
      </button>
      {open && (
        <ImageViewer
          title={t('dives.logbookPage')}
          storagePath={dive.logbookPagePath}
          previewPath={dive.logbookPageSmallPath}
          onClose={() => setOpen(false)}
        />
      )}
    </section>
  )
}
