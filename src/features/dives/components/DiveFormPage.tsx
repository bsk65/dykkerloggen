import { useCallback, useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import { useDive } from '../hooks/useDive'
import { useDives } from '../hooks/useDives'
import { useSaveDive, type DiveImageChanges } from '../hooks/useSaveDive'
import { diveToForm, emptyDiveForm, type DiveForm } from '../logic/diveForm'
import { groupDivesBySite, nextDiveNumber } from '../logic/diveSites'
import type { Dive } from '../types'
import { ConditionsSection } from './form/ConditionsSection'
import { DecoSection } from './form/DecoSection'
import { DepthTimeSection } from './form/DepthTimeSection'
import type { SetField } from './form/formTypes'
import { GasSection } from './form/GasSection'
import { GeneralSection } from './form/GeneralSection'
import { NotesSection } from './form/NotesSection'
import { SiteSection } from './form/SiteSection'
import styles from './DiveFormPage.module.css'

/** Nyt dyk (/dyk/nyt) eller redigering (/dyk/:diveId/rediger). */
export function DiveFormPage() {
  const { diveId } = useParams()
  const { t } = useT()
  const { dives } = useDives()
  const existing = useDive(diveId)

  if (diveId) {
    if (existing.status === 'loading' || dives === null) return null
    if (existing.status !== 'ready') return <p className={styles.status}>{t('dives.notFound')}</p>
    return <DiveFormLoaded key={existing.dive.id} dives={dives} existing={existing.dive} />
  }
  if (dives === null) return null
  return <DiveFormLoaded key="new" dives={dives} existing={null} />
}

type LoadedProps = { dives: Dive[]; existing: Dive | null }

function DiveFormLoaded({ dives, existing }: LoadedProps) {
  const { t } = useT()
  const navigate = useNavigate()
  const { save, saving, error } = useSaveDive()
  const [form, setForm] = useState<DiveForm>(() =>
    existing ? diveToForm(existing) : emptyDiveForm(nextDiveNumber(dives)),
  )
  const [images, setImages] = useState<DiveImageChanges>({
    sitePhoto: 'keep',
    logbookPage: 'keep',
  })
  const sites = useMemo(
    () => groupDivesBySite(dives.filter((d) => d.id !== existing?.id)),
    [dives, existing],
  )

  const set: SetField = useCallback((key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }, [])

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const id = await save(form, existing, images)
    if (id) navigate(`/dyk/${id}`, { replace: true })
  }

  return (
    <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
      <h1 className={styles.heading}>{existing ? t('dives.editTitle') : t('dives.newTitle')}</h1>
      <SiteSection form={form} set={set} sites={sites} />
      <GeneralSection form={form} set={set} />
      <DepthTimeSection form={form} set={set} />
      <GasSection form={form} set={set} />
      <DecoSection form={form} set={set} />
      <ConditionsSection form={form} set={set} />
      <NotesSection
        form={form}
        set={set}
        existing={existing}
        images={images}
        onImagesChange={setImages}
      />
      {error && <p className={styles.error}>{t('dives.saveError')}</p>}
      <div className={styles.actions}>
        <Button type="button" variant="secondary" onClick={() => navigate(-1)}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" disabled={saving}>
          {saving ? t('common.saving') : t('common.save')}
        </Button>
      </div>
    </form>
  )
}
