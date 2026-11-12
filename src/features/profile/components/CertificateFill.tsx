import { useEffect, useState } from 'react'
import { useT } from '../../../shared/i18n/useT'
import styles from './CertificateFill.module.css'

function isLandscapeScreen(): boolean {
  return window.innerWidth > window.innerHeight
}

/**
 * Certifikatet på hele skærmen. Er kortet liggende og telefonen på højkant
 * (eller omvendt), drejes billedet, så det bliver så stort som muligt — man
 * vender bare telefonen. Tryk et vilkårligt sted for at lukke.
 */
export function CertificateFill({
  url,
  alt,
  onClose,
}: {
  url: string
  alt: string
  onClose: () => void
}) {
  const { t } = useT()
  const [imageLandscape, setImageLandscape] = useState<boolean | null>(null)
  const [screenLandscape, setScreenLandscape] = useState(isLandscapeScreen)

  useEffect(() => {
    const onResize = () => setScreenLandscape(isLandscapeScreen())
    window.addEventListener('resize', onResize)
    // Skjul browserens adresselinje m.m., hvor det understøttes (Android).
    document.documentElement.requestFullscreen?.().catch(() => undefined)
    return () => {
      window.removeEventListener('resize', onResize)
      if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
    }
  }, [])

  const rotated = imageLandscape !== null && imageLandscape !== screenLandscape

  return (
    <button
      type="button"
      className={styles.fill}
      onClick={onClose}
      aria-label={t('profile.tapToExit')}
    >
      <img
        className={rotated ? `${styles.image} ${styles.rotated}` : styles.image}
        src={url}
        alt={alt}
        onLoad={(e) =>
          setImageLandscape(e.currentTarget.naturalWidth > e.currentTarget.naturalHeight)
        }
      />
    </button>
  )
}
