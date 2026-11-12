import { useT } from '../../../shared/i18n/useT'
import { DiveCard } from '../../dives/components/DiveCard'
import type { DiveSite } from '../../dives/logic/diveSites'
import styles from './SiteDivesCard.module.css'

/** Det valgte sted på kloden og dykkene dér. */
export function SiteDivesCard({ site, onClose }: { site: DiveSite; onClose: () => void }) {
  const { t } = useT()
  return (
    <section className={styles.card}>
      <header className={styles.header}>
        <div>
          <h2 className={styles.title}>{site.name}</h2>
          <p className={styles.meta}>
            {[site.region, site.country].filter(Boolean).join(', ')}
            {' · '}
            {t('globe.diveCount', { n: site.dives.length })}
          </p>
        </div>
        <button
          type="button"
          className={styles.close}
          onClick={onClose}
          aria-label={t('common.close')}
        >
          ✕
        </button>
      </header>
      <ul className={styles.list}>
        {site.dives.map((dive) => (
          <li key={dive.id}>
            <DiveCard dive={dive} />
          </li>
        ))}
      </ul>
    </section>
  )
}
