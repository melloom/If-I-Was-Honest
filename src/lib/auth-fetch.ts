import { firebaseAuth } from './firebase-client'

// Fetch helper that always attaches a fresh Firebase ID token.
export async function authFetch(input: string | URL | Request, init: RequestInit = {}) {
  const user = firebaseAuth.currentUser
  if (!user) throw new Error('Not signed in')

  // Force refresh to avoid stale tokens
  const idToken = await user.getIdToken(true)

  const headers = new Headers(init.headers || {})
  headers.set('Authorization', `Bearer ${idToken}`)

  return fetch(input, { ...init, headers })
}
