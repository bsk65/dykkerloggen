import type { ReactNode } from 'react'
import { useAuthUser } from '../hooks/useAuthUser'
import { LoginPage } from './LoginPage'

/** Viser login-siden, indtil brugeren er logget ind. */
export function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuthUser()
  if (loading) return null
  if (!user) return <LoginPage />
  return children
}
