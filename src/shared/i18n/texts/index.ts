import { airTexts } from './air'
import { authTexts } from './auth'
import { commonTexts } from './common'
import { divesTexts } from './dives'
import { globeTexts } from './globe'
import { nitrogenTexts } from './nitrogen'
import { optionsTexts } from './options'
import { profileTexts } from './profile'
import { sitesTexts } from './sites'
import { statsTexts } from './stats'

/**
 * Alle tekst-områder. Nøglen i t() er "område.nøgle", f.eks. t('common.save').
 * Nyt område: opret en fil her ved siden af med defineTexts og tilføj den nedenfor.
 */
export const texts = {
  common: commonTexts,
  auth: authTexts,
  dives: divesTexts,
  options: optionsTexts,
  sites: sitesTexts,
  air: airTexts,
  nitrogen: nitrogenTexts,
  stats: statsTexts,
  globe: globeTexts,
  profile: profileTexts,
}
