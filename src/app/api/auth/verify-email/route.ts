import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyEmailToken, markEmailAsVerified } from '@/lib/auth-tokens'

/**
 * GET /api/auth/verify-email
 * Verify email token from email link
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Verify the token
    const result = await verifyEmailToken(token)

    if (!result) {
      return NextResponse.json(
        { error: 'Invalid or expired verification link' },
        { status: 400 }
      )
    }

    // Mark email as verified
    await markEmailAsVerified(result.userId)

    // Redirect to success page
    return NextResponse.redirect(
      new URL('/auth/email-verified?email=' + encodeURIComponent(result.email), request.url)
    )
  } catch (error) {
    console.error('Email verification error:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
