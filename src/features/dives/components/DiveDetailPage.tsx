import { useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { useStorageUrl } from '../../../shared/hooks/useStorageUrl'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import { StarRating } from '../../../shared/ui/StarRating'
import { useDive } from '../hooks/useDive'
import { useSaveDive } from '../hooks/useSaveDive'
import type { Dive } from '../types'
import { AirConsumptionCard } from './AirConsumptionCard'
import { DiveFacts } from './DiveFacts'
import { SiteMiniMap } from './SiteMiniMap'
import { formatDiveDate } from '../logic/formatDiveDate'
import styles from './DiveDetailPage.module.css'

export function DiveDetailPage() {
  const { diveId } = useParams()
  const { t } = useT()
  const state = useDive(diveId)

  if (state.status === 'loading') return null
  if (state.status !== 'ready') return <p className={styles.status}>{t('dives.notFound')}</p>
  return <DiveDetail dive={state.dive} />
}

function DiveDetail({ dive }: { dive: Dive }) {
  const { t, locale } = useT()
  const navigate = useNavigate()
  const photoUrl = useStorageUrl(dive.sitePhotoPath)
  const { remove, saving, error } = useSaveDive()
  const [confirmDelete, setConfirmDelete] = useState(false)

  async function handleDelete() {
    if (await remove(dive)) navigate('/', { replace: true })
  }

  return (
    <article className={styles.page}>
      <Link to="/" className={styles.back}>
        ← {t('dives.backToList')}
      </Link>
      <header className={styles.header}>
        <p className={styles.number}>
          {dive.diveNumber !== null && t('dives.diveNo', { n: dive.diveNumber })}
          {' · '}
          {formatDiveDate(dive, locale)}
        </p>
        <h1 className={styles.title}>{dive.siteName || t('dives.unnamedSite')}</h1>
        <p className={styles.place}>{[dive.region, dive.country].filter(Boolean).join(', ')}</p>
        <StarRating value={dive.rating} />
      </header>

      {photoUrl && <img className={styles.photo} src={photoUrl} alt={t('dives.sitePhoto')} />}

      <div className={styles.headline}>
        <div>
          <span className={styles.big}>{dive.maxDepthM ?? '–'}</span> m
        </div>
        <div>
          <span className={styles.big}>{dive.diveTimeMin ?? '–'}</span> min
        </div>
      </div>

      <AirConsumptionCard dive={dive} />
      <DiveFacts dive={dive} />
      {dive.lat !== null && dive.lng !== null && <SiteMiniMap lat={dive.lat} lng={dive.lng} />}
      {dive.comment && <p className={styles.comment}>{dive.comment}</p>}

      {error && <p className={styles.error}>{t('dives.deleteError')}</p>}
      <div className={styles.actions}>
        <Button type="button" onClick={() => navigate(`/dyk/${dive.id}/rediger`)}>
          {t('common.edit')}
        </Button>
        {confirmDelete ? (
          <Button
            type="button"
            variant="danger"
            disabled={saving}
            onClick={() => void handleDelete()}
          >
            {t('dives.confirmDelete')}
          </Button>
        ) : (
          <Button type="button" variant="secondary" onClick={() => setConfirmDelete(true)}>
            {t('common.delete')}
          </Button>
        )}
      </div>
    </article>
  )
}
