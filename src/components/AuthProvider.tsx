'use client'

import { FirebaseAuthProvider } from './FirebaseAuthProvider'
import { ReactNode } from 'react'

export function AuthProvider({ children }: { children: ReactNode }) {
  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
}
