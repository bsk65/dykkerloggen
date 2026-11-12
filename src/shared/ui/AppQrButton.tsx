import { useEffect, useRef, useState } from 'react'
import { useT } from '../i18n/useT'
import styles from './AppQrButton.module.css'

/** Appens forside — ikke den aktuelle side. */
function appUrl(): string {
  return `${window.location.origin}/`
}

/**
 * Logoet i hjørnet. Et tryk viser en QR-kode med appens adresse, så en
 * dykkerven kan scanne den og installere appen (samme idé som i
 * søsterprojekterne "3D bueskydning" og "Rejseappen").
 */
export function AppQrButton() {
  const { t } = useT()
  const dialogRef = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  const [qrSrc, setQrSrc] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const url = appUrl()

  // QR-biblioteket hentes først, når vinduet åbnes første gang.
  useEffect(() => {
    if (!open || qrSrc) return
    let cancelled = false
    import('qrcode')
      .then((qr) =>
        qr.toString(url, { type: 'svg', margin: 1, color: { dark: '#0a1631', light: '#ffffff' } }),
      )
      .then((svg) => {
        if (!cancelled) setQrSrc(`data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}`)
      })
      .catch(() => undefined)
    return () => {
      cancelled = true
    }
  }, [open, qrSrc, url])

  function show() {
    setOpen(true)
    setCopied(false)
    dialogRef.current?.showModal()
  }

  function close() {
    dialogRef.current?.close()
  }

  async function copy() {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
    } catch {
      // Kopiering kan være blokeret — adressen står stadig synlig og kan markeres.
    }
  }

  return (
    <>
      <button
        type="button"
        className={styles.iconButton}
        onClick={show}
        aria-label={t('common.qrShow')}
      >
        <img src="/icons/logo.svg" alt="" className={styles.icon} />
      </button>

      <dialog
        ref={dialogRef}
        className={styles.dialog}
        onClose={() => setOpen(false)}
        onClick={(e) => {
          // Klik på den mørke baggrund uden for vinduet lukker det.
          if (e.target === dialogRef.current) close()
        }}
      >
        <div className={styles.content}>
          <h2 className={styles.heading}>{t('common.appName')}</h2>
          <p className={styles.hint}>{t('common.qrHint')}</p>
          {qrSrc ? (
            <img src={qrSrc} alt={t('common.qrAlt', { url })} className={styles.qr} />
          ) : (
            <div className={styles.qrPlaceholder} />
          )}
          <div className={styles.urlRow}>
            <input className={styles.url} value={url} readOnly onFocus={(e) => e.target.select()} />
            <button type="button" className={styles.copy} onClick={() => void copy()}>
              {copied ? t('common.copied') : t('common.copy')}
            </button>
          </div>
          <button type="button" className={styles.close} onClick={close}>
            {t('common.close')}
          </button>
        </div>
      </dialog>
    </>
  )
}
