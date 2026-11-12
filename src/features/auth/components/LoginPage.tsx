import { useState, type FormEvent } from 'react'
import type { TextKey } from '../../../shared/i18n/translator'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import { LangToggle } from '../../../shared/ui/LangToggle'
import { TextField } from '../../../shared/ui/TextField'
import { useAuthActions } from '../hooks/useAuthActions'
import styles from './LoginPage.module.css'

type Mode = 'login' | 'signup' | 'reset'

const SUBMIT_LABEL: Record<Mode, TextKey> = {
  login: 'auth.login',
  signup: 'auth.signup',
  reset: 'auth.sendLink',
}

export function LoginPage() {
  const { t } = useT()
  const [mode, setMode] = useState<Mode>('login')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [resetSentTo, setResetSentTo] = useState<string | null>(null)
  const { login, signup, resetPassword, error, pending } = useAuthActions()

  function switchMode(next: Mode) {
    setMode(next)
    setResetSentTo(null)
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (mode === 'login') await login(email, password)
    else if (mode === 'signup') await signup(email, password)
    else if (await resetPassword(email)) setResetSentTo(email)
  }

  return (
    <div className={styles.page}>
      <form className={styles.form} onSubmit={(e) => void handleSubmit(e)}>
        <div className={styles.titleRow}>
          <h1 className={styles.title}>{t('common.appName')}</h1>
          <LangToggle />
        </div>
        <p className={styles.info}>{t('auth.tagline')}</p>
        {mode === 'reset' && <p className={styles.info}>{t('auth.resetInfo')}</p>}
        <TextField
          label={t('auth.email')}
          type="email"
          autoComplete="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        {mode !== 'reset' && (
          <TextField
            label={t('auth.password')}
            type="password"
            autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
        )}
        {error && <p className={styles.error}>{t(error)}</p>}
        {resetSentTo && (
          <p className={styles.success}>{t('auth.resetSent', { email: resetSentTo })}</p>
        )}
        <Button type="submit" disabled={pending}>
          {t(SUBMIT_LABEL[mode])}
        </Button>

        {mode === 'login' && (
          <button type="button" className={styles.switchMode} onClick={() => switchMode('reset')}>
            {t('auth.forgotPassword')}
          </button>
        )}
        <button
          type="button"
          className={styles.switchMode}
          onClick={() => switchMode(mode === 'login' ? 'signup' : 'login')}
        >
          {mode === 'login'
            ? t('auth.toSignup')
            : mode === 'signup'
              ? t('auth.toLogin')
              : t('auth.backToLogin')}
        </button>
      </form>
    </div>
  )
}
