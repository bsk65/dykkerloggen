import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useOfflineCopies } from '../../../shared/hooks/useOfflineCopies'
import { useT } from '../../../shared/i18n/useT'
import { AppVersion } from '../../../shared/ui/AppVersion'
import { Button } from '../../../shared/ui/Button'
import { LangToggle } from '../../../shared/ui/LangToggle'
import { OfflineStatusLine } from '../../../shared/ui/OfflineStatusLine'
import { useAuthActions } from '../../auth/hooks/useAuthActions'
import { ImportDivesSection } from '../../dives/components/ImportDivesSection'
import { useCertificates } from '../hooks/useCertificates'
import { certificateImagePaths } from '../logic/certificates'
import type { Certificate } from '../types'
import { CertificateCard } from './CertificateCard'
import { CertificateViewer } from './CertificateViewer'
import { ProfileHeader } from './ProfileHeader'
import styles from './ProfilePage.module.css'

/** Profil: navn, certifikater (også uden dækning), import af dyk og indstillinger. */
export function ProfilePage() {
  const { t } = useT()
  const { logout } = useAuthActions()
  const { certificates, loading, error } = useCertificates()
  const [open, setOpen] = useState<Certificate | null>(null)
  const offline = useOfflineCopies(
    useMemo(() => certificateImagePaths(certificates ?? []), [certificates]),
  )

  return (
    <div className={styles.page}>
      <ProfileHeader />

      <section className={styles.section}>
        <div className={styles.sectionHead}>
          <h2 className={styles.heading}>{t('profile.certificates')}</h2>
          <Link to="/profil/certifikat/nyt" className={styles.addLink}>
            + {t('profile.addCertificate')}
          </Link>
        </div>
        <OfflineStatusLine status={offline} />
        {error && <p className={styles.error}>{t('profile.loadError')}</p>}
        {loading && <p className={styles.muted}>{t('common.loading')}</p>}
        {certificates && certificates.length === 0 && (
          <p className={styles.muted}>{t('profile.noCertificates')}</p>
        )}
        <ul className={styles.list}>
          {certificates?.map((certificate) => (
            <li key={certificate.id}>
              <CertificateCard certificate={certificate} onOpen={() => setOpen(certificate)} />
            </li>
          ))}
        </ul>
      </section>

      <ImportDivesSection />

      <section className={styles.section}>
        <h2 className={styles.heading}>{t('profile.settings')}</h2>
        <div className={styles.settingRow}>
          <span>{t('common.langLabel')}</span>
          <LangToggle />
        </div>
        <Button type="button" variant="secondary" onClick={() => void logout()}>
          {t('auth.logout')}
        </Button>
        <AppVersion />
      </section>

      {open && <CertificateViewer certificate={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
