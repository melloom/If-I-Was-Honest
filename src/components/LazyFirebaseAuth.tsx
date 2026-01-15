'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'

// Dynamically import FirebaseAuthProvider with no SSR
const FirebaseAuthProvider = dynamic(
  () => import('./FirebaseAuthProvider').then(mod => ({ default: mod.FirebaseAuthProvider })),
  { 
    ssr: false,
    loading: () => null,
  }
)

export function LazyFirebaseAuth({ children }: { children: React.ReactNode }) {
  const [shouldLoad, setShouldLoad] = useState(false)

  useEffect(() => {
    // Defer Firebase initialization until after critical rendering
    // Use requestIdleCallback if available, otherwise setTimeout
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => setShouldLoad(true), { timeout: 1000 })
    } else {
      const timer = setTimeout(() => setShouldLoad(true), 100)
      return () => clearTimeout(timer)
    }
  }, [])

  if (!shouldLoad) {
    // Return children without Firebase context during initial load
    return <>{children}</>
  }

  return <FirebaseAuthProvider>{children}</FirebaseAuthProvider>
}
