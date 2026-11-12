import { useMemo } from 'react'
import { useT } from '../../../shared/i18n/useT'
import { formatNumber } from '../../../shared/utils/numbers'
import { calculateDiveStats } from '../logic/diveStats'
import type { Dive } from '../types'
import styles from './StatsSummary.module.css'

/** Nøgletal for hele logbogen. */
export function StatsSummary({ dives }: { dives: Dive[] }) {
  const { t, locale } = useT()
  const stats = useMemo(() => calculateDiveStats(dives), [dives])
  const hours = Math.floor(stats.totalMinutes / 60)
  const minutes = stats.totalMinutes % 60

  const tiles = [
    { value: String(stats.diveCount), label: t('stats.dives') },
    { value: t('stats.hoursMinutes', { h: hours, m: minutes }), label: t('stats.underwater') },
    {
      value: stats.deepestM === null ? '–' : `${formatNumber(stats.deepestM, locale)} m`,
      label: t('stats.deepest'),
    },
    { value: String(stats.siteCount), label: t('stats.sites') },
    { value: String(stats.countryCount), label: t('stats.countries') },
    {
      value:
        stats.avgSacLPerMin === null
          ? '–'
          : `${formatNumber(stats.avgSacLPerMin, locale)} ${t('air.sacShort')}`,
      label: t('stats.avgSac', { n: stats.sacDiveCount }),
    },
  ]

  return (
    <section className={styles.grid} aria-label={t('stats.title')}>
      {tiles.map((tile) => (
        <div key={tile.label} className={styles.tile}>
          <span className={styles.value}>{tile.value}</span>
          <span className={styles.label}>{tile.label}</span>
        </div>
      ))}
    </section>
  )
}
