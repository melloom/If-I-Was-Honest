import { useEffect, useCallback } from 'react'
import { getFirestore, collection, query, where, onSnapshot, orderBy, Timestamp } from 'firebase/firestore'
import { getFirebaseApp } from '@/lib/firebase-client'

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

interface UseRealtimeEntriesOptions {
  filter?: 'all' | 'private' | 'shared'
}

export function useRealtimeEntries(
  userId: string | undefined,
  setEntries: (entries: Entry[]) => void,
  options: UseRealtimeEntriesOptions = {}
) {
  const { filter = 'all' } = options

  useEffect(() => {
    if (!userId) return

    const app = getFirebaseApp()
    const db = getFirestore(app)
    const entriesRef = collection(db, 'entries', userId, 'entries')

    // Build query based on filter
    let q = query(entriesRef, orderBy('createdAt', 'desc'))

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs
        .map(doc => {
          const data = doc.data()

          // Skip soft-deleted entries
          if (data.deletedAt) return null

          // Apply filter
          const isPublished = !!data.publishedAt
          if (filter === 'private' && isPublished) return null
          if (filter === 'shared' && !isPublished) return null

          // Convert Firestore timestamps to ISO strings
          const createdAt = data.createdAt instanceof Timestamp
            ? data.createdAt.toDate().toISOString()
            : data.createdAt || new Date().toISOString()
          const updatedAt = data.updatedAt instanceof Timestamp
            ? data.updatedAt.toDate().toISOString()
            : data.updatedAt || createdAt
          const publishedAt = data.publishedAt instanceof Timestamp
            ? data.publishedAt.toDate().toISOString()
            : data.publishedAt || null

          return {
            id: doc.id,
            content: data.content || '',
            title: data.title || null,
            status: data.status || 'NO_STATUS',
            createdAt,
            updatedAt,
            isPublished,
            publishedAt,
            to: data.to || null,
            from: data.from || null,
            moods: data.moods || [],
            tags: data.tags || [],
          } as Entry
        })
        .filter((entry): entry is Entry => entry !== null)

      setEntries(entries)
    }, (error) => {
      console.error('[useRealtimeEntries] Error:', error)
    })

    return () => unsubscribe()
  }, [userId, setEntries, filter])
}
