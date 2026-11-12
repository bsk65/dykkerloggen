import type { TextKey } from '../i18n/translator'
import { useT } from '../i18n/useT'
import type { SaveFailure } from '../utils/saveFailure'
import styles from './SaveFailureMessage.module.css'

const MESSAGES: Record<SaveFailure['kind'], TextKey | null> = {
  image: 'common.saveErrorImage',
  upload: 'common.saveErrorUpload',
  save: null,
}

/**
 * Tydelig fejlbesked, når noget ikke kunne gemmes — med en lille teknisk
 * detalje, så årsagen kan findes. `saveMessage` er teksten for selve posten.
 */
export function SaveFailureMessage({
  failure,
  saveMessage,
}: {
  failure: SaveFailure
  saveMessage: TextKey
}) {
  const { t } = useT()
  return (
    <div className={styles.box} role="alert">
      <p className={styles.message}>⚠ {t(MESSAGES[failure.kind] ?? saveMessage)}</p>
      <p className={styles.detail}>{t('common.technicalDetail', { detail: failure.detail })}</p>
    </div>
  )
}
