import { NextResponse } from 'next/server'
import { getServerFirestore } from '@/lib/firestore'
import { getUserIdFromRequest } from '@/lib/firebase-session'

export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getServerFirestore()

    // Get user document
    const userRef = db.collection('users').doc(userId)
    const userDoc = await userRef.get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const userData = userDoc.data()
    
    // Increment session version to invalidate all existing sessions
    const currentPreferences = userData?.preferences || {}
    const nextVersion = (currentPreferences.sessionVersion ?? 0) + 1
    const updatedPreferences = { ...currentPreferences, sessionVersion: nextVersion }

    // Update user document with new session version
    await userRef.update({
      preferences: updatedPreferences,
      lastLogoutAllAt: new Date(),
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Sign out everywhere failed', error)
    return NextResponse.json({ error: 'Failed to sign out everywhere' }, { status: 500 })
  }
}
