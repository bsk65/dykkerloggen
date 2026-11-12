import {
  createUserWithEmailAndPassword,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut,
} from 'firebase/auth'
import { useState } from 'react'
import { auth } from '../../../firebase/config'
import { getLang } from '../../../shared/i18n/lang'
import type { TextKey } from '../../../shared/i18n/translator'

const ERROR_KEYS: Record<string, TextKey> = {
  'auth/invalid-credential': 'auth.errorCredentials',
  'auth/wrong-password': 'auth.errorCredentials',
  'auth/email-already-in-use': 'auth.errorEmailInUse',
  'auth/weak-password': 'auth.errorWeakPassword',
  'auth/invalid-email': 'auth.errorInvalidEmail',
  'auth/too-many-requests': 'auth.errorTooMany',
}

/** Fejlen som tekst-nøgle, så den vises på det aktuelle sprog. */
function toErrorKey(error: unknown): TextKey {
  const code = (error as { code?: string }).code
  return (code && ERROR_KEYS[code]) || 'auth.errorGeneric'
}

export function useAuthActions() {
  const [error, setError] = useState<TextKey | null>(null)
  const [pending, setPending] = useState(false)

  async function run(action: () => Promise<unknown>): Promise<boolean> {
    setPending(true)
    setError(null)
    try {
      await action()
      return true
    } catch (err) {
      setError(toErrorKey(err))
      return false
    } finally {
      setPending(false)
    }
  }

  const login = (email: string, password: string) =>
    run(() => signInWithEmailAndPassword(auth, email, password))

  const signup = (email: string, password: string) =>
    run(() => createUserWithEmailAndPassword(auth, email, password))

  /** Firebase afslører ikke, om e-mailen findes — derfor samme besked uanset hvad. */
  const resetPassword = (email: string) =>
    run(() => {
      auth.languageCode = getLang()
      return sendPasswordResetEmail(auth, email)
    })

  const logout = () => signOut(auth)

  return { login, signup, resetPassword, logout, error, pending }
}
