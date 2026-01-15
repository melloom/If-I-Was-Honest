'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase-client'
import { AppHeader } from '@/components/AppHeader'

export default function SettingsPage() {
  const { user, idToken, loading } = useFirebaseAuth()
  const router = useRouter()
  const [settings, setSettings] = useState({
    firstName: '',
    currentMood: '',
    showCharacterCount: false,
    enableContentWarnings: true,
    shareConfirmation: true,
    defaultShareAnonymously: true,
    emailUpdates: false,
    reminders: 'none' as 'none' | 'daily' | 'weekly',
  })
  const [dangerLoading, setDangerLoading] = useState({ signOutAll: false, deleting: false })
  const [actionMessage, setActionMessage] = useState<string | null>(null)

  // Load settings from localStorage (client-only)
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('ifiwh-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings((prev) => ({ ...prev, ...parsed }))
      } catch (e) {
        console.warn('Failed to parse settings', e)
      }
    }
  }, [])

  // Persist settings
  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem('ifiwh-settings', JSON.stringify(settings))
  }, [settings])

  const handleSignOutEverywhere = async () => {
    if (dangerLoading.signOutAll) return
    const confirmed = window.confirm('Sign out of all devices? This will require signing in again everywhere.')
    if (!confirmed) return

    try {
      setDangerLoading((s) => ({ ...s, signOutAll: true }))
      const res = await fetch('/api/account/logout-all', { method: 'POST', headers: { ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) } })
      if (!res.ok) {
        throw new Error('Failed to sign out everywhere')
      }
      setActionMessage('Signed out everywhere. Redirecting to home...')
      await firebaseSignOut(firebaseAuth)
      router.push('/')
    } catch (error) {
      console.error(error)
      alert('Could not sign out everywhere. Please try again.')
    } finally {
      setDangerLoading((s) => ({ ...s, signOutAll: false }))
    }
  }

  const handleDeleteAccount = async () => {
    if (dangerLoading.deleting) return
    const first = window.confirm('Delete your account and all journal entries? This cannot be undone.')
    if (!first) return
    const second = window.confirm('Are you absolutely sure? This will remove your data permanently.')
    if (!second) return

    try {
      setDangerLoading((s) => ({ ...s, deleting: true }))
      const res = await fetch('/api/account/delete', { method: 'DELETE', headers: { ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) } })
      if (!res.ok) {
        throw new Error('Failed to delete account')
      }
      setActionMessage('Account deleted. Redirecting to home...')
      await firebaseSignOut(firebaseAuth)
      router.push('/')
    } catch (error) {
      console.error(error)
      alert('Could not delete account. Please try again.')
    } finally {
      setDangerLoading((s) => ({ ...s, deleting: false }))
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
        <div className="max-w-md w-full text-center space-y-4">
          <h1 className="text-2xl font-bold" style={{ color: '#1a1a1a' }}>Please sign in</h1>
          <p className="text-sm" style={{ color: '#6a6a6a' }}>
            Settings are available after you sign in.
          </p>
          <Link
            href="/auth/signin"
            className="px-6 py-3 rounded-full text-sm font-medium transition-all hover:opacity-80"
            style={{ backgroundColor: '#2c2c2c', color: '#ffffff' }}
          >
            Go to Sign In
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      <header className="border-b sticky top-0 z-40 bg-white" style={{ borderColor: '#e0e0e0' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link 
              href="/feed" 
              className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
              style={{ color: '#111111', fontWeight: 700 }}
            >
              If I Was Honest
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/feed" className="text-sm font-medium hover:opacity-70" style={{ color: '#6a6a6a' }}>
                Feed
              </Link>
              <Link href="/dashboard" className="text-sm font-medium hover:opacity-70" style={{ color: '#6a6a6a' }}>
                My Journal
              </Link>
              <Link href="/about" className="text-sm font-medium hover:opacity-70" style={{ color: '#6a6a6a' }}>
                About
              </Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full text-sm font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#f5f5f5', color: '#6a6a6a', border: '2px solid #e0e0e0' }}
              >
                Back to Journal
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
        <div>
          <h1 className="text-4xl font-bold mb-2" style={{ color: '#1a1a1a' }}>
            Settings
          </h1>
          <p className="text-base" style={{ color: '#6a6a6a' }}>
            Manage your account and privacy preferences.
          </p>
        </div>

        {actionMessage && (
          <div
            className="rounded-lg border px-4 py-3 text-sm"
            style={{ borderColor: '#b6e3c6', backgroundColor: '#f0fff4', color: '#1b5e20' }}
          >
            {actionMessage}
          </div>
        )}

        <section className="bg-white rounded-2xl border p-6 space-y-6" style={{ borderColor: '#e0e0e0' }}>
          <div>
            <h2 className="text-xl font-semibold mb-1" style={{ color: '#1a1a1a' }}>Profile</h2>
            <p className="text-sm" style={{ color: '#8a8a8a' }}>Personalize your journal experience</p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#4a4a4a' }}>
                First Name (optional)
              </label>
              <input
                type="text"
                placeholder="What should we call you?"
                value={settings.firstName}
                onChange={(e) => setSettings((s) => ({ ...s, firstName: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border text-base"
                style={{
                  backgroundColor: '#fafafa',
                  borderColor: '#e0e0e0',
                  color: '#2a2a2a',
                }}
                maxLength={50}
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-2" style={{ color: '#4a4a4a' }}>
                How are you feeling today?
              </label>
              <input
                type="text"
                placeholder="Share your current mood..."
                value={settings.currentMood}
                onChange={(e) => setSettings((s) => ({ ...s, currentMood: e.target.value }))}
                className="w-full px-4 py-2.5 rounded-lg border text-base"
                style={{
                  backgroundColor: '#fafafa',
                  borderColor: '#e0e0e0',
                  color: '#2a2a2a',
                }}
                maxLength={100}
              />
              <p className="text-xs mt-1.5" style={{ color: '#8a8a8a' }}>
                This helps personalize your dashboard greeting
              </p>
            </div>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: '#e0e0e0' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>Email</h2>
                <p className="text-sm" style={{ color: '#6a6a6a' }}>{user?.email}</p>
              </div>
              <Link
                href="/auth/signin"
                className="text-sm font-medium underline"
                style={{ color: '#2c2c2c' }}
              >
                Change email
              </Link>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4 pt-4 border-t" style={{ borderColor: '#e0e0e0' }}>
            <label className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: '#e0e0e0' }}>
              <input
                type="checkbox"
                className="mt-1"
                checked={settings.showCharacterCount}
                onChange={(e) => setSettings((s) => ({ ...s, showCharacterCount: e.target.checked }))}
              />
              <div>
                <div className="font-medium" style={{ color: '#1a1a1a' }}>Show character count</div>
                <div className="text-sm" style={{ color: '#6a6a6a' }}>Display remaining characters while writing.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: '#e0e0e0' }}>
              <input
                type="checkbox"
                className="mt-1"
                checked={settings.enableContentWarnings}
                onChange={(e) => setSettings((s) => ({ ...s, enableContentWarnings: e.target.checked }))}
              />
              <div>
                <div className="font-medium" style={{ color: '#1a1a1a' }}>Content warnings</div>
                <div className="text-sm" style={{ color: '#6a6a6a' }}>Show warnings before sensitive content.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: '#e0e0e0' }}>
              <input
                type="checkbox"
                className="mt-1"
                checked={settings.shareConfirmation}
                onChange={(e) => setSettings((s) => ({ ...s, shareConfirmation: e.target.checked }))}
              />
              <div>
                <div className="font-medium" style={{ color: '#1a1a1a' }}>Confirm before sharing</div>
                <div className="text-sm" style={{ color: '#6a6a6a' }}>Ask for confirmation before publishing to the feed.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: '#e0e0e0' }}>
              <input
                type="checkbox"
                className="mt-1"
                checked={settings.defaultShareAnonymously}
                onChange={(e) => setSettings((s) => ({ ...s, defaultShareAnonymously: e.target.checked }))}
              />
              <div>
                <div className="font-medium" style={{ color: '#1a1a1a' }}>Default to anonymous</div>
                <div className="text-sm" style={{ color: '#6a6a6a' }}>Prefill share options as anonymous when publishing.</div>
              </div>
            </label>

            <label className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: '#e0e0e0' }}>
              <input
                type="checkbox"
                className="mt-1"
                checked={settings.emailUpdates}
                onChange={(e) => setSettings((s) => ({ ...s, emailUpdates: e.target.checked }))}
              />
              <div>
                <div className="font-medium" style={{ color: '#1a1a1a' }}>Email updates</div>
                <div className="text-sm" style={{ color: '#6a6a6a' }}>Occasional product and safety updates.</div>
              </div>
            </label>

            <div className="flex items-start gap-3 p-3 rounded-lg border" style={{ borderColor: '#e0e0e0' }}>
              <div className="mt-1 h-5 w-5 rounded-full border" style={{ borderColor: '#e0e0e0' }} />
              <div className="flex-1">
                <div className="font-medium" style={{ color: '#1a1a1a' }}>Reminders</div>
                <div className="text-sm mb-2" style={{ color: '#6a6a6a' }}>Get a gentle nudge to write.</div>
                <div className="flex gap-2 flex-wrap">
                  {['none', 'daily', 'weekly'].map((option) => (
                    <button
                      key={option}
                      onClick={() => setSettings((s) => ({ ...s, reminders: option as 'none' | 'daily' | 'weekly' }))}
                      className="px-3 py-2 rounded-full text-sm font-medium border"
                      style={{
                        backgroundColor: settings.reminders === option ? '#2c2c2c' : '#ffffff',
                        color: settings.reminders === option ? '#ffffff' : '#6a6a6a',
                        borderColor: settings.reminders === option ? '#2c2c2c' : '#e0e0e0',
                      }}
                      type="button"
                    >
                      {option.charAt(0).toUpperCase() + option.slice(1)}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t" style={{ borderColor: '#e0e0e0' }}>
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold" style={{ color: '#1a1a1a' }}>Danger zone</h2>
                <p className="text-sm" style={{ color: '#6a6a6a' }}>
                  Sign out everywhere or delete your account and entries.
                </p>
              </div>
              <div className="flex gap-3 flex-wrap justify-end">
                <button
                  onClick={handleSignOutEverywhere}
                  disabled={dangerLoading.signOutAll}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-60"
                  style={{ backgroundColor: '#ffe5e5', color: '#d32f2f', border: '1px solid #f5c2c7' }}
                >
                  {dangerLoading.signOutAll ? 'Signing Out...' : 'Sign Out Everywhere'}
                </button>
                <button
                  onClick={handleDeleteAccount}
                  disabled={dangerLoading.deleting}
                  className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80 disabled:opacity-60"
                  style={{ backgroundColor: '#2c2c2c', color: '#ffffff', border: '1px solid #1f1f1f' }}
                >
                  {dangerLoading.deleting ? 'Deleting...' : 'Delete Account'}
                </button>
              </div>
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
