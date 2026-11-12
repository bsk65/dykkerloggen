import { useEffect, useState } from 'react'
import { Link, useRouteError } from 'react-router-dom'
import {
  canReloadForStaleChunk,
  isStaleChunkError,
  reloadOnceForStaleChunk,
} from '../utils/staleChunk'
import { useT } from '../i18n/useT'
import { Button } from './Button'
import styles from './RouteErrorPage.module.css'

/** Vises i stedet for React Routers standard-fejlside. */
export function RouteErrorPage() {
  const error = useRouteError()
  const { t } = useT()
  const staleChunk = isStaleChunkError(error)
  // Besluttes én gang ved første visning, så genindlæsnings-vagten ikke
  // skifter svaret undervejs.
  const [reloading] = useState(() => staleChunk && canReloadForStaleChunk())

  useEffect(() => {
    if (reloading) reloadOnceForStaleChunk()
  }, [reloading])

  if (reloading) {
    return <p className={styles.status}>{t('common.errorReloading')}</p>
  }

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>{t('common.errorTitle')}</h1>
      <p className={styles.text}>
        {staleChunk ? t('common.errorStale') : t('common.errorUnexpected')}
      </p>
      <Button type="button" onClick={() => window.location.reload()}>
        {t('common.reload')}
      </Button>
      <Link to="/">{t('common.backHome')}</Link>
    </div>
  )
}
