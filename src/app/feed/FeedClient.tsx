'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase-client'
import { AppHeader } from '@/components/AppHeader'
import { ErrorToast } from '@/components/ErrorToast'

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
  const [statusDropdownOpen, setStatusDropdownOpen] = useState<string | null>(null) // Track which entry's dropdown is open

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

  const fetchEntries = async (page: number = 1) => {
    console.log('[Feed] Fetching public feed entries for page', page)
    try {
      setLoading(true)
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

      // Scroll to top when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' })
      } catch (error) {
      console.error('Error fetching feed:', error)
      const errorMsg = error instanceof Error ? error.message : 'Failed to fetch feed'
      setErrorMessage(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  // Fetch entries (public, no auth required)
  useEffect(() => {
    console.log('[Feed] useEffect triggered - fetching public feed')
    setCurrentPage(1)
    fetchEntries(1)
  }, [selectedMood, searchQuery])

  // Auto-refresh feed every 30 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      console.log('[Feed] Auto-refreshing feed')
      fetchEntries(currentPage)
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [selectedMood, searchQuery, currentPage])

  const handlePageChange = (page: number) => {
    fetchEntries(page)
  }

  const totalPages = Math.ceil(totalCount / postsPerPage)

  // Check if entry can be deleted (within 24 hours of publishing)
  const canDeleteEntry = (publishedAt: string) => {
    const published = new Date(publishedAt)
    const now = new Date()
    const hoursSincePublished = (now.getTime() - published.getTime()) / (1000 * 60 * 60)
    return hoursSincePublished < 24
  }

  // Delete published entry - show confirmation modal
  const handleDeletePublishedEntry = (entryId: string) => {
    setDeleteConfirmModal({ show: true, entryId })
  }

  // Execute delete after confirmation
  const executeDeletePublishedEntry = async (entryId: string) => {
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
  }

  // Handle status change for owned entries
  const handleStatusChange = async (entryId: string, newStatus: string) => {
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
  }

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
      <AppHeader />

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {entries.map((entry) => {
              const preview = entry.content.length > 120
                ? entry.content.substring(0, 120).trim()
                : entry.content
              const hasMore = entry.content.length > 120
              const primaryMood = entry.moods[0]?.name || null
              const timeAgo = mounted ? formatTimeAgo(entry.publishedAt) : ''
              const cardColor = getCardColor(entry.id)

              // Status badge (display only)
              const statusOption = STATUS_OPTIONS.find(s => s.value === entry.status) || STATUS_OPTIONS[0]

              // Generate varied rotation for note effect (more visible)
              const getRotation = (id: string) => {
                let hash = 0
                for (let i = 0; i < id.length; i++) {
                  hash = (id.charCodeAt(i) + ((hash << 5) - hash)) | 0
                }
                // Random rotation between -5 and 5 degrees for MORE variety
                const rotation = ((Math.abs(hash) % 100) - 50) / 10
                return rotation
              }

              // Generate MORE offset for scattered look
              const getOffset = (id: string, axis: 'x' | 'y') => {
                let hash = 0
                for (let i = 0; i < id.length; i++) {
                  hash = (id.charCodeAt(i) * (axis === 'x' ? 7 : 13) + ((hash << 3) - hash)) | 0
                }
                // Larger offset between -8px and 8px
                return ((Math.abs(hash) % 17) - 8)
              }

              // Generate unique tape positions for each card - different locations
              const getTapePosition = (id: string, side: 'left' | 'right') => {
                let hash = 0
                for (let i = 0; i < id.length; i++) {
                  hash = (id.charCodeAt(i) * (side === 'left' ? 17 : 23) + ((hash << 4) - hash)) | 0
                }
                // Determine tape location: 0=top, 1=bottom, 2=left side, 3=right side
                const location = Math.abs(hash) % 4

                // Random position along edge (10-30% from corner)
                const position = 10 + (Math.abs(hash) % 21)
                const rotation = ((Math.abs(hash) % 12) - 6) // -6 to +6 degrees
                const width = 18 + (Math.abs(hash) % 10) // 18-28px base width

                return {
                  position: `${position}%`,
                  rotation,
                  width,
                  location // 0=top, 1=bottom, 2=left, 3=right
                }
              }

              // Generate better positioned creases - more natural placement
              const getCreasePosition = (id: string, index: number) => {
                let hash = 0
                for (let i = 0; i < id.length; i++) {
                  hash = (id.charCodeAt(i) * (index * 17) + ((hash << 6) - hash)) | 0
                }
                const absHash = Math.abs(hash)

                // Creases positioned more naturally across the card
                // First crease: upper third (25-40%)
                // Second crease: middle (45-65%)
                const top = index === 1 ? 25 + (absHash % 16) : // 25-40%
                           50 + (absHash % 16) // 50-65%

                // More varied horizontal positioning
                const left = 2 + (absHash % 8) // 2-10% from left
                const width = 80 + (absHash % 16) // 80-95% width

                // Slightly more varied rotation for natural look
                const rotation = ((absHash % 8) - 4) / 2 // -2 to +2 degrees

                // Better opacity variation
                const opacity = 0.6 + (absHash % 20) / 100 // 0.6-0.8

                return { top: `${top}%`, left: `${left}%`, width: `${width}%`, rotation, opacity }
              }

              // Generate paper rips based on post age
              const getPaperRips = (id: string, publishedAt: string) => {
                const now = new Date().getTime()
                const postDate = new Date(publishedAt).getTime()
                const ageInDays = (now - postDate) / (1000 * 60 * 60 * 24)

                let hash = 0
                for (let i = 0; i < id.length; i++) {
                  hash = (id.charCodeAt(i) * 31 + ((hash << 5) - hash)) | 0
                }
                const absHash = Math.abs(hash)

                // More rips for older posts
                const ripCount = ageInDays < 7 ? 2 : ageInDays < 30 ? 3 : 4
                const ripIntensity = Math.min(ageInDays / 365, 1) // 0-1 based on age up to 1 year

                // Generate random edge positions for rips - MUCH BIGGER
                const rips = []
                for (let i = 0; i < ripCount; i++) {
                  const edgeHash = (absHash * (i + 1)) % 1000
                  const edge = edgeHash % 4 // 0=top, 1=right, 2=bottom, 3=left
                  const position = 15 + (edgeHash % 70) // 15-85% along edge (safer boundaries)
                  const size = 15 + Math.floor(ripIntensity * 25) + (edgeHash % 15) // 15-55px based on age
                  const depth = 6 + Math.floor(ripIntensity * 10) + (edgeHash % 8) // 6-24px
                  rips.push({ edge, position, size, depth })
                }

                return rips
              }

              // Generate unique crack pattern for each card
              const getCrackPattern = (id: string) => {
                let hash = 0
                for (let i = 0; i < id.length; i++) {
                  hash = (id.charCodeAt(i) * 41 + ((hash << 7) - hash)) | 0
                }
                const absHash = Math.abs(hash)

                // Main crack angle (varied between 90-150 degrees)
                const mainAngle = 90 + (absHash % 61)

                // Branch crack angles (varied)
                const branch1Angle = 140 + (absHash % 50)
                const branch2Angle = 20 + ((absHash >> 2) % 70)
                const branch3Angle = 80 + ((absHash >> 4) % 35)

                // Main crack opacity (much lighter: 0.15-0.35)
                const mainOpacity = 0.15 + ((absHash % 21) / 100)

                // Branch crack opacities (very light: 0.08-0.22)
                const branchOpacity1 = 0.08 + ((absHash % 15) / 100)
                const branchOpacity2 = 0.07 + (((absHash >> 2) % 16) / 100)
                const branchOpacity3 = 0.06 + (((absHash >> 4) % 15) / 100)

                // Micro fracture positions (varied)
                const frac1X = 45 + (absHash % 20)
                const frac1Y = 35 + (absHash % 30)
                const frac2X = 50 + ((absHash >> 1) % 25)
                const frac2Y = 40 + ((absHash >> 1) % 30)
                const frac3X = 40 + ((absHash >> 2) % 30)
                const frac3Y = 50 + ((absHash >> 2) % 25)
                const frac4X = 35 + ((absHash >> 3) % 30)
                const frac4Y = 45 + ((absHash >> 3) % 30)

                // Micro fracture opacities (much lighter: 0.04-0.12)
                const fracOpacity1 = 0.04 + ((absHash % 9) / 100)
                const fracOpacity2 = 0.03 + (((absHash >> 1) % 8) / 100)
                const fracOpacity3 = 0.04 + (((absHash >> 2) % 9) / 100)
                const fracOpacity4 = 0.03 + (((absHash >> 3) % 8) / 100)

                return {
                  mainAngle,
                  branch1Angle,
                  branch2Angle,
                  branch3Angle,
                  mainOpacity,
                  branchOpacity1,
                  branchOpacity2,
                  branchOpacity3,
                  frac1X, frac1Y, frac2X, frac2Y, frac3X, frac3Y, frac4X, frac4Y,
                  fracOpacity1, fracOpacity2, fracOpacity3, fracOpacity4
                }
              }

              const rotation = getRotation(entry.id)
              const offsetX = isDesktop ? getOffset(entry.id, 'x') : 0
              const offsetY = isDesktop ? getOffset(entry.id, 'y') : 0
              const leftTape = getTapePosition(entry.id, 'left')
              const rightTape = getTapePosition(entry.id, 'right')
              const crease1 = getCreasePosition(entry.id, 1)
              const crease2 = getCreasePosition(entry.id, 2)
              const paperRips = getPaperRips(entry.id, entry.publishedAt)
              const crackPattern = getCrackPattern(entry.id)

              return (
                <div
                  key={entry.id}
                  onClick={() => setSelectedEntry(entry)}
                  className="relative p-6 cursor-pointer transition-all duration-200 hover:scale-105 md:hover:rotate-0 hover:z-10 hover:shadow-2xl"
                  style={{
                    backgroundColor: cardColor,
                    boxShadow: `${offsetX}px ${Math.abs(offsetY) + 4}px 16px rgba(0, 0, 0, 0.12), 0 2px 4px rgba(0, 0, 0, 0.08)`,
                    border: '1px solid rgba(0, 0, 0, 0.08)',
                    borderRadius: '2px',
                    transform: isDesktop ? `rotate(${rotation}deg) translate(${offsetX}px, ${offsetY}px)` : 'none',
                    overflow: 'hidden', // Ensure paper tears stay within card boundaries
                    // Add paper edge effect with slight irregularity
                    backgroundImage: `
                      linear-gradient(to right, rgba(0,0,0,0.03) 0%, transparent 1%, transparent 99%, rgba(0,0,0,0.03) 100%),
                      linear-gradient(to bottom, rgba(0,0,0,0.03) 0%, transparent 1%, transparent 99%, rgba(0,0,0,0.03) 100%)
                    `,
                  }}
                >
                  {/* BIGGER realistic tape - positioned differently on each card */}
                  {/* Left tape */}
                  {leftTape.location === 0 && ( // Top edge
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        top: '-8px',
                        left: leftTape.position,
                        width: `${leftTape.width + 20}px`,
                        height: '24px',
                        background: 'linear-gradient(135deg, rgba(255,240,120,0.75) 0%, rgba(255,230,95,0.85) 50%, rgba(255,240,120,0.75) 100%)',
                        transform: `rotate(${leftTape.rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15)',
                        border: '1px solid rgba(210,190,50,0.5)',
                        borderRadius: '2px',
                        backdropFilter: 'blur(0.5px)',
                      }}
                    />
                  )}
                  {leftTape.location === 1 && ( // Bottom edge
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        bottom: '-8px',
                        left: leftTape.position,
                        width: `${leftTape.width + 20}px`,
                        height: '24px',
                        background: 'linear-gradient(135deg, rgba(255,240,120,0.75) 0%, rgba(255,230,95,0.85) 50%, rgba(255,240,120,0.75) 100%)',
                        transform: `rotate(${leftTape.rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15)',
                        border: '1px solid rgba(210,190,50,0.5)',
                        borderRadius: '2px',
                        backdropFilter: 'blur(0.5px)',
                      }}
                    />
                  )}
                  {leftTape.location === 2 && ( // Left side
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        left: '-8px',
                        top: leftTape.position,
                        width: '24px',
                        height: `${leftTape.width + 20}px`,
                        background: 'linear-gradient(135deg, rgba(255,240,120,0.75) 0%, rgba(255,230,95,0.85) 50%, rgba(255,240,120,0.75) 100%)',
                        transform: `rotate(${leftTape.rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15)',
                        border: '1px solid rgba(210,190,50,0.5)',
                        borderRadius: '2px',
                        backdropFilter: 'blur(0.5px)',
                      }}
                    />
                  )}
                  {leftTape.location === 3 && ( // Right side
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        right: '-8px',
                        top: leftTape.position,
                        width: '24px',
                        height: `${leftTape.width + 20}px`,
                        background: 'linear-gradient(135deg, rgba(255,240,120,0.75) 0%, rgba(255,230,95,0.85) 50%, rgba(255,240,120,0.75) 100%)',
                        transform: `rotate(${leftTape.rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15)',
                        border: '1px solid rgba(210,190,50,0.5)',
                        borderRadius: '2px',
                        backdropFilter: 'blur(0.5px)',
                      }}
                    />
                  )}

                  {/* Right tape */}
                  {rightTape.location === 0 && ( // Top edge
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        top: '-8px',
                        right: rightTape.position,
                        width: `${rightTape.width + 20}px`,
                        height: '24px',
                        background: 'linear-gradient(135deg, rgba(255,240,120,0.75) 0%, rgba(255,230,95,0.85) 50%, rgba(255,240,120,0.75) 100%)',
                        transform: `rotate(${rightTape.rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15)',
                        border: '1px solid rgba(210,190,50,0.5)',
                        borderRadius: '2px',
                        backdropFilter: 'blur(0.5px)',
                      }}
                    />
                  )}
                  {rightTape.location === 1 && ( // Bottom edge
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        bottom: '-8px',
                        right: rightTape.position,
                        width: `${rightTape.width + 20}px`,
                        height: '24px',
                        background: 'linear-gradient(135deg, rgba(255,240,120,0.75) 0%, rgba(255,230,95,0.85) 50%, rgba(255,240,120,0.75) 100%)',
                        transform: `rotate(${rightTape.rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15)',
                        border: '1px solid rgba(210,190,50,0.5)',
                        borderRadius: '2px',
                        backdropFilter: 'blur(0.5px)',
                      }}
                    />
                  )}
                  {rightTape.location === 2 && ( // Left side
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        left: '-8px',
                        top: rightTape.position,
                        width: '24px',
                        height: `${rightTape.width + 20}px`,
                        background: 'linear-gradient(135deg, rgba(255,240,120,0.75) 0%, rgba(255,230,95,0.85) 50%, rgba(255,240,120,0.75) 100%)',
                        transform: `rotate(${rightTape.rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15)',
                        border: '1px solid rgba(210,190,50,0.5)',
                        borderRadius: '2px',
                        backdropFilter: 'blur(0.5px)',
                      }}
                    />
                  )}
                  {rightTape.location === 3 && ( // Right side
                    <div
                      className="absolute pointer-events-none z-30"
                      style={{
                        right: '-8px',
                        top: rightTape.position,
                        width: '24px',
                        height: `${rightTape.width + 20}px`,
                        background: 'linear-gradient(135deg, rgba(255,240,120,0.75) 0%, rgba(255,230,95,0.85) 50%, rgba(255,240,120,0.75) 100%)',
                        transform: `rotate(${rightTape.rotation}deg)`,
                        boxShadow: '0 4px 8px rgba(0,0,0,0.2), inset 0 2px 0 rgba(255,255,255,0.6), inset 0 -2px 0 rgba(0,0,0,0.15)',
                        border: '1px solid rgba(210,190,50,0.5)',
                        borderRadius: '2px',
                        backdropFilter: 'blur(0.5px)',
                      }}
                    />
                  )}

                  {/* Status badge */}
                  <div
                    className="absolute top-4 right-4 z-20"
                  >
                    {entry.userId === user?.uid ? (
                      // User owns this entry - make status clickable with dropdown
                      <div
                        className="relative"
                      >
                        <button
                          onClick={(e) => {
                            e.stopPropagation() // Prevent modal from opening
                            setStatusDropdownOpen(statusDropdownOpen === entry.id ? null : entry.id)
                          }}
                          className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5 transition-all hover:scale-105 hover:shadow-lg cursor-pointer"
                          style={{ backgroundColor: statusOption.color, color: statusOption.textColor }}
                          title="Click to change status"
                        >
                          <span>{statusOption.emoji}</span>
                          {statusOption.label}
                        </button>

                        {/* Status dropdown menu */}
                        {statusDropdownOpen === entry.id && (
                          <div
                            className="absolute right-0 top-full w-48 rounded-lg shadow-xl border overflow-hidden z-50"
                            style={{ backgroundColor: '#FFFFFF', borderColor: '#E0E0E0' }}
                            onClick={(e) => e.stopPropagation()}
                          >
                            {STATUS_OPTIONS.map((status) => (
                              <button
                                key={status.value}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  handleStatusChange(entry.id, status.value)
                                }}
                                className="w-full px-4 py-2.5 text-left text-sm font-medium flex items-center gap-2 transition-all"
                                style={{
                                  backgroundColor: entry.status === status.value ? status.color : '#FFFFFF',
                                  color: entry.status === status.value ? status.textColor : '#4A4A4A',
                                  opacity: entry.status === status.value ? 1 : 0.9
                                }}
                                onMouseEnter={(e) => {
                                  if (entry.status !== status.value) {
                                    e.currentTarget.style.backgroundColor = '#F5F5F5'
                                  }
                                }}
                                onMouseLeave={(e) => {
                                  if (entry.status !== status.value) {
                                    e.currentTarget.style.backgroundColor = '#FFFFFF'
                                  }
                                }}
                              >
                                <span className="text-base">{status.emoji}</span>
                                <span>{status.label}</span>
                                {entry.status === status.value && (
                                  <span className="ml-auto text-lg">✓</span>
                                )}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>
                    ) : (
                      // Not the owner - display only
                      <span
                        className="text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5"
                        style={{ backgroundColor: statusOption.color, color: statusOption.textColor }}
                        title={statusOption.label}
                      >
                        <span>{statusOption.emoji}</span>
                        {statusOption.label}
                      </span>
                    )}
                  </div>

                  {/* Paper lighting - subtle gradient for depth and realism */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-sm"
                    style={{
                      background: 'radial-gradient(ellipse at 30% 20%, rgba(255,255,255,0.4) 0%, transparent 50%, rgba(0,0,0,0.03) 100%)',
                    }}
                  />

                  {/* MUCH MORE VISIBLE paper texture */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-sm"
                    style={{
                      backgroundImage: `url("data:image/svg+xml,%3Csvg width='200' height='200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' /%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='200' height='200' filter='url(%23noise)' opacity='0.15'/%3E%3C/svg%3E")`,
                      mixBlendMode: 'multiply',
                    }}
                  />

                  {/* Stronger worn edges */}
                  <div
                    className="absolute inset-0 pointer-events-none rounded-sm"
                    style={{
                      boxShadow: 'inset 0 0 30px rgba(0,0,0,0.06), inset 0 0 5px rgba(0,0,0,0.08)',
                    }}
                  />

                  {/* Top edge shadow - MORE VISIBLE */}
                  <div
                    className="absolute top-0 left-0 right-0 h-3 pointer-events-none"
                    style={{
                      background: 'linear-gradient(to bottom, rgba(0,0,0,0.15), transparent)',
                    }}
                  />

                  {/* Realistic paper creases with enhanced depth */}
                  {/* Crease 1 - Top highlight line */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: crease1.top,
                      left: crease1.left,
                      width: crease1.width,
                      height: '1.5px',
                      background: 'rgba(255,255,255,0.6)',
                      transform: `rotate(${crease1.rotation}deg) translateY(-2px)`,
                      opacity: crease1.opacity * 0.9,
                      boxShadow: '0 0 2px rgba(255,255,255,0.4)',
                    }}
                  />
                  {/* Crease 1 - Main shadow */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: crease1.top,
                      left: crease1.left,
                      width: crease1.width,
                      height: '2px',
                      background: 'rgba(0,0,0,0.15)',
                      transform: `rotate(${crease1.rotation}deg)`,
                      opacity: crease1.opacity,
                    }}
                  />
                  {/* Crease 1 - Bottom shadow fade */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: crease1.top,
                      left: crease1.left,
                      width: crease1.width,
                      height: '10px',
                      background: `linear-gradient(to bottom, rgba(0,0,0,0.12), transparent)`,
                      transform: `rotate(${crease1.rotation}deg) translateY(1px)`,
                      opacity: crease1.opacity * 0.8,
                      filter: 'blur(2px)',
                    }}
                  />

                  {/* Crease 2 - Top highlight line */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: crease2.top,
                      left: crease2.left,
                      width: crease2.width,
                      height: '1.5px',
                      background: 'rgba(255,255,255,0.5)',
                      transform: `rotate(${crease2.rotation}deg) translateY(-2px)`,
                      opacity: crease2.opacity * 0.8,
                      boxShadow: '0 0 2px rgba(255,255,255,0.3)',
                    }}
                  />
                  {/* Crease 2 - Main shadow */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: crease2.top,
                      left: crease2.left,
                      width: crease2.width,
                      height: '2px',
                      background: 'rgba(0,0,0,0.12)',
                      transform: `rotate(${crease2.rotation}deg)`,
                      opacity: crease2.opacity,
                    }}
                  />
                  {/* Crease 2 - Bottom shadow fade */}
                  <div
                    className="absolute pointer-events-none"
                    style={{
                      top: crease2.top,
                      left: crease2.left,
                      width: crease2.width,
                      height: '8px',
                      background: `linear-gradient(to bottom, rgba(0,0,0,0.1), transparent)`,
                      transform: `rotate(${crease2.rotation}deg) translateY(1px)`,
                      opacity: crease2.opacity * 0.7,
                      filter: 'blur(2px)',
                    }}
                  />

                  {/* Paper rips/tears - more wear on older posts */}
                  {paperRips.map((rip, idx) => (
                    <div key={idx}>
                      {/* Top edge rip */}
                      {rip.edge === 0 && (
                        <>
                          {/* Main tear shadow */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              top: '-1px',
                              left: `${rip.position}%`,
                              width: `${rip.size}px`,
                              height: `${rip.depth + 2}px`,
                              background: `linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)`,
                              clipPath: `polygon(
                                0% 0%, 12% 45%, 8% 25%, 22% 60%, 18% 35%, 35% 70%, 32% 40%,
                                48% 65%, 45% 30%, 62% 75%, 58% 35%, 72% 68%, 68% 28%,
                                82% 55%, 88% 40%, 100% 0%
                              )`,
                              filter: 'blur(0.5px)',
                            }}
                          />
                          {/* Torn edge highlight */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              top: 0,
                              left: `${rip.position}%`,
                              width: `${rip.size}px`,
                              height: '1px',
                              background: `linear-gradient(to right, transparent, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.6) 70%, transparent)`,
                            }}
                          />
                          {/* Dark torn edge */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              top: '1px',
                              left: `${rip.position}%`,
                              width: `${rip.size}px`,
                              height: '1.5px',
                              background: `linear-gradient(to right, transparent, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.4) 80%, transparent)`,
                            }}
                          />
                        </>
                      )}
                      {/* Right edge rip */}
                      {rip.edge === 1 && (
                        <>
                          {/* Main tear shadow */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              right: '-1px',
                              top: `${rip.position}%`,
                              width: `${rip.depth + 2}px`,
                              height: `${rip.size}px`,
                              background: `linear-gradient(to left, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)`,
                              clipPath: `polygon(
                                100% 0%, 55% 12%, 75% 8%, 40% 22%, 65% 18%, 30% 35%, 60% 32%,
                                35% 48%, 70% 45%, 25% 62%, 65% 58%, 32% 72%, 72% 68%,
                                45% 82%, 60% 88%, 100% 100%
                              )`,
                              filter: 'blur(0.5px)',
                            }}
                          />
                          {/* Torn edge highlight */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              right: 0,
                              top: `${rip.position}%`,
                              width: '1px',
                              height: `${rip.size}px`,
                              background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.6) 70%, transparent)`,
                            }}
                          />
                          {/* Dark torn edge */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              right: '1px',
                              top: `${rip.position}%`,
                              width: '1.5px',
                              height: `${rip.size}px`,
                              background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.4) 80%, transparent)`,
                            }}
                          />
                        </>
                      )}
                      {/* Bottom edge rip */}
                      {rip.edge === 2 && (
                        <>
                          {/* Main tear shadow */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              bottom: '-1px',
                              left: `${rip.position}%`,
                              width: `${rip.size}px`,
                              height: `${rip.depth + 2}px`,
                              background: `linear-gradient(to top, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)`,
                              clipPath: `polygon(
                                0% 100%, 12% 55%, 8% 75%, 22% 40%, 18% 65%, 35% 30%, 32% 60%,
                                48% 35%, 45% 70%, 62% 25%, 58% 65%, 72% 32%, 68% 72%,
                                82% 45%, 88% 60%, 100% 100%
                              )`,
                              filter: 'blur(0.5px)',
                            }}
                          />
                          {/* Torn edge highlight */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              bottom: 0,
                              left: `${rip.position}%`,
                              width: `${rip.size}px`,
                              height: '1px',
                              background: `linear-gradient(to right, transparent, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.6) 70%, transparent)`,
                            }}
                          />
                          {/* Dark torn edge */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              bottom: '1px',
                              left: `${rip.position}%`,
                              width: `${rip.size}px`,
                              height: '1.5px',
                              background: `linear-gradient(to right, transparent, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.4) 80%, transparent)`,
                            }}
                          />
                        </>
                      )}
                      {/* Left edge rip */}
                      {rip.edge === 3 && (
                        <>
                          {/* Main tear shadow */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              left: '-1px',
                              top: `${rip.position}%`,
                              width: `${rip.depth + 2}px`,
                              height: `${rip.size}px`,
                              background: `linear-gradient(to right, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.15) 40%, transparent 100%)`,
                              clipPath: `polygon(
                                0% 0%, 45% 12%, 25% 8%, 60% 22%, 35% 18%, 70% 35%, 40% 32%,
                                65% 48%, 30% 45%, 75% 62%, 35% 58%, 68% 72%, 28% 68%,
                                55% 82%, 40% 88%, 0% 100%
                              )`,
                              filter: 'blur(0.5px)',
                            }}
                          />
                          {/* Torn edge highlight */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              left: 0,
                              top: `${rip.position}%`,
                              width: '1px',
                              height: `${rip.size}px`,
                              background: `linear-gradient(to bottom, transparent, rgba(255,255,255,0.6) 30%, rgba(255,255,255,0.6) 70%, transparent)`,
                            }}
                          />
                          {/* Dark torn edge */}
                          <div
                            className="absolute pointer-events-none"
                            style={{
                              left: '1px',
                              top: `${rip.position}%`,
                              width: '1.5px',
                              height: `${rip.size}px`,
                              background: `linear-gradient(to bottom, transparent, rgba(0,0,0,0.4) 20%, rgba(0,0,0,0.4) 80%, transparent)`,
                            }}
                          />
                        </>
                      )}
                    </div>
                  ))}

                  {/* Realistic crack/tear effect overlay */}
                  <div
                    className="absolute inset-0 pointer-events-none z-5"
                    style={{
                      opacity: crackPattern.mainOpacity,
                      backgroundImage: `
                        linear-gradient(${crackPattern.mainAngle}deg,
                          transparent 0%,
                          transparent 48.4%,
                          rgba(0,0,0,.12) 49.3%,
                          rgba(0,0,0,.12) 50.1%,
                          transparent 51%,
                          transparent 100%
                        ),
                        linear-gradient(${crackPattern.mainAngle}deg,
                          transparent 0%,
                          transparent 48.7%,
                          rgba(255,255,255,.45) 49.5%,
                          rgba(255,255,255,.45) 50.2%,
                          transparent 51%,
                          transparent 100%
                        ),
                        linear-gradient(${crackPattern.branch1Angle}deg,
                          transparent 0%,
                          transparent 62%,
                          rgba(0,0,0,${crackPattern.branchOpacity1}) 62.6%,
                          rgba(0,0,0,${crackPattern.branchOpacity1}) 63.1%,
                          transparent 63.6%,
                          transparent 100%
                        ),
                        linear-gradient(${crackPattern.branch2Angle}deg,
                          transparent 0%,
                          transparent 68%,
                          rgba(0,0,0,${crackPattern.branchOpacity2}) 68.4%,
                          rgba(0,0,0,${crackPattern.branchOpacity2}) 69%,
                          transparent 69.6%,
                          transparent 100%
                        ),
                        linear-gradient(${crackPattern.branch3Angle}deg,
                          transparent 0%,
                          transparent 41%,
                          rgba(0,0,0,${crackPattern.branchOpacity3}) 41.4%,
                          rgba(0,0,0,${crackPattern.branchOpacity3}) 41.85%,
                          transparent 42.3%,
                          transparent 100%
                        ),
                        radial-gradient(circle at ${crackPattern.frac1X}% ${crackPattern.frac1Y}%, rgba(0,0,0,${crackPattern.fracOpacity1}) 0 1px, transparent 2px),
                        radial-gradient(circle at ${crackPattern.frac2X}% ${crackPattern.frac2Y}%, rgba(0,0,0,${crackPattern.fracOpacity2}) 0 1px, transparent 2px),
                        radial-gradient(circle at ${crackPattern.frac3X}% ${crackPattern.frac3Y}%, rgba(0,0,0,${crackPattern.fracOpacity3}) 0 1px, transparent 2px),
                        radial-gradient(circle at ${crackPattern.frac4X}% ${crackPattern.frac4Y}%, rgba(0,0,0,${crackPattern.fracOpacity4}) 0 1px, transparent 2px),
                        radial-gradient(ellipse at 55% 52%, rgba(0,0,0,.06), transparent 55%)
                      `,
                      backgroundSize: `
                        100% 100%,
                        100% 100%,
                        100% 100%,
                        100% 100%,
                        100% 100%,
                        100% 100%,
                        100% 100%,
                        100% 100%,
                        100% 100%,
                        140% 140%
                      `,
                      backgroundPosition: `
                        0 0,
                        1px 1px,
                        0 0,
                        0 0,
                        0 0,
                        0 0,
                        0 0,
                        0 0,
                        0 0,
                        50% 50%
                      `,
                      filter: 'blur(.08px)',
                      mixBlendMode: 'multiply',
                    }}
                  />

                  {/* Content - relative positioning to appear above texture */}
                  <div className="relative z-10">
                    {/* To: Header - Only show if there's an actual recipient */}
                    {entry.to && (
                      <div className="mb-4">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-medium uppercase tracking-wide" style={{ color: '#9B9B9B' }}>
                            To:
                          </span>
                          <span className="text-base font-semibold" style={{ color: '#1A1A1A' }}>
                            {entry.to}
                          </span>
                        </div>
                        <div className="flex items-center justify-end">
                          <span className="text-xs" style={{ color: '#9B9B9B' }}>
                            {timeAgo}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* For notes without "To:" - just show timestamp */}
                    {!entry.to && (
                      <div className="mb-4">
                        <div className="flex items-center justify-end">
                          <span className="text-xs" style={{ color: '#9B9B9B' }}>
                            {timeAgo}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Row 2: Message preview */}
                    <p className="text-base leading-relaxed mb-3" style={{ color: '#2A2A2A', fontWeight: '500' }}>
                      {preview}
                      {hasMore && (
                        <span className="ml-1" style={{ color: '#6B6B6B' }}>
                          … read more
                        </span>
                      )}
                    </p>

                    {/* Row 3: Stats + extras */}
                    {primaryMood && (
                      <div className="flex items-center justify-end text-xs">
                        <span
                          className="px-3 py-1 rounded-full font-medium"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.7)',
                            color: '#6B6B6B',
                            backdropFilter: 'blur(8px)'
                          }}
                        >
                          {primaryMood}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
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

      {/* Floating Action Button - Only for authenticated users */}
      {user && (
        <button
          onClick={() => setShowWriteModal(true)}
          className="fixed bottom-8 left-1/2 -translate-x-1/2 px-8 py-4 rounded-full flex items-center gap-3 shadow-xl transition-all hover:scale-105 z-50 font-semibold text-base"
          style={{ backgroundColor: '#1A1A1A', color: '#FFFFFF' }}
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
