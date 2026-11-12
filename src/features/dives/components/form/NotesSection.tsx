import { useT } from '../../../../shared/i18n/useT'
import { Section } from '../../../../shared/ui/Section'
import { StarRating } from '../../../../shared/ui/StarRating'
import { TextAreaField } from '../../../../shared/ui/TextAreaField'
import type { SitePhotoChange } from '../../hooks/useSaveDive'
import type { FormSectionProps } from './formTypes'
import { SitePhotoField } from './SitePhotoField'

type NotesSectionProps = FormSectionProps & {
  existingPhotoPath: string | null
  photo: SitePhotoChange
  onPhotoChange: (change: SitePhotoChange) => void
}

export function NotesSection({
  form,
  set,
  existingPhotoPath,
  photo,
  onPhotoChange,
}: NotesSectionProps) {
  const { t } = useT()
  return (
    <Section title={t('dives.sectionNotes')}>
      <div className="wide">
        <TextAreaField
          label={t('dives.comment')}
          value={form.comment}
          onChange={(e) => set('comment', e.target.value)}
        />
      </div>
      <div className="wide">
        <TextAreaField
          label={t('dives.gearDetails')}
          placeholder={t('dives.gearDetailsPlaceholder')}
          rows={2}
          value={form.gearDetails}
          onChange={(e) => set('gearDetails', e.target.value)}
        />
      </div>
      <div className="wide">
        <StarRating
          label={t('dives.rating')}
          value={form.rating}
          onChange={(v) => set('rating', v)}
        />
      </div>
      <div className="wide">
        <SitePhotoField existingPath={existingPhotoPath} change={photo} onChange={onPhotoChange} />
      </div>
    </Section>
  )
}
