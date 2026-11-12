import { TextField } from './TextField'

type NumberFieldProps = {
  label: string
  /** Enhed vist efter labelen, f.eks. "m" eller "bar" */
  unit?: string
  value: string
  onChange: (value: string) => void
  /** Kun hele tal (dyknummer, tryk) — giver telefonens taltastatur uden komma */
  integer?: boolean
}

/** Talfelt: tekstfelt med taltastatur. Komma og punktum accepteres begge. */
export function NumberField({ label, unit, value, onChange, integer = false }: NumberFieldProps) {
  return (
    <TextField
      label={unit ? `${label} (${unit})` : label}
      inputMode={integer ? 'numeric' : 'decimal'}
      value={value}
      onChange={(e) => onChange(e.target.value.replace(/[^\d.,-]/g, ''))}
    />
  )
}
