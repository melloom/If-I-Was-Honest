import { NextResponse } from 'next/server'
import { adminAuth } from '@/lib/firebase-admin'
import { getServerFirestore } from '@/lib/firestore'

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const idToken = authHeader.substring('Bearer '.length)
    const decoded = await adminAuth().verifyIdToken(idToken)
    const uid = decoded.uid
    const email = decoded.email?.toLowerCase()

    if (!email) {
      return NextResponse.json({ error: 'Email required' }, { status: 400 })
    }

    const db = getServerFirestore()

    // Create/update user document in Firestore
    // The uid is the document ID, which simplifies lookups
    const userRef = db.collection('users').doc(uid)
    await userRef.set(
      {
        uid,
        email,
        emailVerified: decoded.email_verified || false,
        updatedAt: new Date(),
      },
      { merge: true } // merge: true preserves other fields
    )

    // Ensure document exists on first creation
    const docSnap = await userRef.get()
    if (!docSnap.exists) {
      await userRef.set({
        uid,
        email,
        emailVerified: decoded.email_verified || false,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
    }

    return NextResponse.json({ ok: true, uid })
  } catch (error) {
    console.error('firebase-sync error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Internal error' },
      { status: 500 }
    )
  }
}
