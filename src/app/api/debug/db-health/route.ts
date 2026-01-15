import { NextResponse } from 'next/server'

// Prisma is deprecated in this project; Firestore is used instead.
// Keep endpoint for compatibility but return a simple status.
export async function GET(request: Request) {
  const token = request.headers.get('x-debug-token') || ''
  const expected = process.env.DEBUG_TOKEN || ''

  if (!expected || token !== expected) {
    return NextResponse.json({ ok: false }, { status: 404 })
  }

  return NextResponse.json({ ok: true, message: 'DB health check disabled (Prisma removed).' })
}
