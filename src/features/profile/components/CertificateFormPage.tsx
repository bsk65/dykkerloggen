import { useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useT } from '../../../shared/i18n/useT'
import type { ImageChange } from '../../../shared/types/imageChange'
import { Button } from '../../../shared/ui/Button'
import { ImageField } from '../../../shared/ui/ImageField'
import { SaveFailureMessage } from '../../../shared/ui/SaveFailureMessage'
import { TextField } from '../../../shared/ui/TextField'
import { useCertificateActions } from '../hooks/useCertificateActions'
import { useCertificates } from '../hooks/useCertificates'
import { ORGANIZATIONS } from '../logic/certificates'
import type { Certificate } from '../types'
import styles from './CertificateFormPage.module.css'

/** Nyt certifikat (/profil/certifikat/nyt) eller redigering (/profil/certifikat/:certId). */
export function CertificateFormPage() {
  const { certId } = useParams()
  const { t } = useT()
  const { certificates } = useCertificates()
  if (certificates === null) return null
  const existing = certId ? (certificates.find((c) => c.id === certId) ?? null) : null
  if (certId && !existing) return <p className={styles.muted}>{t('profile.notFound')}</p>
  return <CertificateForm key={existing?.id ?? 'new'} existing={existing} />
}

const orNull = (value: string) => value.trim() || null

function CertificateForm({ existing }: { existing: Certificate | null }) {
  const { t } = useT()
  const navigate = useNavigate()
  const { save, remove, saving, error } = useCertificateActions()
  const [title, setTitle] = useState(existing?.title ?? '')
  const [organization, setOrganization] = useState(existing?.organization ?? 'SSI')
  const [certDate, setCertDate] = useState(existing?.certDate ?? '')
  const [certNumber, setCertNumber] = useState(existing?.certNumber ?? '')
  const [instructor, setInstructor] = useState(existing?.instructor ?? '')
  const [front, setFront] = useState<ImageChange>('keep')
  const [back, setBack] = useState<ImageChange>('keep')
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const ok = await save(
      existing,
      {
        title: title.trim(),
        organization: orNull(organization),
        certDate: orNull(certDate),
        certNumber: orNull(certNumber),
        instructor: orNull(instructor),
      },
      front,
      back,
    )
    if (ok) navigate('/profil', { replace: true })
  }

  async function handleDelete() {
    if (existing && (await remove(existing))) navigate('/profil', { replace: true })
  }

  return (
    <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
      <h1 className={styles.heading}>
        {existing ? t('profile.editCertificate') : t('profile.newCertificate')}
      </h1>
      <TextField
        label={t('profile.certTitle')}
        placeholder={t('profile.certTitlePlaceholder')}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <TextField
        label={t('profile.organization')}
        list="organizations"
        value={organization}
        onChange={(e) => setOrganization(e.target.value)}
      />
      <datalist id="organizations">
        {ORGANIZATIONS.map((org) => (
          <option key={org} value={org} />
        ))}
      </datalist>
      <TextField
        label={t('profile.certDate')}
        type="date"
        value={certDate}
        onChange={(e) => setCertDate(e.target.value)}
      />
      <TextField
        label={t('profile.certNumber')}
        value={certNumber}
        onChange={(e) => setCertNumber(e.target.value)}
      />
      <TextField
        label={t('profile.instructor')}
        value={instructor}
        onChange={(e) => setInstructor(e.target.value)}
      />
      <ImageField
        label={t('profile.front')}
        existingPath={existing?.frontPath ?? null}
        change={front}
        onChange={setFront}
      />
      <ImageField
        label={t('profile.back')}
        existingPath={existing?.backPath ?? null}
        change={back}
        onChange={setBack}
      />
      {error && <SaveFailureMessage failure={error} saveMessage="profile.saveError" />}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>
      {existing &&
        (confirmDelete ? (
          <Button
            type="button"
            variant="danger"
            disabled={saving}
            onClick={() => void handleDelete()}
          >
            {t('profile.confirmDelete')}
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={() => setConfirmDelete(true)}>
            {t('profile.deleteCertificate')}
          </Button>
        ))}
    </form>
  )
}
