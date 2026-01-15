import { NextResponse, NextRequest } from 'next/server'
import { getServerFirestore } from '@/lib/firestore'
import { getUserIdFromRequest } from '@/lib/firebase-session'
import { sanitizePlainText } from '@/lib/sanitize'

// GET - Fetch a single entry
export async function GET(
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

    const { id: entryId } = await context.params
    const db = getServerFirestore()

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

    return NextResponse.json({
      id: entryDoc.id,
      content: entryData?.content,
      title: entryData?.title,
      status: entryData?.status,
      createdAt: entryData?.createdAt?.toDate?.().toISOString(),
      updatedAt: entryData?.updatedAt?.toDate?.().toISOString(),
      moods: entryData?.moods || [],
      tags: entryData?.tags || [],
    })
  } catch (error) {
    console.error('Entry fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch entry' },
      { status: 500 }
    )
  }
}

// PATCH - Update an entry
export async function PATCH(
  request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const userId = await getUserIdFromRequest(request)

    if (!userId) {
      console.error('[Entry Update] Unauthorized: No userId from token')
      return NextResponse.json(
        { error: 'Unauthorized', message: 'Authentication required' },
        { status: 401 }
      )
    }

    const { id: entryId } = await context.params
    const { content, title, status } = await request.json()

    console.log('[Entry Update] Request:', { userId, entryId, hasContent: !!content, hasTitle: !!title, status })

    const db = getServerFirestore()
    const entryRef = db.collection('entries').doc(userId).collection('entries').doc(entryId)
    const entryDoc = await entryRef.get()

    if (!entryDoc.exists) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    const entryData = entryDoc.data()

    // SECURITY: Verify ownership
    if (entryData?.userId && entryData.userId !== userId) {
      console.warn('[Entry Update] Unauthorized update attempt', {
        entryId,
        entryUserId: entryData.userId,
        requestUserId: userId
      })
      return NextResponse.json(
        { error: 'Unauthorized: You do not own this entry' },
        { status: 403 }
      )
    }

    // Check if soft deleted
    if (entryData?.deletedAt) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    // Build update data
    const updateData: any = {
      updatedAt: new Date(),
    }

    if (content !== undefined) {
      updateData.content = sanitizePlainText(content)
    }

    if (title !== undefined) {
      updateData.title = title ? sanitizePlainText(title) : null
    }

    if (status !== undefined) {
      updateData.status = status
      // Track when status was last changed (for rate limiting)
      updateData.lastStatusChangeAt = new Date()

      // SECURITY: Log status change for audit trail
      console.log('[Entry Update] Status change', {
        entryId,
        userId,
        oldStatus: entryData?.status || 'STILL_TRUE',
        newStatus: status,
        timestamp: new Date().toISOString(),
        isPublished: !!entryData?.publishedAt
      })
    }

    // Update the entry
    await entryRef.update(updateData)

    // If this entry is published, also update the published_entries collection
    if (entryData?.publishedAt) {
      const publishedEntryRef = db.collection('published_entries').doc(entryId)
      const publishedDoc = await publishedEntryRef.get()

      if (publishedDoc.exists) {
        // SECURITY: Double-check ownership in published collection
        const publishedData = publishedDoc.data()
        if (publishedData?.userId !== userId) {
          console.error('[Entry Update] Ownership mismatch in published_entries', {
            entryId,
            publishedUserId: publishedData?.userId,
            requestUserId: userId
          })
          return NextResponse.json(
            { error: 'Unauthorized: Ownership verification failed' },
            { status: 403 }
          )
        }

        await publishedEntryRef.update(updateData)
        console.log('[Entry Update] Updated published_entries collection', {
          entryId,
          userId,
          updatedFields: Object.keys(updateData)
        })
      }
    }

    return NextResponse.json({
      success: true,
      entry: {
        id: entryId,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Entry update error:', error)
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    )
  }
}

// DELETE - Soft or permanent delete an entry
// RULE: Private posts can be deleted anytime, but permanent deletes are limited (e.g., 10 lifetime)
// RULE: Public posts can only be deleted within 24 hours (max 10 lifetime deletions)
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

    const { id: entryId } = await context.params
    const db = getServerFirestore()

    // Check for permanent delete parameter
    const { searchParams } = new URL(request.url)
    const isPermanentDelete = searchParams.get('permanent') === 'true'

    const entryRef = db.collection('entries').doc(userId).collection('entries').doc(entryId)
    const entryDoc = await entryRef.get()

    if (!entryDoc.exists) {
      return NextResponse.json(
        { error: 'Entry not found' },
        { status: 404 }
      )
    }

    const entryData = entryDoc.data()
    const now = new Date()

    // If published, handle public post deletion logic
    if (entryData?.publishedAt) {
      const publishedAt = entryData.publishedAt.toDate()
      const hoursSincePublished = (now.getTime() - publishedAt.getTime()) / (1000 * 60 * 60)

      // If permanent delete is requested for published entry older than 24 hours
      if (isPermanentDelete && hoursSincePublished > 24) {
        // Check permanent delete limit
        const userDoc = await db.collection('users').doc(userId).get()
        const userData = userDoc.data()
        const permanentDeletions = userData?.permanentDeletions || 0
        const permanentDeleteLimit = 10

        if (permanentDeletions >= permanentDeleteLimit) {
          return NextResponse.json(
            {
              error: 'Permanent delete limit reached',
              message: `You have used all ${permanentDeleteLimit} permanent deletes.`,
              permanentDeletions,
              permanentDeleteLimit
            },
            { status: 403 }
          )
        }

        // Mark private entry as deleted
        await entryRef.update({
          deletedAt: now,
        })

        // Delete from published_entries
        const publishedEntryRef = db.collection('published_entries').doc(entryId)
        await publishedEntryRef.delete()

        // Increment permanent delete counter
        await db.collection('users').doc(userId).update({
          permanentDeletions: permanentDeletions + 1,
          lastPermanentDeletionAt: now
        })

        // Get updated permanent deletion count for response
        const userDoc2 = await db.collection('users').doc(userId).get()
        const userData2 = userDoc2.data()
        const updatedPermanentDeletions = userData2?.permanentDeletions || 0

        return NextResponse.json({
          success: true,
          message: 'Published entry permanently deleted',
          permanentDeletions: updatedPermanentDeletions,
          permanentDeletionsRemaining: permanentDeleteLimit - updatedPermanentDeletions
        })
      }

      // Public posts can only be deleted within 24 hours (unless permanent delete is requested)
      if (hoursSincePublished > 24) {
        return NextResponse.json(
          {
            error: 'Public post is now permanent',
            message:
              `This post has been live for ${Math.floor(hoursSincePublished)} hours and is now part of the community. ` +
              `It remains anonymous and helps others feel less alone.\n\n` +
              `If you need to permanently remove this post, you can use one of your 10 permanent deletes. ` +
              `This action is irreversible and should only be used if absolutely necessary.`,
            publishedAt: publishedAt.toISOString(),
            hoursSincePublished: Math.floor(hoursSincePublished),
            canPermanentlyDelete: true
          },
          { status: 403 }
        )
      }

      // Check deletion limit for public posts
      const userDoc = await db.collection('users').doc(userId).get()
      const userData = userDoc.data()
      const deletionCount = userData?.publicPostDeletions || 0

      if (deletionCount >= 10) {
        return NextResponse.json(
          {
            error: 'Deletion limit reached',
            message: 'You have used all 10 lifetime public post deletions. This encourages thoughtful posting.',
            deletionsUsed: deletionCount,
            deletionsLimit: 10
          },
          { status: 403 }
        )
      }

      // Increment deletion counter for public posts
      await db.collection('users').doc(userId).update({
        publicPostDeletions: deletionCount + 1,
        lastPublicPostDeletionAt: now
      })

      // Soft delete the private entry
      await entryRef.update({
        deletedAt: now,
      })

      // If it's a published entry, also delete from published_entries
      const publishedEntryRef = db.collection('published_entries').doc(entryId)
      await publishedEntryRef.update({
        deletedAt: now,
      })

      // Get updated deletion count for response
      const userDoc2 = await db.collection('users').doc(userId).get()
      const userData2 = userDoc2.data()
      const deletionCount2 = userData2?.publicPostDeletions || 0

      return NextResponse.json({
        success: true,
        message: 'Public post deleted successfully (within 24-hour window)',
        deletionsUsed: deletionCount2,
        deletionsRemaining: 10 - deletionCount2
      })
    }

    // Otherwise, handle permanent delete logic for private entries
    // Check permanent delete limit
    const userDoc = await db.collection('users').doc(userId).get()
    const userData = userDoc.data()
    const permanentDeletions = userData?.permanentDeletions || 0
    const permanentDeleteLimit = 10

    if (permanentDeletions >= permanentDeleteLimit) {
      return NextResponse.json(
        {
          error: 'Permanent delete limit reached',
          message: `You have used all ${permanentDeleteLimit} permanent deletes.`,
          permanentDeletions,
          permanentDeleteLimit
        },
        { status: 403 }
      )
    }

    // Soft delete the private entry
    await entryRef.update({
      deletedAt: now,
    })

    // Increment permanent delete counter
    await db.collection('users').doc(userId).update({
      permanentDeletions: permanentDeletions + 1,
      lastPermanentDeletionAt: now
    })

    // Get updated permanent deletion count for response
    const userDoc2 = await db.collection('users').doc(userId).get()
    const userData2 = userDoc2.data()
    const updatedPermanentDeletions = userData2?.permanentDeletions || 0

    return NextResponse.json({
      success: true,
      message: 'Private entry permanently deleted',
      permanentDeletions: updatedPermanentDeletions,
      permanentDeletionsRemaining: permanentDeleteLimit - updatedPermanentDeletions
    })
  } catch (error) {
    console.error('Entry deletion error:', error)
    return NextResponse.json(
      { error: 'Failed to delete entry' },
      { status: 500 }
    )
  }
}

// PUT - Full replace an entry (treats content as required)
export async function PUT(
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

    const { id: entryId } = await context.params
    const { content, title, status } = await request.json()

    if (!content || content.trim().length === 0) {
      return NextResponse.json(
        { error: 'Content is required' },
        { status: 400 }
      )
    }

    const db = getServerFirestore()
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

    // Validate status if provided
    const validStatuses = ['STILL_TRUE', 'IVE_GROWN', 'I_WAS_COPING', 'I_LIED']
    const finalStatus = status && validStatuses.includes(status) ? status : 'STILL_TRUE'

    // Update the entry
    await entryRef.update({
      content: sanitizePlainText(content),
      title: title ? sanitizePlainText(title) : null,
      status: finalStatus,
      updatedAt: new Date(),
    })

    return NextResponse.json({
      success: true,
      entry: {
        id: entryId,
        updatedAt: new Date().toISOString(),
      },
    })
  } catch (error) {
    console.error('Entry update error:', error)
    return NextResponse.json(
      { error: 'Failed to update entry' },
      { status: 500 }
    )
  }
}
