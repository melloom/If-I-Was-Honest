import { NextResponse } from 'next/server'
import { getServerFirestore } from '@/lib/firestore'
import { adminAuth } from '@/lib/firebase-admin'

// This endpoint should be called by a cron job (e.g., Vercel Cron, Cloud Scheduler)
// to process accounts past their 24-hour grace period
export async function GET(request: Request) {
  // Verify this is being called by an authorized source
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET
  
  if (!cronSecret || authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getServerFirestore()
    const now = new Date()

    // Find all accounts scheduled for deletion where deleteAfter time has passed
    const snapshot = await db
      .collection('users')
      .where('deletionStatus', '==', 'pending')
      .where('deleteAfter', '<=', now)
      .get()

    console.log(`[Cron] Processing ${snapshot.size} scheduled account deletions`)

    const results = {
      processed: 0,
      failed: 0,
      errors: [] as string[],
    }

    for (const userDoc of snapshot.docs) {
      const userId = userDoc.id
      
      try {
        // Delete private entries only
        const entriesCollectionRef = db.collection('entries').doc(userId).collection('entries')
        const entriesSnapshot = await entriesCollectionRef.get()
        
        const batch = db.batch()
        
        for (const doc of entriesSnapshot.docs) {
          batch.delete(doc.ref)
        }

        // Delete the entries collection document
        batch.delete(db.collection('entries').doc(userId))

        // IMPORTANT: Keep published entries in the database
        // They remain anonymous and contribute to the public feed
        // Only anonymize the userId to prevent user identification
        const publishedSnapshot = await db
          .collection('published_entries')
          .where('userId', '==', userId)
          .get()

        console.log(`[Cron] Keeping ${publishedSnapshot.size} published posts for user ${userId}`)

        for (const doc of publishedSnapshot.docs) {
          // Remove userId but keep the post
          batch.update(doc.ref, {
            userId: '[deleted]',
            userDeleted: true,
            userDeletedAt: now,
          })
        }

        // Delete user moods
        const moodsCollectionRef = db.collection('user_moods').doc(userId).collection('moods')
        const moodsSnapshot = await moodsCollectionRef.get()
        
        for (const doc of moodsSnapshot.docs) {
          batch.delete(doc.ref)
        }
        
        if (moodsSnapshot.size > 0) {
          batch.delete(db.collection('user_moods').doc(userId))
        }

        // Delete user tags
        const tagsCollectionRef = db.collection('user_tags').doc(userId).collection('tags')
        const tagsSnapshot = await tagsCollectionRef.get()
        
        for (const doc of tagsSnapshot.docs) {
          batch.delete(doc.ref)
        }
        
        if (tagsSnapshot.size > 0) {
          batch.delete(db.collection('user_tags').doc(userId))
        }

        // Mark user document as deleted (soft delete for audit trail)
        batch.update(db.collection('users').doc(userId), {
          deletionStatus: 'completed',
          deletedAt: now,
          email: '[deleted]',
          name: '[deleted]',
        })

        // Commit all changes
        await batch.commit()

        // Delete the Firebase Auth user
        try {
          await adminAuth().deleteUser(userId)
          console.log(`[Cron] Deleted Firebase Auth user ${userId}`)
        } catch (authError: any) {
          console.error(`[Cron] Error deleting Firebase Auth user ${userId}:`, authError.message)
          // Continue anyway, data is already deleted
        }

        console.log(`[Cron] Successfully processed deletion for user ${userId}`)
        results.processed++
      } catch (error: any) {
        console.error(`[Cron] Failed to process deletion for user ${userId}:`, error)
        results.failed++
        results.errors.push(`${userId}: ${error.message}`)
      }
    }

    return NextResponse.json({ 
      success: true, 
      timestamp: now.toISOString(),
      ...results
    })
  } catch (error: any) {
    console.error('[Cron] Failed to process scheduled deletions:', error)
    return NextResponse.json({ 
      error: 'Failed to process scheduled deletions',
      message: error.message 
    }, { status: 500 })
  }
}
