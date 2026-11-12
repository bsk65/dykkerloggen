import { useT } from '../../../../shared/i18n/useT'
import { SelectField } from '../../../../shared/ui/SelectField'
import { useOptionLabel } from '../../hooks/useOptionLabel'
import { OPTION_LISTS, type OptionListName } from '../../options'

type OptionSelectProps<L extends OptionListName> = {
  list: L
  label: string
  value: (typeof OPTION_LISTS)[L][number] | ''
  onChange: (value: (typeof OPTION_LISTS)[L][number] | '') => void
  /** Skal feltet kunne stå tomt ("Ikke angivet")? */
  optional?: boolean
}

/** Dropdown med en af SSI-valglisterne (vandtype, adgang, vejr …). */
export function OptionSelect<L extends OptionListName>({
  list,
  label,
  value,
  onChange,
  optional = true,
}: OptionSelectProps<L>) {
  const { t } = useT()
  const optionLabel = useOptionLabel()
  return (
    <SelectField
      label={label}
      value={value}
      options={OPTION_LISTS[list] as readonly (typeof OPTION_LISTS)[L][number][]}
      optionLabel={(v) => optionLabel(list, v)}
      onChange={onChange}
      emptyLabel={optional ? t('common.notSpecified') : undefined}
    />
  )
}
