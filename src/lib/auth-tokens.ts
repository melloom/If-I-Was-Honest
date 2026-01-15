import crypto from 'crypto'
import bcrypt from 'bcryptjs'
import { getServerFirestore } from './firestore'

const TOKEN_EXPIRY = 1 * 60 * 60 * 1000 // 1 hour
const VERIFICATION_TOKEN_EXPIRY = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Generate a secure token for email verification or password reset
 */
export function generateSecureToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Hash a token for storage in database
 */
export function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex')
}

/**
 * Create and store an email verification token
 */
export async function createEmailVerificationToken(userId: string, email: string) {
  const db = getServerFirestore()
  const token = generateSecureToken()
  const hashedToken = hashToken(token)
  const expiresAt = new Date(Date.now() + VERIFICATION_TOKEN_EXPIRY)

  await db.collection('emailVerificationTokens').add({
    userId,
    email,
    hashedToken,
    expiresAt,
    createdAt: new Date(),
    used: false,
  })

  return token
}

/**
 * Verify an email verification token
 */
export async function verifyEmailToken(token: string): Promise<{
  userId: string
  email: string
} | null> {
  const db = getServerFirestore()
  const hashedToken = hashToken(token)
  const now = new Date()

  const snapshot = await db
    .collection('emailVerificationTokens')
    .where('hashedToken', '==', hashedToken)
    .where('used', '==', false)
    .where('expiresAt', '>', now)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  const data = doc.data()

  // Mark token as used
  await doc.ref.update({ used: true })

  return {
    userId: data.userId,
    email: data.email,
  }
}

/**
 * Create a password reset token
 */
export async function createPasswordResetToken(email: string) {
  const db = getServerFirestore()
  const token = generateSecureToken()
  const hashedToken = hashToken(token)
  const expiresAt = new Date(Date.now() + TOKEN_EXPIRY)

  await db.collection('passwordResetTokens').add({
    email,
    hashedToken,
    expiresAt,
    createdAt: new Date(),
    used: false,
  })

  return token
}

/**
 * Verify a password reset token
 */
export async function verifyPasswordResetToken(token: string): Promise<string | null> {
  const db = getServerFirestore()
  const hashedToken = hashToken(token)
  const now = new Date()

  const snapshot = await db
    .collection('passwordResetTokens')
    .where('hashedToken', '==', hashedToken)
    .where('used', '==', false)
    .where('expiresAt', '>', now)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return null
  }

  const doc = snapshot.docs[0]
  const data = doc.data()

  return data.email
}

/**
 * Use a password reset token (mark as used)
 */
export async function usePasswordResetToken(token: string): Promise<boolean> {
  const db = getServerFirestore()
  const hashedToken = hashToken(token)
  const now = new Date()

  const snapshot = await db
    .collection('passwordResetTokens')
    .where('hashedToken', '==', hashedToken)
    .where('used', '==', false)
    .where('expiresAt', '>', now)
    .limit(1)
    .get()

  if (snapshot.empty) {
    return false
  }

  await snapshot.docs[0].ref.update({ used: true })
  return true
}

/**
 * Reset user password
 */
export async function resetUserPassword(email: string, newPassword: string) {
  const db = getServerFirestore()

  // Hash the password
  const hashedPassword = await bcrypt.hash(newPassword, 12)

  // Find user by email and update password
  const snapshot = await db.collection('users').where('email', '==', email.toLowerCase()).limit(1).get()

  if (snapshot.empty) {
    throw new Error('User not found')
  }

  await snapshot.docs[0].ref.update({
    password: hashedPassword,
    passwordResetAt: new Date(),
  })
}

/**
 * Mark email as verified
 */
export async function markEmailAsVerified(userId: string) {
  const db = getServerFirestore()

  await db.collection('users').doc(userId).update({
    emailVerified: true,
    emailVerifiedAt: new Date(),
  })
}

/**
 * Get verification status
 */
export async function getVerificationStatus(userId: string) {
  const db = getServerFirestore()
  const userDoc = await db.collection('users').doc(userId).get()

  if (!userDoc.exists) {
    return null
  }

  const data = userDoc.data()
  return {
    emailVerified: data?.emailVerified || false,
    emailVerifiedAt: data?.emailVerifiedAt,
  }
}
