import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { createPasswordResetToken } from '@/lib/auth-tokens'
import { sendPasswordResetEmail } from '@/lib/email'
import { emailSchema } from '@/lib/validation'
import { getServerFirestore } from '@/lib/firestore'
import { RateLimiter } from '@/lib/rate-limit'

const passwordResetLimiter = new RateLimiter({
  max: 3,
  window: 3600, // 3 attempts per hour
})

/**
 * POST /api/auth/forgot-password
 * Request password reset email
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    const validationResult = emailSchema.safeParse(email)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Rate limiting by email
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    const rateLimitKey = `forgot-password:${clientIp}`
    const rateLimitResult = await passwordResetLimiter.check(rateLimitKey)

    if (!rateLimitResult.success) {
      return NextResponse.json(
        {
          error: 'Too many password reset requests. Please try again later.',
          retryAfter: Math.ceil((rateLimitResult.resetAt - Date.now()) / 1000),
        },
        { status: 429 }
      )
    }

    // Check if user exists
    const db = getServerFirestore()
    const userSnapshot = await db
      .collection('users')
      .where('email', '==', validationResult.data.toLowerCase())
      .limit(1)
      .get()

    // Always return success for security (don't reveal if email exists)
    if (userSnapshot.empty) {
      return NextResponse.json(
        { message: 'If an account exists with this email, a password reset link has been sent.' },
        { status: 200 }
      )
    }

    // Create reset token
    const resetToken = await createPasswordResetToken(validationResult.data)

    // Send reset email
    try {
      await sendPasswordResetEmail(
        validationResult.data,
        resetToken,
        process.env.NEXTAUTH_URL || 'http://localhost:3000'
      )
    } catch (emailError) {
      console.error('Failed to send reset email:', emailError)
      // Don't fail the request, token is still created
    }

    return NextResponse.json(
      { message: 'If an account exists with this email, a password reset link has been sent.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset request error:', error)
    return NextResponse.json(
      { error: 'Failed to process password reset request' },
      { status: 500 }
    )
  }
}
