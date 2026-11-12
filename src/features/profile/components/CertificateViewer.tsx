import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { useStorageUrl } from '../../../shared/hooks/useStorageUrl'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import { formatIsoDate } from '../../../shared/utils/dates'
import type { Certificate } from '../types'
import { CertificateFill } from './CertificateFill'
import styles from './CertificateViewer.module.css'

/**
 * Certifikatet stort på skærmen — til at vise frem på et dykkercenter.
 * Tryk på kortet for at fylde hele skærmen; knappen vender kortet. Billederne
 * ligger på telefonen, så det virker også uden dækning.
 */
export function CertificateViewer({
  certificate,
  onClose,
}: {
  certificate: Certificate
  onClose: () => void
}) {
  const { t, locale } = useT()
  const hasBack = certificate.backPath !== null
  const [side, setSide] = useState<'front' | 'back'>(
    certificate.frontPath || !hasBack ? 'front' : 'back',
  )
  const [filled, setFilled] = useState(false)
  const url = useStorageUrl(side === 'front' ? certificate.frontPath : certificate.backPath)

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const canFlip = certificate.frontPath !== null && hasBack
  const details = [
    certificate.organization,
    certificate.certDate && formatIsoDate(certificate.certDate, locale),
    certificate.certNumber && t('profile.certNumberShown', { n: certificate.certNumber }),
    certificate.instructor && t('profile.instructorShown', { name: certificate.instructor }),
  ].filter(Boolean)

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true">
      <div className={styles.topBar}>
        <Link to={`/profil/certifikat/${certificate.id}`} className={styles.editLink}>
          {t('common.edit')}
        </Link>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t('common.close')}
        >
          ✕
        </button>
      </div>
      <button
        type="button"
        className={styles.imageButton}
        onClick={() => url && setFilled(true)}
        disabled={!url}
      >
        {url ? (
          <img className={styles.image} src={url} alt={certificate.title} />
        ) : (
          <span className={styles.noImage}>{t('profile.noImage')}</span>
        )}
      </button>
      <div className={styles.details}>
        <h2 className={styles.title}>{certificate.title}</h2>
        {details.map((line) => (
          <p key={line as string} className={styles.line}>
            {line}
          </p>
        ))}
        {url && <p className={styles.hint}>{t('profile.tapToFill')}</p>}
        {canFlip && (
          <Button
            type="button"
            variant="secondary"
            onClick={() => setSide(side === 'front' ? 'back' : 'front')}
          >
            ⇄ {side === 'front' ? t('profile.showBack') : t('profile.showFront')}
          </Button>
        )}
      </div>
      {filled && url && (
        <CertificateFill url={url} alt={certificate.title} onClose={() => setFilled(false)} />
      )}
    </div>
  )
}
