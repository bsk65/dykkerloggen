import { useT } from '../../../../shared/i18n/useT'
import { NumberField } from '../../../../shared/ui/NumberField'
import { Section } from '../../../../shared/ui/Section'
import type { FormSectionProps } from './formTypes'

export function DepthTimeSection({ form, set }: FormSectionProps) {
  const { t } = useT()
  return (
    <Section title={t('dives.sectionDepthTime')}>
      <NumberField
        label={t('dives.diveTime')}
        unit="min"
        value={form.diveTimeMin}
        onChange={(v) => set('diveTimeMin', v)}
        integer
      />
      <NumberField
        label={t('dives.maxDepth')}
        unit="m"
        value={form.maxDepthM}
        onChange={(v) => set('maxDepthM', v)}
      />
      <NumberField
        label={t('dives.avgDepth')}
        unit="m"
        value={form.avgDepthM}
        onChange={(v) => set('avgDepthM', v)}
      />
      <NumberField
        label={t('dives.weight')}
        unit="kg"
        value={form.weightKg}
        onChange={(v) => set('weightKg', v)}
      />
    </Section>
  )
}
