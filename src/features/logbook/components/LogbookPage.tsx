import { useMemo, useState } from 'react'
import { useOfflineCopies } from '../../../shared/hooks/useOfflineCopies'
import { useT } from '../../../shared/i18n/useT'
import { OfflineStatusLine } from '../../../shared/ui/OfflineStatusLine'
import { useLogbookActions } from '../hooks/useLogbookActions'
import { useLogbookScans } from '../hooks/useLogbookScans'
import { LogbookThumb } from './LogbookThumb'
import { LogbookUpload } from './LogbookUpload'
import { LogbookViewer } from './LogbookViewer'
import styles from './LogbookPage.module.css'

/** Billeder af gamle papir-logbøger. */
export function LogbookPage() {
  const { t } = useT()
  const { scans, loading, error: loadError } = useLogbookScans()
  const actions = useLogbookActions()
  const [openIndex, setOpenIndex] = useState<number | null>(null)
  const open = scans && openIndex !== null ? scans[openIndex] : null
  // Den lille version af hver side lægges på telefonen (til dykkerture uden dækning).
  const offline = useOfflineCopies(
    useMemo(() => (scans ?? []).map((s) => s.smallPath ?? s.storagePath), [scans]),
  )

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>{t('logbook.title')}</h1>
      <p className={styles.intro}>{t('logbook.intro')}</p>
      <LogbookUpload onUpload={actions.upload} progress={actions.progress} />
      {actions.error && <p className={styles.error}>{t('logbook.error')}</p>}
      {loadError && <p className={styles.error}>{t('logbook.loadError')}</p>}
      {loading && <p className={styles.status}>{t('common.loading')}</p>}
      {scans && scans.length === 0 && <p className={styles.status}>{t('logbook.empty')}</p>}
      <OfflineStatusLine status={offline} />
      {scans && scans.length > 0 && (
        <ul className={styles.grid}>
          {scans.map((scan, index) => (
            <li key={scan.id}>
              <LogbookThumb scan={scan} onOpen={() => setOpenIndex(index)} />
            </li>
          ))}
        </ul>
      )}
      {open && scans && openIndex !== null && (
        <LogbookViewer
          key={open.id}
          scan={open}
          position={{ index: openIndex, total: scans.length }}
          onClose={() => setOpenIndex(null)}
          onPrevious={openIndex > 0 ? () => setOpenIndex(openIndex - 1) : undefined}
          onNext={openIndex < scans.length - 1 ? () => setOpenIndex(openIndex + 1) : undefined}
          onSaveCaption={(caption) => actions.saveCaption(open, caption)}
          onDelete={async () => {
            if (await actions.remove(open)) setOpenIndex(null)
          }}
        />
      )}
    </div>
  )
}
