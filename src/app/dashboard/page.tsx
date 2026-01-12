import { Metadata } from 'next'
import DashboardClient from './DashboardClient'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'My Journal | If I Was Honest',
  description: 'Your private journal space. Write honest thoughts, track your journey, and reflect on your growth.',
}

export default function DashboardPage() {
  return <DashboardClient />
}

