import { NextResponse, NextRequest } from 'next/server'
import { getServerFirestore } from '@/lib/firestore'
import { getUserIdFromRequest } from '@/lib/firebase-session'

// DELETE - Remove a published entry (only within 24 hours)
export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: publishedEntryId } = await context.params
    const db = getServerFirestore()

    // Get the published entry
    const publishedRef = db.collection('published_entries').doc(publishedEntryId)
    const publishedDoc = await publishedRef.get()

    if (!publishedDoc.exists) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    const publishedData = publishedDoc.data()

    // Verify ownership
    if (publishedData?.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 403 }
      )
    }

    // Check if within 24 hours
    const publishedAt = publishedData?.publishedAt?.toDate()
    if (!publishedAt) {
      return NextResponse.json(
        { error: 'Invalid published date' },
        { status: 400 }
      )
    }

    const now = new Date()
    const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60)

    if (hoursSincePublished >= 24) {
      return NextResponse.json(
        { error: 'Can only delete entries within 24 hours of publishing' },
        { status: 403 }
      )
    }

    // Delete the published entry
    await publishedRef.delete()

    // Also mark the private entry as deleted
    const entryRef = db.collection('entries').doc(userId).collection('entries').doc(publishedEntryId)
    const entryDoc = await entryRef.get()
    
    if (entryDoc.exists) {
      await entryRef.update({
        deletedAt: now,
      })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete published entry error:', error)
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    )
  }
}
