import type { ReactNode } from 'react'
import styles from './Section.module.css'

type SectionProps = {
  title: string
  children: ReactNode
  /** Sammenklappelig sektion (lukket fra start), til sjældent brugte felter */
  collapsible?: boolean
}

/** En gruppe felter med overskrift — felterne lægges i et responsivt gitter. */
export function Section({ title, children, collapsible = false }: SectionProps) {
  if (collapsible) {
    return (
      <details className={styles.section}>
        <summary className={styles.summary}>{title}</summary>
        <div className={styles.grid}>{children}</div>
      </details>
    )
  }
  return (
    <section className={styles.section}>
      <h2 className={styles.title}>{title}</h2>
      <div className={styles.grid}>{children}</div>
    </section>
  )
}
