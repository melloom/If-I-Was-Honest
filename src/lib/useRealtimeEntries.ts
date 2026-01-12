import { useEffect } from 'react'
import { getFirestore, collection, query, where, onSnapshot, orderBy } from 'firebase/firestore'
import { getFirebaseApp } from '@/lib/firebase-client'

export function useRealtimeEntries(userId: string | undefined, setEntries: (entries: any[]) => void) {
  useEffect(() => {
    if (!userId) return
    const app = getFirebaseApp()
    const db = getFirestore(app)
    const entriesRef = collection(db, 'entries', userId, 'entries')
    const q = query(entriesRef, where('deletedAt', '==', null), orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      setEntries(entries)
    })
    return () => unsubscribe()
  }, [userId, setEntries])
}
