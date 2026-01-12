"use client"

import Link from 'next/link'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'

export default function AboutFooterCTA() {
  const { user } = useFirebaseAuth()

  return (
    <div className="text-center pt-8">
      {user ? (
        <>
          <p className="text-lg mb-6" style={{ color: '#6a6a6a' }}>
            You're already on your honest journey.
          </p>
          <Link
            href="/dashboard"
            className="inline-block px-8 py-4 rounded-full text-lg font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#2c2c2c', color: '#ffffff' }}
          >
            Go to your journal
          </Link>
        </>
      ) : (
        <>
          <p className="text-lg mb-6" style={{ color: '#6a6a6a' }}>
            Ready to start your honest journey?
          </p>
          <Link
            href="/auth/signup"
            className="inline-block px-8 py-4 rounded-full text-lg font-semibold transition-all hover:opacity-90"
            style={{ backgroundColor: '#2c2c2c', color: '#ffffff' }}
          >
            Get Started Free
          </Link>
        </>
      )}
    </div>
  )
}
