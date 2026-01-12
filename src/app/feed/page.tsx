import { Metadata } from 'next'
import FeedClient from './FeedClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Anonymous Feed | TheHonestProject - Unsent Messages & Confessions',
  description: 'Browse anonymous thoughts, unsent messages, and honest confessions. Read the words people wish they could say but never did. A safe space for authentic self-expression.',
  keywords: [
    'anonymous confessions',
    'unsent messages',
    'honest thoughts',
    'anonymous feed',
    'mental health',
    'emotional expression',
    'secret confessions',
    'anonymous journaling',
    'authentic sharing',
    'safe space community'
  ],
  openGraph: {
    title: 'Anonymous Feed - TheHonestProject',
    description: 'Read anonymous confessions and unsent messages from people around the world.',
    url: 'https://ifiiwashonest.com/feed',
    type: 'website'
  }
}

export default function FeedPage() {
  return <FeedClient />
}
