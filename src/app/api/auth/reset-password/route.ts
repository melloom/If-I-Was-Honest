import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyPasswordResetToken, usePasswordResetToken, resetUserPassword } from '@/lib/auth-tokens'
import { passwordSchema } from '@/lib/validation'

/**
 * POST /api/auth/reset-password
 * Reset password with valid token
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { token, password } = body

    // Validate token
    if (!token || typeof token !== 'string') {
      return NextResponse.json(
        { error: 'Invalid request' },
        { status: 400 }
      )
    }

    // Validate password
    const passwordValidation = passwordSchema.safeParse(password)
    if (!passwordValidation.success) {
      return NextResponse.json(
        {
          error: 'Invalid password',
          details: passwordValidation.error.errors,
        },
        { status: 400 }
      )
    }

    // Verify token
    const email = await verifyPasswordResetToken(token)

    if (!email) {
      return NextResponse.json(
        { error: 'Invalid or expired reset link' },
        { status: 400 }
      )
    }

    // Mark token as used
    const tokenUsed = await usePasswordResetToken(token)
    if (!tokenUsed) {
      return NextResponse.json(
        { error: 'Reset link has already been used' },
        { status: 400 }
      )
    }

    // Update password
    await resetUserPassword(email, passwordValidation.data)

    return NextResponse.json(
      { message: 'Password reset successfully. Please log in with your new password.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Password reset error:', error)
    return NextResponse.json(
      { error: 'Failed to reset password' },
      { status: 500 }
    )
  }
}
