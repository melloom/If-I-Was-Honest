'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase-client'

export function UserNav() {
  const { user, loading } = useFirebaseAuth()
  const router = useRouter()

  if (loading) {
    return <div className="h-10 w-10 rounded-full bg-gray-200 dark:bg-gray-700 animate-pulse" />
  }

  if (!user) {
    return (
      <div className="flex gap-4">
        <Link
          href="/auth/signin"
          className="px-4 py-2 text-sm font-medium hover:text-gray-600 dark:hover:text-gray-300"
        >
          Sign In
        </Link>
        <Link
          href="/auth/signup"
          className="px-4 py-2 text-sm font-medium bg-black dark:bg-white text-white dark:text-black rounded-lg hover:opacity-90"
        >
          Sign Up
        </Link>
      </div>
    )
  }

  return (
    <div className="flex items-center gap-4">
      <span className="text-sm text-gray-600 dark:text-gray-400">
        {user.email}
      </span>
      <button
        onClick={async () => {
          await firebaseSignOut(firebaseAuth)
          router.push('/')
        }}
        className="px-4 py-2 text-sm font-medium border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
      >
        Sign Out
      </button>
    </div>
  )
}
