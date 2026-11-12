import { setLang } from '../i18n/lang'
import type { Lang } from '../i18n/translate'
import { useT } from '../i18n/useT'
import styles from './LangToggle.module.css'

/**
 * Sprogkoder og sprogenes egne navne — de oversættes bevidst ikke (et sprog
 * hedder det samme i vælgeren, uanset hvilket sprog appen står på).
 */
const LANGS: { lang: Lang; code: string; name: string }[] = [
  { lang: 'da', code: 'DA', name: 'Dansk' },
  { lang: 'en', code: 'EN', name: 'English' },
]

/** Sprogvælger "DA | EN". Det aktive sprog er fremhævet; tryk på det andet for at skifte. */
export function LangToggle() {
  const { t, lang: current } = useT()
  return (
    <div className={styles.toggle} role="group" aria-label={t('common.langLabel')}>
      {LANGS.map(({ lang, code, name }) => (
        <button
          key={lang}
          type="button"
          lang={lang}
          className={styles.option}
          aria-pressed={lang === current}
          aria-label={name}
          onClick={() => setLang(lang)}
        >
          {code}
        </button>
      ))}
    </div>
  )
}
