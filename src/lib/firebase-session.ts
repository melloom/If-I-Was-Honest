import { adminAuth } from './firebase-admin'

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('No authorization header or invalid format')
      return null
    }
    const idToken = authHeader.substring('Bearer '.length)

    const decoded = await adminAuth().verifyIdToken(idToken)
    // In Firestore, the user's uid IS their document ID in the users collection
    return decoded.uid
  } catch (e) {
    console.error('Token verification error:', e instanceof Error ? e.message : String(e))
    return null
  }
}
