import type { OfflineStatus } from '../hooks/useOfflineCopies'
import { useT } from '../i18n/useT'
import styles from './OfflineStatusLine.module.css'

/** "12 af 12 billeder ligger på telefonen" — med knap til at hente resten. */
export function OfflineStatusLine({ status }: { status: OfflineStatus }) {
  const { t } = useT()
  if (status.total === 0) return null
  const complete = status.saved === status.total
  return (
    <div className={complete ? styles.complete : styles.incomplete}>
      <span>
        {complete ? '✓ ' : '⚠ '}
        {t('common.offlineStatus', { saved: status.saved, total: status.total })}
      </span>
      {!complete && (
        <button
          type="button"
          className={styles.button}
          onClick={status.syncNow}
          disabled={status.syncing}
        >
          {status.syncing ? t('common.offlineSyncing') : t('common.offlineSync')}
        </button>
      )}
    </div>
  )
}
