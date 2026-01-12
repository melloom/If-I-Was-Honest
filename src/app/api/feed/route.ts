import { NextResponse } from 'next/server'
import { getServerFirestore } from '@/lib/firestore'
import { anonymizeForFeed } from '@/lib/sanitize'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const mood = searchParams.get('mood')
    const search = searchParams.get('search')
    const limit = parseInt(searchParams.get('limit') || '20')
    const offset = parseInt(searchParams.get('offset') || '0')
    const sortBy = searchParams.get('sortBy') || 'recent' // recent, popular

    console.log('[Feed API] Filters:', { mood, search, limit, offset })

    const db = getServerFirestore()

    if (!db) {
      throw new Error('Firestore database not initialized')
    }

    // SECURITY: Only fetch from published_entries collection
    // Private entries (with publishedAt === null) are NEVER in this collection
    // They remain in user-specific entries/{userId}/entries subcollection
    let query = db.collection('published_entries')

    // Filter out deleted entries
    query = query.where('deletedAt', '==', null)

    // Order by published date (most recent first) - must be after where clause
    query = query.orderBy('publishedAt', 'desc')

    // Get results - fetch more when filtering by mood to ensure enough results
    // Mood filtering is done client-side since moods are stored as objects
    const fetchLimit = (mood || search) ? Math.max(limit * 20, 500) : limit * 5
    const snapshot = await query.limit(fetchLimit).get()

    let entries = snapshot.docs.map((doc: any) => {
      const data = doc.data()
      return {
        id: doc.id,
        ...data,
      }
    })

    // Apply mood filter (client-side since moods are objects, not simple strings)
    if (mood) {
      const beforeFilter = entries.length
      entries = entries.filter((entry: any) =>
        entry.moods?.some((m: any) => m.name?.toLowerCase() === mood.toLowerCase())
      )
      console.log('[Feed API] Mood filter:', { mood, beforeFilter, afterFilter: entries.length })
    }

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      const beforeSearch = entries.length
      entries = entries.filter((entry: any) =>
        entry.content?.toLowerCase().includes(searchLower) ||
        entry.to?.toLowerCase().includes(searchLower) || // Search in "To:" field
        entry.from?.toLowerCase().includes(searchLower) || // Search in "From:" field
        entry.moods?.some((m: any) => m.name?.toLowerCase().includes(searchLower)) ||
        entry.tags?.some((t: any) => t.name?.toLowerCase().includes(searchLower))
      )
      console.log('[Feed API] Search filter:', { search, beforeSearch, afterSearch: entries.length })
    }

    // Apply pagination after filtering
    const paginatedEntries = entries.slice(offset, offset + limit)

    // Format the response
    const formattedEntries = paginatedEntries.map((entry: any) => ({
      id: entry.id,
      content: anonymizeForFeed(entry.content || ''),
      to: entry.to || null,
      from: entry.from || null,
      publishedAt: entry.publishedAt?.toDate?.().toISOString() || new Date().toISOString(),
      moods: entry.moods || [],
      tags: entry.tags || [],
      userId: entry.userId || null,
      status: entry.status || 'STILL_TRUE',
    }))

    return NextResponse.json({
      entries: formattedEntries,
      total: entries.length, // Total after filtering
      hasMore: entries.length > offset + limit,
    })
  } catch (error) {
    console.error('Feed fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch feed', details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
