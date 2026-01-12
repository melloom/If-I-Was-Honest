import { NextResponse } from 'next/server'
import { getUserIdFromRequest } from '@/lib/firebase-session'
import { getServerFirestore } from '@/lib/firestore'
import { anonymizeForFeed } from '@/lib/sanitize'

const MOOD_COLORS: Record<string, string> = {
  anxious: '#FFF5E5',
  sad: '#E5F3FF',
  hopeful: '#E5FFE5',
  angry: '#FFE5E5',
  proud: '#E5FFE5',
  confused: '#F5E5FF',
  hurt: '#FFE5EB',
  happy: '#FFF8E5',
  overwhelmed: '#FFE5E5',
  empowered: '#FFE5F5',
  nostalgic: '#E5FFFF',
  numb: '#FFE5EB',
}

export async function POST(request: Request) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { entryId, moods } = await request.json()

    if (!entryId) {
      return NextResponse.json(
        { error: 'Entry ID is required' },
        { status: 400 }
      )
    }

    const db = getServerFirestore()

    // Verify the entry belongs to the user and get its data
    const entryRef = db.collection('entries').doc(userId).collection('entries').doc(entryId)
    const entryDoc = await entryRef.get()

    if (!entryDoc.exists) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    const entryData = entryDoc.data()

    // Check if soft deleted
    if (entryData?.deletedAt) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Check if already published
    if (entryData?.publishedAt) {
      return NextResponse.json(
        { error: 'Entry already published' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Prepare moods array with colors
    const moodsArray = moods && Array.isArray(moods) ? moods.map((mood: string) => ({
      id: `${userId}_${mood}`,
      name: mood,
      color: MOOD_COLORS[mood.toLowerCase()] || '#F5F5F5',
    })) : entryData?.moods || []

    // Prepare tags array
    const tagsArray = entryData?.tags || []

    // Create published entry
    const publishedEntryRef = db.collection('published_entries').doc()
    const publishedEntryId = publishedEntryRef.id

    await publishedEntryRef.set({
      id: publishedEntryId,
      userId,
      content: anonymizeForFeed(entryData?.content || ''),
      moods: moodsArray,
      tags: tagsArray,
      publishedAt: now,
      deletedAt: null,
    })

    // Update the original entry with published status
    await entryRef.update({
      publishedAt: now,
    })

    return NextResponse.json({
      success: true,
      publishedEntry: {
        id: publishedEntryId,
        publishedAt: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('Publish error:', error)
    return NextResponse.json(
      { error: 'Failed to publish entry' },
      { status: 500 }
    )
  }
}
