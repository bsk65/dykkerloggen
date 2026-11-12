import { auth } from '../../../firebase/config'

/**
 * Den indloggede brugers id. Må kun bruges i komponenter under RequireAuth —
 * der er brugeren altid logget ind (ved log ud fjernes hele appen).
 */
export function useUid(): string {
  const uid = auth.currentUser?.uid
  if (!uid) throw new Error('useUid bruges uden for RequireAuth')
  return uid
}
