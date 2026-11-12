import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useT } from '../../../shared/i18n/useT'
import { TextField } from '../../../shared/ui/TextField'
import { useDives } from '../hooks/useDives'
import { filterDives } from '../logic/filterDives'
import { DiveCard } from './DiveCard'
import { StatsSummary } from './StatsSummary'
import styles from './DiveListPage.module.css'

/** Forsiden: statistik, søgning og alle dyk, nyeste først. */
export function DiveListPage() {
  const { t } = useT()
  const { dives, loading, error } = useDives()
  const [query, setQuery] = useState('')
  const shown = useMemo(() => filterDives(dives ?? [], query), [dives, query])

  return (
    <div className={styles.page}>
      <Link to="/dyk/nyt" className={styles.newButton}>
        + {t('dives.logNew')}
      </Link>
      {error && <p className={styles.error}>{t('dives.loadError')}</p>}
      {loading && <p className={styles.status}>{t('common.loading')}</p>}
      {dives && dives.length === 0 && <p className={styles.status}>{t('dives.empty')}</p>}
      {dives && dives.length > 0 && (
        <>
          <StatsSummary dives={dives} />
          <TextField
            label={t('dives.search')}
            type="search"
            placeholder={t('dives.searchPlaceholder')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <ul className={styles.list}>
            {shown.map((dive) => (
              <li key={dive.id}>
                <DiveCard dive={dive} />
              </li>
            ))}
          </ul>
          {shown.length === 0 && <p className={styles.status}>{t('dives.noMatches')}</p>}
        </>
      )}
    </div>
  )
}
