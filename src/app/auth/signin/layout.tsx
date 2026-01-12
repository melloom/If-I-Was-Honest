import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Sign In - Access Your Private Journal',
  description: 'Sign in to If I Was Honest to access your private journal entries, track your mental health journey, and continue your self-reflection practice.',
  keywords: [
    'journal login',
    'sign in',
    'access journal',
    'private journal login',
    'mental health app login'
  ],
  robots: {
    index: false,
    follow: true
  }
}

export default function SignInLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
