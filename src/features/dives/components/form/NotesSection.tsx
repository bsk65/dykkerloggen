import { useT } from '../../../../shared/i18n/useT'
import { Section } from '../../../../shared/ui/Section'
import { StarRating } from '../../../../shared/ui/StarRating'
import { TextAreaField } from '../../../../shared/ui/TextAreaField'
import { ImageField } from '../../../../shared/ui/ImageField'
import { LogbookImagesField } from './LogbookImagesField'
import type { DiveImageChanges } from '../../hooks/useSaveDive'
import type { Dive } from '../../types'
import type { FormSectionProps } from './formTypes'

type NotesSectionProps = FormSectionProps & {
  existing: Dive | null
  images: DiveImageChanges
  onImagesChange: (images: DiveImageChanges) => void
}

export function NotesSection({ form, set, existing, images, onImagesChange }: NotesSectionProps) {
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
        <ImageField
          label={t('dives.sitePhoto')}
          existingPath={existing?.sitePhotoPath ?? null}
          change={images.sitePhoto}
          onChange={(sitePhoto) => onImagesChange({ ...images, sitePhoto })}
        />
      </div>
      <div className="wide">
        <LogbookImagesField
          label={t('dives.logbookPage')}
          hint={t('dives.logbookPageHint')}
          items={images.logbook}
          onChange={(logbook) => onImagesChange({ ...images, logbook })}
        />
      </div>
    </Section>
  )
}
