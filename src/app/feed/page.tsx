import { Metadata } from 'next'
import FeedClient from './FeedClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Anonymous Confessions Feed | If I Was Honest',
  description: 'Browse anonymous thoughts and confessions from others. Read honest words that were never said out loud.',
}

export default function FeedPage() {
  return <FeedClient />
}
