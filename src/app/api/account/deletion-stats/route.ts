import { NextResponse } from 'next/server'
import { getServerFirestore } from '@/lib/firestore'
import { getUserIdFromRequest } from '@/lib/firebase-session'

export async function GET(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const db = getServerFirestore()
    const userDoc = await db.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    const userData = userDoc.data()
    const deletionsUsed = userData?.publicPostDeletions || 0
    const deletionsLimit = 10
    const deletionsRemaining = deletionsLimit - deletionsUsed

    return NextResponse.json({
      deletionsUsed,
      deletionsLimit,
      deletionsRemaining,
      lastDeletionAt: userData?.lastPublicPostDeletionAt?.toDate?.().toISOString() || null,
      canDelete: deletionsRemaining > 0
    })
  } catch (error) {
    console.error('Error fetching deletion stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deletion stats' },
      { status: 500 }
    )
  }
}
