import { useT } from '../../../shared/i18n/useT'
import { SelectField } from '../../../shared/ui/SelectField'
import { DEFAULT_GF_PRESET, GF_PRESET_KEYS } from '../../dives/logic/nitrogen'
import { useProfile } from '../hooks/useProfile'
import styles from './ProfilePage.module.css'

/** Hvor forsigtigt kvælstofberegningen på dykkets side regner (gradient factors). */
export function GfPresetSetting() {
  const { t } = useT()
  const { profile, save } = useProfile()
  return (
    <div>
      <SelectField
        label={t('nitrogen.settingLabel')}
        value={profile?.gfPreset ?? DEFAULT_GF_PRESET}
        options={GF_PRESET_KEYS}
        optionLabel={(preset) => t(`nitrogen.preset_${preset}`)}
        onChange={(preset) => {
          if (preset) save({ gfPreset: preset })
        }}
      />
      <p className={styles.muted}>{t('nitrogen.settingHint')}</p>
    </div>
  )
}
