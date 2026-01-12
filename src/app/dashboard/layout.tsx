import type { Metadata } from 'next'
import type { ReactNode } from 'react'

export const metadata: Metadata = {
  title: 'Private Journal Dashboard — Incognito & Secure',
  description: 'Access your private, incognito journal. Review entries safely, track emotions, and reflect in a space that never exposes your identity. Privacy-first, no tracking, no social.',
  keywords: [
    'private journal',
    'incognito journaling',
    'secure diary',
    'privacy-first',
    'anonymous writing',
    'locked notes',
    'confidential journal',
    'personal reflection',
    'no tracking',
    'no social'
  ],
  openGraph: {
    title: 'Private Journal Dashboard — Incognito & Secure',
    description: 'Access your private, incognito journal in a privacy-first space. No tracking, no social.',
    url: 'https://ifiiwashonest.com/dashboard',
    type: 'website'
  },
  robots: {
    index: false,
    follow: false
  }
}

export default function DashboardLayout({
  children,
}: {
  children: ReactNode
}) {
  return children
}
