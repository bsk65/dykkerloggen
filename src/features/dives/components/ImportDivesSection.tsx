import { useRef } from 'react'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import { useDives } from '../hooks/useDives'
import { useImportDives } from '../hooks/useImportDives'
import styles from './ImportDivesSection.module.css'

/** "Importér dyk" på profilsiden — f.eks. dyk hentet fra SSI's logbog. */
export function ImportDivesSection() {
  const { t } = useT()
  const { dives } = useDives()
  const { state, chooseFile, runImport, reset } = useImportDives(dives)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <section className={styles.section}>
      <h2 className={styles.heading}>{t('dives.importTitle')}</h2>
      <p className={styles.muted}>{t('dives.importHint')}</p>

      <input
        ref={inputRef}
        type="file"
        accept="application/json,.json"
        className={styles.hiddenInput}
        onChange={(e) => {
          const file = e.target.files?.[0]
          e.target.value = ''
          if (file) void chooseFile(file)
        }}
      />

      {state.step === 'ready' && (
        <div className={styles.box}>
          <p className={styles.text}>
            {t('dives.importFound', { found: state.found, fresh: state.fresh.length })}
          </p>
          <div className={styles.actions}>
            <Button type="button" variant="secondary" onClick={reset}>
              {t('common.cancel')}
            </Button>
            {state.fresh.length > 0 && (
              <Button type="button" onClick={() => void runImport()}>
                {t('dives.importRun', { n: state.fresh.length })}
              </Button>
            )}
          </div>
        </div>
      )}

      {state.step === 'importing' && <p className={styles.muted}>{t('dives.importing')}</p>}
      {state.step === 'done' && (
        <p className={styles.success}>✓ {t('dives.importDone', { n: state.count })}</p>
      )}
      {state.step === 'error' && (
        <p className={styles.error}>
          {t(state.reason === 'file' ? 'dives.importBadFile' : 'dives.importSaveError')}
        </p>
      )}

      {state.step !== 'ready' && state.step !== 'importing' && (
        <Button type="button" variant="secondary" onClick={() => inputRef.current?.click()}>
          {t('dives.importChoose')}
        </Button>
      )}
    </section>
  )
}
