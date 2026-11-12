import type { InputHTMLAttributes } from 'react'
import styles from './TextField.module.css'

type TextFieldProps = InputHTMLAttributes<HTMLInputElement> & {
  label: string
}

export function TextField({ label, id, className, ...rest }: TextFieldProps) {
  const inputId = id ?? `field-${label.toLowerCase().replace(/\s+/g, '-')}`
  return (
    <div className={[styles.wrapper, className].filter(Boolean).join(' ')}>
      <label className={styles.label} htmlFor={inputId}>
        {label}
      </label>
      <input id={inputId} className={styles.input} {...rest} />
    </div>
  )
}
