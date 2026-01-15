'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase-client'

export function Header() {
  const { user, loading } = useFirebaseAuth()
  const router = useRouter()

  if (loading) {
    return (
      <header className="border-b sticky top-0 z-40 bg-white" style={{ borderColor: '#e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="h-6 w-24 rounded bg-gray-200 animate-pulse" />
        </div>
      </header>
    )
  }

  return (
    <header className="border-b sticky top-0 z-40 bg-white" style={{ borderColor: '#e0e0e0' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
          style={{ color: '#000000' }}
        >
          If I Was Honest
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/feed" className="text-sm hover:opacity-70" style={{ color: '#6b6b6b' }}>
            Feed
          </Link>
          {user && (
            <Link href="/dashboard" className="text-sm hover:opacity-70" style={{ color: '#6b6b6b' }}>
              Dashboard
            </Link>
          )}
          <Link href="/about" className="text-sm hover:opacity-70" style={{ color: '#6b6b6b' }}>
            About
          </Link>
        </nav>
        <div className="flex items-center gap-4">
          {!user ? (
            <>
              <Link
                href="/auth/signin"
                className="text-sm font-medium hover:opacity-70"
                style={{ color: '#6b6b6b' }}
              >
                Sign In
              </Link>
              <Link
                href="/auth/signup"
                className="px-4 py-2 text-sm font-medium rounded-lg hover:opacity-90"
                style={{ backgroundColor: '#2c2c2c', color: '#ffffff' }}
              >
                Sign Up
              </Link>
            </>
          ) : (
            <>
              <span className="text-sm" style={{ color: '#6b6b6b' }}>
                {user.email}
              </span>
              <button
                onClick={async () => {
                  await firebaseSignOut(firebaseAuth)
                  router.push('/')
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg hover:opacity-90"
                style={{ backgroundColor: '#f0f0f0', color: '#1a1a1a' }}
              >
                Sign Out
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
