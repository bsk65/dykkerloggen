import { useT } from '../i18n/useT'
import styles from './StarRating.module.css'

type StarRatingProps = {
  value: number
  /** Udelades for en ren visning (ikke redigerbar) */
  onChange?: (value: number) => void
  label?: string
}

const STARS = [1, 2, 3, 4, 5]

/** 0–5 stjerner. Tryk på den valgte stjerne igen for at nulstille. */
export function StarRating({ value, onChange, label }: StarRatingProps) {
  const { t } = useT()
  if (!onChange) {
    if (value === 0) return null
    return (
      <span className={styles.display} aria-label={t('common.stars', { n: value })}>
        {'★'.repeat(value)}
      </span>
    )
  }
  return (
    <div className={styles.wrapper}>
      {label && <span className={styles.label}>{label}</span>}
      <div className={styles.stars} role="group" aria-label={label}>
        {STARS.map((star) => (
          <button
            key={star}
            type="button"
            className={styles.star}
            aria-pressed={star <= value}
            aria-label={t('common.stars', { n: star })}
            onClick={() => onChange(star === value ? 0 : star)}
          >
            ★
          </button>
        ))}
      </div>
    </div>
  )
}
