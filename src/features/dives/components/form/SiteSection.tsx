import { useEffect, useRef } from 'react'
import { reverseGeocode } from '../../../../shared/api/nominatim'
import { useT } from '../../../../shared/i18n/useT'
import { Section } from '../../../../shared/ui/Section'
import { SelectField } from '../../../../shared/ui/SelectField'
import { TextField } from '../../../../shared/ui/TextField'
import { SitePicker, type PickSource } from '../../../sites/components/SitePicker'
import type { DiveSite } from '../../logic/diveSites'
import type { FormSectionProps } from './formTypes'
import { OptionSelect } from './OptionSelect'

type SiteSectionProps = FormSectionProps & {
  /** Tidligere dykkersteder, så et kendt sted kan vælges med ét tryk */
  sites: DiveSite[]
}

export function SiteSection({ form, set, sites }: SiteSectionProps) {
  const { t } = useT()
  const lookupRef = useRef<AbortController | null>(null)
  const siteNameRef = useRef(form.siteName)

  useEffect(() => {
    siteNameRef.current = form.siteName
  }, [form.siteName])

  useEffect(() => () => lookupRef.current?.abort(), [])

  /** Kendt sted valgt: udfyld navn, position og forhold fra sidste dyk dér. */
  function chooseSite(key: string) {
    const site = sites.find((s) => s.key === key)
    if (!site) return
    set('siteName', site.name)
    set('country', site.country ?? '')
    set('region', site.region ?? '')
    set('lat', site.lat)
    set('lng', site.lng)
    if (site.waterBody) set('waterBody', site.waterBody)
    if (site.waterType) set('waterType', site.waterType)
    if (site.entry) set('entry', site.entry)
  }

  /**
   * Punkt sat på kortet: slå land og område op. Stedets navn foreslås kun,
   * hvis feltet er tomt — et navn, man selv har skrevet, overskrives aldrig.
   */
  function pick(lat: number, lng: number, _source: PickSource) {
    set('lat', lat)
    set('lng', lng)
    lookupRef.current?.abort()
    const controller = new AbortController()
    lookupRef.current = controller
    reverseGeocode(lat, lng, controller.signal)
      .then((place) => {
        if (place.country) set('country', place.country)
        set('region', place.region ?? '')
        // Læses via ref: brugeren kan have skrevet et navn, mens opslaget kørte.
        if (place.placeName && !siteNameRef.current.trim()) set('siteName', place.placeName)
      })
      .catch(() => undefined)
  }

  return (
    <Section title={t('dives.sectionSite')}>
      {sites.length > 0 && (
        <div className="wide">
          <SelectField
            label={t('dives.previousSite')}
            value=""
            options={sites.map((s) => s.key)}
            optionLabel={(key) => {
              const site = sites.find((s) => s.key === key)
              return site ? `${site.name} (${site.dives.length})` : key
            }}
            onChange={chooseSite}
            emptyLabel={t('dives.previousSitePlaceholder')}
          />
        </div>
      )}
      <TextField
        className="wide"
        label={t('dives.siteName')}
        value={form.siteName}
        onChange={(e) => set('siteName', e.target.value)}
        required
      />
      <div className="wide">
        <SitePicker lat={form.lat} lng={form.lng} onPick={pick} />
      </div>
      <TextField
        label={t('dives.country')}
        value={form.country}
        onChange={(e) => set('country', e.target.value)}
      />
      <TextField
        label={t('dives.region')}
        value={form.region}
        onChange={(e) => set('region', e.target.value)}
      />
      <OptionSelect
        list="waterBody"
        label={t('dives.waterBody')}
        value={form.waterBody}
        onChange={(v) => set('waterBody', v)}
      />
      <OptionSelect
        list="waterType"
        label={t('dives.waterType')}
        value={form.waterType}
        onChange={(v) => set('waterType', v)}
      />
      <OptionSelect
        list="entry"
        label={t('dives.entry')}
        value={form.entry}
        onChange={(v) => set('entry', v)}
      />
    </Section>
  )
}
