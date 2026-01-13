import { initializeApp, getApps } from 'firebase/app'
import { getAuth, setPersistence, browserLocalPersistence } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

let authInstance: ReturnType<typeof getAuth> | null = null
let persistenceSet = false

export function getFirebaseApp() {
  if (typeof window === 'undefined') {
    throw new Error('Firebase client SDK should only be used in the browser')
  }
  if (!getApps().length) {
    initializeApp(firebaseConfig)
  }
  return getApps()[0]
}

export function getFirebaseAuth() {
  if (typeof window === 'undefined') {
    return null as any
  }
  
  // Return cached instance if already created
  if (authInstance) {
    return authInstance
  }
  
  authInstance = getAuth(getFirebaseApp())
  
  // Set persistence to LOCAL for PWA compatibility (only once)
  // This ensures auth state persists between browser and PWA sessions
  if (!persistenceSet) {
    persistenceSet = true
    setPersistence(authInstance, browserLocalPersistence).catch((error) => {
      console.error('[Firebase] Failed to set persistence:', error)
      persistenceSet = false // Reset flag on error so it can retry
    })
  }
  
  return authInstance
}

// Backwards compatibility for existing imports in client components.
// On the server, this will be a harmless stub and won't initialize Firebase.
export const firebaseAuth = typeof window !== 'undefined' ? getFirebaseAuth() : ({} as any)
