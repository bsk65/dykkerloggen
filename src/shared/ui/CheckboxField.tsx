import styles from './CheckboxField.module.css'

type CheckboxFieldProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
}

export function CheckboxField({ label, checked, onChange }: CheckboxFieldProps) {
  return (
    <label className={styles.row}>
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>{label}</span>
    </label>
  )
}
