import { useT } from '../../../shared/i18n/useT'
import { formatNumber } from '../../../shared/utils/numbers'
import { calculateAirConsumption, decoGasUsedL } from '../logic/airConsumption'
import type { DiveData } from '../types'
import styles from './AirConsumptionCard.module.css'

type AirConsumptionCardProps = {
  dive: Pick<
    DiveData,
    | 'startBar'
    | 'endBar'
    | 'tankVolumeL'
    | 'diveTimeMin'
    | 'avgDepthM'
    | 'maxDepthM'
    | 'decoGasUsed'
    | 'decoStartBar'
    | 'decoEndBar'
    | 'decoTankVolumeL'
  >
}

/** Luftforbruget for dykket — eller hvad der mangler for at kunne beregne det. */
export function AirConsumptionCard({ dive }: AirConsumptionCardProps) {
  const { t, locale } = useT()
  const air = calculateAirConsumption(dive)
  const deco = decoGasUsedL(dive)

  if (!air) {
    return <p className={styles.missing}>{t('air.missingData')}</p>
  }

  return (
    <div className={styles.card}>
      <h3 className={styles.title}>{t('air.title')}</h3>
      <div className={styles.grid}>
        <div className={styles.metric}>
          <span className={styles.value}>{formatNumber(air.sacLPerMin, locale)}</span>
          <span className={styles.unit}>{t('air.sacUnit')}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.value}>{formatNumber(air.gasUsedL, locale, 0)}</span>
          <span className={styles.unit}>{t('air.gasUsedUnit')}</span>
        </div>
        <div className={styles.metric}>
          <span className={styles.value}>{formatNumber(air.sacBarPerMin, locale)}</span>
          <span className={styles.unit}>{t('air.barPerMinUnit')}</span>
        </div>
        {deco !== null && (
          <div className={styles.metric}>
            <span className={styles.value}>{formatNumber(deco, locale, 0)}</span>
            <span className={styles.unit}>{t('air.decoGasUnit')}</span>
          </div>
        )}
      </div>
      <p className={styles.explain}>{t('air.explain')}</p>
      {air.usedMaxDepth && <p className={styles.warning}>{t('air.usedMaxDepth')}</p>}
    </div>
  )
}
