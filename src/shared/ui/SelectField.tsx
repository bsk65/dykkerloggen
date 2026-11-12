import type { SelectHTMLAttributes } from 'react'
import fieldStyles from './TextField.module.css'

type SelectFieldProps<V extends string> = Omit<
  SelectHTMLAttributes<HTMLSelectElement>,
  'value' | 'onChange'
> & {
  label: string
  value: V | ''
  options: readonly V[]
  /** Teksten for en værdi */
  optionLabel: (value: V) => string
  onChange: (value: V | '') => void
  /** Tekst for "intet valgt" — udelades, hvis feltet altid skal have en værdi */
  emptyLabel?: string
}

/** Dropdown med label — samme udseende som TextField. */
export function SelectField<V extends string>({
  label,
  value,
  options,
  optionLabel,
  onChange,
  emptyLabel,
  id,
  ...rest
}: SelectFieldProps<V>) {
  const selectId = id ?? `select-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className={fieldStyles.wrapper}>
      <label className={fieldStyles.label} htmlFor={selectId}>
        {label}
      </label>
      <select
        id={selectId}
        className={fieldStyles.input}
        value={value}
        onChange={(e) => onChange(e.target.value as V | '')}
        {...rest}
      >
        {emptyLabel !== undefined && <option value="">{emptyLabel}</option>}
        {options.map((option) => (
          <option key={option} value={option}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  )
}
