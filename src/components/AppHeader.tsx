'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'
import { signOut as firebaseSignOut } from 'firebase/auth'
import { firebaseAuth } from '@/lib/firebase-client'
import { useState, useEffect, useRef } from 'react'

export function AppHeader() {
  // Local state for firstName from settings
  const [firstName, setFirstName] = useState<string | null>(null)
  const [canShare, setCanShare] = useState(false)

  // Load firstName from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return
    try {
      const saved = window.localStorage.getItem('ifiwh-settings')
      if (saved) {
        const parsed = JSON.parse(saved)
        if (parsed.firstName && typeof parsed.firstName === 'string' && parsed.firstName.trim().length > 0) {
          setFirstName(parsed.firstName.trim())
        } else {
          setFirstName(null)
        }
      } else {
        setFirstName(null)
      }
    } catch (e) {
      setFirstName(null)
    }
  }, [])

  // Check if native sharing is available
  useEffect(() => {
    if (typeof window !== 'undefined' && navigator.share) {
      setCanShare(true)
    }
  }, [])

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'If I Was Honest',
          text: 'Share your honest thoughts anonymously',
          url: window.location.origin,
        })
      } catch (err) {
        // User cancelled or error occurred
        console.log('Share cancelled or failed:', err)
      }
    }
  }

  const { user } = useFirebaseAuth()
  const pathname = usePathname()
  const router = useRouter()
  const [menuOpen, setMenuOpen] = useState(false)
  const [navOpen, setNavOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement | null>(null)

  // Close menu on outside click
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

  const isActive = (path: string) => pathname === path

  return (
    <header
      className="border-b sticky top-0 z-40 bg-white"
      style={{
        borderColor: '#e0e0e0',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
        paddingTop: 'max(0.5rem, env(safe-area-inset-top))',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Left */}
          <Link
            href="/feed"
            className="text-xl font-bold tracking-tight hover:opacity-80 transition-opacity"
            style={{ color: '#000000' }}
          >
            If I Was Honest
          </Link>

          {/* Navigation - Center */}
          <nav className="hidden md:flex items-center gap-6 absolute left-1/2 -translate-x-1/2">
            {!user && (
              <Link
                href="/"
                className="text-sm font-medium hover:opacity-70"
                style={{ color: isActive('/') ? '#2a2a2a' : '#6a6a6a' }}
              >
                Home
              </Link>
            )}
            <Link
              href="/feed"
              className="text-sm font-medium hover:opacity-70"
              style={{ color: isActive('/feed') ? '#2a2a2a' : '#6a6a6a' }}
            >
              Feed
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-sm font-medium hover:opacity-70"
                style={{ color: isActive('/dashboard') ? '#2a2a2a' : '#6a6a6a' }}
              >
                My Journal
              </Link>
            )}
            <Link
              href="/about"
              className="text-sm font-medium hover:opacity-70"
              style={{ color: isActive('/about') ? '#2a2a2a' : '#6a6a6a' }}
            >
              About
            </Link>
          </nav>

          {/* User Menu - Right */}
          <div className="flex items-center gap-3 relative" ref={menuRef}>
            {/* Profile bubble - show on mobile first (left side) */}
            {user && (
              <button
                onClick={() => {
                  setMenuOpen((v) => !v)
                  setNavOpen(false)
                }}
                className="md:hidden w-10 h-10 rounded-full bg-gray-200 text-sm font-semibold flex items-center justify-center hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                style={{ color: '#2a2a2a' }}
                aria-label="Account menu"
              >
                {firstName
                  ? firstName.slice(0, 2).toUpperCase()
                  : user?.email
                    ? user.email.slice(0, 2).toUpperCase()
                    : 'ME'}
              </button>
            )}

            {/* Mobile hamburger menu - show for all users (right side) */}
            <button
              onClick={() => {
                setNavOpen(!navOpen)
                setMenuOpen(false)
              }}
              className="md:hidden p-2 hover:opacity-70"
              aria-label="Toggle navigation"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                style={{ color: '#2a2a2a' }}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>

            {/* Desktop Sign In/Sign Up buttons - show when not authenticated */}
            {!user && (
              <div className="hidden md:flex items-center gap-3">
                <Link
                  href="/auth/signin"
                  className="px-4 py-2 text-sm font-medium hover:opacity-70 transition-opacity"
                  style={{ color: '#6a6a6a' }}
                >
                  Sign In
                </Link>
                <Link
                  href="/auth/signup"
                  className="px-4 py-2 text-sm font-medium rounded-lg transition-opacity hover:opacity-80"
                  style={{ backgroundColor: '#2c2c2c', color: '#ffffff' }}
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Desktop profile bubble */}
            {user && (
              <button
                onClick={() => {
                  setMenuOpen((v) => !v)
                  setNavOpen(false)
                }}
                className="hidden md:flex w-10 h-10 rounded-full bg-gray-200 text-sm font-semibold items-center justify-center hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400"
                style={{ color: '#2a2a2a' }}
                aria-label="Account menu"
              >
                {firstName
                  ? firstName.slice(0, 2).toUpperCase()
                  : user?.email
                    ? user.email.slice(0, 2).toUpperCase()
                    : 'ME'}
              </button>
            )}

            {menuOpen && user && (
              <div
                className="absolute right-0 top-12 w-48 rounded-lg border bg-white shadow-lg z-50"
                style={{ borderColor: '#e0e0e0' }}
              >
                <div className="px-4 py-3 border-b" style={{ borderColor: '#e0e0e0', color: '#2a2a2a' }}>
                  <div className="text-sm font-semibold truncate" title={user?.email || ''}>
                    {user?.email || ''}
                  </div>
                </div>
                <div className="flex flex-col">
                  <Link
                    href="/settings"
                    className="px-4 py-3 text-sm hover:bg-gray-100"
                    style={{ color: '#2a2a2a' }}
                    onClick={() => setMenuOpen(false)}
                  >
                    Settings
                  </Link>
                  {canShare && (
                    <button
                      onClick={() => {
                        setMenuOpen(false)
                        handleShare()
                      }}
                      className="px-4 py-3 text-left text-sm hover:bg-gray-100"
                      style={{ color: '#2a2a2a' }}
                    >
                      Share Site
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      setMenuOpen(false)
                      await firebaseSignOut(firebaseAuth)
                      router.push('/')
                    }}
                    className="px-4 py-3 text-left text-sm hover:bg-gray-100"
                    style={{ color: '#d32f2f' }}
                  >
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mobile sidebar navigation */}
        {navOpen && (
          <>
            {/* Backdrop overlay */}
            <div
              className="md:hidden fixed inset-0 bg-black bg-opacity-50 z-40"
              style={{ top: 0 }}
              onClick={() => setNavOpen(false)}
            />
            
            {/* Sidebar */}
            <nav
              className="md:hidden fixed top-0 right-0 h-full w-64 bg-white shadow-xl z-50 flex flex-col"
              style={{
                paddingTop: 'max(1rem, env(safe-area-inset-top))',
                paddingLeft: '1rem',
                paddingRight: 'max(1rem, env(safe-area-inset-right))',
                paddingBottom: 'max(1rem, env(safe-area-inset-bottom))',
                animation: 'slideInRight 0.3s ease-out'
              }}
            >
              {/* Close button */}
              <button
                onClick={() => setNavOpen(false)}
                className="self-end p-2 hover:opacity-70 mb-4"
                aria-label="Close menu"
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  style={{ color: '#2a2a2a' }}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>

              {/* Navigation links */}
              <div className="flex flex-col gap-1">
                {!user && (
                  <Link
                    href="/"
                    className="block px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg"
                    style={{ color: isActive('/') ? '#2a2a2a' : '#6a6a6a' }}
                    onClick={() => setNavOpen(false)}
                  >
                    Home
                  </Link>
                )}
                <Link
                  href="/feed"
                  className="block px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg"
                  style={{ color: isActive('/feed') ? '#2a2a2a' : '#6a6a6a' }}
                  onClick={() => setNavOpen(false)}
                >
                  Feed
                </Link>
                {user ? (
                  <>
                    <Link
                      href="/dashboard"
                      className="block px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg"
                      style={{ color: isActive('/dashboard') ? '#2a2a2a' : '#6a6a6a' }}
                      onClick={() => setNavOpen(false)}
                    >
                      My Journal
                    </Link>
                    <Link
                      href="/about"
                      className="block px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg"
                      style={{ color: isActive('/about') ? '#2a2a2a' : '#6a6a6a' }}
                      onClick={() => setNavOpen(false)}
                    >
                      About
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/about"
                      className="block px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg"
                      style={{ color: isActive('/about') ? '#2a2a2a' : '#6a6a6a' }}
                      onClick={() => setNavOpen(false)}
                    >
                      About
                    </Link>
                    <Link
                      href="/auth/signin"
                      className="block px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg"
                      style={{ color: isActive('/auth/signin') ? '#2a2a2a' : '#6a6a6a' }}
                      onClick={() => setNavOpen(false)}
                    >
                      Sign In
                    </Link>
                    <Link
                      href="/auth/signup"
                      className="block px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg"
                      style={{ color: isActive('/auth/signup') ? '#2a2a2a' : '#6a6a6a' }}
                      onClick={() => setNavOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}

                {/* Share button in sidebar */}
                {canShare && (
                  <>
                    <div className="my-2 border-t" style={{ borderColor: '#e0e0e0' }} />
                    <button
                      onClick={() => {
                        setNavOpen(false)
                        handleShare()
                      }}
                      className="flex items-center gap-3 px-4 py-3 text-sm font-medium hover:bg-gray-100 rounded-lg"
                      style={{ color: '#6a6a6a' }}
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
                        />
                      </svg>
                      Share Site
                    </button>
                  </>
                )}
              </div>
            </nav>

            <style jsx>{`
              @keyframes slideInRight {
                from {
                  transform: translateX(100%);
                }
                to {
                  transform: translateX(0);
                }
              }
            `}</style>
          </>
        )}
      </div>
    </header>
  )
}
