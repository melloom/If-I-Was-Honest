import { NextResponse } from 'next/server'

// Signup is handled client-side via Firebase Auth + /api/auth/firebase-sync.
// This route remains to avoid breaking clients but now responds with guidance.
export async function POST() {
  return NextResponse.json(
    {
      error: 'Signup is handled via Firebase Auth. Please use the client signup flow.',
    },
    { status: 410 }
  )
}
