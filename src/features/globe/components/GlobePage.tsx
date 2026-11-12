import { useMemo, useState } from 'react'
import { useT } from '../../../shared/i18n/useT'
import { useDives } from '../../dives/hooks/useDives'
import { groupDivesBySite } from '../../dives/logic/diveSites'
import { sitesToGeoJson } from '../logic/sitesGeoJson'
import { GlobeMap } from './GlobeMap'
import { SiteDivesCard } from './SiteDivesCard'
import styles from './GlobePage.module.css'

/** Kloden med alle dykkersteder. Tryk på et sted for at se dykkene dér. */
export function GlobePage() {
  const { t } = useT()
  const { dives } = useDives()
  const sites = useMemo(() => groupDivesBySite(dives ?? []), [dives])
  const geoJson = useMemo(() => sitesToGeoJson(sites), [sites])
  const [selectedKey, setSelectedKey] = useState<string | null>(null)
  const selected = sites.find((s) => s.key === selectedKey) ?? null
  const withoutPosition = sites.length - geoJson.features.length

  return (
    <div className={styles.page}>
      <GlobeMap sites={geoJson} onSelect={setSelectedKey} />
      <p className={styles.summary}>
        {t('globe.summary', { sites: geoJson.features.length })}
        {withoutPosition > 0 && ` ${t('globe.withoutPosition', { n: withoutPosition })}`}
      </p>
      {selected && <SiteDivesCard site={selected} onClose={() => setSelectedKey(null)} />}
    </div>
  )
}
