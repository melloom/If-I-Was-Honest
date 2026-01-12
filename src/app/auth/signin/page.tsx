'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Suspense } from 'react'
import { signInWithEmailAndPassword, sendPasswordResetEmail } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase-client'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'

function SignInContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [successMessage, setSuccessMessage] = useState('')
  const [showResetPassword, setShowResetPassword] = useState(false)
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const { user } = useFirebaseAuth()

  // Persist last used email locally for smoother PWA sign-in
  useEffect(() => {
    const savedEmail = typeof window !== 'undefined' ? localStorage.getItem('honest:lastEmail') : null
    if (savedEmail) {
      setEmail(savedEmail)
      setResetEmail(savedEmail)
    }
  }, [])

  useEffect(() => {
    if (typeof window !== 'undefined' && email) {
      localStorage.setItem('honest:lastEmail', email)
    }
  }, [email])

  useEffect(() => {
    // Check if user just registered
    if (searchParams.get('registered') === 'true') {
      setSuccessMessage('Account created successfully! Please sign in.')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setIsLoading(true)

    try {
      await signInWithEmailAndPassword(firebaseAuth, email.toLowerCase(), password)
      // Sync with backend (create user + account mapping if needed)
      const idToken = await firebaseAuth.currentUser?.getIdToken(true)
      if (idToken) {
        await fetch('/api/auth/firebase-sync', { method: 'POST', headers: { Authorization: `Bearer ${idToken}` } })
      }
      router.push('/dashboard')
      router.refresh()
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccessMessage('')
    setResetLoading(true)

    try {
      await sendPasswordResetEmail(firebaseAuth, resetEmail.toLowerCase())
      setSuccessMessage('Password reset email sent! Check your inbox.')
      setShowResetPassword(false)
      setResetEmail('')
    } catch (err) {
      setError('Failed to send reset email. Please check your email address.')
    } finally {
      setResetLoading(false)
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
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2" style={{ color: '#1A1A1A' }}>
            {showResetPassword
              ? 'Reset Password'
              : searchParams.get('registered') === 'true'
              ? 'Welcome!'
              : 'Welcome Back'}
          </h1>
          <p style={{ color: '#6B6B6B' }}>
            {showResetPassword
              ? 'Enter your email to receive a password reset link'
              : searchParams.get('registered') === 'true'
              ? 'Your account is ready. Sign in to get started.'
              : 'Sign in to continue your journey'}
          </p>
        </div>

        <div
          className="rounded-3xl shadow-sm p-6 space-y-6"
          style={{ backgroundColor: '#FFFFFF', boxShadow: '0 1px 3px rgba(0, 0, 0, 0.06)' }}
        >
          {successMessage && (
            <div className="mb-6 text-sm p-3 rounded-lg" style={{ backgroundColor: '#ECFDF5', color: '#047857' }}>
              {successMessage}
            </div>
          )}

          {showResetPassword ? (
            <form onSubmit={handleResetPassword} className="space-y-6">
              <div>
                <label htmlFor="reset-email" className="block text-sm font-medium mb-2" style={{ color: '#1A1A1A' }}>
                  Email
                </label>
                <input
                  id="reset-email"
                  type="email"
                  value={resetEmail}
                  onChange={(e) => setResetEmail(e.target.value)}
                  required
                  className="w-full px-4 h-12 rounded-lg focus:outline-none focus:ring-2 transition-all"
                  style={{ backgroundColor: '#FAF8F3', border: '1px solid #E8E4DC', color: '#1A1A1A' }}
                  placeholder="you@example.com"
                  inputMode="email"
                  autoComplete="email"
                />
              </div>

              {error && (
                <div className="text-sm p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#DC2626' }}>
                  {error}
                </div>
              )}

              <div className="space-y-3">
                <button
                  type="submit"
                  disabled={resetLoading}
                  className="w-full py-3 rounded-lg font-medium hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed transition-opacity"
                  style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
                >
                  {resetLoading ? 'Sending...' : 'Send Reset Link'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowResetPassword(false)
                    setError('')
                  }}
                  className="w-full py-3 rounded-lg font-medium hover:opacity-90 transition-opacity"
                  style={{ backgroundColor: '#F5F3EF', color: '#1A1A1A', border: '1px solid #E8E4DC' }}
                >
                  Back to Sign In
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
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
                <div className="flex items-center justify-between mb-2">
                  <label htmlFor="password" className="block text-sm font-medium" style={{ color: '#1A1A1A' }}>
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(email)
                      setShowResetPassword(true)
                      setError('')
                      setSuccessMessage('')
                    }}
                    className="text-sm hover:underline"
                    style={{ color: '#6B6B6B' }}
                  >
                    Forgot password?
                  </button>
                </div>
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
                  autoComplete="current-password"
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
                {isLoading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {!showResetPassword && (
            <div className="mt-6 text-center text-sm">
              <span style={{ color: '#6B6B6B' }}>
                Don't have an account?{' '}
              </span>
              <Link
                href="/auth/signup"
                className="font-medium hover:underline"
                style={{ color: '#1A1A1A' }}
              >
                Sign up
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default function SignInPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAF8F3' }}>
        <p style={{ color: '#9B9B9B' }}>Loading...</p>
      </div>
    }>
      <SignInContent />
    </Suspense>
  )
}

