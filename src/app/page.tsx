'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { organizationSchema, webApplicationSchema, faqSchema, webSiteSchema } from '@/lib/schema'
import { Header } from '@/components/Header'
import { useFirebaseAuth } from '@/components/FirebaseAuthProvider'

export default function HomePage() {
  const router = useRouter()
  const { user } = useFirebaseAuth()
  
  // Redirect authenticated users to feed
  useEffect(() => {
    if (user) {
      router.push('/feed')
    }
  }, [user, router])
  
  // Initialize to true (show disclaimer) on both server and client to prevent hydration mismatch
  // Will be updated in useEffect after mount to check localStorage
  const [showDisclaimer, setShowDisclaimer] = useState(true)
  const [typedText, setTypedText] = useState('')
  const fullText = "If I was honest..."

  // Typing animation effect - continuous loop
  useEffect(() => {
    if (showDisclaimer) return

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
  }, [showDisclaimer])

  const handleAccept = () => {
    // Persist acceptance permanently in localStorage
    try {
      localStorage.setItem('disclaimer-accepted', 'true')
    } catch (error) {
      console.error('Failed to save disclaimer acceptance:', error)
    }
    setShowDisclaimer(false)
  }

  // Check localStorage after mount to prevent hydration mismatch
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const accepted = localStorage.getItem('disclaimer-accepted')
    setShowDisclaimer(!accepted)
  }, [])

  return (
    <>
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webApplicationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />

      <Header />

      {/* Age Gate / Disclaimer Modal */}
      {showDisclaimer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" style={{ backgroundColor: 'rgba(0, 0, 0, 0.95)' }}>
          <div className="max-w-lg w-full p-8 rounded-lg" style={{ backgroundColor: '#ffffff' }}>
            <h2 className="text-2xl font-bold mb-4" style={{ color: '#1a1a1a' }}>
              Content Disclaimer
            </h2>

            <div className="space-y-4 mb-6" style={{ color: '#4a4a4a', lineHeight: '1.6' }}>
              <p>
                By entering this site, you certify that:
              </p>

              <ul className="list-disc pl-6 space-y-2">
                <li>You are at least <strong>18 years of age</strong></li>
                <li>You understand that you may be exposed to <strong>explicit, sensitive, or triggering content</strong> including discussions of mental health, trauma, abuse, self-harm, and other difficult topics</li>
                <li>You have read and agree to our <Link href="/terms" className="underline" style={{ color: '#2c2c2c' }}>Terms of Service</Link> and <Link href="/privacy" className="underline" style={{ color: '#2c2c2c' }}>Privacy Policy</Link></li>
              </ul>

              <p className="text-sm pt-2" style={{ color: '#6b6b6b' }}>
                This platform is for honest self-expression. Content shared here reflects real thoughts and feelings, which may be difficult to read.
              </p>

              <div className="pt-2 px-4 py-3 rounded" style={{ backgroundColor: '#fff3cd', borderLeft: '4px solid #ffc107' }}>
                <p className="text-sm font-medium" style={{ color: '#856404' }}>
                  <strong>Crisis Resources:</strong> If you're in crisis, please contact the 988 Suicide & Crisis Lifeline (call or text 988) or Crisis Text Line (text HOME to 741741).
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleAccept}
                className="w-full px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
                style={{ backgroundColor: '#2c2c2c', color: '#ffffff' }}
              >
                I Accept & I Am 18+
              </button>

              <button
                onClick={() => window.location.href = 'https://google.com'}
                className="w-full px-6 py-3 rounded-lg font-medium transition-all"
                style={{ backgroundColor: '#f5f5f5', color: '#6b6b6b' }}
              >
                I Do Not Accept
              </button>
            </div>

            <p className="text-xs mt-4 text-center" style={{ color: '#a0a0a0' }}>
              Your acceptance is saved for this session on this device
            </p>
          </div>
        </div>
      )}

      {/* Main Page Content */}
      <div className="min-h-screen relative flex flex-col items-center justify-center px-6 py-12" style={{ backgroundColor: '#fafafa' }}>
        <main className="max-w-2xl w-full text-center space-y-16">
          {/* Main Question */}
          <div className="space-y-8">
            <h1 className="text-5xl md:text-6xl font-bold leading-tight" style={{ color: '#1a1a1a', letterSpacing: '-0.02em', lineHeight: '1.1' }}>
              The things I wish<br />I could say
            </h1>

            <p className="text-2xl md:text-3xl font-light min-h-[2.5rem]" style={{ color: '#4a4a4a', lineHeight: '1.4' }}>
              {typedText}
              <span className="animate-pulse" style={{ color: '#4a4a4a' }}>|</span>
            </p>
          </div>

          {/* Emotional Hooks */}
          <div className="space-y-6 max-w-xl mx-auto">
            <p className="text-lg md:text-xl" style={{ color: '#6b6b6b', lineHeight: '1.6' }}>
              The thoughts that keep you up at night.
            </p>
            <p className="text-lg md:text-xl" style={{ color: '#6b6b6b', lineHeight: '1.6' }}>
              The feelings you're too afraid to admit.
            </p>
            <p className="text-lg md:text-xl" style={{ color: '#6b6b6b', lineHeight: '1.6' }}>
              The truths you've never told anyone.
            </p>
          </div>

          {/* CTA */}
          <div className="space-y-6 pt-8">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link
                href="/auth/signup"
                className="inline-block px-12 py-4 text-lg font-medium rounded-full transition-all hover:opacity-80"
                style={{
                  backgroundColor: '#2c2c2c',
                  color: '#ffffff',
                  border: 'none',
                }}
              >
                Write your truth
              </Link>
              
              <Link
                href="/feed"
                className="inline-block px-12 py-4 text-lg font-medium rounded-full transition-all hover:opacity-80"
                style={{
                  backgroundColor: '#ffffff',
                  color: '#2c2c2c',
                  border: '2px solid #2c2c2c',
                }}
              >
                Browse Feed
              </Link>
            </div>
          </div>

          {/* Bottom text */}
          <div className="pt-16">
            <p className="text-sm" style={{ color: '#a0a0a0', lineHeight: '1.8' }}>
              A private space where your thoughts stay yours.<br />
              No judgment. No audience. Just you and your words.
            </p>
          </div>
        </main>

        {/* Subtle footer */}
        <footer className="absolute bottom-8 flex gap-4 text-xs" style={{ color: '#c0c0c0' }}>
          <span>Private • Encrypted • Yours</span>
          <span>•</span>
          <Link href="/terms" className="hover:underline">Terms</Link>
          <span>•</span>
          <Link href="/privacy" className="hover:underline">Privacy</Link>
        </footer>
      </div>
    </>
  )
}
