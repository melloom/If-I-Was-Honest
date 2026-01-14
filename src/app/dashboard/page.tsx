import { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Journal | TheHonestProject - Private Thoughts & Reflections',
  description: 'Your private journal space. Write honest thoughts, unsent messages, and confessions. Track your emotional journey and reflect on your growth in a safe, anonymous space.',
  keywords: [
    'private journal',
    'personal diary',
    'mental health journaling',
    'emotional reflection',
    'anonymous writing',
    'thought diary',
    'personal growth',
    'self-reflection',
    'mindfulness journal',
    'emotional wellness'
  ],
  openGraph: {
    title: 'My Journal - TheHonestProject',
    description: 'Your private space for honest thoughts and reflections.',
    url: 'https://thehonestproject.co/dashboard',
    type: 'website'
  }
}

export default function DashboardPage() {
  return <DashboardClient />
}

