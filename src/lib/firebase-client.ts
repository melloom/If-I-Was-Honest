import { initializeApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

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
  return getAuth(getFirebaseApp())
}

// Backwards compatibility for existing imports in client components.
// On the server, this will be a harmless stub and won't initialize Firebase.
export const firebaseAuth = typeof window !== 'undefined' ? getFirebaseAuth() : ({} as any)
