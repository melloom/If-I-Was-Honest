'use client'

import { useState, useEffect, useCallback, useMemo, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase-client'
import { AppHeader } from '@/components/AppHeader'
import { ErrorToast } from '@/components/ErrorToast'
import FeedCard from '@/components/FeedCard'

interface PublishedEntry {
  id: string
  content: string
  publishedAt: string
  to?: string
  from?: string
  moods: {
    name: string
    color: string | null
  }[]
  userId?: string // Add userId for ownership check
  status?: string // Add status for badge display
}

// Status options for badge display
const STATUS_OPTIONS = [
  { value: 'NO_STATUS', label: 'No status', emoji: '—', color: '#F5F5F5', textColor: '#9e9e9e' },
  { value: 'STILL_TRUE', label: 'Still true', emoji: '✓', color: '#E5F3FF', textColor: '#1976d2' },
  { value: 'IVE_GROWN', label: "I've grown", emoji: '🌱', color: '#E5FFE5', textColor: '#2e7d32' },
  { value: 'I_WAS_COPING', label: 'I was coping', emoji: '🛡️', color: '#FFF5E5', textColor: '#ed6c02' },
  { value: 'I_LIED', label: 'I lied to myself', emoji: '👁️', color: '#FFE5F5', textColor: '#9c27b0' },
]
interface FeedResponse {
  entries: PublishedEntry[]
  total: number
  hasMore: boolean
}

function formatTimeAgo(dateString: string): string {
  const now = new Date()
  const date = new Date(dateString)
  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  if (seconds < 60) return `${seconds}s ago`
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  const weeks = Math.floor(days / 7)
  if (weeks < 4) return `${weeks}w ago`
  const months = Math.floor(days / 30)
  if (months < 12) return `${months}mo ago`
  return `${Math.floor(days / 365)}y ago`
}

export default function FeedClient() {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchInput, setSearchInput] = useState('')
  const [selectedMood, setSelectedMood] = useState<string | null>(null)
  const [showWriteModal, setShowWriteModal] = useState(false)
  const [selectedEntry, setSelectedEntry] = useState<PublishedEntry | null>(null)
  const [entries, setEntries] = useState<PublishedEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const postsPerPage = 25
  const { user, idToken } = useFirebaseAuth()
  const [deleteConfirmModal, setDeleteConfirmModal] = useState<{ show: boolean; entryId: string } | null>(null)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [typedText, setTypedText] = useState('')
  const fullText = "If I was honest..."
  const [isDesktop, setIsDesktop] = useState(false)
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isNavOpen, setIsNavOpen] = useState(false)
  
  // Refs for stable references
  const currentPageRef = useRef(currentPage)
  currentPageRef.current = currentPage

  // Set mounted to true after component mounts (client-side only)
  useEffect(() => {
    setMounted(true)
  }, [])

  // Debug logging
  useEffect(() => {
    console.log('[Feed] Auth state:', {
      hasUser: !!user,
      userId: user?.uid,
      hasToken: !!idToken,
      tokenPreview: idToken ? `${idToken.substring(0, 20)}...` : null
    })
  }, [user, idToken])

  const [newContent, setNewContent] = useState('')
  const [toField, setToField] = useState('')
  const [fromField, setFromField] = useState('')
  const [selectedMoods, setSelectedMoods] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false) // Extra safeguard

  // Typing animation effect - continuous loop
  useEffect(() => {
    let currentIndex = 0
    let isDeleting = false

    const typingInterval = setInterval(() => {
      if (!isDeleting) {
        // Typing phase
        if (currentIndex <= fullText.length) {
          setTypedText(fullText.slice(0, currentIndex))
          currentIndex++
        } else {
          // Pause at full text before deleting
          setTimeout(() => {
            isDeleting = true
          }, 2000)
        }
      } else {
        // Deleting phase
        if (currentIndex > 0) {
          currentIndex--
          setTypedText(fullText.slice(0, currentIndex))
        } else {
          // Reset to start typing again
          isDeleting = false
          currentIndex = 0
        }
      }
    }, isDeleting ? 50 : 100)

    return () => clearInterval(typingInterval)
  }, [])

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearchQuery(searchInput)
    }, 500)

    return () => clearTimeout(timer)
  }, [searchInput])

  // Track viewport to apply rotation only on desktop
  useEffect(() => {
    const updateViewport = () => {
      try {
        setIsDesktop(window.innerWidth >= 1024) // Tailwind lg breakpoint
      } catch {}
    }
    updateViewport()
    window.addEventListener('resize', updateViewport)
    return () => window.removeEventListener('resize', updateViewport)
  }, [])

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = () => {
      if (statusDropdownOpen) {
        setStatusDropdownOpen(null)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [statusDropdownOpen])

  // Memoized fetch function
  const fetchEntries = useCallback(async (page: number = 1, isBackground = false) => {
    console.log('[Feed] Fetching public feed entries for page', page)
    try {
      // Only show loading state for non-background fetches
      if (!isBackground) {
        setLoading(true)
      }
      const offset = (page - 1) * postsPerPage
      const params = new URLSearchParams({
        limit: postsPerPage.toString(),
        offset: offset.toString(),
      })

      if (selectedMood) {
        params.append('mood', selectedMood)
      }

      if (searchQuery) {
        params.append('search', searchQuery)
      }

      const response = await fetch(`/api/feed?${params}`, {
        headers: idToken ? { Authorization: `Bearer ${idToken}` } : undefined,
      })

      if (!response.ok) {
        let errorData: { error?: string; details?: string } = {}
        let errorMessage = `HTTP ${response.status}: ${response.statusText}`
        try {
          const contentType = response.headers.get('content-type')
          if (contentType && contentType.includes('application/json')) {
            errorData = await response.json()
            errorMessage = errorData.error || errorData.details || errorMessage
          } else {
            const text = await response.text()
            errorMessage = text || errorMessage
          }
        } catch (e) {
          console.error('[Feed] Failed to parse error response:', e)
        }
        console.error('[Feed] API error:', {
          status: response.status,
          statusText: response.statusText,
          errorMessage,
          errorData,
          url: `/api/feed?${params}`
        })
        throw new Error(errorMessage)
      }

      const data: FeedResponse = await response.json()

      setEntries(data.entries)
      setTotalCount(data.total)
      setHasMore(data.hasMore)
      setCurrentPage(page)

      // Scroll to top when changing pages (not for background refresh)
      if (!isBackground) {
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
      } catch (error) {
      console.error('Error fetching feed:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch feed'
      if (!isBackground) {
        setErrorMessage(errorMsg)
      }
    } finally {
      if (!isBackground) {
        setLoading(false)
      }
    }
  }, [selectedMood, searchQuery, idToken, postsPerPage])

  // Fetch entries (public, no auth required)
  useEffect(() => {
    console.log('[Feed] useEffect triggered - fetching public feed')
    setCurrentPage(1)
    fetchEntries(1)
  }, [fetchEntries])

  // Auto-refresh feed every 60 seconds (increased from 30s for better performance)
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Feed] Auto-refreshing feed (background)')
      fetchEntries(currentPageRef.current, true)
    }, 60000) // 60 seconds - reduced frequency

    return () => clearInterval(interval)
  }, [fetchEntries])

  // Memoized page change handler with smooth transition
  const handlePageChange = useCallback((page: number) => {
    setIsTransitioning(true)
    // Small delay to allow fade-out before fetching
    setTimeout(() => {
      fetchEntries(page).finally(() => {
        // Fade back in after content loads
        setTimeout(() => setIsTransitioning(false), 50)
      })
    }, 150)
  }, [fetchEntries])

  const totalPages = useMemo(() => Math.ceil(totalCount / postsPerPage), [totalCount, postsPerPage])

  // Check if entry can be deleted (within 24 hours of publishing)
  const canDeleteEntry = useCallback((publishedAt: string) => {
    const published = new Date(publishedAt)
    const now = new Date()
    const hoursSincePublished = (now.getTime() - published.getTime()) / (1000 * 60 * 60)
    return hoursSincePublished < 24
  }, [])

  // Delete published entry - show confirmation modal
  const handleDeletePublishedEntry = useCallback((entryId: string) => {
    setDeleteConfirmModal({ show: true, entryId })
  }, [])

  // Execute delete after confirmation
  const executeDeletePublishedEntry = useCallback(async (entryId: string) => {
    try {
      const response = await fetch(`/api/feed/${entryId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${idToken}` },
      })

      if (!response.ok) {
        throw new Error('Failed to delete entry')
      }

      setSelectedEntry(null)
      setDeleteConfirmModal(null)
      fetchEntries(1) // Go back to page 1 after delete
    } catch (error) {
      console.error('Error deleting entry:', error)
      setErrorMessage('Failed to delete entry. Please try again.')
      setDeleteConfirmModal(null)
    }
  }, [idToken, fetchEntries])

  // Handle status change for owned entries - memoized
  const handleStatusChange = useCallback(async (entryId: string, newStatus: string) => {
    try {
      // Wait for token if not immediately available (retry up to 3 times)
      let token = idToken
      let retries = 0
      while (!token && user && retries < 3) {
        console.log(`[Feed] Token not ready, waiting... (attempt ${retries + 1}/3)`)
        await new Promise(resolve => setTimeout(resolve, 500))

        // Try to force refresh the token
        if (user && !token) {
          try {
            const freshToken = await user.getIdToken(true)
            token = freshToken
            console.log('[Feed] Force refreshed token')
          } catch (e) {
            console.error('[Feed] Token refresh failed:', e)
          }
        } else {
          token = idToken
        }
        retries++
      }

      if (!token) {
        console.error('[Feed] No auth token available after retries')
        setErrorMessage('Authentication failed. Please refresh the page and try again.')
        return
      }

      console.log('[Feed] Updating status:', { entryId, newStatus, hasToken: !!token })

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

        if (response.status === 429) {
          setErrorMessage(`Rate limit: ${errorMessage}`)
        } else if (response.status === 401) {
          setErrorMessage('Authentication expired. Please refresh the page.')
        } else {
          setErrorMessage(errorMessage)
        }

        console.error('Status update failed:', errorMessage)
        return
      }

      // Update local state
      setEntries((prev) =>
        prev.map((entry) =>
          entry.id === entryId ? { ...entry, status: newStatus } : entry
        )
      )

      // Close dropdown
      setStatusDropdownOpen(null)

      console.log('[Feed] Status updated successfully')
    } catch (error) {
      console.error('Error updating status:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to update status'
      setErrorMessage(errorMsg)
      setTimeout(() => setErrorMessage(null), 5000)
    }
  }, [idToken, user])

  // Memoized handlers for FeedCard
  const handleCardClick = useCallback((entry: PublishedEntry) => {
    setSelectedEntry(entry)
  }, [])

  const handleStatusDropdownToggle = useCallback((entryId: string | null) => {
    setStatusDropdownOpen(entryId)
  }, [])

  // Generate consistent pastel color from entry ID
  const getCardColor = (entryId: string) => {
    const colors = [
      '#FFE5E5', // light pink
      '#FFE5CC', // light peach
      '#FFF4CC', // light yellow
      '#E5F9E5', // light mint
      '#E5F4FF', // light blue
      '#F0E5FF', // light purple
      '#FFE5F4', // light rose
      '#E5FFF9', // light cyan
      '#FFF0E5', // light coral
      '#F4E5FF', // light lavender
      '#E5FFE5', // light green
      '#FFE5EB', // light salmon
    ]

    // Hash the entry ID to get consistent color
    let hash = 0
    for (let i = 0; i < entryId.length; i++) {
      hash = entryId.charCodeAt(i) + ((hash << 5) - hash)
    }
    return colors[Math.abs(hash) % colors.length]
  }

  const toggleMood = (mood: string) => {
    setSelectedMoods((prev) =>
      prev.includes(mood)
        ? prev.filter((m) => m !== mood)
        : [...prev, mood]
    )
  }

  const swapToFromFields = () => {
    const temp = toField
    setToField(fromField)
    setFromField(temp)
  }

  const handleSaveEntry = async () => {
    if (!user) {
      setErrorMessage('Please sign in to share your thoughts')
      return
    }

    if (!newContent.trim()) {
      setErrorMessage('Please write something first')
      return
    }

    // Prevent double-submission with dual safeguards
    if (saving || isSubmitting) {
      console.log('[Feed] Prevented duplicate submission')
      return
    }

    try {
      setSaving(true)
      setIsSubmitting(true)

      console.log('[Feed] Submitting entry with moods:', selectedMoods)

      const response = await fetch('/api/entries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(idToken ? { Authorization: `Bearer ${idToken}` } : {}) },
        body: JSON.stringify({
          content: newContent,
          to: toField || undefined,
          from: fromField || undefined,
          moods: selectedMoods,
          shareAnonymously: true, // Always share anonymously from feed
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to save entry')
      }

      const result = await response.json()
      console.log('[Feed] Entry saved successfully:', result)

      // Reset form and close modal
      setNewContent('')
      setToField('')
      setFromField('')
      setSelectedMoods([])
      setShowWriteModal(false)

      // Refresh feed to show new entry - wait a bit for server to process
      setTimeout(() => {
        fetchEntries(1)
      }, 500)

      // Success - modal will close automatically
    } catch (error) {
      console.error('Error saving entry:', error)
      setErrorMessage(error instanceof Error ? error.message : 'Failed to save entry. Please try again.')
    } finally {
      setSaving(false)
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAF8F3' }}>
      <AppHeader onNavOpenChange={setIsNavOpen} />

      {/* Feed Header Section */}
      <div className="max-w-4xl mx-auto px-4 py-6 border-b" style={{ borderColor: '#E8E4DC' }}>
        {/* App title */}
        <div className="flex items-center justify-center mb-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-0.5 bg-gradient-to-r from-transparent to-black/20"></div>
            <h1
              className="text-4xl md:text-5xl font-black text-center"
              style={{
                color: '#000000',
                textShadow: '0 1px 2px rgba(0,0,0,0.05)',
                letterSpacing: '-0.02em'
              }}
            >
              TheHonestProject
            </h1>
            <div className="w-12 h-0.5 bg-gradient-to-l from-transparent to-black/20"></div>
          </div>
        </div>

        {/* Typing animation subheader */}
        <p className="text-center text-xl md:text-2xl font-light mb-1 min-h-[2rem]" style={{ color: '#4a4a4a' }}>
          {typedText}
          <span className="animate-pulse" style={{ color: '#4a4a4a' }}>|</span>
        </p>

        {/* Post count */}
        <div className="flex items-center justify-center gap-3 mb-6">
          <p className="text-xs" style={{ color: '#9B9B9B' }}>
            {mounted ? totalCount.toLocaleString() : totalCount} posts found
            {selectedMood && (
              <span className="ml-2 font-semibold" style={{ color: '#667eea' }}>
                (filtered by {selectedMood})
              </span>
            )}
          </p>
          <button
            onClick={() => fetchEntries(currentPage)}
            disabled={loading}
            className="p-1.5 rounded-full hover:bg-gray-100 transition-all disabled:opacity-50"
            title="Refresh feed"
          >
            <svg
              className="w-4 h-4"
              style={{ color: '#9B9B9B' }}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
              />
            </svg>
          </button>
        </div>

        {/* Search bar */}
        <div className="relative mb-4">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none">
            <svg className="w-5 h-5" style={{ color: '#9B9B9B' }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by name (To:), mood, or keyword…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-12 pr-4 py-3 rounded-full text-base focus:outline-none focus:ring-2 transition-all"
            style={{
              backgroundColor: '#FFFFFF',
              color: '#1A1A1A',
              border: '1px solid #E8E4DC',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.04)',
            }}
          />
        </div>

        {/* Mood Filter */}
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedMood(null)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all"
            style={{
              backgroundColor: !selectedMood ? '#1A1A1A' : '#F5F3EF',
              color: !selectedMood ? '#FFFFFF' : '#6B6B6B',
              border: '1px solid ' + (!selectedMood ? '#1A1A1A' : '#E8E4DC')
            }}
          >
            All
          </button>
          {['Love', 'Regret', 'Family', 'Gratitude', 'Hurt', 'Hope', 'Anger', 'Growth'].map((mood) => (
            <button
              key={mood}
              onClick={() => setSelectedMood(mood.toLowerCase())}
              className="px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: selectedMood === mood.toLowerCase() ? '#1A1A1A' : '#F5F3EF',
                color: selectedMood === mood.toLowerCase() ? '#FFFFFF' : '#6B6B6B',
                border: '1px solid ' + (selectedMood === mood.toLowerCase() ? '#1A1A1A' : '#E8E4DC')
              }}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>

      {/* Pagination - Top */}
      {totalPages > 1 && !loading && (
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#F5F3EF', color: '#6B6B6B', border: '1px solid #E8E4DC' }}
            >
              ← Prev
            </button>

            <div className="flex items-center gap-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                // Show first page, last page, current page, and pages around current
                const showPage =
                  page === 1 ||
                  page === totalPages ||
                  (page >= currentPage - 1 && page <= currentPage + 1)

                if (!showPage) {
                  // Show ellipsis
                  if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-2" style={{ color: '#9B9B9B' }}>...</span>
                  }
                  return null
                }

                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className="w-10 h-10 rounded-lg font-medium transition-all"
                    style={{
                      backgroundColor: currentPage === page ? '#1A1A1A' : '#F5F3EF',
                      color: currentPage === page ? '#FFFFFF' : '#6B6B6B',
                      border: '1px solid ' + (currentPage === page ? '#1A1A1A' : '#E8E4DC')
                    }}
                  >
                    {page}
                  </button>
                )
              })}
            </div>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
              style={{ backgroundColor: '#F5F3EF', color: '#6B6B6B', border: '1px solid #E8E4DC' }}
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Feed list */}
      <main className="max-w-4xl mx-auto px-4 pb-32">
        {loading && entries.length === 0 ? (
          <div className="text-center py-20">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: '#6B6B6B' }}></div>
          </div>
        ) : entries.length === 0 ? (
          <div className="text-center py-20">
            <p className="text-lg font-medium mb-2" style={{ color: '#4A4A4A' }}>
              No posts found.
            </p>
            <p className="text-sm" style={{ color: '#9B9B9B' }}>
              {searchQuery ? 'Try another keyword.' : 'Be the first to share.'}
            </p>
          </div>
        ) : (
          <div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 items-start"
            style={{ 
              contentVisibility: 'auto',
              containIntrinsicSize: '0 500px',
              opacity: isTransitioning ? 0 : 1,
              transform: isTransitioning ? 'translateY(10px)' : 'translateY(0)',
              transition: 'opacity 200ms ease-out, transform 200ms ease-out'
            }}
          >
            {entries.map((entry) => (
              <FeedCard
                key={entry.id}
                entry={entry}
                isDesktop={isDesktop}
                mounted={mounted}
                userId={user?.uid}
                statusOptions={STATUS_OPTIONS}
                statusDropdownOpen={statusDropdownOpen}
                onCardClick={handleCardClick}
                onStatusDropdownToggle={handleStatusDropdownToggle}
                onStatusChange={handleStatusChange}
              />
            ))}
          </div>
        )}

        {/* Pagination - Bottom */}
        {totalPages > 1 && !loading && (
          <div className="py-8">
            <div className="flex items-center justify-center gap-2">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#F5F3EF', color: '#6B6B6B', border: '1px solid #E8E4DC' }}
              >
                ← Prev
              </button>

              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  const showPage =
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)

                  if (!showPage) {
                    // Show ellipsis
                    if (page === currentPage - 2 || page === currentPage + 2) {
                      return <span key={page} className="px-2" style={{ color: '#9B9B9B' }}>...</span>
                    }
                    return null
                  }

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className="w-10 h-10 rounded-lg font-medium transition-all"
                      style={{
                        backgroundColor: currentPage === page ? '#1A1A1A' : '#F5F3EF',
                        color: currentPage === page ? '#FFFFFF' : '#6B6B6B',
                        border: '1px solid ' + (currentPage === page ? '#1A1A1A' : '#E8E4DC')
                      }}
                    >
                      {page}
                    </button>
                  )
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                style={{ backgroundColor: '#F5F3EF', color: '#6B6B6B', border: '1px solid #E8E4DC' }}
              >
                Next →
              </button>
            </div>

            <div className="text-center mt-4 text-sm" style={{ color: '#9B9B9B' }}>
              Page {currentPage} of {totalPages}
            </div>
          </div>
        )}
      </main>

      {/* Floating Action Button - Only for authenticated users, hidden when nav menu is open */}
      {user && (
        <button
          onClick={() => !isNavOpen && setShowWriteModal(true)}
          disabled={isNavOpen}
          aria-hidden={isNavOpen}
          className={`fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full flex items-center gap-3 shadow-xl transition-all font-semibold text-base ${
            isNavOpen 
              ? 'opacity-0 pointer-events-none scale-95' 
              : 'hover:scale-105 z-50'
          }`}
          style={{ 
            backgroundColor: isNavOpen ? '#9B9B9B' : '#1A1A1A', 
            color: '#FFFFFF',
            zIndex: isNavOpen ? 30 : 50
          }}
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
          </svg>
          <span>Write a message…</span>
        </button>
      )}

      {/* Entry Detail Modal */}
      {selectedEntry && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setSelectedEntry(null)}
        >
          <div
            className="relative max-w-2xl w-full rounded-3xl overflow-hidden"
            style={{
              backgroundColor: getCardColor(selectedEntry.id),
              maxHeight: '90vh',
              overflowY: 'auto',
              boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
              border: '1px solid rgba(0, 0, 0, 0.1)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Paper texture overlay */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='100' height='100' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' /%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100' height='100' filter='url(%23noise)' opacity='0.05'/%3E%3C/svg%3E")`,
                mixBlendMode: 'multiply',
              }}
            />

            {/* Content - relative positioning to appear above texture */}
            <div className="relative z-10">
              {/* Header */}
              <div className="px-6 py-5 border-b flex justify-between items-start" style={{ borderColor: 'rgba(0, 0, 0, 0.1)' }}>
                <div>
                  {/* Only show "To:" if there's an actual recipient */}
                  {selectedEntry.to && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium uppercase tracking-wide" style={{ color: '#9B9B9B' }}>
                        To:
                      </span>
                      <span className="text-xl font-semibold" style={{ color: '#1A1A1A' }}>
                        {selectedEntry.to}
                      </span>
                    </div>
                  )}
                  {/* Only show "From:" if there's an actual sender */}
                  {selectedEntry.from && (
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium uppercase tracking-wide" style={{ color: '#9B9B9B' }}>
                        From:
                      </span>
                      <span className="text-lg font-semibold" style={{ color: '#1A1A1A' }}>
                        {selectedEntry.from}
                      </span>
                    </div>
                  )}
                  {/* Timestamp */}
                  <div className="text-xs" style={{ color: '#9B9B9B' }}>
                    {mounted ? formatTimeAgo(selectedEntry.publishedAt) : ''} {mounted && '·'} {mounted ? new Date(selectedEntry.publishedAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    }) : selectedEntry.publishedAt}
                  </div>
                </div>
                <button
                  onClick={() => setSelectedEntry(null)}
                  className="text-3xl leading-none hover:opacity-70 transition-opacity flex-shrink-0"
                  style={{ color: '#6B6B6B' }}
                >
                  ×
                </button>
              </div>

              {/* Content */}
              <div className="p-6">
                <p className="text-lg leading-relaxed whitespace-pre-wrap mb-6" style={{ color: '#1A1A1A' }}>
                  {selectedEntry.content}
                </p>

                {/* Tags */}
                {selectedEntry.moods.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-6">
                    {selectedEntry.moods.map((mood, idx) => (
                      <span
                        key={idx}
                        className="text-sm font-medium px-4 py-2 rounded-full"
                        style={{
                          backgroundColor: 'rgba(255, 255, 255, 0.7)',
                          color: '#6B6B6B',
                          backdropFilter: 'blur(8px)'
                        }}
                      >
                        {mood.name}
                      </span>
                    ))}
                  </div>
                )}

                {/* Footer - delete button removed from feed view */}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Write Modal - Full Editor */}
      {showWriteModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
          style={{ backgroundColor: 'rgba(0, 0, 0, 0.85)' }}
          onClick={() => setShowWriteModal(false)}
        >
          <div
            className="max-w-2xl w-full rounded-3xl overflow-hidden"
            style={{ backgroundColor: '#FFFFFF', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-5 border-b flex justify-between items-center" style={{ borderColor: '#E8E4DC' }}>
              <h2 className="text-xl font-bold" style={{ color: '#1A1A1A' }}>
                Write a message
              </h2>
              <button
                onClick={() => setShowWriteModal(false)}
                className="text-3xl leading-none hover:opacity-70 transition-opacity"
                style={{ color: '#6B6B6B' }}
              >
                ×
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {!user ? (
                <div className="text-center py-12">
                  <p className="text-lg mb-4" style={{ color: '#4A4A4A' }}>
                    Please sign in to share your message
                  </p>
                  <Link
                    href="/auth/signin"
                    className="inline-block px-6 py-3 rounded-full font-medium transition-all hover:opacity-80"
                    style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
                  >
                    Sign In
                  </Link>
                </div>
              ) : (
                <>
                  <div className="mb-4 space-y-3">
                    {/* To Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B6B6B' }}>
                        To:
                      </label>
                      <input
                        type="text"
                        placeholder="Name (e.g., Devon, Mom, Anonymous)"
                        value={toField}
                        onChange={(e) => setToField(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: '#FAF8F3',
                          border: '1px solid #E8E4DC',
                          color: '#1A1A1A',
                        }}
                        maxLength={100}
                      />
                    </div>

                    {/* Swap Button */}
                    <div className="flex justify-center">
                      <button
                        type="button"
                        onClick={swapToFromFields}
                        className="px-3 py-2 rounded-lg text-sm font-medium transition-all hover:opacity-80"
                        style={{
                          backgroundColor: '#F5F3EF',
                          border: '1px solid #E8E4DC',
                          color: '#6B6B6B',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '6px'
                        }}
                        title="Swap To and From fields"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m0 0l4 4m10-4v12m0 0l4-4m0 0l-4-4" />
                        </svg>
                        Swap
                      </button>
                    </div>

                    {/* From Field */}
                    <div>
                      <label className="block text-sm font-medium mb-2" style={{ color: '#6B6B6B' }}>
                        From:
                      </label>
                      <input
                        type="text"
                        placeholder="Your name or sender (optional)"
                        value={fromField}
                        onChange={(e) => setFromField(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl text-base focus:outline-none focus:ring-2 transition-all"
                        style={{
                          backgroundColor: '#FAF8F3',
                          border: '1px solid #E8E4DC',
                          color: '#1A1A1A',
                        }}
                        maxLength={100}
                      />
                    </div>
                  </div>

                  <textarea
                    placeholder="Write what you couldn't say out loud…"
                    className="w-full p-4 rounded-xl text-base resize-none focus:outline-none focus:ring-2 transition-all"
                    style={{
                      backgroundColor: '#FAF8F3',
                      border: '1px solid #E8E4DC',
                      color: '#1A1A1A',
                      minHeight: '200px'
                    }}
                    maxLength={10000}
                    value={newContent}
                    onChange={(e) => setNewContent(e.target.value)}
                    autoFocus
                  />

                  <div className="mt-2 text-xs" style={{ color: '#9B9B9B' }}>
                    {newContent.length} / 10,000 characters
                  </div>

                  {/* Mood Tags */}
                  <div className="mt-6">
                    <label className="block text-sm font-medium mb-3" style={{ color: '#6B6B6B' }}>
                      How does this make you feel?
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {['Love', 'Regret', 'Family', 'Gratitude', 'Hurt', 'Hope', 'Anger', 'Growth'].map((mood) => (
                        <button
                          key={mood}
                          type="button"
                          onClick={() => toggleMood(mood.toLowerCase())}
                          className="px-4 py-2 rounded-full text-sm font-medium transition-all"
                          style={{
                            backgroundColor: selectedMoods.includes(mood.toLowerCase()) ? '#1A1A1A' : '#F5F3EF',
                            color: selectedMoods.includes(mood.toLowerCase()) ? '#FFFFFF' : '#6B6B6B',
                            border: '1px solid ' + (selectedMoods.includes(mood.toLowerCase()) ? '#1A1A1A' : '#E8E4DC')
                          }}
                        >
                          {mood}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Privacy Notice */}
                  <div className="mt-6 p-4 rounded-xl" style={{ backgroundColor: '#EFF6FF', border: '1px solid #DBEAFE' }}>
                    <div className="flex items-start gap-3">
                      <svg className="w-5 h-5 mt-0.5 flex-shrink-0" style={{ color: '#3B82F6' }} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                      </svg>
                      <div>
                        <p className="text-sm font-medium" style={{ color: '#1E40AF' }}>
                          Your message will be shared anonymously
                        </p>
                        <p className="text-xs mt-1" style={{ color: '#3B82F6' }}>
                          No one will know it's from you. Your identity is protected.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="mt-6 flex gap-3">
                    <button
                      type="button"
                      onClick={handleSaveEntry}
                      disabled={saving || !newContent.trim()}
                      className="flex-1 px-6 py-3 rounded-full font-medium transition-all hover:opacity-80 disabled:opacity-50"
                      style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
                    >
                      {saving ? 'Sending…' : 'Send message'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowWriteModal(false)}
                      disabled={saving}
                      className="px-6 py-3 rounded-full font-medium transition-all hover:opacity-80"
                      style={{ backgroundColor: '#F5F3EF', color: '#6B6B6B', border: '1px solid #E8E4DC' }}
                    >
                      Cancel
                    </button>
                  </div>
                </>
              )}
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
                Delete Published Entry?
              </div>
              <div className="text-sm" style={{ color: '#6a6a6a' }}>
                Are you sure you want to delete this published entry? This action cannot be undone.
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  className="px-4 py-2 rounded-lg font-medium transition-all hover:opacity-90"
                  style={{ backgroundColor: '#d32f2f', color: '#fff' }}
                  onClick={() => {
                    if (deleteConfirmModal?.entryId) {
                      executeDeletePublishedEntry(deleteConfirmModal.entryId)
                    }
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

      {/* Error Toast */}
      {errorMessage && (
        <ErrorToast message={errorMessage} onClose={() => setErrorMessage(null)} />
      )}
    </div>
  )
}
