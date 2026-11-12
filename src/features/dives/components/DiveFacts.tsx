import type { TextKey } from '../../../shared/i18n/translator'
import { useT } from '../../../shared/i18n/useT'
import { formatNumber } from '../../../shared/utils/numbers'
import { useOptionLabel } from '../hooks/useOptionLabel'
import type { OptionListName } from '../options'
import type { Dive } from '../types'
import styles from './DiveFacts.module.css'

type Fact = { label: TextKey; value: string }

/** Alle udfyldte oplysninger om dykket i en overskuelig liste. Tomme felter udelades. */
export function DiveFacts({ dive }: { dive: Dive }) {
  const { t, locale } = useT()
  const optionLabel = useOptionLabel()

  const num = (value: number | null, unit: string) =>
    value === null ? null : `${formatNumber(value, locale)} ${unit}`
  const opt = (list: OptionListName, value: string | null) =>
    value === null ? null : optionLabel(list, value)

  const gas = dive.nitrox ? `${t('dives.gasNitrox')} ${dive.o2Percent ?? '?'} %` : t('dives.gasAir')
  const decoGas =
    dive.decoGasUsed && dive.decoO2Percent !== null
      ? `${dive.decoO2Percent} % · ${dive.decoTankVolumeL ?? '?'} L · ${dive.decoStartBar ?? '?'} → ${dive.decoEndBar ?? '?'} bar`
      : null

  const facts: (Fact | { label: TextKey; value: string | null })[] = [
    { label: 'dives.diveKind', value: opt('diveKind', dive.diveKind) },
    { label: 'dives.purpose', value: opt('purpose', dive.purpose) },
    { label: 'dives.specialty', value: opt('specialty', dive.specialty) },
    { label: 'dives.buddies', value: dive.buddies.join(', ') || null },
    { label: 'dives.instructor', value: dive.instructor },
    { label: 'dives.center', value: dive.center },
    { label: 'dives.avgDepth', value: num(dive.avgDepthM, 'm') },
    { label: 'dives.weight', value: num(dive.weightKg, 'kg') },
    { label: 'dives.gas', value: gas },
    { label: 'dives.gearConfig', value: opt('gearConfig', dive.gearConfig) },
    {
      label: 'dives.tank',
      value:
        dive.tankVolumeL === null
          ? null
          : [num(dive.tankVolumeL, 'L'), opt('tankMaterial', dive.tankMaterial)]
              .filter(Boolean)
              .join(' · '),
    },
    {
      label: 'dives.pressure',
      value:
        dive.startBar === null && dive.endBar === null
          ? null
          : `${dive.startBar ?? '?'} → ${dive.endBar ?? '?'} bar`,
    },
    {
      label: 'dives.decoTime',
      value: dive.deco ? (num(dive.decoTimeMin, 'min') ?? t('common.yes')) : null,
    },
    { label: 'dives.decoGas', value: decoGas },
    { label: 'dives.waterBody', value: opt('waterBody', dive.waterBody) },
    { label: 'dives.waterType', value: opt('waterType', dive.waterType) },
    { label: 'dives.entry', value: opt('entry', dive.entry) },
    { label: 'dives.weather', value: opt('weather', dive.weather) },
    { label: 'dives.surface', value: opt('surface', dive.surface) },
    { label: 'dives.current', value: opt('current', dive.current) },
    { label: 'dives.visibility', value: num(dive.visibilityM, 'm') },
    { label: 'dives.airTemp', value: num(dive.airTempC, '°C') },
    { label: 'dives.surfaceTemp', value: num(dive.surfaceTempC, '°C') },
    { label: 'dives.waterTemp', value: num(dive.waterTempC, '°C') },
    { label: 'dives.gearDetails', value: dive.gearDetails },
  ]

  return (
    <dl className={styles.list}>
      {facts
        .filter((fact): fact is Fact => Boolean(fact.value))
        .map((fact) => (
          <div key={fact.label} className={styles.row}>
            <dt className={styles.term}>{t(fact.label)}</dt>
            <dd className={styles.value}>{fact.value}</dd>
          </div>
        ))}
    </dl>
  )
}
