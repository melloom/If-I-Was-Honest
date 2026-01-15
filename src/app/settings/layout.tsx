import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Account Settings - Privacy & Security',
  description: 'Manage your journal privacy settings, security preferences, and account options. Control your data, export entries, and customize your journaling experience.',
  keywords: [
    'privacy settings',
    'journal security',
    'account management',
    'data export',
    'privacy controls'
  ],
  openGraph: {
    title: 'Account Settings - Control Your Privacy & Security',
    description: 'Manage privacy settings, security preferences, and customize your journaling experience.',
    url: 'https://thehonestproject.co/settings'
  },
  alternates: {
    canonical: 'https://thehonestproject.co/settings'
  },
  robots: {
    index: false,
    follow: false
  }
}

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
