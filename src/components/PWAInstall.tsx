'use client'

import { useEffect, useState, useCallback } from 'react'

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const PWA_DISMISSED_KEY = 'pwa-install-dismissed'
const PWA_INSTALLED_KEY = 'pwa-installed'
const DISMISS_DURATION_DAYS = 7 // Don't show again for 7 days after dismissal

function isDismissedRecently(): boolean {
  if (typeof window === 'undefined') return true
  
  // Check if already installed
  if (localStorage.getItem(PWA_INSTALLED_KEY) === 'true') return true
  
  const dismissedAt = localStorage.getItem(PWA_DISMISSED_KEY)
  if (!dismissedAt) return false
  
  const dismissedTime = parseInt(dismissedAt, 10)
  const now = Date.now()
  const daysSinceDismissal = (now - dismissedTime) / (1000 * 60 * 60 * 24)
  
  return daysSinceDismissal < DISMISS_DURATION_DAYS
}

export function PWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null)
  const [showPrompt, setShowPrompt] = useState(false)

  const handleBeforeInstallPrompt = useCallback((e: Event) => {
    e.preventDefault()
    const beforeInstallPromptEvent = e as BeforeInstallPromptEvent
    setDeferredPrompt(beforeInstallPromptEvent)
    
    // Only show if not dismissed recently
    if (!isDismissedRecently()) {
      setShowPrompt(true)
    }
  }, [])

  useEffect(() => {
    // Don't set up listener if already dismissed recently
    if (isDismissedRecently()) return

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    }
  }, [handleBeforeInstallPrompt])

  const handleInstall = async () => {
    if (!deferredPrompt) return

    try {
      await deferredPrompt.prompt()
      const { outcome } = await deferredPrompt.userChoice
      
      if (outcome === 'accepted') {
        console.log('PWA installed successfully')
        // Mark as installed so we never show the prompt again
        localStorage.setItem(PWA_INSTALLED_KEY, 'true')
      }
      
      setDeferredPrompt(null)
      setShowPrompt(false)
    } catch (error) {
      console.error('Error installing PWA:', error)
    }
  }

  const handleDismiss = () => {
    // Store dismissal timestamp in localStorage so it persists across sessions
    localStorage.setItem(PWA_DISMISSED_KEY, Date.now().toString())
    setShowPrompt(false)
  }

  if (!showPrompt || !deferredPrompt) return null

  return (
    <div
      className="fixed bottom-4 right-4 max-w-sm rounded-lg border bg-white shadow-lg p-4 z-50"
      style={{ borderColor: '#e0e0e0' }}
    >
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm" style={{ color: '#2a2a2a' }}>
            Install App
          </h3>
          <p className="text-xs mt-1" style={{ color: '#6a6a6a' }}>
            Install If I Was Honest for offline access and quick launch from your home screen.
          </p>
        </div>
        <button
          onClick={handleDismiss}
          className="text-gray-400 hover:text-gray-600 font-semibold text-lg"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
      <div className="flex gap-2 mt-3">
        <button
          onClick={handleDismiss}
          className="flex-1 px-3 py-2 text-xs font-medium rounded hover:bg-gray-100"
          style={{ color: '#6a6a6a' }}
        >
          Later
        </button>
        <button
          onClick={handleInstall}
          className="flex-1 px-3 py-2 text-xs font-medium rounded text-white hover:opacity-90"
          style={{ backgroundColor: '#2c2c2c' }}
        >
          Install
        </button>
      </div>
    </div>
  )
}
