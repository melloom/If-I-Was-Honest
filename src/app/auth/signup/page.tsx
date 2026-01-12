'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createUserWithEmailAndPassword } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase-client'

export default function SignUpPage() {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match')
      return
    }

    if (password.length < 8) {
      setError('Password must be at least 8 characters')
      return
    }

    setIsLoading(true)

    try {
      // Create Firebase auth user
      await createUserWithEmailAndPassword(firebaseAuth, email.toLowerCase(), password)
      // Sync with backend (create user + account mapping)
      const idToken = await firebaseAuth.currentUser?.getIdToken(true)
      if (idToken) {
        await fetch('/api/auth/firebase-sync', { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } })
      }
      // Redirect to dashboard
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div
      className="min-h-screen px-4"
      style={{
        backgroundColor: '#FAF8F3',
        paddingTop: '1.5rem',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom, 0px) + 1rem)',
      }}
    >
      <div className="max-w-md w-full mx-auto space-y-6">
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm font-medium hover:opacity-70 transition-opacity"
            style={{ color: '#6B6B6B' }}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to home
          </Link>
        </div>
        <div className="text-center mb-4">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            Create Your Account
          </h1>
          <p style={{ color: '#6B6B6B' }}>
            Start your journey to honest self-reflection
          </p>
        </div>

        <div
          className="rounded-3xl shadow-sm p-6 space-y-6"
          style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 h-12 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: '#FAF8F3', border: '1px solid #E8E4DC', color: '#1A1A1A' }}
                placeholder="you@example.com"
                inputMode="email"
                autoComplete="email"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 h-12 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: '#FAF8F3', border: '1px solid #E8E4DC', color: '#1A1A1A' }}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <p className="text-xs mt-1" style={{ color: '#6B6B6B' }}>
                At least 8 characters
              </p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={8}
                className="w-full px-4 h-12 rounded-lg focus:outline-none focus:ring-2 transition-all"
                style={{ backgroundColor: '#FAF8F3', border: '1px solid #E8E4DC', color: '#1A1A1A' }}
                placeholder="••••••••"
                autoComplete="new-password"
              />
            </div>

            {error && (
              <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
              style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
            >
              {isLoading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <div className="mt-6 text-center text-sm">
            <span style={{ color: '#6B6B6B' }}>
              Already have an account?{' '}
            </span>
            <Link
              href="/auth/signin"
              className="font-medium hover:underline"
              style={{ color: '#1A1A1A' }}
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
