import { useCallback } from 'react'
import type { TextKey } from '../../../shared/i18n/translator'
import { useT } from '../../../shared/i18n/useT'
import type { OptionListName } from '../options'

/** Tekst-nøglen for en værdi i en valgliste, f.eks. options.waterType_salt. */
export function optionKey(list: OptionListName, value: string): TextKey {
  return `options.${list}_${value}` as TextKey
}

/** Funktion, der giver teksten for en værdi i en valgliste på det valgte sprog. */
export function useOptionLabel() {
  const { t } = useT()
  return useCallback((list: OptionListName, value: string) => t(optionKey(list, value)), [t])
}
