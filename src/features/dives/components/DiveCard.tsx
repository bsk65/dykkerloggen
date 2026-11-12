import { Link } from 'react-router-dom'
import { useT } from '../../../shared/i18n/useT'
import { formatNumber } from '../../../shared/utils/numbers'
import { StarRating } from '../../../shared/ui/StarRating'
import { calculateAirConsumption } from '../logic/airConsumption'
import { formatDiveDate } from '../logic/formatDiveDate'
import type { Dive } from '../types'
import styles from './DiveCard.module.css'

/** Et dyk i listen: nummer, sted, dato og nøgletal. */
export function DiveCard({ dive }: { dive: Dive }) {
  const { t, locale } = useT()
  const air = calculateAirConsumption(dive)
  return (
    <Link to={`/dyk/${dive.id}`} className={styles.card}>
      <span className={styles.number}>{dive.diveNumber ?? '–'}</span>
      <div className={styles.main}>
        <span className={styles.site}>
          {dive.lat === null && (
            <span className={styles.noPin} title={t('dives.noPosition')}>
              ○{' '}
            </span>
          )}
          {dive.siteName || t('dives.unnamedSite')}
        </span>
        <span className={styles.meta}>
          {formatDiveDate(dive, locale)}
          {dive.country && ` · ${dive.country}`}
        </span>
        <span className={styles.badges}>
          <StarRating value={dive.rating} />
          {dive.logbookImages.length > 0 && (
            <span className={styles.logbookIcon} title={t('dives.logbookPage')}>
              📖
            </span>
          )}
        </span>
      </div>
      <div className={styles.figures}>
        {dive.maxDepthM !== null && <span>{formatNumber(dive.maxDepthM, locale)} m</span>}
        {dive.diveTimeMin !== null && <span>{dive.diveTimeMin} min</span>}
        {air && (
          <span className={styles.sac}>
            {formatNumber(air.sacLPerMin, locale)} {t('air.sacShort')}
          </span>
        )}
      </div>
    </Link>
  )
}
