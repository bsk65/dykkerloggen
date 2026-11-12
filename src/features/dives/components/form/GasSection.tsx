import { useT } from '../../../../shared/i18n/useT'
import { CheckboxField } from '../../../../shared/ui/CheckboxField'
import { NumberField } from '../../../../shared/ui/NumberField'
import { Section } from '../../../../shared/ui/Section'
import { formToDive } from '../../logic/diveForm'
import { AirConsumptionCard } from '../AirConsumptionCard'
import type { FormSectionProps } from './formTypes'
import { OptionSelect } from './OptionSelect'

/** Flaske og luft — luftforbruget beregnes løbende, mens man skriver. */
export function GasSection({ form, set }: FormSectionProps) {
  const { t } = useT()
  return (
    <Section title={t('dives.sectionGas')}>
      <OptionSelect
        list="gearConfig"
        label={t('dives.gearConfig')}
        value={form.gearConfig}
        onChange={(v) => set('gearConfig', v)}
      />
      <OptionSelect
        list="tankMaterial"
        label={t('dives.tankMaterial')}
        value={form.tankMaterial}
        onChange={(v) => set('tankMaterial', v)}
      />
      <NumberField
        label={t('dives.tankVolume')}
        unit="L"
        value={form.tankVolumeL}
        onChange={(v) => set('tankVolumeL', v)}
      />
      <NumberField
        label={t('dives.startPressure')}
        unit="bar"
        value={form.startBar}
        onChange={(v) => set('startBar', v)}
        integer
      />
      <NumberField
        label={t('dives.endPressure')}
        unit="bar"
        value={form.endBar}
        onChange={(v) => set('endBar', v)}
        integer
      />
      <CheckboxField
        label={t('dives.nitrox')}
        checked={form.nitrox}
        onChange={(v) => set('nitrox', v)}
      />
      {form.nitrox && (
        <NumberField
          label={t('dives.o2Percent')}
          unit="%"
          value={form.o2Percent}
          onChange={(v) => set('o2Percent', v)}
        />
      )}
      <div className="wide">
        <AirConsumptionCard dive={formToDive(form)} />
      </div>
    </Section>
  )
}
