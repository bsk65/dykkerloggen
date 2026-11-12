import { useT } from '../../../../shared/i18n/useT'
import { NumberField } from '../../../../shared/ui/NumberField'
import { Section } from '../../../../shared/ui/Section'
import { TextField } from '../../../../shared/ui/TextField'
import type { FormSectionProps } from './formTypes'
import { OptionSelect } from './OptionSelect'

export function GeneralSection({ form, set }: FormSectionProps) {
  const { t } = useT()
  return (
    <Section title={t('dives.sectionGeneral')}>
      <NumberField
        label={t('dives.diveNumber')}
        value={form.diveNumber}
        onChange={(v) => set('diveNumber', v)}
        integer
      />
      <TextField
        label={t('dives.date')}
        type="date"
        value={form.date}
        onChange={(e) => set('date', e.target.value)}
        required
      />
      <TextField
        label={t('dives.entryTime')}
        type="time"
        value={form.entryTime}
        onChange={(e) => set('entryTime', e.target.value)}
      />
      <OptionSelect
        list="diveKind"
        label={t('dives.diveKind')}
        value={form.diveKind}
        onChange={(v) => v && set('diveKind', v)}
        optional={false}
      />
      <OptionSelect
        list="purpose"
        label={t('dives.purpose')}
        value={form.purpose}
        onChange={(v) => set('purpose', v)}
      />
      <OptionSelect
        list="specialty"
        label={t('dives.specialty')}
        value={form.specialty}
        onChange={(v) => set('specialty', v)}
      />
      <TextField
        className="wide"
        label={t('dives.buddies')}
        placeholder={t('dives.buddiesPlaceholder')}
        value={form.buddies}
        onChange={(e) => set('buddies', e.target.value)}
      />
      <TextField
        label={t('dives.instructor')}
        value={form.instructor}
        onChange={(e) => set('instructor', e.target.value)}
      />
      <TextField
        label={t('dives.center')}
        value={form.center}
        onChange={(e) => set('center', e.target.value)}
      />
    </Section>
  )
}
