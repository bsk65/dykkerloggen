import type { TextareaHTMLAttributes } from 'react'
import fieldStyles from './TextField.module.css'
import styles from './TextAreaField.module.css'

type TextAreaFieldProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { label: string }

export function TextAreaField({ label, id, ...rest }: TextAreaFieldProps) {
  const areaId = id ?? `area-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className={fieldStyles.wrapper}>
      <label className={fieldStyles.label} htmlFor={areaId}>
        {label}
      </label>
      <textarea id={areaId} className={`${fieldStyles.input} ${styles.area}`} rows={4} {...rest} />
    </div>
  )
}
