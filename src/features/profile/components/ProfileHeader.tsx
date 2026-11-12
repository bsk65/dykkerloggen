import { useState, type FormEvent } from 'react'
import { auth } from '../../../firebase/config'
import { useT } from '../../../shared/i18n/useT'
import { Button } from '../../../shared/ui/Button'
import { TextField } from '../../../shared/ui/TextField'
import { useProfile } from '../hooks/useProfile'
import styles from './ProfileHeader.module.css'

/** Navn og dykker-/SSI-nummer øverst på profilen — kan rettes på stedet. */
export function ProfileHeader() {
  const { t } = useT()
  const { profile, save } = useProfile()
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState('')
  const [diverId, setDiverId] = useState('')

  function startEditing() {
    setName(profile?.name ?? '')
    setDiverId(profile?.diverId ?? '')
    setEditing(true)
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    save({ name: name.trim(), diverId: diverId.trim() })
    setEditing(false)
  }

  if (editing) {
    return (
      <form className={styles.form} onSubmit={handleSubmit}>
        <TextField
          label={t('profile.name')}
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <TextField
          label={t('profile.diverId')}
          value={diverId}
          onChange={(e) => setDiverId(e.target.value)}
        />
        <div className={styles.actions}>
          <Button type="button" variant="secondary" onClick={() => setEditing(false)}>
            {t('common.cancel')}
          </Button>
          <Button type="submit">{t('common.save')}</Button>
        </div>
      </form>
    )
  }

  return (
    <header className={styles.header}>
      <div className={styles.avatar} aria-hidden="true">
        🤿
      </div>
      <div className={styles.info}>
        <h1 className={styles.name}>{profile?.name || t('profile.noName')}</h1>
        {profile?.diverId && (
          <p className={styles.meta}>{t('profile.diverIdShown', { id: profile.diverId })}</p>
        )}
        <p className={styles.meta}>{auth.currentUser?.email}</p>
      </div>
      <button type="button" className={styles.edit} onClick={startEditing}>
        {t('common.edit')}
      </button>
    </header>
  )
}
