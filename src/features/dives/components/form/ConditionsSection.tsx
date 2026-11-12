import { useT } from '../../../../shared/i18n/useT'
import { NumberField } from '../../../../shared/ui/NumberField'
import { Section } from '../../../../shared/ui/Section'
import type { FormSectionProps } from './formTypes'
import { OptionSelect } from './OptionSelect'

export function ConditionsSection({ form, set }: FormSectionProps) {
  const { t } = useT()
  return (
    <Section title={t('dives.sectionConditions')}>
      <OptionSelect
        list="weather"
        label={t('dives.weather')}
        value={form.weather}
        onChange={(v) => set('weather', v)}
      />
      <OptionSelect
        list="surface"
        label={t('dives.surface')}
        value={form.surface}
        onChange={(v) => set('surface', v)}
      />
      <OptionSelect
        list="current"
        label={t('dives.current')}
        value={form.current}
        onChange={(v) => set('current', v)}
      />
      <NumberField
        label={t('dives.visibility')}
        unit="m"
        value={form.visibilityM}
        onChange={(v) => set('visibilityM', v)}
      />
      <NumberField
        label={t('dives.airTemp')}
        unit="°C"
        value={form.airTempC}
        onChange={(v) => set('airTempC', v)}
      />
      <NumberField
        label={t('dives.surfaceTemp')}
        unit="°C"
        value={form.surfaceTempC}
        onChange={(v) => set('surfaceTempC', v)}
      />
      <NumberField
        label={t('dives.waterTemp')}
        unit="°C"
        value={form.waterTempC}
        onChange={(v) => set('waterTempC', v)}
      />
    </Section>
  )
}
