import { adminAuth } from './firebase-admin'

export async function getUserIdFromRequest(request: Request): Promise<string | null> {
  try {
    const authHeader = request.headers.get('authorization') || request.headers.get('Authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.warn('[Auth] No authorization header or invalid format', {
        hasAuth: !!authHeader,
        authPrefix: authHeader?.substring(0, 10)
      })
      return null
    }
    const idToken = authHeader.substring('Bearer '.length)

    console.log('[Auth] Verifying token:', {
      tokenLength: idToken.length,
      tokenPrefix: idToken.substring(0, 20) + '...'
    })

    const decoded = await adminAuth().verifyIdToken(idToken)
    console.log('[Auth] Token verified successfully:', { uid: decoded.uid })
    // In Firestore, the user's uid IS their document ID in the users collection
    return decoded.uid
  } catch (e) {
    console.error('[Auth] Token verification error:', {
      error: e instanceof Error ? e.message : String(e),
      name: e instanceof Error ? e.name : 'Unknown',
      code: (e as any)?.code
    })
    return null
  }
}
