import { onAuthStateChanged, type User } from 'firebase/auth'
import { useEffect, useState } from 'react'
import { auth } from '../../../firebase/config'

type AuthState = {
  user: User | null
  loading: boolean
}

export function useAuthUser(): AuthState {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    return onAuthStateChanged(auth, (nextUser) => {
      setUser(nextUser)
      setLoading(false)
    })
  }, [])

  return { user, loading }
}
