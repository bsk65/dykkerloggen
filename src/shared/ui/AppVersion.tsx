import { useT } from '../i18n/useT'
import styles from './AppVersion.module.css'

/** "Version 29.09.2026 09.18" — byggetidspunktet, så man kan se, om appen er opdateret. */
export function AppVersion() {
  const { t, locale } = useT()
  const label = new Date(__BUILD_TIME__).toLocaleString(locale, {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
  return <p className={styles.version}>{t('common.version', { label })}</p>
}
