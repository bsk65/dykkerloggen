import { NavLink, Outlet } from 'react-router-dom'
import { useAuthActions } from '../../features/auth/hooks/useAuthActions'
import type { TextKey } from '../i18n/translator'
import { useT } from '../i18n/useT'
import { LangToggle } from './LangToggle'
import styles from './AppShell.module.css'

const TABS: { to: string; label: TextKey; icon: string; end?: boolean }[] = [
  { to: '/', label: 'common.navDives', icon: '🤿', end: true },
  { to: '/kloden', label: 'common.navGlobe', icon: '🌍' },
  { to: '/logboeger', label: 'common.navLogbooks', icon: '📖' },
]

/** Topbjælke + indhold + fast bundmenu (nem at ramme med tommelfingeren). */
export function AppShell() {
  const { t } = useT()
  const { logout } = useAuthActions()

  return (
    <div className={styles.shell}>
      <header className={styles.header}>
        <span className={styles.brand}>{t('common.appName')}</span>
        <div className={styles.headerActions}>
          <LangToggle />
          <button type="button" className={styles.logout} onClick={() => void logout()}>
            {t('auth.logout')}
          </button>
        </div>
      </header>
      <main className={styles.main}>
        <Outlet />
      </main>
      <nav className={styles.nav}>
        {TABS.map((tab) => (
          <NavLink
            key={tab.to}
            to={tab.to}
            end={tab.end}
            className={({ isActive }) =>
              [styles.tab, isActive && styles.active].filter(Boolean).join(' ')
            }
          >
            <span className={styles.icon} aria-hidden="true">
              {tab.icon}
            </span>
            {t(tab.label)}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
