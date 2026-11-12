import { useStorageUrl } from '../../../shared/hooks/useStorageUrl'
import { useT } from '../../../shared/i18n/useT'
import { formatIsoDate } from '../../../shared/utils/dates'
import type { Certificate } from '../types'
import styles from './CertificateCard.module.css'

/** Et certifikat i listen: billede af forsiden, titel, organisation og dato. */
export function CertificateCard({
  certificate,
  onOpen,
}: {
  certificate: Certificate
  onOpen: () => void
}) {
  const { t, locale } = useT()
  const url = useStorageUrl(certificate.frontPath)
  const meta = [
    certificate.organization,
    certificate.certDate && formatIsoDate(certificate.certDate, locale),
  ]
    .filter(Boolean)
    .join(' · ')

  return (
    <button type="button" className={styles.card} onClick={onOpen}>
      <span className={styles.imageBox}>
        {url ? (
          <img className={styles.image} src={url} alt="" />
        ) : (
          <span className={styles.placeholder} aria-hidden="true">
            🪪
          </span>
        )}
      </span>
      <span className={styles.text}>
        <span className={styles.title}>{certificate.title}</span>
        {meta && <span className={styles.meta}>{meta}</span>}
        {certificate.certNumber && (
          <span className={styles.meta}>
            {t('profile.certNumberShown', { n: certificate.certNumber })}
          </span>
        )}
      </span>
    </button>
  )
}
