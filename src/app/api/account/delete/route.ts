import { NextResponse } from 'next/server'
import { getServerFirestore } from '@/lib/firestore'
import { getUserIdFromRequest } from '@/lib/firebase-session'
import { adminAuth } from '@/lib/firebase-admin'

// DELETE - Request account deletion (24-hour grace period)
export async function DELETE(request: Request) {
  const userId = await getUserIdFromRequest(request)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getServerFirestore()

    // Get user document to verify they exist
    const userDoc = await db.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const now = new Date()
    const deleteAfter = new Date(now.getTime() + 24 * 60 * 60 * 1000) // 24 hours from now

    // Mark account for deletion (soft delete with 24-hour grace period)
    await db.collection('users').doc(userId).update({
      deletionScheduledAt: now,
      deleteAfter: deleteAfter,
      deletionStatus: 'pending', // pending, cancelled, completed
    })

    return NextResponse.json({ 
      success: true,
      message: 'Account deletion scheduled',
      deleteAfter: deleteAfter.toISOString(),
      gracePeriodHours: 24
    })
  } catch (error) {
    console.error('Account deletion scheduling failed', error)
    return NextResponse.json({ error: 'Failed to schedule account deletion' }, { status: 500 })
  }
}

// POST - Cancel account deletion (restore account)
export async function POST(request: Request) {
  const userId = await getUserIdFromRequest(request)

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const db = getServerFirestore()

    // Get user document
    const userDoc = await db.collection('users').doc(userId).get()

    if (!userDoc.exists) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 })
    }

    const userData = userDoc.data()

    // Check if deletion is pending
    if (userData?.deletionStatus !== 'pending') {
      return NextResponse.json({ error: 'No pending deletion to cancel' }, { status: 400 })
    }

    // Cancel the deletion
    await db.collection('users').doc(userId).update({
      deletionScheduledAt: null,
      deleteAfter: null,
      deletionStatus: 'cancelled',
    })

    return NextResponse.json({ 
      success: true,
      message: 'Account deletion cancelled successfully'
    })
  } catch (error) {
    console.error('Account deletion cancellation failed', error)
    return NextResponse.json({ error: 'Failed to cancel account deletion' }, { status: 500 })
  }
}

// This function should be called by a scheduled Cloud Function or cron job
// to process accounts past their 24-hour grace period
export async function processScheduledDeletions() {
  try {
    const db = getServerFirestore()
    const now = new Date()

    // Find all accounts scheduled for deletion where deleteAfter time has passed
    const snapshot = await db
      .collection('users')
      .where('deletionStatus', '==', 'pending')
      .where('deleteAfter', '<=', now)
      .get()

    console.log(`Processing ${snapshot.size} scheduled account deletions`)

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
        
        batch.delete(db.collection('user_moods').doc(userId))

        // Delete user tags
        const tagsCollectionRef = db.collection('user_tags').doc(userId).collection('tags')
        const tagsSnapshot = await tagsCollectionRef.get()
        
        for (const doc of tagsSnapshot.docs) {
          batch.delete(doc.ref)
        }
        
        batch.delete(db.collection('user_tags').doc(userId))

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
        } catch (authError) {
          console.error(`Error deleting Firebase Auth user ${userId}:`, authError)
          // Continue anyway, data is already deleted
        }

        console.log(`Successfully processed deletion for user ${userId}`)
      } catch (error) {
        console.error(`Failed to process deletion for user ${userId}:`, error)
      }
    }

    return { success: true, processed: snapshot.size }
  } catch (error) {
    console.error('Failed to process scheduled deletions:', error)
    throw error
  }
}
