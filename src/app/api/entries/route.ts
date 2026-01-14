import { NextResponse } from 'next/server'
import { getServerFirestore } from '@/lib/firestore'
import { anonymizeForFeed, sanitizePlainText } from '@/lib/sanitize'
import { getUserIdFromRequest } from '@/lib/firebase-session'
import { isSpamOrGibberish, getSpamScore } from '@/lib/spam-detection'

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

// GET - Fetch user's entries
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
    const { searchParams } = new URL(request.url)
    const filter = searchParams.get('filter') || 'all' // all, private, shared
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    // Get all entries for the user
    const entriesRef = db.collection('entries').doc(userId).collection('entries')
    let query = entriesRef.where('deletedAt', '==', null)

    // Apply filter with correct orderBy for inequality constraints
    if (filter === 'private') {
      // Equality filter can order by createdAt directly
      query = query.where('publishedAt', '==', null).orderBy('createdAt', 'desc')
    } else if (filter === 'shared') {
      // Inequality on publishedAt requires orderBy on the same field first
      query = query.where('publishedAt', '!=', null).orderBy('publishedAt', 'desc').orderBy('createdAt', 'desc')
    } else {
      // Default: all entries ordered by createdAt
      query = query.orderBy('createdAt', 'desc')
    }

    // Get total count
    const allEntriesSnapshot = await query.get()
    const totalCount = allEntriesSnapshot.size

    // Get paginated results
    const snapshot = await query.limit(limit).offset(offset).get()
    const entries = snapshot.docs.map((doc: any) => ({
      id: doc.id,
      ...doc.data(),
    }))

    // Calculate month count
    const now = new Date()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const monthSnapshot = await entriesRef
      .where('deletedAt', '==', null)
      .where('createdAt', '>=', monthStart)
      .get()
    const monthCount = monthSnapshot.size

    // Calculate shared count
    const sharedSnapshot = await entriesRef
      .where('deletedAt', '==', null)
      .where('publishedAt', '!=', null)
      .get()
    const sharedCount = sharedSnapshot.size

    // Format the response
    const formattedEntries = entries.map((entry: any) => ({
      id: entry.id,
      content: entry.content,
      title: entry.title || null,
      status: entry.status || 'NO_STATUS',
      createdAt: entry.createdAt?.toDate?.().toISOString() || new Date().toISOString(),
      updatedAt: entry.updatedAt?.toDate?.().toISOString() || new Date().toISOString(),
      isPublished: !!entry.publishedAt,
      publishedAt: entry.publishedAt?.toDate?.().toISOString() || null,
      moods: entry.moods || [],
      tags: entry.tags || [],
    }))

    return NextResponse.json({
      entries: formattedEntries,
      stats: {
        total: totalCount,
        thisMonth: monthCount,
        shared: sharedCount,
      },
    })
  } catch (error) {
    console.error('Entries fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entries' },
      { status: 500 }
    )
  }
}

// POST - Create new entry
export async function POST(request: Request) {
  try {
    // SECURITY: Verify user authentication
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { content, title, moods, tags, status, shareAnonymously, to, from } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    if (content.length > 10000) {
      return NextResponse.json(
        { error: 'Content is too long (max 10,000 characters)' },
        { status: 400 }
      )
    }

    // Detect spam/gibberish
    if (isSpamOrGibberish(content)) {
      return NextResponse.json(
        { error: 'Content appears to be spam or gibberish. Please write meaningful thoughts.' },
        { status: 400 }
      )
    }

    const spamScore = getSpamScore(content)
    if (spamScore > 70) {
      console.warn(`High spam score (${spamScore}) for user ${userId}`)
      return NextResponse.json(
        { error: 'Content quality check failed. Please write thoughtfully.' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['NO_STATUS', 'STILL_TRUE', 'IVE_GROWN', 'I_WAS_COPING', 'I_LIED']
    const entryStatus = status && validStatuses.includes(status) ? status : 'NO_STATUS'

    const db = getServerFirestore()
    const now = new Date()

    // Prepare moods array
    const moodsArray = moods && Array.isArray(moods) ? moods.map((mood: string) => ({
      id: `${userId}_${mood}`,
      name: mood,
      color: MOOD_COLORS[mood.toLowerCase()] || '#F5F5F5',
    })) : []

    // Prepare tags array
    const tagsArray = tags && Array.isArray(tags) ? tags.map((tag: string) => ({
      id: `${userId}_${tag}`,
      name: tag,
    })) : []

    // Create the entry
    const entryData = {
      userId,
      content: sanitizePlainText(content),
      title: title ? sanitizePlainText(title) : null,
      to: to ? sanitizePlainText(to) : null,
      from: from ? sanitizePlainText(from) : null,
      status: entryStatus,
      moods: moodsArray,
      tags: tagsArray,
      createdAt: now,
      updatedAt: now,
      deletedAt: null,
      publishedAt: null,
    }

    const entriesRef = db.collection('entries').doc(userId).collection('entries')
    const entryRef = entriesRef.doc()
    const entryId = entryRef.id

    // SECURITY: Store in user-specific subcollection (entries/{userId}/entries)
    // Only this user can access their entries through authenticated endpoints
    await entryRef.set(entryData)

    // If user wants to share anonymously, publish immediately
    if (shareAnonymously) {
      // SECURITY: Only published entries go to public feed
      // Content is anonymized (user info removed) before publishing
      const publishedEntryRef = db.collection('published_entries').doc(entryId)

      await publishedEntryRef.set({
        id: entryId,
        userId,
        content: anonymizeForFeed(content),
        to: to ? sanitizePlainText(to) : null,
        from: from ? sanitizePlainText(from) : null,
        status: entryStatus,
        moods: moodsArray,
        tags: tagsArray,
        publishedAt: now,
        deletedAt: null,
      })

      // Update entry with published status
      await entryRef.update({
        publishedAt: now,
      })
    }

    return NextResponse.json({
      success: true,
      entry: {
        id: entryId,
        createdAt: now.toISOString(),
      },
    })
  } catch (error) {
    console.error('Entry creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create entry' },
      { status: 500 }
    )
  }
}
