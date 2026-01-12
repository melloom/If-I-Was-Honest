import { getFirestore, Firestore } from 'firebase/firestore'
import { getApp } from 'firebase/app'
import { initializeApp } from 'firebase/app'

let db: Firestore | null = null

export function getFirestoreDb(): Firestore {
  if (typeof window === 'undefined') {
    throw new Error('Firestore should only be used in the browser')
  }

  if (!db) {
    try {
      const app = getApp()
      db = getFirestore(app)
    } catch {
      const firebaseConfig = {
        apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
        authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
        messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
        appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
      }
      const app = initializeApp(firebaseConfig)
      db = getFirestore(app)
    }
  }

  return db
}

// Server-side Firestore admin
export function getServerFirestore() {
  try {
    const { getAdminApp } = require('./firebase-admin')
    const admin = require('firebase-admin')
    const app = getAdminApp()
    return admin.firestore(app)
  } catch (err) {
    console.error('Failed to initialize server Firestore:', err)
    throw err
  }
}
