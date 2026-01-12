'use client'

import { signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase-client'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState, useEffect, useRef, useCallback } from 'react'
import { useRealtimeEntries } from '@/lib/useRealtimeEntries'
// Utility to detect mobile
function useIsMobile() {
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return isMobile;
}
import { ErrorToast } from '@/components/ErrorToast'
import { AppHeader } from '@/components/AppHeader'

// Status options
const STATUS_OPTIONS = [
  { value: 'STILL_TRUE', label: 'Still true', emoji: '✓', color: '#E5F3FF', textColor: '#1976d2' },
  { value: 'IVE_GROWN', label: "I've grown", emoji: '🌱', color: '#E5FFE5', textColor: '#2e7d32' },
  { value: 'I_WAS_COPING', label: 'I was coping', emoji: '🛡️', color: '#FFF5E5', textColor: '#ed6c02' },
  { value: 'I_LIED', label: 'I lied to myself', emoji: '👁️', color: '#FFE5F5', textColor: '#9c27b0' },
] as const

type EntryStatus = typeof STATUS_OPTIONS[number]['value']

interface Entry {
  id: string
  content: string
  title: string | null
  status: string
  createdAt: string
  updatedAt: string
  isPublished: boolean
  publishedAt?: string | null
  to?: string | null
  from?: string | null
  moods: {
    id: string
    name: string
    color: string | null
  }[]
  tags: {
    id: string
    name: string
  }[]
}

interface Stats {
  total: number
  thisMonth: number
  shared: number
}

type ReminderSetting = 'none' | 'daily' | 'weekly'

type AppSettings = {
  showCharacterCount: boolean
  enableContentWarnings: boolean
  shareConfirmation: boolean
  defaultShareAnonymously: boolean
  emailUpdates: boolean
  reminders: ReminderSetting
  firstName?: string
  currentMood?: string
}

const defaultSettings: AppSettings = {
  showCharacterCount: false,
  enableContentWarnings: true,
  shareConfirmation: true,
  defaultShareAnonymously: true,
  emailUpdates: false,
  reminders: 'none',
}

export default function DashboardClient() {
  // Delete confirmation modal state
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{
    show: boolean
    entryId: string
    isPublished: boolean
    hoursRemaining?: number
  } | null>(null)
  // Permanent delete confirmation modal state
  const [permanentDeleteConfirmModal, setPermanentDeleteConfirmModal] = useState<{
    show: boolean
    entryId: string
  } | null>(null)
  // Publish confirmation modal state
  const [publishConfirmModal, setPublishConfirmModal] = useState<{
    show: boolean
    entryId: string
    moods: string[]
  } | null>(null)
  // Status dropdown state - tracks which entry's dropdown is open
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null)
  // Mobile entry modal state
  const [selectedEntry, setSelectedEntry] = useState<Entry | null>(null)
  const isMobile = useIsMobile()
  const { user, idToken, loading } = useFirebaseAuth()
  const router = useRouter()

  // Debug auth state
  useEffect(() => {
    console.log('[Dashboard] Auth state:', {
      hasUser: !!user,
      userId: user?.uid,
      hasToken: !!idToken,
      tokenLength: idToken?.length,
      loading
    })
  }, [user, idToken, loading])

  const [showNewEntry, setShowNewEntry] = useState(false)
  const [entries, setEntries] = useState<Entry[]>([])
  const [stats, setStats] = useState<Stats>({ total: 0, thisMonth: 0, shared: 0 })
  const [dayStreak, setDayStreak] = useState(0)
  const [filter, setFilter] = useState<'all' | 'private' | 'shared'>('all')
  const [statusFilter, setStatusFilter] = useState<EntryStatus | 'all'>('all')
  const [isLoading, setIsLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)
  const [settings, setSettings] = useState<AppSettings>(defaultSettings)

  // Search and filter state
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedMoodFilters, setSelectedMoodFilters] = useState<string[]>([])
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({ start: '', end: '' })
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'modified' | 'alpha'>('newest')
  const [showFilters, setShowFilters] = useState(false)

  // New entry form state
  const [newContent, setNewContent] = useState('')
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [selectedStatus, setSelectedStatus] = useState<EntryStatus>('STILL_TRUE')
  const [shareAnonymously, setShareAnonymously] = useState(false)
  const [saving, setSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Extra safeguard
  const [toField, setToField] = useState('')
  const [fromField, setFromField] = useState('')

  // Error and modal state
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [permanentDeleteModal, setPermanentDeleteModal] = useState<JSX.Element | null>(null)

  // Deletion stats
  const [deletionStats, setDeletionStats] = useState({
    deletionsUsed: 0,
    deletionsLimit: 50,
    deletionsRemaining: 50,
    canDelete: true
  })

  // Close status dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (statusDropdownOpen) {
        setStatusDropdownOpen(null)
      }
    }
    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [statusDropdownOpen])

  // Memoized setEntries callback for real-time listener
  const handleRealtimeEntries = useCallback((realtimeEntries: Entry[]) => {
    setEntries(realtimeEntries)
    setIsLoading(false)
    // Update stats based on entries
    const total = realtimeEntries.length
    const thisMonth = realtimeEntries.filter(e => {
      const date = new Date(e.createdAt)
      const now = new Date()
      return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
    }).length
    const shared = realtimeEntries.filter(e => e.isPublished).length
    setStats({ total, thisMonth, shared })
    // Calculate day streak
    const entryDates = realtimeEntries
      .map(entry => entry.createdAt && new Date(entry.createdAt))
      .filter((d): d is Date => d instanceof Date && !isNaN(d.getTime()))
      .map(d => d.toISOString().slice(0, 10))
    const uniqueDays = Array.from(new Set(entryDates)).sort().reverse() as string[]
    let streak = 0
    let current = new Date()
    for (let i = 0; i < uniqueDays.length; i++) {
      const dayStr = uniqueDays[i] as string
      const day = new Date(dayStr)
      if (day.toISOString().slice(0, 10) === current.toISOString().slice(0, 10)) {
        streak++
        current.setDate(current.getDate() - 1)
      } else {
        break
      }
    }
    setDayStreak(streak)
  }, [])

  // Real-time Firestore listener for entries
  useRealtimeEntries(user?.uid, handleRealtimeEntries, { filter })

  // Fetch deletion stats (not real-time)
  useEffect(() => {
    if (user) {
      fetchDeletionStats()
    }
  }, [user])

  const fetchDeletionStats = async () => {
    if (!idToken) return
    try {
      const response = await fetch('/api/account/deletion-stats', {
        headers: { Authorization: `Bearer ${idToken}` },
      })

      if (response.ok) {
        const data = await response.json()
        setDeletionStats(data)
      }
    } catch (error) {
      console.error('Error fetching deletion stats:', error)
    }
  }

  const handleSaveEntry = async () => {
    if (!newContent.trim()) {
      setErrorMessage('Please write something first')
      return
    }

    // Prevent double-submission with dual safeguards
    if (saving || isSubmitting) {
      console.log('[Dashboard] Prevented duplicate submission')
      return
    }

    try {
      setSaving(true)
      setIsSubmitting(true)

      console.log('[Dashboard] Submitting entry with moods:', selectedMoods)

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
        body: JSON.stringify({
          content: newContent,
          moods: selectedMoods,
          status: selectedStatus,
          shareAnonymously,
          to: toField.trim() || undefined,
          from: fromField.trim() || undefined,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save entry')
      }

      const result = await response.json()
      console.log('[Dashboard] Entry saved successfully:', result)

      // Reset form and close modal
      setNewContent('')
      setSelectedMoods([])
      setSelectedStatus('STILL_TRUE')
      setShareAnonymously(settings.defaultShareAnonymously)
      setToField('')
      setFromField('')
      setShowNewEntry(false)

      // If shared anonymously, redirect to feed to see the post
      if (shareAnonymously) {
        router.push('/feed')
      }
      // Real-time listener will automatically update entries
    } catch (error) {
      console.error('Error saving entry:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
      setIsSubmitting(false)
    }
  }

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood)
        ? prev.filter((m) => m !== mood)
        : [...prev, mood]
    )
  }

  const handleStatusChange = async (entryId: string, newStatus: EntryStatus) => {
    try {
      // Wait for token if not immediately available (retry up to 3 times)
      let token = idToken
      let retries = 0
      while (!token && user && retries < 3) {
        console.log(`[Dashboard] Token not ready, waiting... (attempt ${retries + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, 500))

        // Try to force refresh the token
        if (user && !token) {
          try {
            const freshToken = await user.getIdToken(true)
            token = freshToken
            console.log('[Dashboard] Force refreshed token')
          } catch (e) {
            console.error('[Dashboard] Token refresh failed:', e)
          }
        } else {
          token = idToken
        }
        retries++
      }

      if (!token) {
        console.error('[Dashboard] No auth token available after retries')
        setErrorMessage('Authentication failed. Please refresh the page and try again.')
        return
      }

      console.log('[Dashboard] Updating status:', { entryId, newStatus, hasToken: !!token })

      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage = errorData.message || errorData.error || 'Failed to update status'

        // Show user-friendly error message
        if (response.status === 429) {
          setErrorMessage(errorMessage)
        } else if (response.status === 401) {
          setErrorMessage('Authentication expired. Please refresh the page.')
        } else {
          setErrorMessage(errorMessage)
        }

        // Use console.warn for expected rate limits, console.error for real errors
        if (response.status === 429) {
          console.warn('Status change rate limited:', errorMessage)
        } else {
          console.error('Status update failed:', errorMessage)
        }
        return
      }

      // Real-time listener will automatically update the entries
      console.log('[Dashboard] Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      setErrorMessage('Failed to update status. Please try again.')
    }
  }

  const handleDeleteEntry = async (entryId: string, isPublished: boolean, publishedAt?: string | null) => {

    // Check if this is a public post and if it's past the 24-hour window
    if (isPublished && publishedAt) {
      const publishedDate = new Date(publishedAt)
      const now = new Date()
      const hoursSincePublished = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60)

      if (hoursSincePublished > 24) {
        // Show custom modal for permanent delete
        setPermanentDeleteModal(
          <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
            <div className="max-w-md w-full rounded-xl bg-white p-8 shadow-2xl border" style={{ borderColor: '#e0e0e0' }}>
              <div className="space-y-4">
                <div className="text-base font-semibold" style={{ color: '#d32f2f' }}>
                  This post has been live for {Math.floor(hoursSincePublished)} hours and is now part of the community.
                </div>
                <div className="text-sm" style={{ color: '#1976d2' }}>
                  It remains anonymous and helps others feel less alone.
                </div>
                <div className="text-sm" style={{ color: '#2a2a2a' }}>
                  If you need to permanently remove this post, you can use one of your <b>50 permanent deletes</b>.<br/>
                  <span style={{ color: '#d32f2f' }}>This action is irreversible and should only be used if absolutely necessary.</span>
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-all"
                    style={{ backgroundColor: '#d32f2f', color: '#fff' }}
                    onClick={() => {
                      setPermanentDeleteModal(null);
                      setPermanentDeleteConfirmModal({
                        show: true,
                        entryId
                      });
                    }}
                  >
                    Permanently Delete
                  </button>
                  <button
                    className="px-4 py-2 rounded-lg font-medium transition-all"
                    style={{ backgroundColor: '#f5f5f5', color: '#2a2a2a', border: '1px solid #e0e0e0' }}
                    onClick={() => setPermanentDeleteModal(null)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          </div>
        );
        return;
      }

      // Within 24 hours - show confirmation modal
      const hoursRemaining = Math.ceil(24 - hoursSincePublished)
      setDeleteConfirmModal({
        show: true,
        entryId,
        isPublished: true,
        hoursRemaining
      })
      return
    } else {
      // Private post - show confirmation modal
      setDeleteConfirmModal({
        show: true,
        entryId,
        isPublished: false
      })
      return
    }
  }

  // Actual delete function (called after confirmation)
  const executeDelete = async (entryId: string) => {
    try {
      // Check if entry was published before deletion
      const entry = entries.find(e => e.id === entryId)
      const wasPublished = entry?.isPublished || false

      const response = await fetch(`/api/entries/${entryId}`, {
        method: 'DELETE',
        headers: { ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
      })

      if (!response.ok) {
        const errorData = await response.json()
        if (response.status === 403) {
          setErrorMessage(errorData.message || 'This post can no longer be deleted')
          return
        }
        throw new Error('Failed to delete entry')
      }

      const result = await response.json()
      console.log('[Dashboard] Entry deleted:', result.message)

      // Refresh deletion stats if it was a public post
      if (wasPublished) {
        fetchDeletionStats()
      }
      // Real-time listener will automatically update entries
    } catch (error) {
      console.error('Error deleting entry:', error)
      setErrorMessage('Failed to delete entry. Please try again.')
    }
  }

  // Close profile menu when navigating
  useEffect(() => {
    setMenuOpen(false)
  }, [filter])

  // Close profile menu on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!menuRef.current) return
      if (!menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Load user settings from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    const saved = window.localStorage.getItem('ifiwh-settings')
    if (saved) {
      try {
        const parsed = JSON.parse(saved)
        setSettings({ ...defaultSettings, ...parsed })
        setShareAnonymously(parsed.defaultShareAnonymously ?? defaultSettings.defaultShareAnonymously)
      } catch (e) {
        console.warn('Failed to parse settings', e)
        setShareAnonymously(defaultSettings.defaultShareAnonymously)
      }
    } else {
      setShareAnonymously(defaultSettings.defaultShareAnonymously)
    }
  }, [])

  const handlePublishEntry = async (entryId: string, moods: string[]) => {
    if (settings.shareConfirmation) {
      setPublishConfirmModal({
        show: true,
        entryId,
        moods
      })
      return
    }
    await executePublish(entryId, moods)
  }

  const executePublish = async (entryId: string, moods: string[]) => {
    try {
      const response = await fetch('/api/entries/publish', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          entryId,
          moods: moods.map((m) => m),
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to publish entry')
      }
      // Real-time listener will automatically update entries
    } catch (error) {
      console.error('Error publishing entry:', error)
      setErrorMessage('Failed to publish entry. Please try again.')
    }
  }

  // Permanent delete handler (after 24h, uses one of 50 permanent deletes)
  const handlePermanentDeleteEntry = async (entryId: string) => {
    setPermanentDeleteConfirmModal({
      show: true,
      entryId
    })
  }

  const executePermanentDelete = async (entryId: string) => {
    try {
      const response = await fetch(`/api/entries/${entryId}?permanent=true`, {
        method: 'DELETE',
        headers: { ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
      })
      if (!response.ok) {
        const errorData = await response.json()
        setErrorMessage(errorData.message || 'Permanent delete failed')
        return
      }
      const result = await response.json()
      console.log('[Dashboard] Entry permanently deleted:', result.message)
      fetchDeletionStats()
      // Real-time listener will automatically update entries
    } catch (error) {
      console.error('Permanent delete error:', error)
      setErrorMessage('Permanent delete failed. Please try again.')
    }
  }

  // Redirect unauthenticated users after render to avoid React render-time updates
  // This hook must be called unconditionally (before any early returns)
  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/signin')
    }
  }, [loading, user, router])

  if (loading) {
    return (
          <>
            {errorMessage && (
              <ErrorToast message={errorMessage} onClose={() => setErrorMessage(null)} />
            )}
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Loading...</p>
      </div>
      </>
    )
  }

  if (!user) {
    // Render a lightweight placeholder while redirecting
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <p className="text-gray-500">Redirecting…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#fafafa' }}>
      {errorMessage && (
        <ErrorToast message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
      {permanentDeleteModal}
      <AppHeader />
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero / Welcome */}
        <div className="text-center mb-16">
          {settings.firstName ? (
            <>
              <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                Welcome back, {settings.firstName}
              </h1>
              {settings.currentMood ? (
                <p className="text-lg md:text-xl mb-2" style={{ color: '#6a6a6a' }}>
                  Feeling <span style={{ color: '#2a2a2a', fontWeight: 500 }}>{settings.currentMood}</span> today
                </p>
              ) : (
                <p className="text-lg md:text-xl" style={{ color: '#6a6a6a' }}>
                  What's on your mind today?
                </p>
              )}
            </>

          ) : (
            <>
              <h1 className="text-5xl md:text-6xl font-bold mb-4" style={{ color: '#1a1a1a', letterSpacing: '-0.02em' }}>
                Your Private Space
              </h1>
              <p className="text-lg md:text-xl" style={{ color: '#6a6a6a' }}>
                Write honestly. Reflect deeply. Grow authentically.
              </p>
            </>
          )}
        </div>

        {/* New Entry Prompt */}
        <div className="mb-12">
          <div
            className="p-8 md:p-12 rounded-2xl cursor-pointer transition-all hover:scale-105"
            style={{
              backgroundColor: '#ffffff',
              border: '3px dashed #e0e0e0'
            }}
            onClick={() => setShowNewEntry(true)}
          >
            <div className="text-center">
              <div className="mb-4">
                <svg className="w-12 h-12 mx-auto" style={{ color: '#c0c0c0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              </div>
              <h2 className="text-2xl font-semibold mb-2" style={{ color: '#2a2a2a' }}>
                What's on your mind?
              </h2>
              <p className="text-base" style={{ color: '#8a8a8a' }}>
                Click to start writing your truth
              </p>
            </div>
          </div>
        </div>

        {/* Recent Entries */}
        <div className="mb-12">
          <div className="flex flex-col gap-4 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <div>
                <h3 className="text-2xl sm:text-3xl font-bold mb-1 leading-tight" style={{ color: '#1a1a1a' }}>
                  Your Entries
                </h3>
                <p className="text-xs sm:text-sm leading-snug" style={{ color: '#8a8a8a', minHeight: 20 }}>
                  {isLoading ? (
                    <span className="animate-pulse">Loading your streak…</span>
                  ) : dayStreak > 1 ? (
                    <>Your personal journal of honest moments &bull; <span style={{ color: '#1976d2', fontWeight: 500 }}>{dayStreak}-day streak</span></>
                  ) : (
                    <>Your personal journal of honest moments</>
                  )}
                </p>
              </div>
              <div className="flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2"
                  style={{
                    backgroundColor: showFilters ? '#2c2c2c' : '#f5f5f5',
                    color: showFilters ? '#ffffff' : '#6a6a6a',
                  }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                  Filters
                </button>
                <button
                  onClick={() => setFilter('all')}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: filter === 'all' ? '#2c2c2c' : '#f5f5f5',
                    color: filter === 'all' ? '#ffffff' : '#6a6a6a',
                  }}
                >
                  All
                </button>
                <button
                  onClick={() => setFilter('private')}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: filter === 'private' ? '#2c2c2c' : '#f5f5f5',
                    color: filter === 'private' ? '#ffffff' : '#6a6a6a',
                  }}
                >
                  Private
                </button>
                <button
                  onClick={() => setFilter('shared')}
                  className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                  style={{
                    backgroundColor: filter === 'shared' ? '#2c2c2c' : '#f5f5f5',
                    color: filter === 'shared' ? '#ffffff' : '#6a6a6a',
                  }}
                >
                  Shared
                </button>
              </div>
            </div>

            {/* Advanced Filters Panel */}
            {showFilters && (
              <div className="p-6 rounded-xl border" style={{ backgroundColor: '#fafafa', borderColor: '#e0e0e0' }}>
                <div className="grid gap-6">
                  {/* Search */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#4a4a4a' }}>
                      Search entries
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        placeholder="Search by content or mood..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full px-4 py-2.5 pl-10 rounded-lg border text-sm"
                        style={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0', color: '#2a2a2a' }}
                      />
                      <svg className="absolute left-3 top-3 w-4 h-4" style={{ color: '#8a8a8a' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Date Range */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#4a4a4a' }}>
                        From date
                      </label>
                      <input
                        type="date"
                        value={dateRange.start}
                        onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0', color: '#2a2a2a' }}
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#4a4a4a' }}>
                        To date
                      </label>
                      <input
                        type="date"
                        value={dateRange.end}
                        onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0', color: '#2a2a2a' }}
                      />
                    </div>

                    {/* Sort */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#4a4a4a' }}>
                        Sort by
                      </label>
                      <select
                        value={sortBy}
                        onChange={(e) => setSortBy(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-lg border text-sm"
                        style={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0', color: '#2a2a2a' }}
                      >
                        <option value="newest">Newest first</option>
                        <option value="oldest">Oldest first</option>
                        <option value="modified">Recently modified</option>
                        <option value="alpha">Alphabetical</option>
                      </select>
                    </div>
                  </div>

                  {/* Mood Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#4a4a4a' }}>
                      Filter by mood
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['anxious', 'sad', 'hopeful', 'angry', 'proud', 'confused', 'hurt', 'happy'].map((mood) => (
                        <button
                          key={mood}
                          onClick={() => {
                            setSelectedMoodFilters((prev) =>
                              prev.includes(mood)
                                ? prev.filter((m) => m !== mood)
                                : [...prev, mood]
                            )
                          }}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                          style={{
                            backgroundColor: selectedMoodFilters.includes(mood) ? '#2c2c2c' : '#f5f5f5',
                            color: selectedMoodFilters.includes(mood) ? '#ffffff' : '#6a6a6a',
                            border: `1px solid ${selectedMoodFilters.includes(mood) ? '#2c2c2c' : '#e0e0e0'}`
                          }}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Status Filter */}
                  <div>
                    <label className="block text-sm font-medium mb-2" style={{ color: '#4a4a4a' }}>
                      Filter by reflection
                    </label>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => setStatusFilter('all')}
                        className="px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                        style={{
                          backgroundColor: statusFilter === 'all' ? '#2c2c2c' : '#f5f5f5',
                          color: statusFilter === 'all' ? '#ffffff' : '#6a6a6a',
                        }}
                      >
                        All
                      </button>
                      {STATUS_OPTIONS.map((status) => (
                        <button
                          key={status.value}
                          onClick={() => setStatusFilter(status.value)}
                          className="px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5"
                          style={{
                            backgroundColor: statusFilter === status.value ? status.color : '#f5f5f5',
                            color: statusFilter === status.value ? status.textColor : '#6a6a6a',
                          }}
                        >
                          <span>{status.emoji}</span>
                          {status.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Clear Filters */}
                  <div className="flex justify-between items-center pt-2 border-t" style={{ borderColor: '#e0e0e0' }}>
                    <div className="text-sm" style={{ color: '#6a6a6a' }}>
                      {entries.filter((entry) => {
                        if (statusFilter !== 'all' && entry.status !== statusFilter) return false
                        if (searchQuery) {
                          const query = searchQuery.toLowerCase()
                          const matchesContent = entry.content.toLowerCase().includes(query)
                          const matchesTitle = entry.title?.toLowerCase().includes(query)
                          const matchesMoods = entry.moods.some(m => m.name.toLowerCase().includes(query))
                          if (!matchesContent && !matchesTitle && !matchesMoods) return false
                        }
                        if (selectedMoodFilters.length > 0) {
                          const entryMoodNames = entry.moods.map(m => m.name.toLowerCase())
                          const hasMatchingMood = selectedMoodFilters.some(filter =>
                            entryMoodNames.includes(filter.toLowerCase())
                          )
                          if (!hasMatchingMood) return false
                        }
                        if (dateRange.start) {
                          const entryDate = new Date(entry.createdAt)
                          const startDate = new Date(dateRange.start)
                          if (entryDate < startDate) return false
                        }
                        if (dateRange.end) {
                          const entryDate = new Date(entry.createdAt)
                          const endDate = new Date(dateRange.end)
                          endDate.setHours(23, 59, 59)
                          if (entryDate > endDate) return false
                        }
                        return true
                      }).length} entries found
                    </div>
                    <button
                      onClick={() => {
                        setSearchQuery('')
                        setSelectedMoodFilters([])
                        setDateRange({ start: '', end: '' })
                        setStatusFilter('all')
                        setSortBy('newest'
                        )
                      }}
                      className="px-4 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                      style={{ backgroundColor: '#fff5f5', color: '#d32f2f', border: '1px solid #ffcdd2' }}
                    >
                      Clear all filters
                    </button>
                  </div>
                </div>
              </div>
            )}

          </div>

          {isLoading ? (
            <div className="text-center py-20">
              <p className="text-lg" style={{ color: '#8a8a8a' }}>
                Loading...
              </p>
            </div>
          ) : entries.length === 0 ? (
            <div className="text-center py-20">
              <div className="mb-6">
                <svg className="w-20 h-20 mx-auto" style={{ color: '#e0e0e0' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2" style={{ color: '#4a4a4a' }}>
                No entries yet
              </h3>
              <p className="text-base mb-6" style={{ color: '#8a8a8a' }}>
                Start your journey of honest self-reflection
              </p>
              <button
                onClick={() => setShowNewEntry(true)}
                className="px-8 py-3 rounded-full font-medium transition-all hover:opacity-80"
                style={{ backgroundColor: '#2c2c2c', color: '#ffffff' }}
              >
                Write Your First Entry
              </button>
            </div>
          ) : (
            <>
              {/* Entries Grid - Show only entries for current filter */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 sm:gap-6">
                {entries
                  .filter(entry => {
                    if (filter === 'private') return !entry.isPublished
                    if (filter === 'shared') return entry.isPublished
                    return true
                  })
                  .filter((entry) => {
                    if (statusFilter !== 'all' && entry.status !== statusFilter) return false;
                    if (searchQuery) {
                      const query = searchQuery.toLowerCase();
                      const matchesContent = entry.content.toLowerCase().includes(query);
                      const matchesTitle = entry.title?.toLowerCase().includes(query);
                      const matchesMoods = entry.moods.some(m => m.name.toLowerCase().includes(query));
                      if (!matchesContent && !matchesTitle && !matchesMoods) return false;
                    }
                    if (selectedMoodFilters.length > 0) {
                      const entryMoodNames = entry.moods.map(m => m.name.toLowerCase());
                      const hasMatchingMood = selectedMoodFilters.some(filter =>
                        entryMoodNames.includes(filter.toLowerCase())
                      );
                      if (!hasMatchingMood) return false;
                    }
                    if (dateRange.start) {
                      const entryDate = new Date(entry.createdAt);
                      const startDate = new Date(dateRange.start);
                      if (entryDate < startDate) return false;
                    }
                    if (dateRange.end) {
                      const entryDate = new Date(entry.createdAt);
                      const endDate = new Date(dateRange.end);
                      endDate.setHours(23, 59, 59);
                      if (entryDate > endDate) return false;
                    }
                    return true;
                  })
                  .sort((a, b) => {
                    switch (sortBy) {
                      case 'newest':
                        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                      case 'oldest':
                        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
                      case 'modified':
                        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
                      case 'alpha':
                        return (a.content || '').localeCompare(b.content || '');
                      default:
                        return 0;
                    }
                  })
                  .map((entry) => {
                    const primaryMood = entry.moods[0];
                    const accentColor = primaryMood?.color || '#f5f5f5';
                    const statusOption = STATUS_OPTIONS.find(s => s.value === entry.status) || STATUS_OPTIONS[0];
                    // Calculate deletion window for shared entries
                    let canDelete = false;
                    let hoursRemaining = 0;
                    let hoursSincePublished = 0;
                    if (entry.isPublished && entry.publishedAt) {
                      const publishedDate = new Date(entry.publishedAt);
                      const now = new Date();
                      hoursSincePublished = (now.getTime() - publishedDate.getTime()) / (1000 * 60 * 60);
                      canDelete = hoursSincePublished <= 24 && deletionStats.canDelete;
                      hoursRemaining = Math.ceil(24 - hoursSincePublished);
                    }
                    // Click to open modal on all devices
                    const handleEntryClick = () => {
                      setSelectedEntry(entry);
                    };
                    return (
                      <div
                        key={entry.id}
                        className={entry.isPublished
                          ? `rounded-xl shadow-md hover:shadow-lg transition-all bg-white border border-gray-200 flex flex-col cursor-pointer ${isMobile ? 'p-3 min-h-[140px]' : 'p-4 sm:p-6 sm:aspect-square aspect-[4/3] min-h-[180px] sm:min-h-[320px] max-w-xs mx-auto'}`
                          : `rounded-lg overflow-hidden transition-all hover:shadow-lg flex flex-col cursor-pointer ${isMobile ? 'p-3' : ''}`}
                        style={entry.isPublished
                          ? (isMobile ? { boxShadow: '0 2px 8px 0 rgba(0,0,0,0.05)', background: '#fff' } : { boxShadow: '0 4px 24px 0 rgba(0,0,0,0.07)', background: '#fff' })
                          : { backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}
                        onClick={handleEntryClick}
                        role="button"
                        tabIndex={0}
                      >
                        {/* Top accent bar with mood color */}
                        <div className={entry.isPublished ? (isMobile ? 'h-1.5 w-full rounded-t-xl mb-2' : 'h-2 w-full rounded-t-2xl mb-3 sm:mb-4') : (isMobile ? 'h-1.5' : 'h-2')} style={{ backgroundColor: accentColor }} />
                        <div className={entry.isPublished ? 'flex flex-col flex-1 justify-between min-h-0' : (isMobile ? 'p-3 flex flex-col flex-1 min-h-0' : 'p-6 sm:p-8 flex flex-col flex-1 min-h-0')}>
                          {/* Header with date, status, and moods */}
                          <div className={entry.isPublished ? (isMobile ? 'flex justify-between items-center mb-2' : 'flex justify-between items-center mb-3 sm:mb-4') : (isMobile ? 'flex justify-between items-start mb-2' : 'flex justify-between items-start mb-4 sm:mb-6')}>
                            <div className={entry.isPublished ? 'flex flex-col gap-1' : 'flex items-center gap-2 flex-wrap'}>
                              <span className={entry.isPublished ? (isMobile ? 'text-[10px] font-semibold uppercase tracking-wide text-gray-400' : 'text-xs font-semibold uppercase tracking-wide text-gray-400') : (isMobile ? 'text-xs font-medium' : 'text-sm font-medium')} style={{ color: '#4a4a4a' }}>
                                {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                  month: 'short',
                                  day: 'numeric',
                                  year: 'numeric',
                                })}
                              </span>
                              <div className="flex flex-wrap gap-1">
                                {entry.moods.map((mood) => (
                                  <span
                                    key={mood.id}
                                    className={isMobile ? 'text-[10px] font-medium px-1.5 py-0.5 rounded-full' : 'text-xs font-medium px-2 py-0.5 rounded-full'}
                                    style={{ backgroundColor: mood.color || '#f5f5f5', color: '#2a2a2a' }}
                                  >
                                    {mood.name}
                                  </span>
                                ))}
                              </div>
                            </div>
                            {/* Status Badge - Click to show dropdown */}
                            <div className="relative">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setStatusDropdownOpen(statusDropdownOpen === entry.id ? null : entry.id)
                                }}
                                className={isMobile ? 'text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 transition-all hover:opacity-80 border cursor-pointer' : 'text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all hover:opacity-80 border cursor-pointer'}
                                style={{ backgroundColor: statusOption.color, color: statusOption.textColor, borderColor: statusOption.color }}
                                title="Click to change status"
                              >
                                <span>{statusOption.emoji}</span>
                                {statusOption.label}
                                <svg className="w-3 h-3 ml-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                              </button>
                              {statusDropdownOpen === entry.id && (
                                <div
                                  className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg z-20 min-w-[180px]"
                                  style={{ borderColor: '#e0e0e0' }}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {STATUS_OPTIONS.map((status) => (
                                    <button
                                      key={status.value}
                                      onClick={(e) => {
                                        e.stopPropagation()
                                        handleStatusChange(entry.id, status.value)
                                        setStatusDropdownOpen(null)
                                      }}
                                      className={`w-full px-3 py-2 text-left text-xs font-medium hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg flex items-center gap-2 ${entry.status === status.value ? 'bg-gray-100' : ''}`}
                                      style={{ color: status.textColor }}
                                    >
                                      <span>{status.emoji}</span>
                                      {status.label}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                          {/* From/To indicator - only show if present */}
                          {(entry.from || entry.to) && (
                            <div className={isMobile ? 'mb-1.5 flex flex-wrap gap-1.5 items-center' : 'mb-3 flex flex-wrap gap-2 items-center'}>
                              {entry.from && (
                                <div className="flex items-center gap-1">
                                  <span className={isMobile ? 'text-[9px] font-medium uppercase tracking-wide text-gray-400' : 'text-[10px] font-medium uppercase tracking-wide text-gray-400'}>
                                    From:
                                  </span>
                                  <span className={isMobile ? 'text-[10px] font-semibold text-gray-700' : 'text-xs font-semibold text-gray-700'}>
                                    {entry.from}
                                  </span>
                                </div>
                              )}
                              {entry.from && entry.to && (
                                <span className={isMobile ? 'text-[10px] text-gray-400' : 'text-xs text-gray-400'}>→</span>
                              )}
                              {entry.to && (
                                <div className="flex items-center gap-1">
                                  <span className={isMobile ? 'text-[9px] font-medium uppercase tracking-wide text-gray-400' : 'text-[10px] font-medium uppercase tracking-wide text-gray-400'}>
                                    To:
                                  </span>
                                  <span className={isMobile ? 'text-[10px] font-semibold text-gray-700' : 'text-xs font-semibold text-gray-700'}>
                                    {entry.to}
                                  </span>
                                </div>
                              )}
                            </div>
                          )}
                          {/* Entry content */}
                          <p className={entry.isPublished
                            ? (isMobile ? 'text-xs leading-snug mb-1.5 whitespace-pre-wrap text-gray-800 line-clamp-3' : 'text-sm sm:text-base leading-relaxed mb-2 sm:mb-4 whitespace-pre-wrap text-gray-800 line-clamp-3 sm:line-clamp-6 transition-all')
                            : (isMobile ? 'text-sm leading-snug mb-2 whitespace-pre-wrap' : 'text-base sm:text-lg leading-relaxed mb-2 sm:mb-6 whitespace-pre-wrap')}
                            style={{ color: '#1a1a1a' }}>
                            {entry.content.length > 300
                              ? (() => {
                                  const preview = entry.content.slice(0, 300);
                                  const lastSpace = preview.lastIndexOf(' ');
                                  return (lastSpace > 0 ? preview.slice(0, lastSpace) : preview) + '...';
                                })()
                              : entry.content}
                          </p>
                          {/* Deletion window indicator for public posts */}
                          {entry.isPublished && (
                            <div className={isMobile ? 'flex flex-wrap gap-1 items-center mb-1' : 'flex flex-wrap gap-2 items-center mb-2'}>
                              {canDelete && hoursRemaining > 0 && (
                                <span
                                  className={isMobile ? 'text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 bg-yellow-50 text-yellow-800' : 'text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-yellow-50 text-yellow-800'}
                                  title={`You can delete this post for ${hoursRemaining} more hour${hoursRemaining !== 1 ? 's' : ''}`}
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                  {hoursRemaining}h to delete
                                </span>
                              )}
                              {!canDelete && (
                                <span
                                  className={isMobile ? 'text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 bg-green-50 text-green-800' : 'text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 bg-green-50 text-green-800'}
                                  title="This post is now permanent and part of the community"
                                >
                                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                                  </svg>
                                  Permanent
                                </span>
                              )}
                            </div>
                          )}
                          {/* Actions bar */}
                          <div className={entry.isPublished ? (isMobile ? 'flex gap-1 pt-1.5 border-t border-gray-100 mt-auto' : 'flex gap-2 pt-2 border-t border-gray-100 mt-auto') : (isMobile ? 'flex gap-2 pt-2 border-t w-full' : 'flex gap-3 pt-3 sm:pt-4 border-t w-full')}
                            style={entry.isPublished ? { borderColor: '#f0f0f0' } : { borderColor: '#f0f0f0' }}>
                            <button
                              onClick={e => { e.stopPropagation(); handleDeleteEntry(entry.id, entry.isPublished, entry.publishedAt); }}
                              className={entry.isPublished
                                ? (isMobile ? 'flex-1 px-2 py-1 rounded-md text-[10px] font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-1 bg-red-50 text-red-700 border border-red-200' : 'flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200')
                                : (isMobile ? 'w-full px-2 py-1 rounded-md text-xs font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-1' : 'w-full px-3 py-1.5 rounded-lg text-sm font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2')}
                              style={entry.isPublished
                                ? { minWidth: 0 }
                                : { backgroundColor: '#fff5f5', color: '#d32f2f', border: '1px solid #ffcdd2', minWidth: 0 }}
                            >
                              <svg className={isMobile ? 'w-3 h-3' : 'w-4 h-4'} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                              </svg>
                              Delete
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
              </div>
            </>
          )}
        </div>

        {/* Entry Modal - render once */}
        {selectedEntry && (
          <div className="fixed inset-0 z-50 flex items-center justify-center px-2 sm:px-0" style={{ backgroundColor: 'rgba(0,0,0,0.85)' }} onClick={() => setSelectedEntry(null)}>
            <div
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl p-4 overflow-y-auto max-h-[90vh]"
              style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.25)' }}
              onClick={e => e.stopPropagation()}
            >
              <button
                className="absolute top-2 right-3 text-3xl text-gray-400 hover:text-gray-700"
                onClick={() => setSelectedEntry(null)}
                aria-label="Close"
              >
                ×
              </button>
              <div className="mb-2 flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  {new Date(selectedEntry.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                </span>
                {selectedEntry.moods.map((mood) => (
                  <span
                    key={mood.id}
                    className="text-xs font-medium px-2 py-0.5 rounded-full"
                    style={{ backgroundColor: mood.color || '#f5f5f5', color: '#2a2a2a' }}
                  >
                    {mood.name}
                  </span>
                ))}
              </div>
              <div className="mb-3">
                <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ backgroundColor: (STATUS_OPTIONS.find(s => s.value === selectedEntry.status)?.color), color: (STATUS_OPTIONS.find(s => s.value === selectedEntry.status)?.textColor) }}>{STATUS_OPTIONS.find(s => s.value === selectedEntry.status)?.emoji} {STATUS_OPTIONS.find(s => s.value === selectedEntry.status)?.label}</span>
              </div>
              {/* From/To Display in Modal */}
              {(selectedEntry.from || selectedEntry.to) && (
                <div className="mb-4 flex flex-wrap gap-3 items-center p-3 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
                  {selectedEntry.from && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        From:
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {selectedEntry.from}
                      </span>
                    </div>
                  )}
                  {selectedEntry.from && selectedEntry.to && (
                    <span className="text-sm text-gray-400">→</span>
                  )}
                  {selectedEntry.to && (
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-medium uppercase tracking-wide text-gray-500">
                        To:
                      </span>
                      <span className="text-sm font-semibold text-gray-800">
                        {selectedEntry.to}
                      </span>
                    </div>
                  )}
                </div>
              )}
              <div className="mb-4">
                <p className="whitespace-pre-wrap text-base text-gray-900" style={{ fontSize: '1rem' }}>{selectedEntry.content}</p>
              </div>
              <div className="flex gap-2 pt-2 border-t border-gray-100 mt-auto">
                <button
                  onClick={() => { setSelectedEntry(null); handleDeleteEntry(selectedEntry.id, selectedEntry.isPublished, selectedEntry.publishedAt); }}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2 bg-red-50 text-red-700 border border-red-200"
                  style={{ minWidth: 0 }}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                  Delete
                </button>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="flex-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all hover:opacity-90 flex items-center justify-center gap-2 bg-gray-50 text-gray-700 border border-gray-200"
                  style={{ minWidth: 0 }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Stats - Minimal */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: '#2a2a2a' }}>{stats.total}</div>
            <div className="text-sm" style={{ color: '#8a8a8a' }}>Total Entries</div>
          </div>
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: '#2a2a2a' }}>{stats.thisMonth}</div>
            <div className="text-sm" style={{ color: '#8a8a8a' }}>This Month</div>
          </div>
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: '#2a2a2a' }}>{stats.shared}</div>
            <div className="text-sm" style={{ color: '#8a8a8a' }}>Shared</div>
          </div>
          <div className="p-6 rounded-lg text-center" style={{ backgroundColor: '#ffffff', border: '1px solid #e0e0e0' }}>
            <div className="text-3xl font-bold mb-1" style={{ color: '#2a2a2a' }}>{dayStreak}</div>
            <div className="text-sm" style={{ color: '#8a8a8a' }}>Day Streak</div>
          </div>
        </div>
      </div>

      {/* New Entry Modal */}
      {showNewEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}
          onClick={() => setShowNewEntry(false)}
        >
          <div
            className="max-w-3xl w-full rounded-lg"
            style={{ backgroundColor: '#ffffff', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 border-b px-6 py-4 flex justify-between items-center" style={{ backgroundColor: '#ffffff', borderColor: '#e0e0e0' }}>
              <h2 className="text-xl font-bold" style={{ color: '#1a1a1a' }}>
                New Entry
              </h2>
              <button
                onClick={() => setShowNewEntry(false)}
                className="text-3xl leading-none"
                style={{ color: '#8a8a8a' }}
              >
                ×
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6">
              <textarea
                placeholder="Write your truth here... be honest, be raw, be you."
                className="w-full p-4 rounded-lg border-2 text-base resize-none"
                style={{
                  backgroundColor: '#fafafa',
                  borderColor: '#e0e0e0',
                  color: '#2a2a2a',
                  minHeight: '300px'
                }}
                maxLength={10000}
                value={newContent}
                onChange={(e) => setNewContent(e.target.value)}
                autoFocus
              />

              {settings.showCharacterCount && (
                <div className="mt-2 text-xs" style={{ color: '#6a6a6a' }}>
                  {10000 - newContent.length} characters remaining
                </div>
              )}

              {/* Mood Tags */}
              <div className="mt-4">
                <label className="block text-sm font-medium mb-2" style={{ color: '#6a6a6a' }}>
                  How are you feeling?
                </label>
                <div className="flex flex-wrap gap-2">
                  {['anxious', 'sad', 'hopeful', 'angry', 'proud', 'confused', 'hurt', 'happy'].map((mood) => (
                    <button
                      key={mood}
                      type="button"
                      onClick={() => toggleMood(mood)}
                      className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                      style={{
                        backgroundColor: selectedMoods.includes(mood) ? '#2c2c2c' : '#f5f5f5',
                        color: selectedMoods.includes(mood) ? '#ffffff' : '#6a6a6a',
                        border: `2px solid ${selectedMoods.includes(mood) ? '#2c2c2c' : '#e0e0e0'}`
                      }}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              {/* From/To Fields - Optional - Always inline */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#6a6a6a' }}>
                  Journey <span className="text-xs font-normal" style={{ color: '#9a9a9a' }}>(optional - describe your emotional shift)</span>
                </label>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <input
                      type="text"
                      placeholder="From..."
                      className="w-full px-3 py-2.5 rounded-lg border-2 text-sm"
                      style={{
                        backgroundColor: '#fafafa',
                        borderColor: '#e0e0e0',
                        color: '#2a2a2a',
                      }}
                      value={fromField}
                      onChange={(e) => setFromField(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="To..."
                      className="w-full px-3 py-2.5 rounded-lg border-2 text-sm"
                      style={{
                        backgroundColor: '#fafafa',
                        borderColor: '#e0e0e0',
                        color: '#2a2a2a',
                      }}
                      value={toField}
                      onChange={(e) => setToField(e.target.value)}
                      maxLength={50}
                    />
                  </div>
                </div>
              </div>

              {/* Status Selection */}
              <div className="mt-6">
                <label className="block text-sm font-medium mb-2" style={{ color: '#6a6a6a' }}>
                  How do you feel about this reflection?
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      type="button"
                      onClick={() => setSelectedStatus(status.value)}
                      className="px-4 py-3 rounded-lg text-sm font-medium transition-all text-left"
                      style={{
                        backgroundColor: selectedStatus === status.value ? status.color : '#f5f5f5',
                        color: selectedStatus === status.value ? status.textColor : '#6a6a6a',
                        border: `2px solid ${selectedStatus === status.value ? status.textColor : '#e0e0e0'}`
                      }}
                    >
                      <span className="mr-2">{status.emoji}</span>
                      {status.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Privacy Options - Private Journal vs Public Post */}
              <div className="mt-6 p-6 rounded-lg border-2" style={{
                backgroundColor: shareAnonymously ? '#e5f3ff' : '#fff5e5',
                borderColor: shareAnonymously ? '#1976d2' : '#ed6c02'
              }}>
                <div className="flex items-start gap-3 mb-3">
                  <div className="flex-shrink-0 mt-1">
                    <svg className="w-6 h-6" style={{ color: shareAnonymously ? '#1976d2' : '#ed6c02' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      {shareAnonymously ? (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z" />
                      ) : (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V4a4 4 0 00-8 0v4h8z" />
                      )}
                    </svg>
                  </div>
                  <div className="flex-1">
                    <div className="font-semibold text-base mb-1" style={{ color: shareAnonymously ? '#1976d2' : '#ed6c02' }}>
                      {shareAnonymously ? '🌍 Public Post (Anonymous)' : '🔒 Private Journal Entry'}
                    </div>
                    <p className="text-sm leading-relaxed" style={{ color: '#4a4a4a' }}>
                      {shareAnonymously
                        ? 'Will be shared anonymously on the public feed for others to see and connect with'
                        : 'Only you can see this - completely private and secure in your personal journal'
                      }
                    </p>
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg transition-all hover:bg-black hover:bg-opacity-5">
                  <div className="relative">
                    <input
                      type="checkbox"
                      className="sr-only peer"
                      checked={shareAnonymously}
                      onChange={(e) => setShareAnonymously(e.target.checked)}
                    />
                    <div className="w-14 h-7 rounded-full transition-colors peer-checked:bg-blue-600" style={{ backgroundColor: shareAnonymously ? '#1976d2' : '#d0d0d0' }}></div>
                    <div className="absolute left-1 top-1 w-5 h-5 bg-white rounded-full transition-transform" style={{
                      transform: shareAnonymously ? 'translateX(28px)' : 'translateX(0)'
                    }}></div>
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#2a2a2a' }}>
                    {shareAnonymously ? 'Share publicly' : 'Keep private'}
                  </span>
                </label>
              </div>

              {/* Actions */}
              <div className="mt-6 flex gap-3">
                <button
                  type="button"
                  onClick={handleSaveEntry}
                  disabled={saving || !newContent.trim()}
                  className="flex-1 px-6 py-3 rounded-lg font-medium transition-all hover:opacity-80 disabled:opacity-50"
                  style={{ backgroundColor: '#2c2c2c', color: '#ffffff' }}
                >
                  {saving ? 'Saving...' : 'Save Entry'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowNewEntry(false)}
                  disabled={saving}
                  className="px-6 py-3 rounded-lg font-medium transition-all hover:opacity-80"
                  style={{ backgroundColor: '#f5f5f5', color: '#6a6a6a' }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteConfirmModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="max-w-md w-full rounded-xl bg-white p-8 shadow-2xl border" style={{ borderColor: '#e0e0e0' }}>
            <div className="space-y-4">
              <div className="text-xl font-semibold" style={{ color: '#2a2a2a' }}>
                {deleteConfirmModal.isPublished ? 'Delete Public Post?' : 'Delete Private Entry?'}
              </div>
              <div className="text-sm" style={{ color: '#6a6a6a' }}>
                {deleteConfirmModal.isPublished && deleteConfirmModal.hoursRemaining ? (
                  <>
                    You have {deleteConfirmModal.hoursRemaining} hour{deleteConfirmModal.hoursRemaining !== 1 ? 's' : ''} remaining to delete this post.
                    After that, it becomes permanent to preserve the community.
                  </>
                ) : (
                  'Are you sure you want to delete this entry? This action cannot be undone.'
                )}
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#d32f2f', color: '#fff' }}
                  onClick={() => {
                    setDeleteConfirmModal(null)
                    executeDelete(deleteConfirmModal.entryId)
                  }}
                >
                  Delete
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#f5f5f5', color: '#2a2a2a', border: '1px solid #e0e0e0' }}
                  onClick={() => setDeleteConfirmModal(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {permanentDeleteConfirmModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="max-w-md w-full rounded-xl bg-white p-8 shadow-2xl border" style={{ borderColor: '#e0e0e0' }}>
            <div className="space-y-4">
              <div className="text-xl font-semibold" style={{ color: '#d32f2f' }}>
                Permanently Delete Post?
              </div>
              <div className="text-sm" style={{ color: '#2a2a2a' }}>
                This will permanently delete this post and use 1 of your 50 permanent deletes. This action cannot be undone.
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#d32f2f', color: '#fff' }}
                  onClick={() => {
                    setPermanentDeleteConfirmModal(null)
                    executePermanentDelete(permanentDeleteConfirmModal.entryId)
                  }}
                >
                  Permanently Delete
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#f5f5f5', color: '#2a2a2a', border: '1px solid #e0e0e0' }}
                  onClick={() => setPermanentDeleteConfirmModal(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Publish Confirmation Modal */}
      {publishConfirmModal?.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div className="max-w-md w-full rounded-xl bg-white p-8 shadow-2xl border" style={{ borderColor: '#e0e0e0' }}>
            <div className="space-y-4">
              <div className="text-xl font-semibold" style={{ color: '#2a2a2a' }}>
                Share Anonymously?
              </div>
              <div className="text-sm" style={{ color: '#6a6a6a' }}>
                Share this entry anonymously to the public feed? It will be visible to everyone but your identity will remain private.
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#1976d2', color: '#fff' }}
                  onClick={() => {
                    setPublishConfirmModal(null)
                    executePublish(publishConfirmModal.entryId, publishConfirmModal.moods)
                  }}
                >
                  Share
                </button>
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#f5f5f5', color: '#2a2a2a', border: '1px solid #e0e0e0' }}
                  onClick={() => setPublishConfirmModal(null)}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
