import { useT } from '../../../../shared/i18n/useT'
import { CheckboxField } from '../../../../shared/ui/CheckboxField'
import { NumberField } from '../../../../shared/ui/NumberField'
import { Section } from '../../../../shared/ui/Section'
import type { FormSectionProps } from './formTypes'
import { OptionSelect } from './OptionSelect'

/** Dekompression — felterne vises først, når dykket er markeret som dekodyk. */
export function DecoSection({ form, set }: FormSectionProps) {
  const { t } = useT()
  return (
    <Section title={t('dives.sectionDeco')}>
      <CheckboxField label={t('dives.deco')} checked={form.deco} onChange={(v) => set('deco', v)} />
      {form.deco && (
        <>
          <NumberField
            label={t('dives.decoTime')}
            unit="min"
            value={form.decoTimeMin}
            onChange={(v) => set('decoTimeMin', v)}
            integer
          />
          <CheckboxField
            label={t('dives.decoGasUsed')}
            checked={form.decoGasUsed}
            onChange={(v) => set('decoGasUsed', v)}
          />
        </>
      )}
      {form.deco && form.decoGasUsed && (
        <>
          <OptionSelect
            list="tankMaterial"
            label={t('dives.decoTankMaterial')}
            value={form.decoTankMaterial}
            onChange={(v) => set('decoTankMaterial', v)}
          />
          <NumberField
            label={t('dives.decoTankVolume')}
            unit="L"
            value={form.decoTankVolumeL}
            onChange={(v) => set('decoTankVolumeL', v)}
          />
          <NumberField
            label={t('dives.decoO2')}
            unit="%"
            value={form.decoO2Percent}
            onChange={(v) => set('decoO2Percent', v)}
          />
          <NumberField
            label={t('dives.decoStart')}
            unit="bar"
            value={form.decoStartBar}
            onChange={(v) => set('decoStartBar', v)}
            integer
          />
          <NumberField
            label={t('dives.decoEnd')}
            unit="bar"
            value={form.decoEndBar}
            onChange={(v) => set('decoEndBar', v)}
            integer
          />
        </>
      )}
    </Section>
  )
}
