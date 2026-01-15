'use client'

import { signOut as firebaseSignOut } from 'firebase/auth'
import { useEffect } from 'react'
import { firebaseAuth } from '@/lib/firebase-client'

export default function SignOutPage() {
  useEffect(() => {
    firebaseSignOut(firebaseAuth).finally(() => {
      window.location.href = '/'
    })
  }, [])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p className="text-gray-600 dark:text-gray-400">Signing out...</p>
    </div>
  )
}
