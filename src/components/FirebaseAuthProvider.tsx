'use client'

import { createContext, useContext, useEffect, useRef, useState } from 'react'
import { firebaseAuth } from '@/lib/firebase-client'
import { onIdTokenChanged, User } from 'firebase/auth'

type AuthContextValue = {
  user: User | null
  idToken: string | null
  loading: boolean
}

const AuthContext = createContext<AuthContextValue>({ user: null, idToken: null, loading: true })

export function FirebaseAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [idToken, setIdToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const refreshedOnce = useRef(false)

  useEffect(() => {
    console.log('[FirebaseAuthProvider] Setting up token listener')
    const unsub = onIdTokenChanged(firebaseAuth, async (u) => {
      console.log('[FirebaseAuthProvider] Token change:', u ? `User: ${u.uid}` : 'No user')
      setUser(u)
      if (u) {
        try {
          const token = await u.getIdToken()
          setIdToken(token)
        } catch (error) {
          console.error('[FirebaseAuthProvider] Error getting token:', error)
          setIdToken(null)
        }
      } else {
        setIdToken(null)
      }
      setLoading(false)
    })

    // Proactively refresh the token to avoid unexpected expirations on iOS/PWA backgrounding
    const refreshInterval = setInterval(async () => {
      try {
        if (firebaseAuth.currentUser) {
          await firebaseAuth.currentUser.getIdToken(true)
          if (!refreshedOnce.current) {
            refreshedOnce.current = true
            console.log('[FirebaseAuthProvider] Token refresh interval started')
          }
        }
      } catch (error) {
        console.error('[FirebaseAuthProvider] Periodic token refresh failed:', error)
      }
    }, 10 * 60 * 1000) // every 10 minutes

    return () => {
      unsub()
      clearInterval(refreshInterval)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, idToken, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useFirebaseAuth() {
  return useContext(AuthContext)
}
